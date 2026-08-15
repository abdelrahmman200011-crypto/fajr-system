import { useEffect, useMemo, useState } from 'react';
import { Clock3, CheckCircle2, MessageSquareText, Plus, Trash2, Send, Copy } from 'lucide-react';
import { buildPendingBooking, buildWhatsAppMessageForPending, getPendingSummary } from '../services/pendingBookings';

export default function PendingBookingsPanel({
  trips = [],
  initialItems = [],
  onAddBooking,
  onApproveBooking,
}) {
  const [entries, setEntries] = useState(initialItems);
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    tripId: trips[0]?.id || '',
    tripTitle: trips[0]?.destination || '',
    notes: '',
  });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setEntries(initialItems);
  }, [initialItems]);

  const summary = useMemo(() => getPendingSummary(entries), [entries]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.customerName.trim()) return;

    const selectedTrip = trips.find((trip) => String(trip.id) === String(form.tripId));
    const booking = buildPendingBooking({
      customerName: form.customerName,
      phone: form.phone,
      tripId: selectedTrip?.id || form.tripId,
      tripTitle: selectedTrip?.destination || form.tripTitle || 'رحلة غير محددة',
      notes: form.notes,
      source: 'manual',
    });

    setEntries((prev) => [booking, ...prev]);
    if (onAddBooking) onAddBooking(booking);
    setForm({
      customerName: '',
      phone: '',
      tripId: trips[0]?.id || '',
      tripTitle: trips[0]?.destination || '',
      notes: '',
    });
  };

  const approveBooking = (id) => {
    setEntries((prev) => prev.map((entry) => entry.id === id ? { ...entry, status: 'approved' } : entry));
    if (onApproveBooking) onApproveBooking(id);
  };

  const deleteBooking = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-gold to-amber-600 shadow-lg shadow-amber-600/20">
            <Clock3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">الحجوزات المعلقة من الذكاء الاصطناعي</h3>
            <p className="text-xs font-medium text-slate-500">قيم وأقر الحجوزات المقترحة بسرعة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
            <Clock3 className="h-3 w-3" />
            {summary.pending} معلقة
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            {summary.approved} مؤكدة
          </span>
        </div>
      </div>

      {/* Add New Booking Form */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 gap-2 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <input
            value={form.customerName}
            onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/10"
            placeholder="اسم العميل"
            required
          />
        </div>

        <div>
          <input
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/10"
            placeholder="رقم الهاتف"
            type="tel"
          />
        </div>

        <div>
          <select
            value={form.tripId}
            onChange={(e) => setForm((prev) => ({ ...prev, tripId: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/10"
          >
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.destination || 'رحلة'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <input
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-primary-green focus:ring-2 focus:ring-primary-green/10"
            placeholder="ملاحظات"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-primary-green to-primary-green-deep px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-primary-green/20 transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          إضافة
        </button>
      </form>

      {/* Bookings List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-500">لا توجد حجوزات معلقة حاليًا</p>
            <p className="text-xs text-slate-400">ستظهر الحجوزات المقترحة من AI هنا</p>
          </div>
        ) : (
          entries.map((entry) => {
            const waLink = entry.phone
              ? `https://wa.me/${String(entry.phone).replace(/\D/g, '')}?text=${encodeURIComponent(buildWhatsAppMessageForPending(entry))}`
              : '#';
            const waMessage = buildWhatsAppMessageForPending(entry);

            return (
              <div
                key={entry.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all ${
                  entry.status === 'approved'
                    ? 'border-emerald-200 bg-gradient-to-l from-emerald-50 to-emerald-50/50'
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-extrabold text-slate-900">
                        {entry.customerName}
                      </p>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          entry.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
                            : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                        }`}
                      >
                        {entry.status === 'pending' ? '⏳ قيد المراجعة' : '✓ مؤكد'}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        📍 {entry.tripTitle}
                      </span>
                      {entry.phone && (
                        <span className="inline-flex items-center gap-1">
                          📱 {entry.phone}
                        </span>
                      )}
                      {entry.notes && (
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          💬 {entry.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {entry.phone && (
                      <>
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                          title="أرسل عبر WhatsApp"
                        >
                          <Send className="h-3.5 w-3.5" />
                          إرسال
                        </a>

                        <button
                          onClick={() => copyToClipboard(waMessage, entry.id)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                            copiedId === entry.id
                              ? 'border-slate-300 bg-slate-100 text-slate-600'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                          title="نسخ الرسالة"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {copiedId === entry.id ? 'تم' : 'نسخ'}
                        </button>
                      </>
                    )}

                    {entry.status !== 'approved' && (
                      <button
                        onClick={() => approveBooking(entry.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-primary-green to-primary-green-deep px-3 py-2 text-xs font-bold text-white shadow-md shadow-primary-green/20 transition hover:brightness-110"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        تأكيد
                      </button>
                    )}

                    <button
                      onClick={() => deleteBooking(entry.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      title="حذف الحجز"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
