export function calculateTripStatus(trip, currentPassengersCount = 0) {
  const norm = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const start = norm(trip?.startDate || trip?.departure);
  const end = norm(trip?.endDate || trip?.returnDate);
  const isFull = currentPassengersCount >= (trip?.capacity || 49);

  if (end && today > end) {
    return { text: 'منتهية (مغلقة)', color: 'bg-gray-100 text-gray-700', ring: 'ring-gray-200' };
  }
  if (start && end && today >= start && today <= end) {
    return { text: 'قيد التنفيذ (انطلقت)', color: 'bg-blue-100 text-blue-700', ring: 'ring-blue-200' };
  }
  if (isFull) {
    return { text: 'مكتملة العدد', color: 'bg-red-100 text-red-700', ring: 'ring-red-200' };
  }
  return { text: 'مجدولة (متاح الحجز)', color: 'bg-green-100 text-green-700', ring: 'ring-green-200' };
}

export function isTripCompleted(endDate) {
  if (!endDate) return false;
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  return new Date(endDate) < today;
}

export function occupiedPercentage(trip) {
  const capacity = Number(trip?.capacity) || 0;
  const booked = Number(trip?.bookedCount) || 0;
  return capacity > 0 ? Math.min(Math.round((booked / capacity) * 100), 100) : 0;
}

export function remainingSeats(trip) {
  const capacity = Number(trip?.capacity) || 0;
  const booked = Number(trip?.bookedCount) || 0;
  return Math.max(capacity - booked, 0);
}
