import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import PrintTripRoster from '../components/PrintTripRoster';
import {
  Plus,
  CalendarDays,
  MapPin,
  Bus,
  Armchair,
  Trash2,
  Route,
  Clock,
  User,
  Phone,
  Car,
  Eye,
  Wallet,
  Banknote,
  TrendingUp,
  ArrowRight,
  CircleCheck,
  Printer,
  Hotel,
  Save,
  Table2,
  Luggage,
} from 'lucide-react';
import { formatSAR, calculateTripStatus, invoiceTotals } from '../data/mockData';
import AddTrip from './AddTrip';

const invoiceMethod = (inv) =>
  inv.paymentMethod ||
  (inv.paymentType === 'بنك' ? 'تحويل بنكي' : inv.paymentType) ||
  'كاش';

const normalizeRow = (r) => ({
  id: r.id || `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  name: r.name || '',
  documentId: r.documentId || '',
  phone: r.phone || '',
  nationality: r.nationality || '',
  payType: r.payType || r.paymentType || '',
  amount: r.amount ?? r.paidAmount ?? '',
  address: r.address || '',
  roomNumber: r.roomNumber || '',
  notes: r.notes || '',
  clientId: r.clientId || null,
});

const inputClass = 'input-field focus:border-emerald-500 focus:ring-emerald-500/20';
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700';
const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-SA') : '—';

export default function TripsView({
  trips,
  passengers,
  invoices,
  packages,
  services,
  currentUser,
  onAddTrip,
  onDeleteTrip,
  onSaveTripPassengers,
}) {
  const [view, setTripView] = useState('list'); // 'list' | 'add'
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  const filteredTrips = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return trips.filter((t) => {
      const matchesQuery =
        !q ||
        (t.tripNumber || '').toLowerCase().includes(q) ||
        (t.destination || '').toLowerCase().includes(q) ||
        (t.gatheringPoint || '').toLowerCase().includes(q) ||
        (t.hotelName || '').toLowerCase().includes(q);

      const status = calculateTripStatus(t, t.bookedCount ?? 0).text;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && status !== 'منتهية (مغلقة)') ||
        (statusFilter === 'full' && status === 'مكتملة العدد') ||
        (statusFilter === 'completed' && status === 'منتهية (مغلقة)');

      return matchesQuery && matchesStatus;
    });
  }, [searchTerm, statusFilter, trips]);

  const tripSummary = useMemo(
    () => ({
      total: trips.length,
      active: trips.filter((t) => calculateTripStatus(t, t.bookedCount ?? 0).text !== 'منتهية (مغلقة)').length,
      full: trips.filter((t) => calculateTripStatus(t, t.bookedCount ?? 0).text === 'مكتملة العدد').length,
      completed: trips.filter((t) => calculateTripStatus(t, t.bookedCount ?? 0).text === 'منتهية (مغلقة)').length,
    }),
    [trips]
  );

  if (view === 'add') {
    return (
      <AddTrip
        onAddTrip={onAddTrip}
        onCancel={() => setTripView('list')}
        onCreated={(created) => {
          setTripView('list');
          if (created?.id) setSelectedTripId(created.id);
        }}
      />
    );
  }

  if (selectedTrip) {
    return (
      <TripDetails
        trip={selectedTrip}
        passengers={passengers}
        invoices={invoices}
        packages={packages}
        services={services}
        currentUser={currentUser}
        onBack={() => {
          setSelectedTripId(null);
        }}
        onSaveTripPassengers={onSaveTripPassengers}
      />
    );
  }

  const occupied = (t) =>
    t.capacity > 0
      ? Math.min(Math.round(((t.bookedCount || 0) / t.capacity) * 100), 100)
      : 0;

  const barColor = (t) =>
    (t.bookedCount || 0) >= t.capacity
      ? 'bg-gradient-to-l from-red-400 to-rose-500'
      : t.bookedCount >= t.capacity * 0.75
        ? 'bg-gradient-to-l from-amber-400 to-orange-500'
        : 'bg-gradient-to-l from-emerald-400 to-teal-500';

  return (
    <div className="space-y-6">
      {/* Page header + Add Trip button */}
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-gradient-to-l from-primary-green via-primary-green to-primary-green-deep p-6 text-white shadow-premium sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <Bus className="h-7 w-7 text-accent-gold" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold sm:text-2xl">
              الرحلات المسجلة
            </h1>
            <p className="mt-1 text-sm font-medium text-emerald-50/80">
              {trips.length} رحلة — اضغط على أي رحلة لعرض تفاصيلها
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTripView('add')}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-gold px-5 py-3 text-sm font-extrabold text-primary-green shadow-lg shadow-accent-gold/20 transition hover:bg-[#d7ba58] w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          أضف رحلة جديدة
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-xs font-bold text-slate-500">إجمالي الرحلات</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{tripSummary.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-soft">
          <p className="text-xs font-bold text-emerald-700">نشطة</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-900">{tripSummary.active}</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-soft">
          <p className="text-xs font-bold text-red-700">مكتملة</p>
          <p className="mt-2 text-2xl font-extrabold text-red-900">{tripSummary.full}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-xs font-bold text-slate-500">منتهية</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{tripSummary.completed}</p>
        </div>
      </div>

      {/* Trips list */}
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-col gap-4 border-b border-gray-100/80 p-6 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Bus className="h-5 w-5" />
            </span>
            قائمة الرحلات
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم الرحلة أو الوجهة..."
              className="input-field w-full sm:w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full sm:w-44"
            >
              <option value="all">كل الحالات</option>
              <option value="active">نشطة</option>
              <option value="full">مكتملة</option>
              <option value="completed">منتهية</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3.5 text-right">رقم الرحلة \ الحافلة</th>
                <th className="px-6 py-3.5 text-right">الوجهة</th>
                <th className="px-6 py-3.5 text-right">نقطة التجمع</th>
                <th className="px-6 py-3.5 text-right">تاريخ الذهاب</th>
                <th className="px-6 py-3.5 text-right">الطاقة الاستيعابية</th>
                <th className="px-6 py-3.5 text-right">الحالة</th>
                <th className="px-6 py-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm font-semibold text-gray-500">
                    لا توجد رحلات تطابق البحث الحالي.
                  </td>
                </tr>
              )}
              {filteredTrips.map((t) => {
                const pct = occupied(t);
                const tripStatus = calculateTripStatus(t, t.bookedCount ?? 0);
                return (
                  <FragmentRow
                    key={t.id}
                    t={t}
                    status={tripStatus}
                    pct={pct}
                    barColor={barColor(t)}
                    formatDate={formatDate}
                    onView={() => setSelectedTripId(t.id)}
                    canDelete={currentUser?.role === 'admin'}
                    onDelete={() => onDeleteTrip(t.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- main table row ---------------- */

function FragmentRow({
  t,
  status,
  pct,
  barColor,
  formatDate,
  onView,
  canDelete,
  onDelete,
}) {
  return (
    <tr
      onClick={onView}
      className="cursor-pointer border-t border-gray-100 transition-colors hover:bg-emerald-50/60 group"
    >
      <td className="px-6 py-4">
        <p className="font-bold text-gray-800" dir="ltr">{t.tripNumber}</p>
        <p className="text-xs font-medium text-gray-400">
          {t.hotelName || 'بدون فندق'}
        </p>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-600">
          <MapPin className="h-4 w-4 text-amber-600" />
          {t.destination}
        </span>
      </td>
      <td className="max-w-[180px] truncate px-6 py-4 text-xs font-semibold text-gray-600" title={t.gatheringPoint}>
        {t.gatheringPoint || '—'}
      </td>
      <td className="px-6 py-4 font-semibold text-gray-600" dir="ltr">
        {formatDate(t.departure)}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 font-bold text-gray-800">
          <Armchair className="h-4 w-4 text-emerald-600" />
          {t.capacity}
          <span className="text-xs font-medium text-gray-400">مقعد</span>
        </span>
        <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] font-bold text-gray-400">
          محجوز {t.bookedCount ?? 0} / {t.capacity}
        </p>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${status.color} ${status.ring}`}
        >
          {status.text}
        </span>
      </td>
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-1.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition group-hover:bg-emerald-50 group-hover:text-emerald-600"
            aria-label="عرض التفاصيل"
            title="عرض التفاصيل"
          >
            <Eye className="h-4 w-4" />
          </span>
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm(
                    `هل تريد حذف الرحلة رقم «${t.tripNumber}» نهائياً من النظام؟`
                  )
                ) {
                  onDelete();
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              aria-label="حذف الرحلة"
              title="حذف الرحلة"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ---------------- Trip Details Dashboard ---------------- */

function InfoCard({ icon: Icon, iconBg, label, value, valueDir }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-xs font-bold text-gray-500">{label}</p>
      </div>
      <p
        className={`truncate text-lg font-extrabold text-gray-900 ${valueDir || ''}`}
      >
        {value}
      </p>
    </div>
  );
}

