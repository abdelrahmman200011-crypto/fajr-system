import { useState } from 'react';
import {
  X,
  Banknote,
  CreditCard,
  Wallet,
  CircleAlert,
  CircleCheck,
} from 'lucide-react';
import { formatSAR, invoiceTotals } from '../data/mockData';

export default function PaymentModal({
  invoice,
  passenger,
  services,
  packages,
  onClose,
  onAddPayment,
}) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [payMethod, setPayMethod] = useState('');

  if (!invoice) return null;

  const { totalAmount: paymentTotal, paid: paymentPaid, remaining: paymentRemaining } =
    invoiceTotals(invoice, packages, services);

  const closePayment = () => {
    setPaymentAmount('');
    setPaymentError('');
    setPayMethod('');
    onClose();
  };

  const submitPayment = (e) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!paymentAmount.trim() || !Number.isFinite(amount) || amount === 0) {
      setPaymentError('يرجى إدخال مبلغ صحيح مختلف عن صفر');
      return;
    }
    const isRefund = amount < 0;
    if (isRefund) {
      if (paymentPaid <= 0) {
        setPaymentError('لا يمكن استرجاع مبلغ لم يُدفع بعد');
        return;
      }
      if (Math.abs(amount) > paymentPaid) {
        setPaymentError(`مبلغ الاسترجاع أكبر من المدفوع (${formatSAR(paymentPaid)})`);
        return;
      }
    } else {
      if (amount > paymentRemaining) {
        setPaymentError(`المبلغ أكبر من المتبقي (${formatSAR(paymentRemaining)})`);
        return;
      }
    }
    if (!payMethod) {
      setPaymentError(isRefund ? 'يرجى تحديد طريقة الاسترجاع' : 'يرجى تحديد طريقة الدفع');
      return;
    }
    onAddPayment(invoice.id, amount, payMethod);
    closePayment();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm"
      onClick={closePayment}
    >
      <div
        className="relative w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(10,61,46,0.25)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closePayment}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-500"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-green to-primary-green-deep shadow-lg shadow-primary-green/20">
            <Banknote className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">تسديد دفعة</h3>
            <p className="text-sm text-slate-500">فاتورة #{invoice.id} — {passenger?.fullName || 'معتمر'}</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-xs font-bold text-slate-500">إجمالي الفاتورة</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">{formatSAR(paymentTotal)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200/70">
            <p className="text-xs font-bold text-emerald-700">المدفوع سابقاً</p>
            <p className="mt-1 text-lg font-extrabold text-emerald-800">{formatSAR(paymentPaid)}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200/70">
            <p className="text-xs font-bold text-amber-700">المتبقي</p>
            <p className="mt-1 text-lg font-extrabold text-amber-800">{formatSAR(paymentRemaining)}</p>
          </div>
        </div>

        {Array.isArray(invoice.paymentHistory) && invoice.paymentHistory.length > 0 && (
          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
              <Wallet className="h-3.5 w-3.5 text-primary-green" />
              سجل المدفوعات
            </p>
            <div className="divide-y divide-slate-200">
              {invoice.paymentHistory.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                      {p.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-500" dir="ltr">{p.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                      {p.method || 'كاش'}
                    </span>
                    <span className="font-extrabold text-slate-900">{formatSAR(p.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submitPayment} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              المبلغ الآن (القيمة السالبة للتشير إلى استرجاع)
            </label>
            <div className="relative">
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => {
                  setPaymentAmount(e.target.value);
                  setPaymentError('');
                }}
                placeholder="مثال: 2000 للدفع أو -2000 للاسترجاع"
                autoFocus
                className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-14 pr-4 text-base font-extrabold outline-none transition focus:border-primary-green focus:bg-white focus:ring-4 focus:ring-primary-green/10 ${Number(paymentAmount) < 0 ? 'text-red-600' : 'text-emerald-800'}`}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                ر.س
              </span>
            </div>
            <p className="mt-1.5 text-xs font-medium text-slate-400">
              قيمة موجبة تزيد المدفوع، وقيمة سالبة تُسجَّل كاسترجاع ضمن سجل المدفوعات لموازنة الصندوق.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              طريقة الدفع / الاسترجاع
            </label>
            <select
              value={payMethod}
              onChange={(e) => {
                setPayMethod(e.target.value);
                setPaymentError('');
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary-green focus:bg-white focus:ring-4 focus:ring-primary-green/10"
            >
              <option value="">— اختر طريقة الدفع / الاسترجاع —</option>
              <option value="كاش">كاش</option>
              <option value="فيزا / شبكة">فيزا / شبكة</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
              <option value="استرجاع نقدي">استرجاع نقدي</option>
              <option value="استرجاع بنكي">استرجاع بنكي</option>
            </select>
          </div>

          {paymentError && (
            <p className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              <CircleAlert className="h-4 w-4 shrink-0" />
              {paymentError}
            </p>
          )}

          {Number(paymentAmount) >= paymentRemaining && paymentRemaining > 0 && (
            <p className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
              <CircleCheck className="h-4 w-4 shrink-0" />
              سيتم إغلاق الفاتورة كمدفوعة بالكامل
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button type="button" onClick={closePayment} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 sm:w-auto">
              إلغاء
            </button>
            <button type="submit" className="w-full rounded-2xl bg-gradient-to-l from-primary-green to-primary-green-deep px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary-green/20 transition hover:brightness-110 sm:w-auto">
              <CreditCard className="h-4 w-4" />
              تأكيد الدفعة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
