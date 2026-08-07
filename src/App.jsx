import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import Sidebar, { NAV_TABS } from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ServicesPackagesView from './views/ServicesPackagesView';
import TripsView from './views/TripsView';
import PassengersView from './views/PassengersView';
import InvoicesView from './views/InvoicesView';
import UnifiedBookingView from './views/UnifiedBookingView';
import HotelsView from './views/HotelsView';
import InvoiceDetailsView from './views/InvoiceDetailsView';
import PassengerDetailsView from './views/PassengerDetailsView';
import {
  initialServices,
  initialPackages,
  initialTrips,
  initialInvoices,
  initialHotels,
  initialRooms,
  packagePrice,
  invoiceTotals,
  calculateTripStatus,
} from './data/mockData';

const nextId = (list) =>
  list.length > 0 ? Math.max(...list.map((x) => x.id)) + 1 : 1;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailInvoiceId, setDetailInvoiceId] = useState(null);
  const [detailPassengerId, setDetailPassengerId] = useState(null);

  const [passengers, setPassengers] = useState([]);
  const [passengersLoading, setPassengersLoading] = useState(true);
  const [services, setServices] = useState(initialServices);
  const [packages, setPackages] = useState(initialPackages);
  const [trips, setTrips] = useState(initialTrips);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [hotels, setHotels] = useState(initialHotels);
  const [rooms, setRooms] = useState(initialRooms);

  const stats = useMemo(() => {
    return {
      totalPassengers: passengers.length,
      activeTrips: trips.filter(
        (t) => calculateTripStatus(t, t.bookedCount ?? 0).text !== 'منتهية (مغلقة)'
      ).length,
      totalRevenue: invoices.reduce((acc, inv) => acc + inv.paid, 0),
      aldaer: passengers.filter((p) => p.branch === 'الداير').length,
      jazan: passengers.filter((p) => p.branch === 'جازان').length,
      packageCount: packages.length,
    };
  }, [passengers, trips, invoices, packages.length]);

  const enrichedInvoices = useMemo(
    () =>
      invoices.map((inv) => {
        const totals = invoiceTotals(inv, packages, services);
        return {
          ...inv,
          total: totals.totalAmount,
          paid: totals.paid,
          remaining: totals.remaining,
          passenger: passengers.find((p) => p.id === inv.passengerId) || null,
          trip: trips.find((t) => t.id === inv.tripId) || null,
          package: totals.pkg,
        };
      }),
    [invoices, passengers, trips, packages, services]
  );

  const navigate = (view) => {
    setActiveView(view);
    setDetailInvoiceId(null);
    setDetailPassengerId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
    setDetailInvoiceId(null);
    setDetailPassengerId(null);
  };

  /* ---------- Passengers real-time sync (Firestore) ---------- */
  useEffect(() => {
    setPassengersLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, 'passengers'),
      (snapshot) => {
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setPassengers(list);
        setPassengersLoading(false);
      },
      (error) => {
        console.error('فشل مزامنة بيانات المسافرين:', error);
        setPassengersLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  /* ---------- Passengers CRUD ---------- */
  const addPassengers = async (list) => {
    const created = [];
    for (const p of list) {
      const ref = await addDoc(collection(db, 'passengers'), p);
      created.push({ id: ref.id, ...p });
    }
    return created;
  };

  const editPassenger = async (id, data) => {
    await updateDoc(doc(db, 'passengers', id), data);
  };

  const cancelPassenger = async (id) => {
    await updateDoc(doc(db, 'passengers', id), { status: 'canceled' });
  };

  const reactivatePassenger = async (id) => {
    await updateDoc(doc(db, 'passengers', id), { status: 'active' });
  };

  const deletePassenger = async (id) => {
    await deleteDoc(doc(db, 'passengers', id));
  };

  const assignRooms = async (ids, roomId) => {
    await Promise.all(
      ids.map((id) =>
        updateDoc(doc(db, 'passengers', id), { roomId: roomId || null })
      )
    );
  };

  /* ---------- Factory Reset (Admin only) ---------- */
  const handleFactoryReset = async () => {
    const collectionsToWipe = ['hotels', 'trips', 'passengers', 'invoices'];
    for (const name of collectionsToWipe) {
      const snap = await getDocs(collection(db, name));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, name, d.id))));
    }
    setTrips([]);
    setInvoices([]);
    setHotels([]);
    setRooms([]);
  };

  /* ---------- Services & Packages CRUD ---------- */
  const addService = (data) =>
    setServices((prev) => [{ ...data, id: nextId(prev) }, ...prev]);

  const deleteService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setPackages((prev) =>
      prev.map((p) => ({
        ...p,
        serviceIds: p.serviceIds.filter((sid) => sid !== id),
      }))
    );
  };

  const addPackage = (data) =>
    setPackages((prev) => [{ ...data, id: nextId(prev) }, ...prev]);

  const deletePackage = (id) =>
    setPackages((prev) => prev.filter((p) => p.id !== id));

  /* ---------- Trips CRUD ---------- */
  const addTrip = (data) =>
    setTrips((prev) => [{ ...data, id: nextId(prev) }, ...prev]);

  const deleteTrip = (id) => setTrips((prev) => prev.filter((t) => t.id !== id));

  /* ---------- Invoices ---------- */
  const addInvoice = (data) => {
    const firstPaid = Number(data.paid) || 0;
    const paymentHistory =
      firstPaid > 0
        ? [
            {
              id: 1,
              amount: firstPaid,
              method: data.paymentMethod || 'كاش',
              date: new Date().toISOString().slice(0, 10),
            },
          ]
        : [];
    const pkg = packages.find((p) => p.id === data.packageId) || null;
    const perPerson = pkg ? packagePrice(pkg, services) : 0;
    const paxCount =
      Number(data.coveredCount) || data.coveredPassengers?.length || 1;
    const totalAmount = perPerson * paxCount;
    const invoice = {
      ...data,
      id: nextId(invoices),
      perPerson,
      paxCount,
      totalAmount,
      coveredCount: paxCount,
      paid: firstPaid,
      paidAmount: firstPaid,
      paymentMethod: firstPaid > 0 ? data.paymentMethod || 'كاش' : '',
      paymentHistory,
    };
    setInvoices((prev) => [invoice, ...prev]);
    setTrips((prev) =>
      prev.map((t) =>
        t.id === data.tripId
          ? { ...t, bookedCount: t.bookedCount + paxCount }
          : t
      )
    );
    return invoice;
  };

  const deleteInvoice = (id) =>
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));

  const addRoom = (data) =>
    setRooms((prev) => [{ ...data, id: nextId(prev) }, ...prev]);

  const deleteRoom = (id) => setRooms((prev) => prev.filter((r) => r.id !== id));

  const addHotel = (data) => {
    const hotel = { ...data, id: nextId(hotels) };
    setHotels((prev) => [hotel, ...prev]);
    return hotel;
  };

  const deleteHotel = (id) => {
    setHotels((prev) => prev.filter((h) => h.id !== id));
    setRooms((prev) => prev.filter((r) => r.hotelId !== id));
  };

  const addPayment = (id, amount, method) =>
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const existing = Array.isArray(inv.paymentHistory) ? inv.paymentHistory : [];
        const history = [
          ...existing,
          {
            id: existing.length ? Math.max(...existing.map((p) => p.id)) + 1 : 1,
            amount: Number(amount),
            method: method || 'كاش',
            date: new Date().toISOString().slice(0, 10),
          },
        ];
        const paidTotal = history.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        return {
          ...inv,
          paid: paidTotal,
          paidAmount: paidTotal,
          paymentMethod: history[history.length - 1]?.method || '',
          paymentHistory: history,
        };
      })
    );

  const pageTitle =
    detailInvoiceId != null
      ? 'تفاصيل الفاتورة'
      : detailPassengerId != null
        ? 'ملف المسافر'
        : NAV_TABS.find((t) => t.id === activeView)?.label || 'الرئيسية';

  let view;
  switch (activeView) {
    case 'packages':
      view = (
        <ServicesPackagesView
          services={services}
          packages={packages}
          onAddService={addService}
          onAddPackage={addPackage}
          onDeleteService={deleteService}
          onDeletePackage={deletePackage}
        />
      );
      break;
    case 'trips':
      view = (
        <TripsView
          trips={trips}
          passengers={passengers}
          invoices={invoices}
          packages={packages}
          services={services}
          hotels={hotels}
          currentUser={currentUser}
          onAddTrip={addTrip}
          onDeleteTrip={deleteTrip}
        />
      );
      break;
    case 'rooms':
      view = (
        <HotelsView
          hotels={hotels}
          rooms={rooms}
          passengers={passengers}
          onAddHotel={addHotel}
          onDeleteHotel={deleteHotel}
          onAddRoom={addRoom}
          onDeleteRoom={deleteRoom}
        />
      );
      break;
    case 'booking':
      view = (
        <UnifiedBookingView
          passengers={passengers}
          trips={trips}
          packages={packages}
          services={services}
          hotels={hotels}
          rooms={rooms}
          currentUserBranch={currentUser.branch}
          onAddPassengers={addPassengers}
          onAddInvoice={addInvoice}
          onAssignRooms={assignRooms}
          onViewInvoice={(id) => {
            setDetailInvoiceId(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      );
      break;
    case 'passengers':
      view = (
        <PassengersView
          passengers={passengers}
          passengersLoading={passengersLoading}
          trips={trips}
          invoices={invoices}
          currentUser={currentUser}
          currentUserBranch={currentUser.branch}
          onAdd={addPassengers}
          onEdit={editPassenger}
          onCancel={cancelPassenger}
          onReactivate={reactivatePassenger}
          onDelete={deletePassenger}
          onOpenDetails={setDetailPassengerId}
        />
      );
      break;
    case 'invoices':
      view = (
        <InvoicesView
          passengers={passengers}
          trips={trips}
          packages={packages}
          services={services}
          invoices={invoices}
          currentUser={currentUser}
          onAddInvoice={addInvoice}
          onAddPayment={addPayment}
          onDeleteInvoice={deleteInvoice}
          onCancelPassenger={cancelPassenger}
          onOpenDetails={setDetailInvoiceId}
        />
      );
      break;
    default:
      view = (
        <DashboardView
          stats={stats}
          invoices={enrichedInvoices}
          trips={trips}
          onNavigate={navigate}
        />
      );
  }

  if (detailInvoiceId != null) {
    view = (
      <InvoiceDetailsView
        invoiceId={detailInvoiceId}
        invoices={invoices}
        passengers={passengers}
        trips={trips}
        packages={packages}
        services={services}
        currentUser={currentUser}
        onBack={() => {
          setDetailInvoiceId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onAddPayment={addPayment}
        onCancelPassenger={cancelPassenger}
        onDeleteInvoice={deleteInvoice}
      />
    );
  } else if (detailPassengerId != null) {
    view = (
      <PassengerDetailsView
        passengerId={detailPassengerId}
        passengers={passengers}
        invoices={invoices}
        trips={trips}
        packages={packages}
        services={services}
        onBack={() => {
          setDetailPassengerId(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 bg-islamic-pattern bg-pattern-sm">
      <div className="flex min-h-screen">
        <Sidebar
          active={activeView}
          onNavigate={navigate}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar
            title={pageTitle}
            onOpenSidebar={() => setSidebarOpen(true)}
            user={currentUser}
            onLogout={handleLogout}
            onFactoryReset={handleFactoryReset}
          />

          <main key={activeView} className="view-enter flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {view}
          </main>

          <footer className="border-t border-gray-200/60 bg-white/40 px-6 py-4 text-center text-xs font-medium text-gray-400 backdrop-blur">
            © 2026 فجر النسك لخدمات الحج والعمرة — نظام الإدارة المتكامل
          </footer>
        </div>
      </div>
    </div>
  );
}