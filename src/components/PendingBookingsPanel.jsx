import { useEffect, useMemo, useState } from 'react';
import { Clock3, CheckCircle2, MessageSquareText, Plus } from 'lucide-react';
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
      source: 'agent',
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

  return (
    <div className="space-y-5 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700">
            <Clock3 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">الحجوزات المعلقة</h3>
            <p className="text-sm text-gray-500">تتبع الحجوزات المستلمة من الواتساب أو AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">معلقة {summary.pending}</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">مؤكدة {summary.approved}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <input
          value={form.customerName}
          onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-amber-500 focus:bg-white"
          placeholder="اسم العميل"
        />
        <input
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-amber-500 focus:bg-white"
          placeholder="رقم الواتساب"
        />
        <select
          value={form.tripId}
          onChange={(e) => setForm((prev) => ({ ...prev, tripId: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-amber-500 focus:bg-white"
        >
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>{trip.destination || 'رحلة'}</option>
          ))}
        </select>
        <input
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-amber-500 focus:bg-white"
          placeholder="ملاحظات إضافية"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-amber-700/20 transition hover:bg-amber-500"
        >
          <Plus className="h-4 w-4" />
          إضافة حجز معلق
        </button>
      </form>

      <div className="space-y-3">
        {entries.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-5 text-center text-sm font-medium text-gray-500">
            لا توجد حجوزات معلقة حاليًا.
          </div>
        )}

        {entries.map((entry) => {
          const waLink = entry.phone
            ? `https://wa.me/${String(entry.phone).replace(/\D/g, '')}?text=${encodeURIComponent(buildWhatsAppMessageForPending(entry))}`
            : '#';

          return (
            <div key={entry.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-extrabold text-gray-800">{entry.customerName}</p>
                <p className="text-xs text-gray-500">{entry.tripTitle}</p>
                <p className="mt-1 text-[11px] text-gray-400">{entry.notes || 'لا توجد ملاحظات'}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${entry.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {entry.status === 'pending' ? 'قيد المراجعة' : 'مؤكد'}
                </span>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700"
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  واتساب
                </a>
                {entry.status !== 'approved' && (
                  <button
                    onClick={() => approveBooking(entry.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-bold text-emerald-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    تأكيد
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
