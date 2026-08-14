export const COLLECTIONS = {
  passengers: 'passengers',
  trips: 'trips',
  invoices: 'invoices',
  hotels: 'hotels',
  rooms: 'rooms',
  clients: 'clients',
};

export const BRANCHES = ['الداير', 'جازان'];

export const PAYMENT_METHODS = ['كاش', 'فيزا / شبكة', 'تحويل بنكي'];

export const normalizePassenger = (row = {}) => ({
  id: row.id ?? '',
  fullName: row.fullName ?? '',
  documentId: row.documentId ?? '',
  phone: row.phone ?? '',
  nationality: row.nationality ?? '',
  gender: row.gender ?? '',
  address: row.address ?? '',
  branch: row.branch ?? '',
  status: row.status ?? 'active',
  familyId: row.familyId ?? null,
  roomNumber: row.roomNumber ?? '',
  notes: row.notes ?? '',
  ...row,
});

export const normalizeTrip = (row = {}) => ({
  id: row.id ?? '',
  tripNumber: row.tripNumber ?? '',
  destination: row.destination ?? '',
  gatheringPoint: row.gatheringPoint ?? '',
  departure: row.departure ?? '',
  returnDate: row.returnDate ?? '',
  time: row.time ?? '10:00',
  capacity: Number(row.capacity) || 49,
  bookedCount: Number(row.bookedCount) || 0,
  hotelName: row.hotelName ?? '',
  price: Number(row.price) || 0,
  passengers: Array.isArray(row.passengers) ? row.passengers : [],
  ...row,
});

export const normalizeInvoice = (row = {}) => ({
  id: row.id ?? '',
  docId: row.docId ?? row.id ?? '',
  passengerId: row.passengerId ?? '',
  tripId: row.tripId ?? '',
  packageId: row.packageId ?? null,
  paid: Number(row.paid) || 0,
  paidAmount: Number(row.paidAmount) || Number(row.paid) || 0,
  paymentMethod: row.paymentMethod ?? '',
  paymentHistory: Array.isArray(row.paymentHistory) ? row.paymentHistory : [],
  coveredCount: Number(row.coveredCount) || Number(row.coveredPassengers?.length) || 1,
  coveredPassengers: Array.isArray(row.coveredPassengers) ? row.coveredPassengers : [],
  roomNumber: row.roomNumber ?? '',
  bookingNotes: row.bookingNotes ?? '',
  branch: row.branch ?? '',
  ...row,
});

export const normalizeHotel = (row = {}) => ({
  id: row.id ?? '',
  name: row.name ?? '',
  location: row.location ?? '',
  ...row,
});

export const normalizeRoom = (row = {}) => ({
  id: row.id ?? '',
  number: row.number ?? '',
  category: row.category ?? '',
  type: row.type ?? '',
  capacity: Number(row.capacity) || 0,
  hotelId: row.hotelId ?? null,
  ...row,
});

export const invoiceStatusMeta = (remaining) => {
  if (remaining <= 0) {
    return { label: 'مدفوع بالكامل', tone: 'emerald' };
  }
  return { label: 'متبقي', tone: 'amber' };
};
