import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ReceiptText,
  Calculator,
  Wallet,
  CreditCard,
  CircleAlert,
  CircleCheck,
  Ban,
  Search,
  Printer,
  Eye,
} from 'lucide-react';
import { formatSAR, invoiceTotals } from '../data/mockData';
import PrintInvoice from '../components/PrintInvoice';
import PaymentModal from '../components/PaymentModal';

export default function InvoicesView({
  passengers,
  trips,
  packages,
  services,
  invoices,
  onAddPayment,
  onOpenDetails,
}) {
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

  const summary = useMemo(
    () =>
      invoices.reduce(
        (acc, inv) => {
          const { totalAmount, paid } = invoiceTotals(
            inv,
            packages,
            services
          );
          acc.total += totalAmount;
          acc.collected += paid;
          acc.remaining += Math.max(totalAmount - paid, 0);
          return acc;
        },
        { count: invoices.length, total: 0, collected: 0, remaining: 0 }
      ),
    [invoices, packages, services]
  );

  const paymentInvoice = invoices.find(
    (inv) => inv.id === paymentInvoiceId
  ) || null;
  const paymentPassenger = paymentInvoice
    ? passengers.find((p) => p.id === paymentInvoice.passengerId)
    : null;

  const openPayment = (inv) => setPaymentInvoiceId(inv.id);
  const closePayment = () => setPaymentInvoiceId(null);
  const handleView = (inv) => onOpenDetails(inv.id);

  return (
    <div className="space-y-6">
      {/* Summary statistics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <ReceiptText className="h-4 w-4" />
            عدد الفواتير
          </p>
          <p className="mt-2 text-2xl font-extrabold">{summary.count}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-100">
            <Calculator className="h-4 w-4" />
            إجمالي القيمة
          </p>
          <p className="mt-2 text-2xl font-extrabold">{formatSAR(summary.total)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold text-amber-100">
            <Wallet className="h-4 w-4" />
            المحصّل
          </p>
          <p className="mt-2 text-2xl font-extrabold">{formatSAR(summary.collected)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold text-sky-100">
            <CreditCard className="h-4 w-4" />
            المتبقي
          </p>
          <p className="mt-2 text-2xl font-extrabold">{formatSAR(summary.remaining)}</p>
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