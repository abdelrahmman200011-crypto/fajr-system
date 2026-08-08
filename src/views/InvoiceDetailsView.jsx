import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  User,
  Users,
  Phone,
  CreditCard,
  Bus,
  Package,
  Wallet,
  CircleCheck,
  CircleAlert,
  Ban,
  Printer,
  Trash2,
  Lock,
  ArrowLeftRight,
  ReceiptText,
  MapPin,
  CalendarDays,
  Banknote,
  IdCard,
  NotebookPen,
} from 'lucide-react';
import {
  formatSAR,
  familyMembers,
  familyHead,
  invoiceTotals,
} from '../data/mockData';
import PaymentModal from '../components/PaymentModal';
import PrintInvoice from '../components/PrintInvoice';

const BRAND_GREEN = 'text-[#4a8b41]';
const BRAND_BROWN = 'text-[#713639]';

export default function InvoiceDetailsView({
  invoiceId,
  invoices,
  passengers,
  trips,
  packages,
  services,
  currentUser,
  onBack,
  onAddPayment,
  onCancelPassenger,
  onDeleteInvoice,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [printNode, setPrintNode] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'print-invoice-details';
    document.body.appendChild(el);
    setPrintNode(el);
    return () => el.remove();
  }, []);

  const invoice = invoices.find((inv) => inv.id === invoiceId) || null;
  const passenger = invoice
    ? passengers.find((p) => p.id === invoice.passengerId)
    : null;
  const trip = invoice ? trips.find((t) => t.id === invoice.tripId) : null;
  const pkg = invoice
    ? packages.find((p) => p.id === invoice.packageId)
    : null;

  const head = familyHead(passengers, passenger?.familyId);
  const members = familyMembers(passengers, passenger?.familyId);
  const companions = members.filter((m) => m.id !== head?.id);
  const isCompanion = Boolean(head && head.id !== passenger?.id);

  const coveredCount =
    Number(invoice?.coveredCount) || invoice?.coveredPassengers?.length || 1;
  const totals = invoiceTotals(invoice, packages, services);
  const total = totals.totalAmount;
  const paid = totals.paid;
  const remaining = totals.remaining;
  const isCanceled = passenger?.status === 'canceled';
  const payments = Array.isArray(invoice?.paymentHistory)
    ? invoice.paymentHistory
    : [];
  const currentPaidAmount = payments.reduce(
    (acc, p) => acc + Number(p.amount || 0),
    0
  );
  const canHardDelete = currentPaidAmount <= 0;
  const refundableAmount = Math.abs(currentPaidAmount);

  const handlePrint = () => {
    if (!invoice) return;
    setInvoiceToPrint({
      ...invoice,
      passenger,
      trip,
      pkg,
      total,
      paid,
    });
    window.setTimeout(() => window.print(), 50);
  };

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/70 p-10 text-center shadow-soft backdrop-blur-xl">
        <p className="text-base font-bold text-gray-500">
          الفاتورة غير موجودة أو تم حذفها.
        </p>
        <button onClick={onBack} className="btn-primary mt-5">
          <ArrowRight className="h-4 w-4" />
          العودة للفواتير
        </button>
      </div>
    );
  }

  const statusBadge = isCanceled ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-600 ring-1 ring-red-200">
      <Ban className="h-3.5 w-3.5" />
      ملغاة
    </span>
  ) : remaining === 0 && total > 0 ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
      <CircleCheck className="h-3.5 w-3.5" />
      مسددة بالكامل
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 ring-1 ring-amber-200">
      <CircleAlert className="h-3.5 w-3.5" />
      {paid > 0 ? 'مدفوع جزئياً' : 'غير مدفوع'}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-gray-800 to-gray-900 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-gray-900/20 transition hover:from-gray-700 hover:to-gray-800"
            aria-label="العودة لقائمة الفواتير"
          >
            <ArrowRight className="h-5 w-5" />
            عودة لقائمة الفواتير
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
            <ReceiptText className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-extrabold text-gray-900">
                تفاصيل الفاتورة
              </h2>
              <span
                className="inline-flex rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-extrabold text-gray-700"
                dir="ltr"
              >
                #{invoice.id}
              </span>
              {statusBadge}
            </div>
            <p className="text-sm text-gray-500">
              {passenger?.fullName || 'سجل مفقود'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* LEFT column: customer + trip + package info */}
        <div className="space-y-5 lg:col-span-3">
          {/* Customer details */}
          <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
            <h3 className={`mb-4 flex items-center gap-2 text-sm font-extrabold ${BRAND_GREEN}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4a8b41]/10">
                <User className="h-4 w-4" />
              </span>
              بيانات العميل
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-gray-400">الاسم الكامل</p>
                <p className="mt-1 font-extrabold text-gray-900">
                  {passenger?.fullName || '—'}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <Phone className="h-3 w-3" />
                  رقم الجوال
                </p>
                <p className="mt-1 font-bold text-gray-800" dir="ltr">
                  {passenger?.phone || '—'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-bold text-gray-400">
                  رقم الهوية / الإقامة
                </p>
                <p className="mt-1 font-bold text-gray-800" dir="ltr">
                  {passenger?.documentId || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400">الفرع</p>
                <p className="mt-1 font-bold text-gray-800">
                  {passenger?.branch || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400">العنوان</p>
                <p className="mt-1 font-bold text-gray-800">
                  {passenger?.address || '—'}
                </p>
              </div>
            </div>
          </section>

          {/* Trip details */}
          <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
            <h3 className={`mb-4 flex items-center gap-2 text-sm font-extrabold ${BRAND_BROWN}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#713639]/10">
                <Bus className="h-4 w-4" />
              </span>
              بيانات الرحلة
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-gray-400">رقم الرحلة</p>
                <p className="mt-1 font-extrabold text-gray-900">
                  {trip?.tripNumber || '—'}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <MapPin className="h-3 w-3" />
                  الوجهة
                </p>
                <p className="mt-1 font-bold text-gray-800">
                  {trip?.destination || '—'}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <MapPin className="h-3 w-3" />
                  نقطة التجمع / الانطلاق
                </p>
                <p className="mt-1 font-bold text-gray-800">
                  {trip?.gatheringPoint || '—'}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <CalendarDays className="h-3 w-3" />
                  تاريخ الذهاب
                </p>
                <p className="mt-1 font-bold text-gray-800" dir="ltr">
                  {trip?.departure || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400">تاريخ العودة</p>
                <p className="mt-1 font-bold text-gray-800" dir="ltr">
                  {trip?.returnDate || '—'}
                </p>
              </div>
            </div>
          </section>

          {/* Extra booking details */}
          {(invoice?.roomNumber || invoice?.bookingNotes) && (
            <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
              <h3
                className={`mb-4 flex items-center gap-2 text-sm font-extrabold text-amber-700`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <NotebookPen className="h-4 w-4" />
                </span>
                بيانات إضافية للحجز
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {invoice?.roomNumber && (
                  <div>
                    <p className="text-xs font-bold text-gray-400">رقم الغرفة</p>
                    <p className="mt-1 font-extrabold text-gray-900" dir="ltr">
                      {invoice.roomNumber}
                    </p>
                  </div>
                )}
                {invoice?.bookingNotes && (
                  <div className={invoice?.roomNumber ? '' : 'sm:col-span-2'}>
                    <p className="text-xs font-bold text-gray-400">
                      ملاحظات الحجز
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm font-bold text-gray-800">
                      {invoice.bookingNotes}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Package details */}
          {pkg && (
            <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
              <h3 className={`mb-4 flex items-center gap-2 text-sm font-extrabold ${BRAND_GREEN}`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4a8b41]/10">
                  <Package className="h-4 w-4" />
                </span>
                الباقة والخدمات
              </h3>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="font-extrabold text-gray-900">{pkg.name}</p>
                <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-extrabold text-emerald-700">
                  {formatSAR(total)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(pkg.serviceIds || []).map((sid) => {
                  const svc = services.find((s) => s.id === sid);
                  if (!svc) return null;
                  return (
                    <span
                      key={sid}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-bold text-gray-600 ring-1 ring-gray-200"
                    >
                      <CircleCheck className="h-3 w-3 text-emerald-600" />
                      {svc.name}
                    </span>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT column: financials + actions */}
        <div className="space-y-5 lg:col-span-2">
          {/* Financial status */}
          <section className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 text-white">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Wallet className="h-4 w-4" />
              </span>
              الوضع المالي
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] font-bold text-gray-400">الإجمالي</p>
                <p className="mt-1 text-lg font-extrabold">
                  {formatSAR(total)}
                </p>
              </div>
              <div className="rounded-xl bg-[#4a8b41]/25 p-3">
                <p className="text-[11px] font-bold text-emerald-200">المدفوع</p>
                <p className="mt-1 text-lg font-extrabold text-emerald-300">
                  {formatSAR(paid)}
                </p>
              </div>
              <div className="rounded-xl bg-[#b45309]/25 p-3">
                <p className="text-[11px] font-bold text-amber-200">المتبقي</p>
                <p className="mt-1 text-lg font-extrabold text-amber-300">
                  {formatSAR(remaining)}
                </p>
              </div>
            </div>
          </section>

          {/* Payment history ledger */}
          <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-gray-800">
              <Banknote className="h-4 w-4 text-emerald-600" />
              سجل المدفوعات
            </h3>
            {payments.length === 0 ? (
              <p className="rounded-xl bg-gray-50 px-3 py-4 text-center text-sm font-medium text-gray-400">
                لا توجد أي دفعات مسجلة
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase text-gray-400">
                      <th className="py-1.5 pr-0 pl-2 text-right">التاريخ</th>
                      <th className="py-1.5 px-2 text-right">الطريقة</th>
                      <th className="py-1.5 text-right">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="text-sm">
                        <td className="py-2 font-semibold text-gray-500" dir="ltr">
                          {p.date}
                        </td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${
                              Number(p.amount) < 0
                                ? 'bg-red-50 text-red-600 ring-red-200'
                                : 'bg-gray-50 text-gray-600 ring-gray-200'
                            }`}
                          >
                            {p.method || 'كاش'}
                          </span>
                        </td>
                        <td
                          className={`py-2 text-left font-extrabold ${
                            Number(p.amount) < 0
                              ? 'text-red-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {formatSAR(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Covered passengers for this invoice */}
      {Array.isArray(invoice?.coveredPassengers) &&
        invoice.coveredPassengers.length > 0 && (
          <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#713639]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#713639]/10">
                <Users className="h-4 w-4" />
              </span>
              المشمولون في هذه الفاتورة ({invoice.coveredPassengers.length})
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {invoice.coveredPassengers.map((cp) => (
                <div
                  key={cp.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-sm ${
                      cp.isPrimary
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
                    }`}
                  >
                    {cp.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-gray-800">
                      {cp.fullName}
                    </p>
                    {cp.isPrimary && (
                      <span className="text-[10px] font-extrabold text-emerald-600">
                        رب الأسرة
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Family / companions tree */}
      <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#713639]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#713639]/10">
            <Users className="h-4 w-4" />
          </span>
          شجرة العائلة / المرافقين
        </h3>

        {!passenger?.familyId ? (
          <p className="rounded-xl bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-400">
            لا يوجد رفقاء أو مرافقون مرتبطون بهذا السجل.
          </p>
        ) : isCompanion ? (
          <div className="rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50 to-fuchsia-50 p-5">
            <p className="flex items-center gap-2 text-base font-extrabold text-violet-800">
              <Users className="h-5 w-5" />
              هذا المعتمر مرافق مع: {head.fullName}
            </p>
            <p className="mt-2 text-sm font-medium text-violet-700">
              للتواصل مع المسؤول الرئيسي عن الحجز، استخدم البيانات التالية:
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm font-bold text-violet-900">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 ring-1 ring-violet-200">
                <User className="h-4 w-4 text-violet-600" />
                {head.fullName}
              </span>
              <span
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 ring-1 ring-violet-200"
                dir="ltr"
              >
                <Phone className="h-4 w-4 text-violet-600" />
                {head.phone || '—'}
              </span>
            </div>
          </div>
        ) : companions.length === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-400">
            لا يوجد رفقاء مرتبطون بهذا المعتمر.
          </p>
        ) : (
          <div>
            <p className="mb-4 text-sm font-bold text-gray-600">
              المعتمر الرئيسي «{passenger.fullName}» — لديه{' '}
              {companions.length} من الرفقاء/المرافقين:
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {companions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white shadow-sm ${
                      c.status === 'canceled'
                        ? 'bg-gray-400'
                        : 'bg-gradient-to-br from-violet-500 to-fuchsia-600'
                    }`}
                  >
                    {c.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`truncate font-extrabold text-gray-900 ${
                          c.status === 'canceled'
                            ? 'text-gray-500 line-through'
                            : ''
                        }`}
                      >
                        {c.fullName}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-px text-[10px] font-extrabold text-violet-700 ring-1 ring-violet-200">
                        <Users className="h-3 w-3" />
                        رفيق/تابع
                      </span>
                      {c.status === 'canceled' && (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-px text-[10px] font-extrabold text-red-600 ring-1 ring-red-200">
                          <Ban className="h-3 w-3" />
                          ملغى
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 space-y-1 text-xs font-semibold text-gray-500">
                      <p className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span dir="ltr">{c.phone || '—'}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <IdCard className="h-3 w-3 text-gray-400" />
                        <span dir="ltr">{c.documentId || '—'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-6 py-4 shadow-soft backdrop-blur-xl">
        <button
          onClick={() => setPayOpen(true)}
          disabled={isCanceled || remaining <= 0}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
            isCanceled || remaining <= 0
              ? 'cursor-not-allowed bg-gray-100 text-gray-300'
              : 'bg-[#4a8b41] text-white hover:bg-[#3d7637]'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          تسديد المتبقي
        </button>

        <button
          onClick={() => setCancelOpen(true)}
          disabled={isCanceled}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
            isCanceled
              ? 'cursor-not-allowed bg-gray-100 text-gray-300'
              : 'bg-[#713639] text-white hover:bg-[#5d2c2e]'
          }`}
        >
          <Ban className="h-4 w-4" />
          إلغاء الحجز
        </button>

        <button
          onClick={() => {
            if (isCanceled) onAddPayment(invoice.id, -refundableAmount, 'استرجاع نقدي');
          }}
          disabled={!isCanceled || refundableAmount <= 0}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition ${
            !isCanceled || refundableAmount <= 0
              ? 'cursor-not-allowed bg-gray-100 text-gray-300'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          تصفية / استرجاع
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          <Printer className="h-4 w-4" />
          طباعة الفاتورة
        </button>

        <div className="mr-auto flex items-center gap-2">
          {currentUser?.role !== 'admin' ? (
            <span
              title="حذف الفواتير متاح لمدير النظام فقط"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold text-gray-300"
            >
              <Lock className="h-4 w-4" />
              حذف نهائي
            </span>
          ) : !canHardDelete ? (
            <button
              type="button"
              disabled
              title="يجب تصفية الحساب واسترجاع الأموال أولاً قبل الحذف النهائي"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold text-red-300 opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              حذف نهائي
            </button>
          ) : !confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold text-red-500 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              حذف نهائي
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              <span className="text-xs font-bold text-red-600">
                هل أنت متأكد من حذف هذه الفاتورة نهائياً؟
              </span>
              <button
                onClick={() => {
                  onDeleteInvoice(invoice.id);
                  onBack();
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-red-700"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-extrabold text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel confirmation sub-modal */}
      {cancelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setCancelOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Ban className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-extrabold text-gray-900">
                إلغاء الحجز
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              سيتم تحويل حالة الحجز إلى «ملغى» وتحرير مقعده في الحافلة
              لاستيعاب حجوزات جديدة. تظل الفاتورة وسجل المدفوعات محفوظة
              للرجوع إليها عند الاسترجاع.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCancelOpen(false)}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-extrabold text-gray-600 transition hover:bg-gray-200"
              >
                تراجع
              </button>
              <button
                onClick={() => {
                  if (passenger) onCancelPassenger(passenger.id);
                  setCancelOpen(false);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-red-700"
              >
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {payOpen && invoice && (
        <PaymentModal
          invoice={invoice}
          passenger={passenger}
          services={services}
          packages={packages}
          onClose={() => setPayOpen(false)}
          onAddPayment={onAddPayment}
        />
      )}

      {/* Printable customer invoice (portal to body, print only) */}
      {printNode &&
        invoiceToPrint &&
        createPortal(<PrintInvoice invoice={invoiceToPrint} />, printNode)}
    </div>
  );
}
