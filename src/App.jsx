import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
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
import { invoiceTotals, calculateTripStatus } from './data/mockData';

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
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [trips, setTrips] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);

  const stats = useMemo(() => {
    return {
      totalPassengers: passengers.length,
      activeTrips: trips.filter(
        (t) => calculateTripStatus(t, t.bookedCount ?? 0).text !== 'منتهية (مغلقة)'
      ).length,
      totalRevenue: invoices.reduce((acc, inv) => acc + inv.paid, 0),
      aldaer: passengers.filter((p) => p.branch === 'الداير').length,
      jazan: passengers.filter((p) => p.branch === 'جازان').length,
    };
  }, [passengers, trips, invoices]);

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

  /* ---------- Hotels & Rooms real-time sync (Firestore) ---------- */
  useEffect(() => {
    const unsubHotels = onSnapshot(
      collection(db, 'hotels'),
      (snapshot) => {
        setHotels(
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        );
      },
      (error) => console.error('فشل مزامنة الفنادق:', error)
    );
    const unsubRooms = onSnapshot(
      collection(db, 'rooms'),
      (snapshot) => {
        setRooms(
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        );
      },
      (error) => console.error('فشل مزامنة الغرف:', error)
    );
    return () => {
      unsubHotels();
      unsubRooms();
    };
  }, []);

  /* ---------- Trips real-time sync (Firestore) ---------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'trips'),
      (snapshot) => {
        setTrips(
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        );
      },
      (error) => console.error('فشل مزامنة الرحلات:', error)
    );
    return unsubscribe;
  }, []);

  /* ---------- Invoices real-time sync (Firestore) ---------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'invoices'),
      (snapshot) => {
        setInvoices(
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        );
      },
      (error) => console.error('فشل مزامنة الفواتير:', error)
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

  /* ---------- Trips CRUD (Firestore) ---------- */
  const addTrip = async (data) => {
    const ref = await addDoc(collection(db, 'trips'), {
      ...data,
      price: Number(data.price) || 0,
      bookedCount: 0,
    });
    return { id: ref.id, ...data };
  };

  const deleteTrip = async (id) => {
    await deleteDoc(doc(db, 'trips', id));
  };

  const saveTripPassengers = async (tripId, rows, extras = {}) => {
    await updateDoc(doc(db, 'trips', tripId), {
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
    const trip = trips.find((t) => t.id === data.tripId) || null;
    const perPerson = Number(trip?.price) || 0;
    const paxCount =
      Number(data.coveredCount) || data.coveredPassengers?.length || 1;
    const totalAmount = perPerson * paxCount;
    const invoice = {
      ...data,
      id: nextId(invoices),
      createdAt: new Date().toISOString().slice(0, 10),
      perPerson,
      paxCount,
      totalAmount,
      coveredCount: paxCount,
      paid: firstPaid,
      paidAmount: firstPaid,
      paymentMethod: firstPaid > 0 ? data.paymentMethod || 'كاش' : '',
      paymentHistory,
    };
    try {
      await setDoc(doc(db, 'invoices', String(invoice.id)), invoice);
    } catch (error) {
      console.error('فشل حفظ الفاتورة:', error);
    }
    setInvoices((prev) => [invoice, ...prev]);
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
    return invoice;
  };

  const deleteInvoice = async (id) => {
    try {
      await deleteDoc(doc(db, 'invoices', String(id)));
    } catch (error) {
      console.error('فشل حذف الفاتورة:', error);
    }
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const addPayment = async (id, amount, method) => {
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
        const updated = {
          ...inv,
          paid: paidTotal,
          paidAmount: paidTotal,
          paymentMethod: history[history.length - 1]?.method || '',
          paymentHistory: history,
        };
        updateDoc(doc(db, 'invoices', String(id)), {
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