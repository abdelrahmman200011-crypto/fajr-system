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
  CreditCard,
  Phone,
  Car,
  ChevronDown,
  ChevronUp,
  Eye,
  Wallet,
  Banknote,
  TrendingUp,
  ArrowRight,
  CircleCheck,
  CircleAlert,
  Printer,
  Hotel,
} from 'lucide-react';
import { formatSAR, calculateTripStatus, invoiceTotals } from '../data/mockData';

const paymentStyles = {
  'مدفوع': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'عربون': 'bg-amber-50 text-amber-700 ring-amber-200',
  'غير مدفوع': 'bg-rose-50 text-rose-600 ring-rose-200',
};

const methodStyles = {
  'كاش': 'bg-gray-50 text-gray-600 ring-gray-200',
  'فيزا / شبكة': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'تحويل بنكي': 'bg-teal-50 text-teal-700 ring-teal-200',
};

const invoiceMethod = (inv) =>
  inv.paymentMethod ||
  (inv.paymentType === 'بنك' ? 'تحويل بنكي' : inv.paymentType) ||
  'كاش';

const emptyTrip = {
  tripNumber: '',
  destination: '',
  gatheringPoint: '',
  departure: '',
  returnDate: '',
  time: '10:00',
  capacity: 49,
  hotelName: '',
  price: '',
  driverName: '',
  driverIqama: '',
  driverPhone: '',
  plate: '',
};

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
}) {
  const [trip, setTrip] = useState(emptyTrip);
  const [expanded, setExpanded] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  if (selectedTrip) {
    return (
      <TripDetails
        trip={selectedTrip}
        passengers={passengers}
        invoices={invoices}
        packages={packages}
        services={services}
        onBack={() => {
          setSelectedTripId(null);
          setExpanded(null);
        }}
      />
    );
  }

  const set = (field, value) => setTrip((prev) => ({ ...prev, [field]: value }));

  const submit = (e) => {
    e.preventDefault();
    if (!trip.tripNumber.trim() || !trip.destination.trim() || !trip.departure) return;
    if (trip.price !== '' && Number.isNaN(Number(trip.price))) return;
    onAddTrip({ ...trip, price: Number(trip.price) || 0 });
    setTrip(emptyTrip);
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

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
      {/* Trip & Fleet Management form */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
            <Route className="h-5 w-5" />
          </span>
          إدارة الرحلة والأسطول
          <span className="rounded-full bg-emerald-600/10 px-3 py-0.5 text-xs font-bold text-emerald-700">
            رحلة جديدة
          </span>
        </h3>

        <form onSubmit={submit} className="space-y-6">
          {/* Core trip info */}
          <section>
            <div className="mb-4 flex items-center gap-2.5">
              <Bus className="h-5 w-5 text-emerald-700" />
              <h4 className="text-sm font-extrabold text-gray-800">
                معلومات الرحلة
              </h4>
              <span className="h-px flex-1 bg-gradient-to-l from-emerald-200 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>رقم الرحلة</label>
                  <input
                    type="text"
                    value={trip.tripNumber}
                    onChange={(e) => set('tripNumber', e.target.value)}
                    placeholder="مثال: TR-123"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>نقطة التجمع / نقطة الانطلاق</label>
                  <input
                    type="text"
                    value={trip.gatheringPoint}
                    onChange={(e) => set('gatheringPoint', e.target.value)}
                    placeholder="مثال: محطة رمسيس أمام المدخل الرئيسي"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>الوجهة</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={trip.destination}
                    onChange={(e) => set('destination', e.target.value)}
                    placeholder="مكة المكرمة"
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>تاريخ الذهاب</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={trip.departure}
                    onChange={(e) => set('departure', e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>تاريخ العودة</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={trip.returnDate}
                    onChange={(e) => set('returnDate', e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>الوقت</label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={trip.time}
                    onChange={(e) => set('time', e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>الطاقة الاستيعابية / الحمولة</label>
                <div className="relative">
                  <Armchair className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    value={trip.capacity}
                    onChange={(e) => set('capacity', Number(e.target.value))}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Accommodation hotel + price */}
          <section>
            <div className="mb-4 flex items-center gap-2.5">
              <Hotel className="h-5 w-5 text-teal-600" />
              <h4 className="text-sm font-extrabold text-gray-800">
                الإقامة والتسعير
              </h4>
              <span className="h-px flex-1 bg-gradient-to-l from-teal-200 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>اسم الفندق (نص حر)</label>
                <div className="relative">
                  <Hotel className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={trip.hotelName}
                    onChange={(e) => set('hotelName', e.target.value)}
                    placeholder="مثال: فندق أبراج الراحة — مكة"
                    className={`${inputClass} pr-10`}
                  />
                </div>
                <p className="mt-1.5 text-xs font-medium text-gray-400">
                  اسم الفندق يُكتب يدوياً ولا يرتبط بقسم إدارة الفنادق
                </p>
              </div>

              <div>
                <label className={labelClass}>سعر الرحلة للفرد</label>
                <div className="relative">
                  <Wallet className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={trip.price}
                    onChange={(e) => set('price', e.target.value)}
                    placeholder="0"
                    className={`${inputClass} pr-10`}
                  />
                </div>
                <p className="mt-1.5 text-xs font-medium text-gray-400">
                  يُستخدم هذا السعر تلقائياً عند إصدار الفواتير من نقطة البيع
                </p>
              </div>
            </div>
          </section>

          {/* Driver & bus info */}
          <section>
            <div className="mb-4 flex items-center gap-2.5">
              <Car className="h-5 w-5 text-amber-600" />
              <h4 className="text-sm font-extrabold text-gray-800">
                السائق والحافلة
              </h4>
              <span className="h-px flex-1 bg-gradient-to-l from-amber-200 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>اسم السائق</label>
                <div className="relative">
                  <User className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={trip.driverName}
                    onChange={(e) => set('driverName', e.target.value)}
                    placeholder="مثال: عبدالله سالم الزهراني"
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رقم الإقامة</label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={trip.driverIqama}
                    onChange={(e) => set('driverIqama', e.target.value)}
                    placeholder="رقم الإقامة / الهوية"
                    className={`${inputClass} pr-10`}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رقم جوال السائق</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={trip.driverPhone}
                    onChange={(e) => set('driverPhone', e.target.value)}
                    placeholder="05xxxxxxxx"
                    className={`${inputClass} pr-10`}
                    inputMode="tel"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رقم اللوحة</label>
                <input
                  type="text"
                  value={trip.plate}
                  onChange={(e) => set('plate', e.target.value)}
                  placeholder="4875 د ن"
                  className={`${inputClass} text-center font-bold tracking-widest`}
                  dir="ltr"
                />
              </div>
            </div>
          </section>

          <button type="submit" className="btn-primary w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            إنشاء الرحلة
          </button>
        </form>
      </div>

      {/* Trips table */}
      <div className="rounded-2xl border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-gray-100/80 p-6 pb-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Bus className="h-5 w-5" />
            </span>
            الرحلات المسجلة
          </h3>
          <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700">
            {trips.length} رحلة
          </span>
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
              {trips.map((t) => {
                const pct = occupied(t);
                const isOpen = expanded === t.id;
                const tripStatus = calculateTripStatus(t, t.bookedCount ?? 0);
                return (
                  <FragmentRow
                    key={t.id}
                    t={t}
                    status={tripStatus}
                    isOpen={isOpen}
                    pct={pct}
                    barColor={barColor(t)}
                    formatDate={formatDate}
                    onToggle={() => toggle(t.id)}
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
  isOpen,
  pct,
  barColor,
  formatDate,
  onToggle,
  onView,
  canDelete,
  onDelete,
}) {
  return (
    <>
      <tr className="border-t border-gray-100 transition-colors hover:bg-emerald-50/40">
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
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={onView}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
              aria-label="عرض التفاصيل"
              title="عرض التفاصيل"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-amber-50 hover:text-amber-600"
              aria-label="إظهار تفاصيل الرحلة"
              title="إظهار تفاصيل الرحلة"
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {canDelete && (
            <button
              onClick={() => {
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

      {isOpen && (
        <tr className="border-t border-dashed border-emerald-100/80 bg-gradient-to-b from-emerald-50/40 to-amber-50/20">
          <td colSpan={7} className="px-6 py-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-emerald-100">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-gray-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-700">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  جدول الرحلة
                </h4>
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold text-gray-400">تاريخ الذهاب</p>
                    <p className="mt-0.5 font-bold text-gray-800" dir="ltr">
                      {formatDate(t.departure)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">تاريخ العودة</p>
                    <p className="mt-0.5 font-bold text-gray-800" dir="ltr">
                      {formatDate(t.returnDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">الوقت</p>
                    <p className="mt-0.5">
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200"
                        dir="ltr"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        {t.time || '10:00'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">الحالة</p>
                    <p className="mt-0.5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${status.color} ${status.ring}`}
                      >
                        {status.text}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-amber-100">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-gray-800">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <Bus className="h-4 w-4" />
                  </span>
                  السائق والحافلة
                </h4>
                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-gray-400">اسم السائق</p>
                    <p className="mt-0.5 font-bold text-gray-800">
                      {t.driverName || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">رقم الإقامة</p>
                    <p className="mt-0.5 font-bold text-gray-800" dir="ltr">
                      {t.driverIqama || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">جوال السائق</p>
                    <p className="mt-0.5 font-bold text-gray-800" dir="ltr">
                      {t.driverPhone || '—'}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-gray-400">رقم اللوحة</p>
                    <p
                      className="mt-1 inline-flex items-center gap-1.5 rounded-lg border-2 border-gray-800/80 bg-white px-4 py-1.5 text-sm font-extrabold tracking-widest text-gray-900"
                      dir="ltr"
                    >
                      <Car className="h-4 w-4 text-amber-600" />
                      {t.plate || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
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
}) {
  const [printNode, setPrintNode] = useState(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'print-manifest';
    document.body.appendChild(el);
    setPrintNode(el);
    return () => el.remove();
  }, []);

  const { rows, expected, collected, remaining, collectionPct } = useMemo(() => {
    const tripInvoices = invoices.filter((inv) => inv.tripId === trip.id);
    const rows = tripInvoices.map((inv) => {
      const passenger = passengers.find((p) => p.id === inv.passengerId) || null;
      const { total, paid, remaining } = invoiceTotals(inv, packages, services);
      let status = 'غير مدفوع';
      if (total > 0 && paid >= total) status = 'مدفوع';
      else if (paid > 0) status = 'عربون';
      return { inv, passenger, total, paid, remaining, status };
    });
    const expected = rows.reduce((a, r) => a + r.total, 0);
    const collected = rows.reduce((a, r) => a + r.paid, 0);
    const remaining = Math.max(expected - collected, 0);
    const collectionPct =
      expected > 0 ? Math.round((collected / expected) * 100) : 0;
    return { rows, expected, collected, remaining, collectionPct };
  }, [trip.id, invoices, passengers, packages, services]);

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
              {rows.length} فاتورة مسجلة
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

      {/* Section 3 — Passengers roster */}
      <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-gray-100/80 p-6 pb-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
              <User className="h-5 w-5" />
            </span>
            قائمة ركاب الرحلة
          </h3>
          <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700">
            {rows.length} مسافر
          </span>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Bus className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-base font-bold text-gray-500">
              لا توجد ركاب مسجلة لهذه الرحلة
            </p>
            <p className="mt-1 text-sm text-gray-400">
              قم بإصدار فواتير لهذه الرحلة من صفحة الفواتير
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-right text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3.5 text-center">م</th>
                  <th className="px-4 py-3.5 text-right">اسم المسافر</th>
                  <th className="px-4 py-3.5 text-right">رقم الجوال</th>
                  <th className="px-4 py-3.5 text-right">رقم الوثيقة</th>
                  <th className="px-4 py-3.5 text-right">نوع الدفع</th>
                  <th className="px-4 py-3.5 text-right">المدفوع</th>
                  <th className="px-4 py-3.5 text-right">حالة الدفع</th>
                  <th className="px-4 py-3.5 text-right">المتبقي</th>
                  <th className="px-4 py-3.5 text-right">العنوان</th>
                  <th className="px-4 py-3.5 text-center">الغرفة</th>
                  <th className="px-4 py-3.5 text-right">ملاحظة</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.inv.id}
                    className="border-t border-gray-100 transition-colors hover:bg-emerald-50/40"
                  >
                    <td className="px-4 py-4 text-center font-bold text-gray-400">
                      {i + 1}
                    </td>
                    <td className="px-4 py-4">
                      <p className="inline-flex items-center gap-1 font-bold text-gray-800">
                        <CircleCheck
                          className={`h-4 w-4 ${r.status === 'مدفوع' ? 'text-emerald-500' : r.status === 'عربون' ? 'text-amber-500' : 'text-rose-400'}`}
                        />
                        {r.passenger?.fullName || 'مسافر محذوف'}
                      </p>
                      {r.passenger?.familyId && (
                        <p className="mt-0.5 text-[10px] font-bold text-violet-500">
                          {r.passenger.familyId}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-600" dir="ltr">
                      {r.passenger?.phone || '—'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-600" dir="ltr">
                      {r.passenger?.documentId || '—'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                          methodStyles[invoiceMethod(r.inv)] ||
                          'bg-gray-50 text-gray-600 ring-gray-200'
                        }`}
                      >
                        {invoiceMethod(r.inv)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-gray-800">
                      {formatSAR(r.inv.paidAmount ?? r.paid)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${paymentStyles[r.status]}`}
                      >
                        {r.status === 'مدفوع' ? (
                          <CircleCheck className="h-3.5 w-3.5" />
                        ) : (
                          <CircleAlert className="h-3.5 w-3.5" />
                        )}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`font-extrabold ${
                          r.remaining > 0 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {formatSAR(r.remaining)}
                      </span>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-4 text-xs font-semibold text-gray-600" title={r.passenger?.address}>
                      {r.passenger?.address || '—'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-lg bg-emerald-50 px-2 py-0.5 font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                        {r.passenger?.roomNumber || '—'}
                      </span>
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-4 text-xs font-semibold text-gray-500" title={r.passenger?.notes}>
                      {r.passenger?.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ===== Printable Official Manifest (portal to body, print only) ===== */}
      {printNode &&
        createPortal(
          <PrintTripRoster trip={trip} passengers={rows} />,
          printNode
        )}
    </div>
  );
}