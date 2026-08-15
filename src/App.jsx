import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { useCollection } from './hooks/useCollection';
import {
  COLLECTIONS,
  normalizePassenger,
  normalizeTrip,
  normalizeInvoice,
  normalizeHotel,
  normalizeRoom,
} from './lib/models';
import Sidebar, { NAV_TABS } from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import TripsView from './views/TripsView';
import PassengersView from './views/PassengersView';
import InvoicesView from './views/InvoicesView';
import POS from './views/POS';
import InvoiceDetailsView from './views/InvoiceDetailsView';
import ClientProfile from './views/ClientProfile';
import Analytics from './views/Analytics';
import ReportsView from './views/ReportsView';
import AdminDashboard from './views/AdminDashboard';
import { invoiceTotals } from './data/mockData';
import { calculateTripStatus } from './services/trips';
import { buildInvoiceFromBooking, buildPaymentHistory } from './services/booking';
import { useDashboardStats } from './hooks/useDashboardStats';
import { useEnrichedInvoices } from './hooks/useEnrichedInvoices';
import { createDocument, updateDocument, deleteDocument, bulkDelete } from './services/crud';
import { buildBranchReport } from './services/reports';
import { normalizePendingBooking } from './services/pendingBookings';

const nextId = (list) =>
  list.length > 0 ? Math.max(...list.map((x) => x.id)) + 1 : 1;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailInvoiceId, setDetailInvoiceId] = useState(null);
  const [detailPassengerId, setDetailPassengerId] = useState(null);

  const { items: passengerRows, loading: passengersLoading } = useCollection(
    COLLECTIONS.passengers,
    normalizePassenger
  );
  const { items: tripRows } = useCollection(COLLECTIONS.trips, normalizeTrip);
  const { items: invoiceRows } = useCollection(
    COLLECTIONS.invoices,
    normalizeInvoice
  );
  const { items: hotelRows } = useCollection(COLLECTIONS.hotels, normalizeHotel);
  const { items: roomRows } = useCollection(COLLECTIONS.rooms, normalizeRoom);

  const [passengers, setPassengers] = useState([]);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('fajr-pending-bookings') || '[]');
      setPendingBookings(Array.isArray(stored) ? stored.map(normalizePendingBooking) : []);
    } catch (error) {
      setPendingBookings([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fajr-pending-bookings', JSON.stringify(pendingBookings));
  }, [pendingBookings]);

  useEffect(() => setPassengers(passengerRows), [passengerRows]);
  useEffect(() => setTrips(tripRows), [tripRows]);
  useEffect(() => setInvoices(invoiceRows), [invoiceRows]);
  useEffect(() => setHotels(hotelRows), [hotelRows]);
  useEffect(() => setRooms(roomRows), [roomRows]);

  const stats = useDashboardStats(passengers, trips, invoices);
  const branchReport = buildBranchReport(passengers, trips, invoices, packages, services);

  const addPendingBooking = (booking) => {
    const normalized = normalizePendingBooking(booking);
    setPendingBookings((prev) => [normalized, ...prev]);
  };

  const approvePendingBooking = (id) => {
    setPendingBookings((prev) => prev.map((entry) => entry.id === id ? { ...entry, status: 'approved' } : entry));
  };

  const enrichedInvoices = useEnrichedInvoices({
    invoices,
    passengers,
    trips,
    packages,
    services,
  });

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

  /* ---------- Real-time collection sync remains centralized in useCollection hooks ---------- */

  /* ---------- Passengers CRUD ---------- */
  const addPassengers = async (list) => {
    return createDocument(COLLECTIONS.passengers, list[0]);
  };

  const editPassenger = async (id, data) => {
    await updateDocument(COLLECTIONS.passengers, id, data);
  };

  const cancelPassenger = async (id) => {
    await updateDocument(COLLECTIONS.passengers, id, { status: 'canceled' });
  };

  const reactivatePassenger = async (id) => {
    await updateDocument(COLLECTIONS.passengers, id, { status: 'active' });
  };

  const deletePassenger = async (id) => {
    await deleteDocument(COLLECTIONS.passengers, id);
  };

  /* ---------- Factory Reset (Admin only) ---------- */
  const handleFactoryReset = async () => {
    await bulkDelete(['hotels', 'trips', 'passengers', 'invoices']);
    setTrips([]);
    setInvoices([]);
    setHotels([]);
    setRooms([]);
  };

  /* ---------- Trips CRUD (Firestore) ---------- */
  const addTrip = async (data) => {
    return createDocument(COLLECTIONS.trips, {
      ...data,
      price: Number(data.price) || 0,
      bookedCount: 0,
    });
  };

  const deleteTrip = async (id) => {
    await deleteDocument(COLLECTIONS.trips, id);
  };

  const saveTripPassengers = async (tripId, rows, extras = {}) => {
    await updateDocument(COLLECTIONS.trips, tripId, {
      passengers: rows,
      bookedCount: rows.length,
      ...extras,
    });
  };

  /* ---------- POS Booking: save client + invoice + append to trip ---------- */
  const confirmBooking = async ({
    existingClientId,
    newClient,
    tripId,
    branch,
    roomNumber,
    bookingNotes,
    paid,
    paymentMethod,
  }) => {
    let client;
    if (existingClientId) {
      client = passengers.find((p) => p.id === existingClientId) || null;
      if (!client) throw new Error('Client not found');
    } else {
      const created = await addPassengers([
        { ...newClient, gender: newClient?.gender || '', branch },
      ]);
      client = created[0];
      try {
        await setDoc(doc(db, 'clients', client.id), {
          fullName: client.fullName,
          documentId: client.documentId || '',
          phone: client.phone || '',
          nationality: client.nationality || '',
          gender: client.gender || '',
          address: client.address || '',
          branch,
        });
      } catch (error) {
        console.error('فشل حفظ العميل في سجل العملاء:', error);
      }
    }

    const trip = trips.find((t) => t.id === tripId) || null;
    if (!trip) throw new Error('Trip not found');

    const invoice = await addInvoice({
      passengerId: client.id,
      tripId,
      paid,
      paidAmount: paid,
      paymentMethod,
      coveredCount: 1,
      coveredPassengers: [
        { id: client.id, fullName: client.fullName, isPrimary: true },
      ],
      roomNumber,
      bookingNotes,
      branch,
    });

    const row = {
      id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: client.fullName,
      documentId: client.documentId || '',
      phone: client.phone || '',
      nationality: client.nationality || '',
      payType: paymentMethod || '',
      amount: Number(paid) || 0,
      address: client.address || '',
      roomNumber: roomNumber || '',
      notes: bookingNotes || '',
      clientId: client.id,
    };

    try {
      const currentPassengers = Array.isArray(trip.passengers)
        ? trip.passengers
        : [];
      await updateDoc(doc(db, 'trips', tripId), {
        passengers: [...currentPassengers, row],
      });
    } catch (error) {
      console.error('فشل إضافة الحاج إلى كشف الرحلة:', error);
    }

    return { invoice, passenger: client, trip };
  };

  /* ---------- Invoices ---------- */
  const addInvoice = async (data) => {
    const trip = trips.find((t) => t.id === data.tripId) || null;
    const paxCount = Number(data.coveredCount || data.paxCount || 1) || 1;
    const invoice = buildInvoiceFromBooking({
      data,
      trip,
      nextInvoiceId: nextId(invoices),
    });
    const ref = await createDocument(COLLECTIONS.invoices, invoice);
    const saved = { ...invoice, docId: ref.id };
    setInvoices((prev) => [saved, ...prev]);
    if (trip) {
      updateDoc(doc(db, 'trips', trip.id), {
        bookedCount: increment(paxCount),
      }).catch((error) => console.error('فشل تحديث مقاعد الرحلة:', error));
      setTrips((prev) =>
        prev.map((t) =>
          t.id === data.tripId
            ? { ...t, bookedCount: (t.bookedCount ?? 0) + paxCount }
            : t
        )
      );
    }
    return saved;
  };

  const deleteInvoice = async (id) => {
    const target = invoices.find((inv) => inv.id === id) || null;
    const docId = target?.docId || String(id);
    try {
      await deleteDocument(COLLECTIONS.invoices, docId);
    } catch (error) {
      console.error('فشل حذف الفاتورة:', error);
    }
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const addPayment = async (id, amount, method) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const history = buildPaymentHistory(
          inv.paymentHistory,
          amount,
          method
        );
        const paidTotal = history.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        const updated = {
          ...inv,
          paid: paidTotal,
          paidAmount: paidTotal,
          paymentMethod: history[history.length - 1]?.method || '',
          paymentHistory: history,
        };
        updateDocument(COLLECTIONS.invoices, inv.docId || String(id), {
          paid: paidTotal,
          paidAmount: paidTotal,
          paymentMethod: history[history.length - 1]?.method || '',
          paymentHistory: history,
        }).catch((error) => console.error('فشل تحديث دفعة الفاتورة:', error));
        return updated;
      })
    );
  };

  const pageTitle =
    detailInvoiceId != null
      ? 'تفاصيل الفاتورة'
      : detailPassengerId != null
        ? 'ملف العميل'
        : NAV_TABS.find((t) => t.id === activeView)?.label || 'الرئيسية';

  let view;
  switch (activeView) {
    case 'trips':
      view = (
        <TripsView
          trips={trips}
          passengers={passengers}
          invoices={invoices}
          packages={packages}
          services={services}
          currentUser={currentUser}
          onAddTrip={addTrip}
          onDeleteTrip={deleteTrip}
          onSaveTripPassengers={saveTripPassengers}
          onAddClient={addPassengers}
        />
      );
      break;
    case 'booking':
      view = (
        <POS
          passengers={passengers}
          trips={trips}
          currentUserBranch={currentUser.branch}
          onConfirmBooking={confirmBooking}
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
    case 'analytics':
      view = (
        <Analytics
          passengers={passengers}
          trips={trips}
          invoices={invoices}
          packages={packages}
          services={services}
        />
      );
      break;
    case 'reports':
      view = (
        <ReportsView
          passengers={passengers}
          trips={trips}
          invoices={invoices}
          packages={packages}
          services={services}
          pendingBookings={pendingBookings}
          onCreatePendingBooking={addPendingBooking}
        />
      );
      break;
    case 'admin':
      view = <AdminDashboard stats={stats} branchReport={branchReport} />;
      break;
    default:
      view = (
        <DashboardView
          stats={stats}
          invoices={enrichedInvoices}
          trips={trips}
          passengers={passengers}
          pendingBookings={pendingBookings}
          onNavigate={navigate}
          onAddPendingBooking={addPendingBooking}
          onApprovePendingBooking={approvePendingBooking}
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
      <ClientProfile
        clientId={detailPassengerId}
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
    <div className="min-h-screen bg-bg-light bg-islamic-pattern bg-pattern-sm text-slate-900">
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

          <footer className="border-t border-slate-200/80 bg-white/80 px-6 py-4 text-center text-xs font-medium text-slate-500 backdrop-blur">
            © 2026 فجر النسك لخدمات الحج والعمرة — نظام الإدارة المتكامل
          </footer>
        </div>
      </div>
    </div>
  );
}