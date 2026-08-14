export function normalizePendingBooking(raw = {}) {
  return {
    id: raw.id || `PB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customerName: raw.customerName || 'عميل جديد',
    phone: raw.phone || '',
    tripId: raw.tripId || null,
    tripTitle: raw.tripTitle || 'رحلة غير محددة',
    source: raw.source || 'manual',
    status: raw.status || 'pending',
    notes: raw.notes || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function buildPendingBooking({ customerName, phone, tripId, tripTitle, notes = '', source = 'manual' }) {
  return normalizePendingBooking({
    customerName,
    phone,
    tripId,
    tripTitle,
    notes,
    source,
    status: 'pending',
  });
}

export function buildWhatsAppMessageForPending(booking) {
  const customerName = booking?.customerName || 'العزيز';
  const tripTitle = booking?.tripTitle || 'رحلة غير محددة';
  const notes = booking?.notes ? `\nملاحظات: ${booking.notes}` : '';
  return `أهلاً ${customerName}، تم تسجيل طلب حجز معلق لك في ${tripTitle}. سنقوم بمراجعة الطلب خلال أقرب وقت. ${notes}\nيرجى التأكيد أو إرسال التفاصيل المطلوبة.`;
}

export function getPendingSummary(pendingBookings = []) {
  const total = pendingBookings.length;
  const pending = pendingBookings.filter((entry) => entry.status === 'pending').length;
  const approved = pendingBookings.filter((entry) => entry.status === 'approved').length;
  return { total, pending, approved };
}
