import { useMemo } from 'react';
import {
  ArrowRight,
  User,
  Building2,
  CreditCard,
  Venus,
  Mars,
  Ban,
  IdCard,
  ReceiptText,
  Bus,
  Wallet,
  CalendarDays,
  Sparkles,
  RotateCcw,
  CircleCheck,
  CircleAlert,
  MessageSquareText,
} from 'lucide-react';
import {
  formatSAR,
  invoiceTotals,
} from '../data/mockData';
import { buildReminderMessage } from '../services/ai';

const GENDER_META = {
  ذكر: { icon: Venus, cls: 'text-sky-700' },
  أنثى: { icon: Mars, cls: 'text-pink-700' },
};

function Field({ label, value, ltr }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400">{label}</p>
      <p className="mt-1 font-bold text-gray-800" dir={ltr ? 'ltr' : undefined}>
        {value || '—'}
      </p>
    </div>
  );
}

function StatusBadge({ label, cls, icon: Icon }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${cls}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

export default function ClientProfile({
  clientId,
  passengers,
  invoices,
  trips,
  packages,
  services,
  onBack,
}) {
  const client = passengers.find((p) => p.id === clientId) || null;

  const clientInvoices = useMemo(
    () =>
      invoices.filter(
        (inv) => inv.passengerId === clientId || inv.clientId === clientId
      ),
    [invoices, clientId]
  );

  const bookings = useMemo(() => {
    const map = new Map();
    clientInvoices.forEach((inv) => {
      if (!inv.tripId) return;
      let existing = map.get(inv.tripId);
      if (!existing) {
        existing = {
          tripId: inv.tripId,
          trip: trips.find((t) => t.id === inv.tripId) || null,
          invoices: [],
        };
        map.set(inv.tripId, existing);
      }
      existing.invoices.push(inv);
    });
    return [...map.values()];
  }, [clientInvoices, trips]);

  if (!client) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/70 p-10 text-center shadow-soft backdrop-blur-xl">
        <p className="text-base font-bold text-gray-500">
          الملف غير موجود أو تم حذفه.
        </p>
        <button onClick={onBack} className="btn-primary mt-5">
          <ArrowRight className="h-4 w-4" />
          العودة
        </button>
      </div>
    );
  }

  const isCanceled = client.status === 'canceled';
  const gender = GENDER_META[client.gender] || null;
  const GenderIcon = gender?.icon || User;

  const paymentTotals = clientInvoices.reduce(
    (acc, inv) => {
      const { totalAmount, paid } = invoiceTotals(inv, packages, services);
      acc.total += totalAmount;
      acc.paid += paid;
      acc.remaining += Math.max(totalAmount - paid, 0);
      return acc;
    },
    { total: 0, paid: 0, remaining: 0 }
  );

  const bookingCount = bookings.length;
  const status =
    bookingCount === 0
      ? {
          label: 'بدون حجوزات',
          cls: 'bg-gray-100 text-gray-600 ring-gray-200',
          icon: Ban,
        }
      : bookingCount === 1
        ? {
            label: 'عميل جديد',
            cls: 'bg-sky-50 text-sky-700 ring-sky-200',
            icon: Sparkles,
          }
        : bookingCount >= 5
          ? {
              label: 'عميل VIP',
              cls: 'bg-violet-50 text-violet-700 ring-violet-200',
              icon: Sparkles,
            }
          : {
              label: 'عميل منتظم',
              cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
              icon: RotateCcw,
            };

  const StatusIcon = status.icon;

  const reminderTrip = bookings[0]?.trip || null;
  const reminderText = buildReminderMessage({
    passenger: client,
    trip: reminderTrip,
    hotel: { name: reminderTrip?.hotelName || 'الفندق المخصص' },
    notes: 'يرجى التأكد من استلام الحزمة قبل الساعة التاسعة مساءً.',
  });
  const whatsappLink = client.phone
    ? `https://wa.me/966${String(client.phone).replace(/\D/g, '').slice(-9)}?text=${encodeURIComponent(reminderText)}`
    : null;

  return (
    <div className="space-y-6">
      {/* Header / identity card */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
              aria-label="العودة"
              title="العودة"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-lg ${
                isCanceled
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-700'
              }`}
            >
              {client.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-900">
                  ملف {client.fullName}
                </h2>
                <StatusBadge
                  label={status.label}
                  cls={status.cls}
                  icon={StatusIcon}
                />
                {isCanceled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-600 ring-1 ring-red-200">
                    <Ban className="h-3.5 w-3.5" />
                    حجز ملغى
                  </span>
                )}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                <GenderIcon className={`h-4 w-4 ${gender?.cls || 'text-gray-500'}`} />
                {client.gender || '—'}
                <span className="text-gray-300">·</span>
                {client.nationality || '—'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
              <Building2 className="h-4 w-4" />
              {client.branch || '—'}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
              <IdCard className="h-3.5 w-3.5" />
              رقم التعريف بالبيانات: {clientId}
            </span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="رقم الجوال" value={client.phone} ltr />
          <Field label="السجل / الإقامة" value={client.documentId} ltr />
          <Field label="العنوان" value={client.address} />
          <Field label="الجنسية" value={client.nationality} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
            <ReceiptText className="h-4 w-4" />
            عدد الفواتير
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            {clientInvoices.length}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
            <CreditCard className="h-4 w-4" />
            إجمالي المدفوع
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            {formatSAR(paymentTotals.paid)}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
            <CalendarDays className="h-4 w-4" />
            عدد الحجوزات
          </p>
          <p className="mt-2 text-3xl font-extrabold">{bookingCount}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#713639] to-[#5d2c2e] p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
            <Wallet className="h-4 w-4" />
            المتبقي
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            {formatSAR(paymentTotals.remaining)}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">تذكير واتساب ذكي</h3>
              <p className="text-xs text-gray-500">رسالة مخصصة قبل الرحلة بناءً على بيانات العميل</p>
            </div>
          </div>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-extrabold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-500"
            >
              <MessageSquareText className="h-4 w-4" />
              إرسال رسالة واتساب
            </a>
          )}
        </div>

        <div className="rounded-xl bg-violet-50 p-4 text-sm font-medium leading-7 text-violet-900">
          {reminderText}
        </div>
      </section>

      {/* Trips history */}
      <section className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700">
              <Bus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                سجل الرحلات
              </h3>
              <p className="text-xs text-gray-500">
                كل الرحلات التي حجزها العميل سابقاً
              </p>
            </div>
          </div>
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-700">
            {bookingCount} رحلة
          </span>
        </div>

        {bookings.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-500">
            لا توجد رحلات محجوزة لهذا العميل بعد.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-right">رقم الرحلة</th>
                  <th className="px-4 py-3 text-right">الوجهة</th>
                  <th className="px-4 py-3 text-right">تاريخ الرحلة</th>
                  <th className="px-4 py-3 text-right">حالة الحجز</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const t = b.trip || {};
                  const dateLabel =
                    [
                      t.startDate || t.departure,
                      t.endDate || t.returnDate,
                    ]
                      .filter(Boolean)
                      .join(' → ') || '—';
                  return (
                    <tr
                      key={b.tripId}
                      className="border-t border-gray-100 hover:bg-emerald-50/40"
                    >
                      <td className="px-4 py-3 font-extrabold text-gray-800">
                        {t.tripNumber || '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-600">
                        {t.destination || '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-600">
                        {dateLabel}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          <CircleCheck className="h-3 w-3" />
                          محجوز
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Invoices history */}
      <section className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                سجل الفواتير
              </h3>
              <p className="text-xs text-gray-500">
                فواتير الحجز ومدفوعاتها وتواريخها
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600">
            {clientInvoices.length} فاتورة
          </span>
        </div>

        {clientInvoices.length === 0 ? (
          <p className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-500">
            لا توجد فواتير مرتبطة بهذا العميل.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-right text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-right">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right">التاريخ</th>
                  <th className="px-4 py-3 text-right">الرحلة</th>
                  <th className="px-4 py-3 text-right">الإجمالي</th>
                  <th className="px-4 py-3 text-right">المدفوع</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {clientInvoices.map((inv) => {
                  const trip = trips.find((t) => t.id === inv.tripId);
                  const { totalAmount, paid, remaining } = invoiceTotals(
                    inv,
                    packages,
                    services
                  );
                  const dateLabel =
                    inv.createdAt || inv.date || '—';
                  return (
                    <tr
                      key={inv.id}
                      className="border-t border-gray-100 hover:bg-emerald-50/40"
                    >
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-extrabold text-gray-700"
                          dir="ltr"
                        >
                          #{inv.id}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-600">
                        {dateLabel}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-600">
                        {trip?.tripNumber || '—'}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-emerald-900">
                        {formatSAR(totalAmount)}
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-700">
                        {formatSAR(paid)}
                      </td>
                      <td className="px-4 py-3">
                        {remaining <= 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                            <CircleCheck className="h-3 w-3" />
                            مدفوع بالكامل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                            <CircleAlert className="h-3 w-3" />
                            {formatSAR(remaining)} متبقي
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}