function TripDetails({
  trip,
  passengers,
  invoices,
  packages,
  services,
  onBack,
  onSaveTripPassengers,
}) {
  const [printNode, setPrintNode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [luggageInstructions, setLuggageInstructions] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'print-manifest';
    document.body.appendChild(el);
    setPrintNode(el);
    return () => el.remove();
  }, []);

  const { bookings, expected, collected, remaining, collectionPct } = useMemo(() => {
    const tripInvoices = invoices.filter((inv) => inv.tripId === trip.id);
    const bookings = tripInvoices.map((inv) => {
      const passenger = passengers.find((p) => p.id === inv.passengerId) || null;
      const { total, paid, remaining } = invoiceTotals(inv, packages, services);
      let status = 'غير مدفوع';
      if (total > 0 && paid >= total) status = 'مدفوع';
      else if (paid > 0) status = 'عربون';
      return { inv, passenger, total, paid, remaining, status };
    });
    const expected = bookings.reduce((a, r) => a + r.total, 0);
    const collected = bookings.reduce((a, r) => a + r.paid, 0);
    const remaining = Math.max(expected - collected, 0);
    const collectionPct =
      expected > 0 ? Math.round((collected / expected) * 100) : 0;
    return { bookings, expected, collected, remaining, collectionPct };
  }, [trip.id, invoices, passengers, packages, services]);

  /* ---- derived read-only passenger list from trip.passengers (or legacy bookings) ---- */
  const manifest = useMemo(() => {
    if (Array.isArray(trip.passengers) && trip.passengers.length > 0) {
      return trip.passengers.map(normalizeRow);
    }
    return bookings.map((b) =>
      normalizeRow({
        name: b.passenger?.fullName || '',
        documentId: b.passenger?.documentId,
        phone: b.passenger?.phone,
        nationality: b.passenger?.nationality,
        payType: invoiceMethod(b.inv),
        amount: b.paid,
        address: b.passenger?.address,
        roomNumber: b.passenger?.roomNumber,
        notes: b.passenger?.notes,
        clientId: b.passenger?.id,
      })
    );
  }, [trip.passengers, bookings]);

  /* ---- keep luggage instructions & general notes in sync with the trip ---- */
  useEffect(() => {
    setLuggageInstructions(trip.luggageInstructions || '');
    setGeneralNotes(trip.generalNotes || '');
  }, [trip.id, trip.luggageInstructions, trip.generalNotes]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      await onSaveTripPassengers(
        trip.id,
        manifest,
        {
          luggageInstructions: luggageInstructions.trim(),
          generalNotes: generalNotes.trim(),
        }
      );
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 3000);
    } catch (err) {
      console.error('فشل حفظ ملاحظات الرحلة:', err);
    } finally {
      setSaving(false);
    }
  };

  const capacity = trip.capacity || 0;
  const booked = trip.bookedCount ?? 0;
  const capPct = capacity > 0 ? Math.min(Math.round((booked / capacity) * 100), 100) : 0;
  const tripStatus = calculateTripStatus(trip, booked);
  const tripHotelName = trip.hotelName || '';

  return (
    <div className="space-y-6">
      {/* Header + back */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
            <Bus className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
              رحلة {trip.tripNumber}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                <MapPin className="h-3 w-3" />
                {trip.destination}
              </span>
              {trip.gatheringPoint && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
                  <MapPin className="h-3 w-3" />
                  {trip.gatheringPoint}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                <Wallet className="h-3 w-3" />
                {formatSAR(trip.price)}
              </span>
              {tripHotelName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 ring-1 ring-teal-200">
                  <Hotel className="h-3 w-3" />
                  {tripHotelName}
                </span>
              )}
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${tripStatus.color} ${tripStatus.ring}`}
              >
                {tripStatus.text}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 print:hidden sm:flex-row sm:items-center">
          <button
            onClick={() => window.print()}
            className="btn-outline w-full sm:w-auto"
          >
            <Printer className="h-4 w-4" />
            طباعة الكشف الرسمي
          </button>
          <button
            onClick={onBack}
            className="btn-outline w-full sm:w-auto"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى الرحلات
          </button>
        </div>
      </div>

      {/* Capacity strip */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-gray-800">
            نسبة امتلاء الرحلة
          </p>
          <span className="text-sm font-bold text-gray-600">
            محجوز {booked} من {capacity} مقعد ({capPct}٪)
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-all ${
              booked >= capacity
                ? 'bg-gradient-to-l from-red-400 to-rose-500'
                : capPct >= 75
                  ? 'bg-gradient-to-l from-amber-400 to-orange-500'
                  : 'bg-gradient-to-l from-emerald-400 to-teal-500'
            }`}
            style={{ width: `${capPct}%` }}
          />
        </div>
      </div>

      {/* Section 1 — Trip & Fleet info */}
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
            <Route className="h-5 w-5" />
          </span>
          معلومات الرحلة والأسطول
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={MapPin}
            iconBg="bg-amber-500/10 text-amber-600"
            label="الوجهة"
            value={trip.destination || '—'}
          />
          <InfoCard
            icon={CalendarDays}
            iconBg="bg-emerald-600/10 text-emerald-700"
            label="تاريخ الذهاب"
            value={formatDate(trip.departure)}
            valueDir="ltr"
          />
          <InfoCard
            icon={CalendarDays}
            iconBg="bg-emerald-600/10 text-emerald-700"
            label="تاريخ العودة"
            value={formatDate(trip.returnDate)}
            valueDir="ltr"
          />
          <InfoCard
            icon={Clock}
            iconBg="bg-sky-50 text-sky-600"
            label="وقت الانطلاق"
            value={trip.time || '10:00'}
            valueDir="ltr"
          />
          <InfoCard
            icon={MapPin}
            iconBg="bg-sky-50 text-sky-600"
            label="نقطة التجمع / الانطلاق"
            value={trip.gatheringPoint || '—'}
          />

          {/* Fleet card — spans full width */}
          <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:col-span-2 lg:col-span-4">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Car className="h-5 w-5" />
              </span>
              <h4 className="text-sm font-extrabold text-gray-800">
                السائق والحافلة
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-bold text-gray-400">اسم السائق</p>
                <p className="mt-1 font-bold text-gray-800">
                  <User className="ml-1 inline h-4 w-4 text-emerald-600" />
                  {trip.driverName || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400">رقم الإقامة</p>
                <p className="mt-1 font-bold text-gray-800" dir="ltr">
                  {trip.driverIqama || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400">جوال السائق</p>
                <p className="mt-1 font-bold text-gray-800" dir="ltr">
                  <Phone className="ml-1 inline h-4 w-4 text-emerald-600" />
                  {trip.driverPhone || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400">رقم اللوحة</p>
                <p
                  className="mt-1 inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-800/80 bg-white px-3 py-1 text-sm font-extrabold tracking-widest text-gray-900"
                  dir="ltr"
                >
                  {trip.plate || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Financial KPIs */}
      <section>
        <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <Wallet className="h-5 w-5" />
          </span>
          الملخص المالي
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5 shadow-lg shadow-emerald-700/20">
            <span className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-emerald-50/90">
                الإجمالي المتوقع
              </p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Wallet className="h-5 w-5 text-white" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-white">
              {formatSAR(expected)}
            </p>
            <p className="mt-1 text-xs font-medium text-emerald-50/80">
              {bookings.length} فاتورة مسجلة
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-700/20">
            <span className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-amber-50/90">إجمالي المحصل</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Banknote className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold">
              {formatSAR(collected)}
            </p>
            <p className="mt-1 text-xs font-medium text-amber-50/80">
              نسبة التحصيل {collectionPct}٪
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-5 text-white shadow-lg shadow-rose-700/20">
            <span className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-rose-50/90">إجمالي المتبقي</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <TrendingUp className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-extrabold">
              {formatSAR(remaining)}
            </p>
            <p className="mt-1 text-xs font-medium text-rose-50/80">
              {remaining > 0 ? 'مستحق التحصيل' : 'تم تحصيل كامل المبالغ'}
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 — Read-only passengers roster */}
      <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100/80 p-6 pb-4">
          <div>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                <User className="h-5 w-5" />
              </span>
              كشف الحجاج
            </h3>
            <p className="mt-1 text-xs font-medium text-gray-400">
              المسافرون المرتبطون بهذه الرحلة — تُضاف الحجوزات من نقطة البيع
            </p>
          </div>
          <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700">
            {manifest.length} مسافر
          </span>
        </div>

        {manifest.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Table2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-base font-bold text-gray-500">
              لا يوجد ركاب مسجلون في هذه الرحلة
            </p>
            <p className="mt-1 text-sm text-gray-400">
              استخدم نقطة البيع لإضافة حجز لهذه الرحلة
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-right text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <th className="w-12 px-4 py-3.5 text-center">م</th>
                  <th className="min-w-[200px] px-4 py-3.5 text-right">الاسم</th>
                  <th className="w-[150px] px-4 py-3.5 text-right">السجل / الإقامة</th>
                  <th className="w-[130px] px-4 py-3.5 text-right">رقم الجوال</th>
                  <th className="w-[110px] px-4 py-3.5 text-right">الجنسية</th>
                  <th className="w-[110px] px-4 py-3.5 text-right">نوع الدفع</th>
                  <th className="w-[110px] px-4 py-3.5 text-center">القيمة</th>
                  <th className="w-[90px] px-4 py-3.5 text-center">الغرفة</th>
                  <th className="w-[160px] px-4 py-3.5 text-right">ملاحظة</th>
                </tr>
              </thead>
              <tbody>
                {manifest.map((row, i) => {
                  const isPaid =
                    Number(row.amount || 0) > 0 &&
                    Number(row.amount || 0) >= Number(trip.price || 0);
                  return (
                    <tr
                      key={row.id}
                      className="border-t border-gray-100 transition-colors hover:bg-emerald-50/30"
                    >
                      <td className="px-4 py-3 text-center font-bold text-gray-400">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-600" dir="ltr">
                        {row.documentId || '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-600" dir="ltr">
                        {row.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{row.nationality || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-amber-50 text-amber-700 ring-amber-200'
                          }`}
                        >
                          {row.payType || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-emerald-700">
                        {formatSAR(Number(row.amount || 0))}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-700" dir="ltr">
                        {row.roomNumber || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="line-clamp-2 text-xs font-medium text-gray-500">
                          {row.notes || ''}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50/60">
                  <td colSpan={6} className="px-4 py-3 text-xs font-bold text-gray-500">
                    إجمالي المحصل من الحجوزات
                  </td>
                  <td className="px-4 py-3 text-center font-extrabold text-emerald-700">
                    {formatSAR(
                      manifest.reduce((a, r) => a + (Number(r.amount) || 0), 0)
                    )}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Section 4 — Luggage instructions & general notes */}
      <section className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Luggage className="h-5 w-5" />
            </span>
            معلومات الأمتعة والملاحظات العامة
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {savedFlash && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                <CircleCheck className="h-3.5 w-3.5" />
                تم حفظ الملاحظات
              </span>
            )}
            <button
              type="button"
              onClick={saveNotes}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'جارٍ الحفظ...' : 'حفظ الملاحظات'}
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div>
            <label className={labelClass}>
              تعليمات الأمتعة (للسائق / المشرف)
            </label>
            <textarea
              value={luggageInstructions}
              onChange={(e) => {
                setLuggageInstructions(e.target.value);
                setSavedFlash(false);
              }}
              rows={4}
              placeholder="مثال: يُمنع فتح صناديق الحقائب بعد 06:00 مساءً، تأكد من ربط الأمتعة جيداً قبل الانطلاق..."
              className={`${inputClass} w-full resize-none`}
            />
          </div>
          <div>
            <label className={labelClass}>ملاحظات عامة على الرحلة</label>
            <textarea
              value={generalNotes}
              onChange={(e) => {
                setGeneralNotes(e.target.value);
                setSavedFlash(false);
              }}
              rows={4}
              placeholder="مثال: التوقف المخطط له في محطة الباحة، مدة التوقف 15 دقيقة..."
              className={`${inputClass} w-full resize-none`}
            />
          </div>
        </div>
      </section>

      {/* ===== Printable Official Manifest (portal to body, print only) ===== */}
      {printNode &&
        createPortal(<PrintTripRoster trip={trip} passengers={manifest} />, printNode)}
    </div>
  );
}