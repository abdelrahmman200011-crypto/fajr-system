import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Store,
  UserSearch,
  User,
  UserPlus,
  Bus,
  Wallet,
  CreditCard,
  Banknote,
  CircleCheck,
  CircleAlert,
  ReceiptText,
  Printer,
  X,
  BadgeCheck,
  Building2,
  NotebookPen,
  Armchair,
} from 'lucide-react';
import { formatSAR } from '../data/mockData';
import SearchableDropdown from '../components/SearchableDropdown';
import PrintInvoice from '../components/PrintInvoice';

const paymentMethods = ['كاش', 'فيزا / شبكة', 'تحويل بنكي'];
const nationalities = [
  'سعودي',
  'يمني',
  'هندي',
  'باكستاني',
  'سوري',
  'مصري',
  'جزر القمر',
  'إفريقي',
  'أخرى',
];

const remainingSeats = (trip) =>
  Math.max(trip.capacity - (trip.bookedCount || 0), 0);

const inputClass = 'input-field focus:border-emerald-500 focus:ring-emerald-500/20';
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700';
const cardClass =
  'relative z-10 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:p-6';

export default function POS({
  passengers,
  trips,
  currentUserBranch,
  onAddPassengers,
  onConfirmBooking,
  onViewInvoice,
}) {
  const [clientId, setClientId] = useState('');
  const [clientDetails, setClientDetails] = useState({
    fullName: '',
    documentId: '',
    phone: '',
    nationality: '',
    gender: '',
    address: '',
  });
  const [tripId, setTripId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [paid, setPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [printNode, setPrintNode] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'pos-print-invoice';
    document.body.appendChild(el);
    setPrintNode(el);
    return () => el.remove();
  }, []);

  const selectedClient = passengers.find((p) => p.id === clientId) || null;
  const selectedTrip = trips.find((t) => t.id === tripId) || null;
  const perPerson = Number(selectedTrip?.price) || 0;
  const total = perPerson;
  const paidValue = Number(paid) || 0;
  const remaining = Math.max(total - paidValue, 0);
  const methodRequired = paidValue > 0;
  const isNewClient = !selectedClient;

  const applyClient = (p) => {
    if (!p) return;
    setClientId(p.id);
    setClientDetails({
      fullName: p.fullName || '',
      documentId: p.documentId || '',
      phone: p.phone || '',
      nationality: p.nationality || '',
      gender: p.gender || '',
      address: p.address || '',
    });
    setError('');
    setSuccess(null);
  };

  const patchClientOrClear = (field, value) => {
    setSuccess(null);
    setClientId('');
    patchClient(field, value);
  };

  const patch = (field, value) => {
    setSuccess(null);
    setClientDetails((prev) => ({ ...prev, [field]: value }));
  };

  const nameValue = selectedClient ? selectedClient.fullName : clientDetails.fullName;
  const docValue = selectedClient ? selectedClient.documentId : clientDetails.documentId;
  const phoneValue = selectedClient ? selectedClient.phone : clientDetails.phone;
  const nationValue = selectedClient ? selectedClient.nationality : clientDetails.nationality;
  const genderValue = selectedClient ? selectedClient.gender : clientDetails.gender;

  const canSubmit = Boolean(
    nameValue.trim() &&
      tripId &&
      selectedTrip &&
      remainingSeats(selectedTrip) >= 1 &&
      paidValue >= 0 &&
      paidValue <= total &&
      (!methodRequired || paymentMethod)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!nameValue.trim()) {
      setError('يرجى إدخال اسم العميل أو اختياره من البحث');
      return;
    }
    if (!tripId || !selectedTrip) {
      setError('يرجى اختيار الرحلة');
      return;
    }
    if (remainingSeats(selectedTrip) < 1) {
      setError('الرحلة مكتملة المقاعد — اختر رحلة أخرى');
      return;
    }
    if (methodRequired && !paymentMethod) {
      setError('يرجى تحديد طريقة الدفع');
      return;
    }
    if (paidValue > total) {
      setError('المبلغ المدفوع أكبر من إجمالي الرحلة');
      return;
    }

    setSubmitting(true);
    try {
      const result = await onConfirmBooking({
        existingClientId: selectedClient ? selectedClient.id : null,
        newClient: isNewClient
          ? {
              fullName: clientDetails.fullName.trim(),
              documentId: clientDetails.documentId.trim(),
              phone: clientDetails.phone.trim(),
              nationality: clientDetails.nationality,
              gender: clientDetails.gender,
              address: clientDetails.address.trim(),
            }
          : null,
        tripId,
        branch: currentUserBranch || 'الداير',
        roomNumber: roomNumber.trim(),
        bookingNotes: bookingNotes.trim(),
        paid: paidValue,
        paymentMethod: methodRequired ? paymentMethod : '',
      });

      setInvoiceToPrint(result.invoice);
      setSuccess({
        invoiceId: result.invoice.id,
        passengerName: result.passenger.fullName,
        total: result.invoice.totalAmount ?? total,
        paid: paidValue,
        remaining: Math.max((result.invoice.totalAmount ?? total) - paidValue, 0),
        tripName: result.trip?.tripNumber,
      });

      setClientId('');
      setClientDetails({ fullName: '', documentId: '', phone: '', nationality: '', gender: '', address: '' });
      setTripId('');
      setPaid('');
      setPaymentMethod('');
      setRoomNumber('');
      setBookingNotes('');
      window.setTimeout(() => window.print(), 150);
    } catch (err) {
      console.error('فشل تأكيد الحجز:', err);
      setError('تعذر تأكيد الحجز وإصدار الفاتورة، حاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setSuccess(null);
    setInvoiceToPrint(null);
    setClientId('');
    setClientDetails({ fullName: '', documentId: '', phone: '', nationality: '', gender: '', address: '' });
    setTripId('');
    setPaid('');
    setPaymentMethod('');
    setRoomNumber('');
    setBookingNotes('');
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-4 bg-gradient-to-l from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
              <Store className="h-8 w-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">
                نقطة البيع — حجز جديد
              </h1>
<p className="mt-1 text-sm font-medium text-white/80">
                نموذج واحد متواصل: اختر العميل، حدد الرحلة، أضف ملاحظات
                الغرفة، ثم أكّد الدفع وأصدر الفاتورة
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold ring-1 ring-white/20">
            <Building2 className="h-5 w-5 text-amber-300" />
            {currentUserBranch || 'الداير'}
          </span>
        </div>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-l from-emerald-50 to-teal-50 p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <BadgeCheck className="h-7 w-7" />
              </span>
              <div>
                <p className="text-base font-extrabold text-emerald-900">
                  تم تأكيد الحجز وإصدار الفاتورة #{success.invoiceId} بنجاح
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {success.passengerName} · {success.tripName} · الإجمالي{' '}
                  {formatSAR(success.total)} · المدفوع {formatSAR(success.paid)} ·
                  المتبقي {formatSAR(success.remaining)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Printer className="h-4 w-4" />
                طباعة الفاتورة
              </button>
              {onViewInvoice && (
                <button
                  type="button"
                  onClick={() => onViewInvoice(success.invoiceId)}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <ReceiptText className="h-4 w-4" />
                  عرض التفاصيل
                </button>
              )}
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-900"
              >
                <X className="h-4 w-4" />
                حجز جديد
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* A. Client details */}
        <section className={cardClass}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-extrabold text-white bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg">
                1
              </span>
              <div>
                <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
                  <UserSearch className="h-5 w-5 text-emerald-600" />
                  بيانات العميل
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  ابحث عن عميل مسجل أو أدخل عميلاً جديداً
                </p>
              </div>
            </div>
            {!selectedClient && clientDetails.fullName.trim() && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
                <UserPlus className="h-3.5 w-3.5" />
                عميل جديد — سيُحفظ تلقائياً عند التأكيد
              </span>
            )}
          </div>

          <div>
            <label className={labelClass}>البحث عن عميل مسجل</label>
            <SearchableDropdown
              options={passengers}
              value={clientId}
              onChange={(id) => {
                const p = passengers.find((x) => x.id === id) || null;
                applyClient(p);
              }}
              placeholder="ابحث بالاسم أو الجوال أو السجل..."
              display={(o) => o.fullName}
            />
            <p className="mt-1.5 text-xs font-medium text-gray-400">
              اختر عميلاً موجوداً لملء البيانات تلقائياً، أو اترك الحقول التالية
              لتعريف عميل جديد
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>
                الاسم الكامل
                {nameValue ? '' : <span className="mr-1 text-xs font-bold text-red-500">*</span>}
              </label>
              <input
                type="text"
                value={nameValue}
                onChange={(e) => patchClientOrClear('fullName', e.target.value)}
                placeholder="مثال: خالد بن محمد العتيبي"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>السجل / الإقامة</label>
              <input
                type="text"
                dir="ltr"
                value={docValue}
                onChange={(e) => patchClientOrClear('documentId', e.target.value)}
                placeholder="رقم الهوية أو الإقامة"
                className={inputClass}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className={labelClass}>رقم الجوال</label>
              <input
                type="tel"
                dir="ltr"
                value={phoneValue}
                onChange={(e) => patchClientOrClear('phone', e.target.value)}
                placeholder="05xxxxxxxx"
                className={inputClass}
                inputMode="tel"
              />
            </div>
            <div>
              <label className={labelClass}>الجنس</label>
              <select
                value={genderValue}
                onChange={(e) => patchClientOrClear('gender', e.target.value)}
                className={inputClass}
              >
                <option value="">— اختر الجنس —</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>الجنسية</label>
              <select
                value={nationValue}
                onChange={(e) => patchClientOrClear('nationality', e.target.value)}
                className={inputClass}
              >
                <option value="">— اختر الجنسية —</option>
                {nationalities.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>العنوان</label>
              <input
                type="text"
                value={clientDetails.address}
                onChange={(e) => patch('address', e.target.value)}
                placeholder="المنطقة / المدينة (اختياري)"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* B. Trip */}
        <section className={cardClass}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-extrabold text-white bg-gradient-to-br from-sky-500 to-blue-700 shadow-lg">
              2
            </span>
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
                <Bus className="h-5 w-5 text-sky-600" />
                الرحلة
              </h3>
              <p className="text-xs font-medium text-gray-500">
                اختر الرحلة النشطة لهذا الحجز
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>الرحلة</label>
            <div className="relative">
              <Bus className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={tripId}
                onChange={(e) => {
                  setSuccess(null);
                  setTripId(e.target.value);
                  setError('');
                }}
                className={`${inputClass} appearance-none pr-10`}
              >
                <option value="">— اختر الرحلة —</option>
                {trips.map((t) => {
                  const free = remainingSeats(t);
                  const isFull = free <= 0;
                  return (
                    <option key={t.id} value={t.id} disabled={isFull}>
                      [{t.tripNumber}] {t.destination} · {formatSAR(t.price)}{' '}
                      {isFull ? '— مكتملة' : `(متبقي ${free} مقاعد)`}
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedTrip && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                <Armchair className="h-3.5 w-3.5" />
                المقاعد المتاحة: {remainingSeats(selectedTrip)} — السعر للفرد{' '}
                {formatSAR(perPerson)}
              </p>
            )}
          </div>
        </section>

        {/* C. Accommodation & notes */}
        <section className={cardClass}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-extrabold text-white bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              3
            </span>
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
                <Building2 className="h-5 w-5 text-amber-600" />
                الإقامة والملاحظات
              </h3>
              <p className="text-xs font-medium text-gray-500">
                رقم الغرفة وملاحظات الحجز (اختيارية) — تُطبع على الفاتورة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>رقم الغرفة</label>
              <input
                type="text"
                dir="ltr"
                value={roomNumber}
                onChange={(e) => {
                  setSuccess(null);
                  setRoomNumber(e.target.value);
                }}
                placeholder="مثال: 218"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>ملاحظات الحجز</label>
              <textarea
                value={bookingNotes}
                onChange={(e) => {
                  setSuccess(null);
                  setBookingNotes(e.target.value);
                }}
                rows={3}
                placeholder="مثال: يحتاج كرسي متحرك عند الوصول، أو سياسة الوصول والسقف"
                className={`${inputClass} w-full resize-none`}
              />
            </div>
          </div>
        </section>

        {/* D. Payment */}
        <section className={cardClass}>
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-extrabold text-white bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg">
              4
            </span>
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
                <Wallet className="h-5 w-5 text-violet-600" />
                المالية والدفع
              </h3>
              <p className="text-xs font-medium text-gray-500">
                استلم الدفعة وحدد طريقة الدفع لإصدار الفاتورة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50/80 p-5 ring-1 ring-emerald-200/60">
              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <ReceiptText className="h-4 w-4" />
                إجمالي الرحلة
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-900">
                {formatSAR(total)}
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-700/70">
                {selectedTrip ? `الفرد ${formatSAR(perPerson)}` : 'حدد رحلة أولاً'}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50/80 p-5 ring-1 ring-amber-200/60">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <CreditCard className="h-4 w-4" />
                المبلغ المدفوع الآن
              </label>
              <div className="relative mt-2">
                <input
                  type="number"
                  min="0"
                  value={paid}
                  onChange={(e) => {
                    setSuccess(null);
                    setPaid(e.target.value);
                  }}
                  placeholder="0"
                  className="w-full rounded-xl border border-amber-300/70 bg-white px-4 py-2 text-3xl font-extrabold text-amber-900 outline-none transition placeholder:text-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                  ر.س
                </span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-5 ring-1 ${
                remaining === 0 && paidValue > 0
                  ? 'bg-emerald-600 text-white ring-emerald-700'
                  : 'bg-gray-900 text-white ring-gray-800'
              }`}
            >
              <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
                {remaining === 0 && paidValue > 0 ? (
                  <CircleCheck className="h-4 w-4" />
                ) : (
                  <Banknote className="h-4 w-4" />
                )}
                المبلغ المتبقي
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {formatSAR(remaining)}
              </p>
              {remaining === 0 && paidValue > 0 && (
                <p className="mt-1 text-[11px] font-bold opacity-90">
                  مدفوع بالكامل
                </p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label
              className={`mb-1.5 flex items-center gap-1.5 text-sm font-semibold ${
                methodRequired ? 'text-gray-700' : 'text-gray-400'
              }`}
            >
              <Banknote className="h-4 w-4" />
              طريقة الدفع
              {methodRequired && (
                <span className="text-xs font-bold text-amber-600">(مطلوبة)</span>
              )}
            </label>
            <select
              value={paymentMethod}
              disabled={!methodRequired}
              onChange={(e) => {
                setSuccess(null);
                setPaymentMethod(e.target.value);
              }}
              className={`${inputClass} max-w-sm disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
            >
              <option value="">— اختر طريقة الدفع —</option>
              {paymentMethods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </section>

        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
            <CircleAlert className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-extrabold text-emerald-900">
              ملخص الحجز: {formatSAR(total)}
            </p>
            <p className="mt-0.5 text-xs font-medium text-gray-400">
              {selectedTrip
                ? `${selectedTrip.tripNumber} — ${selectedTrip.destination}`
                : 'لم تختر رحلة بعد'}
            </p>
          </div>
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-700 px-10 py-4 text-lg font-extrabold text-white shadow-xl transition hover:scale-[1.02] hover:from-emerald-700 hover:to-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ReceiptText className="h-6 w-6" />
            {submitting ? 'جارٍ التأكيد...' : 'تأكيد الحجز وإصدار فاتورة'}
          </button>
        </div>
      </form>

      {printNode &&
        invoiceToPrint &&
        createPortal(<PrintInvoice invoice={invoiceToPrint} />, printNode)}
    </div>
  );
}