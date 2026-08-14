export function buildSmartAlerts({ trips = [], pendingBookings = [], invoices = [] }) {
  const alerts = [];

  const lowCapacityTrips = (trips || []).filter((trip) => {
    const seats = Number(trip?.capacity || 0) - Number(trip?.bookedCount || 0);
    return seats > 0 && seats <= 3;
  });

  if (lowCapacityTrips.length > 0) {
    alerts.push({
      type: 'capacity',
      title: 'رحلات قريبة من الامتلاء',
      detail: `${lowCapacityTrips.length} رحلة تحتاج متابعة سريعة قبل اكتمال المقاعد.`,
      tone: 'amber',
    });
  }

  const pendingCount = (pendingBookings || []).filter((entry) => entry.status === 'pending').length;
  if (pendingCount > 0) {
    alerts.push({
      type: 'booking',
      title: 'حجوزات معلقة',
      detail: `لديك ${pendingCount} حجز/حجوزات في انتظار التأكيد.`,
      tone: 'rose',
    });
  }

  const unpaidInvoices = (invoices || []).filter((invoice) => Number(invoice?.remaining ?? invoice?.paid ?? 0) > 0).length;
  if (unpaidInvoices > 0) {
    alerts.push({
      type: 'payment',
      title: 'فواتير متبقية',
      detail: `${unpaidInvoices} فاتورة تحتاج متابعة للدفع أو تذكير العميل.`,
      tone: 'sky',
    });
  }

  const approvedToday = (pendingBookings || []).filter((entry) => entry.status === 'approved').length;
  if (approvedToday > 0) {
    alerts.push({
      type: 'approved',
      title: 'حجوزات مؤكدة',
      detail: `${approvedToday} حجز تم تأكيده منذ آخر تحديث.`,
      tone: 'emerald',
    });
  }

  return alerts.slice(0, 4);
}

export function buildFollowUpMessage({ customerName = 'العزيز', tripTitle = 'رحلة', dueType = 'تأكيد الحجز' }) {
  return `أهلاً ${customerName}، هذا تذكير تلقائي بشأن ${dueType} الخاص بك في ${tripTitle}. يرجى الرد أو تأكيد التفاصيل لضمان استكمال الحجز في الوقت المناسب. شكرًا لك.`;
}
