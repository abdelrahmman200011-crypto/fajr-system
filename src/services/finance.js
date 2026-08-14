import { packagePrice } from '../data/mockData';

export function buildInvoiceTotals(inv, packages = [], services = []) {
  const pkg = (packages || []).find((p) => p.id === inv?.packageId) || null;
  const perPerson = Number(inv?.perPerson) || (pkg ? packagePrice(pkg, services || []) : 0);
  const paxCount =
    Number(inv?.paxCount) ||
    Number(inv?.coveredCount) ||
    inv?.coveredPassengers?.length ||
    1;
  const totalAmount = Number(inv?.totalAmount) || perPerson * paxCount;
  const history = Array.isArray(inv?.paymentHistory) ? inv.paymentHistory : [];
  const paid = history.length
    ? history.reduce((acc, p) => acc + Number(p?.amount || 0), 0)
    : Number(inv?.paid ?? inv?.paidAmount ?? 0);
  const remaining = Math.max(totalAmount - paid, 0);

  return { pkg, perPerson, paxCount, totalAmount, paid, remaining };
}

export function summarizeInvoices(invoices, packages, services) {
  return invoices.reduce(
    (acc, inv) => {
      const { totalAmount, paid } = buildInvoiceTotals(inv, packages, services);
      acc.total += totalAmount;
      acc.collected += paid;
      acc.remaining += Math.max(totalAmount - paid, 0);
      return acc;
    },
    { count: invoices.length, total: 0, collected: 0, remaining: 0 }
  );
}

export function formatCurrency(value) {
  const safe = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `${safe.toLocaleString('en-US')} ر.س`;
}

export function getInvoicePaymentStatus(inv, packages, services) {
  const { totalAmount, paid, remaining } = buildInvoiceTotals(inv, packages, services);
  if (remaining <= 0 && totalAmount > 0) return 'مسددة بالكامل';
  if (paid > 0) return 'مدفوع جزئياً';
  return 'غير مدفوع';
}
