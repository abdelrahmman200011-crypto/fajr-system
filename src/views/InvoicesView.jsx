import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ReceiptText,
  Calculator,
  Wallet,
  CreditCard,
  Banknote,
  CircleAlert,
  CircleCheck,
  Ban,
  FilePlus2,
  Bus,
  Lock,
  Search,
  Printer,
  Eye,
  Users,
} from 'lucide-react';
import {
  formatSAR,
  familyMembers,
  familyHead,
  invoiceTotals,
} from '../data/mockData';
import PrintInvoice from '../components/PrintInvoice';
import SearchableDropdown from '../components/SearchableDropdown';
import PaymentModal from '../components/PaymentModal';

const seatsLabel = (count) => (count === 1 ? 'مقعد' : 'مقاعد');

export default function InvoicesView({
  passengers,
  trips,
  packages,
  services,
  invoices,
  onAddInvoice,
  onAddPayment,
  onDeleteInvoice,
  onCancelPassenger,
  onOpenDetails,
}) {
  const [passengerId, setPassengerId] = useState('');
  const [tripId, setTripId] = useState('');
  const [paid, setPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [checkedIds, setCheckedIds] = useState(() => new Set());

  const [paymentInvoiceId, setPaymentInvoiceId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [printNode, setPrintNode] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'print-invoice';
    document.body.appendChild(el);
    setPrintNode(el);
    return () => el.remove();
  }, []);

  const handlePrint = (inv) => {
    const passenger = passengers.find((p) => p.id === inv.passengerId);
    const trip = trips.find((t) => t.id === inv.tripId);
    const { pkg, totalAmount, paid } = invoiceTotals(inv, packages, services);
    setInvoiceToPrint({
      ...inv,
      passenger,
      trip,
      pkg,
      total: totalAmount,
      paid,
    });
    window.setTimeout(() => window.print(), 50);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = String(searchTerm || '').trim();
    if (!q) return true;
    const idStr = String(inv.id);
    const numStr = inv.invoiceNumber ? String(inv.invoiceNumber) : '';
    return idStr.includes(q) || numStr.includes(q);
  });

  const primaries = useMemo(
    () =>
      passengers.filter((p) => {
        const head = familyHead(passengers, p.familyId);
        return !(head && head.id !== p.id);
      }),
    [passengers]
  );

  const selectedTrip = trips.find((t) => t.id === tripId) || null;
  const perPerson = Number(selectedTrip?.price) || 0;

  const selectedPassenger =
    passengers.find((p) => p.id === passengerId) || null;
  const primaryId = selectedPassenger
    ? familyHead(passengers, selectedPassenger.familyId)?.id ??
      selectedPassenger.id
    : null;
  const familyList = useMemo(() => {
    if (!selectedPassenger) return [];
    if (!selectedPassenger.familyId) return [selectedPassenger];
    const members = familyMembers(passengers, selectedPassenger.familyId);
    return members.length ? members : [selectedPassenger];
  }, [selectedPassenger, passengers]);

  const coveredList = familyList.filter((m) => checkedIds.has(m.id));
  const checkedCount = coveredList.length;
  const total = checkedCount * perPerson;
  const coveredPassengers = coveredList.map((m) => ({
    id: m.id,
    fullName: m.fullName,
    isPrimary: m.id === primaryId,
  }));

  const paidValue = Number(paid) || 0;
  const remaining = Math.max(total - paidValue, 0);
  const methodRequired = paidValue > 0;

  const remainingSeats = (trip) =>
    Math.max(trip.capacity - (trip.bookedCount || 0), 0);

  const canIssue = Boolean(
    passengerId &&
      tripId &&
      checkedCount > 0 &&
      paidValue >= 0 &&
      paidValue <= total &&
      selectedTrip &&
      remainingSeats(selectedTrip) >= checkedCount &&
      (!methodRequired || paymentMethod)
  );

  const resetForm = () => {
    setPassengerId('');
    setTripId('');
    setPaid('');
    setPaymentMethod('');
    setCheckedIds(new Set());
  };

  const selectPassenger = (id) => {
    setPassengerId(id);
    const p = passengers.find((x) => x.id === id);
    if (!p) {
      setCheckedIds(new Set());
      return;
    }
    const members = p.familyId
      ? familyMembers(passengers, p.familyId)
      : [];
    const list = members.length ? members : [p];
    setCheckedIds(new Set(list.map((m) => m.id)));
  };

  const toggleChecked = (id) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const issueInvoice = (e) => {
    e.preventDefault();
    if (!passengerId || !tripId || checkedCount === 0) return;
    if (
      !selectedTrip ||
      selectedTrip.bookedCount + checkedCount > selectedTrip.capacity
    ) {
      window.alert(
        'عفواً، لا توجد مقاعد كافية لهذه العائلة في الرحلة المحددة.'
      );
      return;
    }
    if (methodRequired && !paymentMethod) {
      window.alert('يرجى تحديد طريقة الدفع');
      return;
    }
    if (!canIssue) return;
    onAddInvoice({
      passengerId,
      tripId,
      paid: paidValue,
      paidAmount: paidValue,
      paymentMethod: methodRequired ? paymentMethod : '',
      coveredPassengers,
      coveredCount: checkedCount,
    });
    resetForm();
  };

  const paymentInvoice = invoices.find(
    (inv) => inv.id === paymentInvoiceId
  ) || null;
  const paymentPassenger = paymentInvoice
    ? passengers.find((p) => p.id === paymentInvoice.passengerId)
    : null;

  const openPayment = (inv) => {
    setPaymentInvoiceId(inv.id);
  };

  const closePayment = () => {
    setPaymentInvoiceId(null);
  };

  const inputClass =
    'input-field focus:border-emerald-500 focus:ring-emerald-500/20';

  const handleView = (inv) => onOpenDetails(inv.id);

  return (
    <div className="space-y-6">
      {/* Invoice builder */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
            <FilePlus2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">
              إصدار فاتورة جديدة
            </h3>
            <p className="text-sm text-gray-500">
              اربط معتمراً برحلة، ثم سجّل المدفوع ويُحسب المتبقي تلقائياً
            </p>
          </div>
        </div>

        <form onSubmit={issueInvoice}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                اختيار المسافر
              </label>
              <SearchableDropdown
                options={primaries}
                value={passengerId}
                onChange={selectPassenger}
                placeholder="ابحث عن رب العائلة / المعتمر..."
                display={(o) => {
                  const count = o.familyId
                    ? familyMembers(passengers, o.familyId).length
                    : 1;
                  return count > 1
                    ? `${o.fullName} (عائلة: ${count} أفراد)`
                    : o.fullName;
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                اختيار الرحلة
              </label>
              <select
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                className={inputClass}
              >
                <option value="">— اختر الرحلة —</option>
                {trips.map((t) => {
                  const free = remainingSeats(t);
                  const isFull = free <= 0;
                  return (
                    <option key={t.id} value={t.id} disabled={isFull}>
                      [{t.tripNumber}] {t.destination} · {formatSAR(t.price)} (
                      {isFull
                        ? 'مكتملة العدد 🔒'
                        : `متبقي ${free} ${seatsLabel(free)}`}
                      )
                    </option>
                  );
                })}
              </select>
              {selectedTrip && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <Bus className="h-3.5 w-3.5" />
                  المقاعد المتبقية: {remainingSeats(selectedTrip)}{' '}
                  {seatsLabel(remainingSeats(selectedTrip))}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                سعر الرحلة للفرد
              </label>
              <div className="flex h-11 items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-4 text-sm font-extrabold text-emerald-900">
                <span>{formatSAR(perPerson)}</span>
                <Calculator className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Family / group checklist */}
          {selectedPassenger && familyList.length > 0 && (
            <div className="mt-5 rounded-2xl border border-violet-200/70 bg-violet-50/40 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-extrabold text-violet-900">
                  <Users className="h-4 w-4" />
                  أفراد العائلة / الحجز المشمول
                </p>
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-extrabold text-white">
                  {checkedCount} / {familyList.length} مشمول
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {familyList.map((m) => {
                  const isPrimary = m.id === primaryId;
                  const checked = checkedIds.has(m.id);
                  return (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
                        checked
                          ? isPrimary
                            ? 'border-emerald-300 bg-white ring-1 ring-emerald-200'
                            : 'border-violet-300 bg-white ring-1 ring-violet-200'
                          : 'border-gray-200 bg-white/60 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChecked(m.id)}
                        className="h-4 w-4 accent-violet-600"
                      />
                      <span className={isPrimary ? 'text-emerald-800' : 'text-gray-800'}>
                        {m.fullName}
                      </span>
                      {isPrimary && (
                        <span className="rounded-full bg-emerald-50 px-2 py-px text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                          رب الأسرة
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-xs font-semibold text-violet-700/80">
                العدد المختار سيُخصم من مقاعد الرحلة، وستُدرج أسماؤهم في
                الفاتورة وكشف الاستلام.
              </p>
            </div>
          )}

          {/* Calculation summary */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50/80 p-5 ring-1 ring-emerald-200/60">
              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Calculator className="h-4 w-4" />
                الإجمالي ({checkedCount || 0} × {formatSAR(perPerson)})
              </p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-900">
                {formatSAR(total)}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50/80 p-5 ring-1 ring-amber-200/60">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <CreditCard className="h-4 w-4" />
                المدفوع
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="0"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-amber-300/70 bg-white px-4 py-2 text-2xl font-extrabold text-amber-900 outline-none transition placeholder:text-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                  ر.س
                </span>
              </div>
            </div>
            <div
              className={`rounded-2xl p-5 ring-1 ${
                remaining === 0
                  ? 'bg-emerald-600 text-white ring-emerald-700'
                  : 'bg-gray-900 text-white ring-gray-800'
              }`}
            >
              <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
                {remaining === 0 ? (
                  <CircleCheck className="h-4 w-4" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                المتبقي
              </p>
              <p className="mt-2 text-2xl font-extrabold">
                {formatSAR(remaining)}
              </p>
              {remaining === 0 && paidValue > 0 && (
                <p className="mt-1 text-[11px] font-bold opacity-90">
                  فاتورة مسددة بالكامل
                </p>
              )}
            </div>
          </div>

          {paidValue > total && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              <CircleAlert className="h-4 w-4" />
              المدفوع أكبر من إجمالي الفاتورة، راجع القيمة
            </p>
          )}

          {/* Payment method */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
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
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
              >
                <option value="">— اختر طريقة الدفع —</option>
                <option value="كاش">كاش</option>
                <option value="فيزا / شبكة">فيزا / شبكة</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
              </select>
              {!methodRequired && (
                <p className="mt-1.5 text-xs font-medium text-gray-400">
                  لا يُطلب تحديد طريقة دفع عندما يكون المدفوع 0
                </p>
              )}
              {methodRequired && !paymentMethod && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-bold text-amber-600">
                  <CircleAlert className="h-3.5 w-3.5" />
                  طريقة الدفع مطلوبة لتسجيل الدفعة
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canIssue}
            className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <ReceiptText className="h-4 w-4" />
            إصدار الفاتورة
          </button>
        </form>
      </div>

      {/* Trip capacity strip */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
              <Bus className="h-5 w-5" />
            </span>
            سعة مقاعد الرحلات
          </h3>
          <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700">
            يُحجز المقعد تلقائياً عند إصدار الفاتورة
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {trips.map((t) => {
            const free = remainingSeats(t);
            const isFull = free <= 0;
            const percent = Math.min((t.bookedCount / t.capacity) * 100, 100);
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-gray-800">
                    رحلة {t.tripNumber} · {t.destination}
                  </p>
                  {isFull ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-extrabold text-red-600 ring-1 ring-red-200">
                      <Lock className="h-3 w-3" />
                      مكتملة
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                      متبقي {free} {seatsLabel(free)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs font-semibold text-gray-500">
                  {t.bookedCount} / {t.capacity} مقعد محجوز
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull
                        ? 'bg-gradient-to-l from-red-500 to-amber-500'
                        : 'bg-gradient-to-l from-emerald-600 to-emerald-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices table */}
      <div className="rounded-2xl border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100/80 p-6 pb-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <ReceiptText className="h-5 w-5" />
            </span>
            الفواتير الصادرة
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث برقم الفاتورة..."
                className="w-56 rounded-xl border border-gray-200 bg-gray-50/60 py-2 pl-9 pr-3 text-sm font-semibold text-gray-800 outline-none transition placeholder:font-medium placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700">
              {filteredInvoices.length} / {invoices.length} فاتورة
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-3.5 text-right">رقم الفاتورة</th>
                <th className="px-6 py-3.5 text-right">المسافر</th>
                <th className="px-6 py-3.5 text-right">الرحلة</th>
                <th className="px-6 py-3.5 text-right">السعر للفرد</th>
                <th className="px-6 py-3.5 text-right">الإجمالي</th>
                <th className="px-6 py-3.5 text-right">المدفوع</th>
                <th className="px-6 py-3.5 text-right">المتبقي</th>
                <th className="px-6 py-3.5 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const passenger = passengers.find(
                  (p) => p.id === inv.passengerId
                );
                const trip = trips.find((t) => t.id === inv.tripId);
                const { pkg, perPerson, paxCount, totalAmount, paid, remaining } =
                  invoiceTotals(inv, packages, services);
                return (
                  <tr
                    key={inv.id}
                    className={`border-t border-gray-100 transition-colors ${
                      passenger?.status === 'canceled'
                        ? 'bg-gray-50/60 opacity-70 hover:bg-gray-100/60'
                        : 'hover:bg-emerald-50/40'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-extrabold text-gray-700" dir="ltr">
                        #{inv.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <p
                            className={`font-bold ${
                              passenger?.status === 'canceled'
                                ? 'text-gray-500 line-through'
                                : 'text-gray-800'
                            }`}
                          >
                            {passenger?.fullName || '—'}
                          </p>
                          <p className="text-xs font-medium text-gray-400">
                            {passenger?.phone || ''}
                          </p>
                        </div>
                        {passenger?.status === 'canceled' && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-extrabold text-red-600 ring-1 ring-red-200">
                            <Ban className="h-3 w-3" />
                            فاتورة ملغاة
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-600">
                      {trip?.tripNumber || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-700">
                        {formatSAR(perPerson)}
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-gray-400">
                        {paxCount} أفراد × {formatSAR(perPerson)} للفرد
                      </p>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-emerald-900">
                      {formatSAR(totalAmount)}
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-700">
                      {formatSAR(paid)}
                    </td>
                    <td className="px-6 py-4">
                      {remaining <= 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                          <CircleCheck className="h-3.5 w-3.5" />
                          مدفوع بالكامل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                          <CircleAlert className="h-3.5 w-3.5" />
                          {formatSAR(remaining)} متبقي
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleView(inv)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          aria-label="عرض التفاصيل"
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(inv)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          aria-label="طباعة الفاتورة"
                          title="طباعة الفاتورة"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        {(remaining > 0 ||
                          passenger?.status === 'canceled') && (
                          <button
                            onClick={() => openPayment(inv)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              passenger?.status === 'canceled'
                                ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                                : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                            aria-label={
                              passenger?.status === 'canceled'
                                ? 'تسجيل استرجاع'
                                : 'تسديد دفعة'
                            }
                            title={
                              passenger?.status === 'canceled'
                                ? 'تسجيل استرجاع / سداد'
                                : 'تسديد دفعة'
                            }
                          >
                            {passenger?.status === 'canceled' ? (
                              <Ban className="h-4 w-4" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-sm font-bold text-gray-400">
                      لا توجد فواتير مطابقة لرقم: «{searchTerm}»
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment modal */}
      {paymentInvoice && (
        <PaymentModal
          invoice={paymentInvoice}
          passenger={paymentPassenger}
          services={services}
          packages={packages}
          onClose={closePayment}
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