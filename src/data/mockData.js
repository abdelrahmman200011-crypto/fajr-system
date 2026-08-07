export const initialServices = [
  { id: 1, name: 'تأشيرة عمرة', category: 'تأشيرات', price: 950 },
  { id: 2, name: 'باص نقل داخلي', category: 'نقل', price: 400 },
  { id: 3, name: 'سكن مكة - 3 نجوم', category: 'سكن', price: 1200 },
  { id: 4, name: 'سكن المدينة - فندق', category: 'سكن', price: 850 },
  { id: 5, name: 'وجبات اليوم الكامل', category: 'إطعام', price: 350 },
  { id: 6, name: 'مشرف مرافق', category: 'خدمات', price: 200 },
  { id: 7, name: 'زيارة المشاعر المقدسة', category: 'زيارات', price: 250 },
];

export const initialPackages = [
  { id: 1, name: 'الباقة الاقتصادية', serviceIds: [1, 2, 3] },
  { id: 2, name: 'الباقة المتوسطة', serviceIds: [1, 2, 3, 5, 6] },
  { id: 3, name: 'الباقة الفاخرة', serviceIds: [1, 2, 3, 4, 5, 6, 7] },
];

export const initialHotels = [
  { id: 1, name: 'فندق السلام مكة', location: 'العزيزية - مكة المكرمة' },
  { id: 2, name: 'فندق النور المدينة', location: 'المركزية - المدينة المنورة' },
  { id: 3, name: 'أبراج منى السكنية', location: 'منى - مكة المكرمة' },
];

export const initialTrips = [
  {
    id: 1,
    name: 'رحلة العمرة الأولى',
    destination: 'مكة المكرمة',
    departure: '2026-08-15',
    returnDate: '2026-08-22',
    time: '10:00',
    capacity: 49,
    bookedCount: 49,
    assignedHotelId: 1,
    driverName: 'عبدالله سالم الزهراني',
    driverIqama: '1098877665',
    driverPhone: '0501122334',
    plate: '4875 د ن',
  },
  {
    id: 2,
    name: 'رحلة العمرة الثانية',
    destination: 'مكة - المدينة المنورة',
    departure: '2026-08-28',
    returnDate: '2026-09-04',
    time: '07:30',
    capacity: 49,
    bookedCount: 45,
    assignedHotelId: 2,
    driverName: 'سعد عوض الغامدي',
    driverIqama: '1066554433',
    driverPhone: '0559988771',
    plate: '2231 ك أ',
  },
  {
    id: 3,
    name: 'رحلة الحج 1448',
    destination: 'منى - عرفات - مكة',
    departure: '2026-05-10',
    returnDate: '2026-05-24',
    time: '10:00',
    capacity: 60,
    bookedCount: 60,
    assignedHotelId: 3,
    driverName: 'مبارك جابر الشهري',
    driverIqama: '1044556677',
    driverPhone: '0534567890',
    plate: '7712 ز ج',
  },
  {
    id: 4,
    name: 'رحلة العمرة الثالثة',
    destination: 'مكة المكرمة',
    departure: '2026-09-12',
    returnDate: '2026-09-19',
    time: '10:00',
    capacity: 49,
    bookedCount: 12,
    assignedHotelId: 1,
    driverName: '',
    driverIqama: '',
    driverPhone: '',
    plate: '',
  },
];

export const initialRooms = [
  { id: 1, number: '101', category: 'رباعية', type: 'رجال', capacity: 4, hotelId: 1 },
  { id: 2, number: '102', category: 'ثلاثية', type: 'نساء', capacity: 3, hotelId: 1 },
  { id: 3, number: '103', category: 'رباعية', type: 'عائلي', capacity: 4, hotelId: 1 },
  { id: 4, number: '104', category: 'ثلاثية', type: 'عائلي', capacity: 3, hotelId: 1 },
  { id: 5, number: '201', category: 'رباعية', type: 'رجال', capacity: 4, hotelId: 2 },
  { id: 6, number: '202', category: 'ثلاثية', type: 'نساء', capacity: 3, hotelId: 2 },
  { id: 7, number: '203', category: 'رباعية', type: 'عائلي', capacity: 4, hotelId: 2 },
  { id: 8, number: '301', category: 'رباعية', type: 'رجال', capacity: 4, hotelId: 3 },
  { id: 9, number: '302', category: 'مزدوجة', type: 'نساء', capacity: 2, hotelId: 3 },
  { id: 10, number: '303', category: 'عائلية', type: 'عائلي', capacity: 4, hotelId: 3 },
];

export const initialInvoices = [
  { id: 1001, passengerId: 1, tripId: 2, packageId: 1, paid: 2550, paymentMethod: 'كاش', paidAmount: 2550, paymentHistory: [{ id: 1, amount: 2550, method: 'كاش', date: '2026-08-01' }] },
  { id: 1002, passengerId: 5, tripId: 2, packageId: 2, paid: 2000, paymentMethod: 'تحويل بنكي', paidAmount: 2000, paymentHistory: [{ id: 1, amount: 2000, method: 'تحويل بنكي', date: '2026-08-02' }] },
  { id: 1003, passengerId: 13, tripId: 3, packageId: 3, paid: 1500, paymentMethod: 'كاش', paidAmount: 1500, paymentHistory: [{ id: 1, amount: 1500, method: 'كاش', date: '2026-07-28' }] },
  { id: 1004, passengerId: 7, tripId: 3, packageId: 2, paid: 2900, paymentMethod: 'فيزا / شبكة', paidAmount: 2900, paymentHistory: [{ id: 1, amount: 2900, method: 'فيزا / شبكة', date: '2026-07-30' }] },
  { id: 1005, passengerId: 2, tripId: 1, packageId: 1, paid: 2550, paymentMethod: 'تحويل بنكي', paidAmount: 2550, paymentHistory: [{ id: 1, amount: 2550, method: 'تحويل بنكي', date: '2026-07-25' }] },
  { id: 1006, passengerId: 6, tripId: 1, packageId: 2, paid: 1000, paymentMethod: 'كاش', paidAmount: 1000, paymentHistory: [{ id: 1, amount: 1000, method: 'كاش', date: '2026-07-26' }] },
  { id: 1007, passengerId: 9, tripId: 1, packageId: 1, paid: 0, paymentMethod: '', paidAmount: 0, paymentHistory: [] },
  { id: 1008, passengerId: 16, tripId: 4, packageId: 2, paid: 3100, paymentMethod: 'فيزا / شبكة', paidAmount: 3100, paymentHistory: [{ id: 1, amount: 2000, method: 'فيزا / شبكة', date: '2026-08-01' }, { id: 2, amount: 1100, method: 'كاش', date: '2026-08-03' }] },
  { id: 1009, passengerId: 17, tripId: 4, packageId: 3, paid: 1500, paymentMethod: 'كاش', paidAmount: 1500, paymentHistory: [{ id: 1, amount: 1500, method: 'كاش', date: '2026-08-02' }] },
  { id: 1010, passengerId: 18, tripId: 4, packageId: 1, paid: 0, paymentMethod: '', paidAmount: 0, paymentHistory: [] },
  { id: 1011, passengerId: 20, tripId: 4, packageId: 3, paid: 4200, paymentMethod: 'كاش', paidAmount: 4200, paymentHistory: [{ id: 1, amount: 4200, method: 'كاش', date: '2026-08-01' }] },
  { id: 1012, passengerId: 21, tripId: 4, packageId: 2, paid: 2000, paymentMethod: 'تحويل بنكي', paidAmount: 2000, paymentHistory: [{ id: 1, amount: 2000, method: 'تحويل بنكي', date: '2026-08-01' }] },
  { id: 1013, passengerId: 12, tripId: 4, packageId: 1, paid: 500, paymentMethod: 'كاش', paidAmount: 500, paymentHistory: [{ id: 1, amount: 500, method: 'كاش', date: '2026-07-29' }] },
  { id: 1014, passengerId: 3, tripId: 2, packageId: 3, paid: 4200, paymentMethod: 'تحويل بنكي', paidAmount: 4200, paymentHistory: [{ id: 1, amount: 4200, method: 'تحويل بنكي', date: '2026-07-27' }] },
  { id: 1015, passengerId: 11, tripId: 2, packageId: 2, paid: 3000, paymentMethod: 'كاش', paidAmount: 3000, paymentHistory: [{ id: 1, amount: 3000, method: 'كاش', date: '2026-07-31' }] },
  { id: 1016, passengerId: 14, tripId: 3, packageId: 1, paid: 1500, paymentMethod: 'كاش', paidAmount: 1500, paymentHistory: [{ id: 1, amount: 1500, method: 'كاش', date: '2026-07-30' }] },
  { id: 1017, passengerId: 19, tripId: 3, packageId: 2, paid: 3100, paymentMethod: 'فيزا / شبكة', paidAmount: 3100, paymentHistory: [{ id: 1, amount: 3100, method: 'فيزا / شبكة', date: '2026-08-02' }] },
];

export function calculateTripStatus(trip, currentPassengersCount) {
  const norm = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    dt.setHours(0, 0, 0, 0);
    return dt;
  };
  const now = new Date(new Date().setHours(0, 0, 0, 0));
  const start = norm(trip?.startDate || trip?.departure);
  const end = norm(trip?.endDate || trip?.returnDate);
  const isFull = currentPassengersCount >= (trip?.capacity || 49);

  if (end && now > end) {
    return { text: 'منتهية (مغلقة)', color: 'bg-gray-100 text-gray-700', ring: 'ring-gray-200' };
  }
  if (start && end && now >= start && now <= end) {
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

export function packagePrice(pkg, services) {
  return (pkg?.serviceIds || [])
    .map((id) => services.find((s) => s.id === id)?.price || 0)
    .reduce((a, b) => a + b, 0);
}

export function packageServices(pkg, services) {
  return (pkg?.serviceIds || [])
    .map((id) => services.find((s) => s.id === id))
    .filter(Boolean);
}

export function invoiceTotals(inv, packages, services) {
  const pkg = (packages || []).find((p) => p.id === inv?.packageId) || null;
  const perPerson =
    Number(inv?.perPerson) || (pkg ? packagePrice(pkg, services || []) : 0);
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

export function formatSAR(amount) {
  const safe = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return `${safe.toLocaleString('en-US')} ر.س`;
}

export function familyMembers(passengers, familyId) {
  if (!familyId) return [];
  return passengers.filter((p) => p.familyId === familyId);
}

export function familyHead(passengers, familyId) {
  const members = familyMembers(passengers, familyId);
  if (members.length === 0) return null;
  return members.reduce((a, b) => (a.id < b.id ? a : b));
}

export const initialPassengers = [
  {
    id: 1,
    fullName: 'خالد بن محمد العتيبي',
    phone: '0551234567',
    address: 'حي النخيل، الداير',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'الداير',
    documentId: '1047123456',
    roomNumber: '201',
    notes: '',
    familyId: 'FAM-101',
  },
  {
    id: 2,
    fullName: 'فاطمة عبدالله العتيبي',
    phone: '0551234567',
    address: 'حي النخيل، الداير',
    gender: 'female',
    nationality: 'سعودية',
    branch: 'الداير',
    documentId: '1047654321',
    roomNumber: '201',
    notes: '',
    familyId: 'FAM-101',
  },
  {
    id: 3,
    fullName: 'عبدالعزيز بن خالد العتيبي',
    phone: '0551234567',
    address: 'حي النخيل، الداير',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'الداير',
    documentId: '1047987654',
    roomNumber: '201',
    notes: '',
    familyId: 'FAM-101',
  },
  {
    id: 4,
    fullName: 'أحمد بن يوسف حاجي',
    phone: '0533211234',
    address: 'شارع الملك فهد، صبيا',
    gender: 'male',
    nationality: 'يمني',
    branch: 'الداير',
    documentId: '2098765432',
    roomNumber: '203',
    notes: '',
    familyId: 'FAM-102',
  },
  {
    id: 5,
    fullName: 'مريم أحمد حاجي',
    phone: '0533211234',
    address: 'شارع الملك فهد، صبيا',
    gender: 'female',
    nationality: 'يمنية',
    branch: 'الداير',
    documentId: '2098765890',
    roomNumber: '203',
    notes: '',
    familyId: 'FAM-102',
  },
  {
    id: 6,
    fullName: 'محمد إسماعيل خان',
    phone: '0547654321',
    address: 'حي الروضة، الداير',
    gender: 'male',
    nationality: 'باكستاني',
    branch: 'الداير',
    documentId: 'KH4382917',
    roomNumber: '205',
    notes: 'يحتاج كرسياً متحركاً',
    familyId: 'FAM-103',
  },
  {
    id: 7,
    fullName: 'أسماء محمد خان',
    phone: '0547654321',
    address: 'حي الروضة، الداير',
    gender: 'female',
    nationality: 'باكستانية',
    branch: 'الداير',
    documentId: 'KH5520193',
    roomNumber: '206',
    notes: '',
    familyId: 'FAM-103',
  },
  {
    id: 8,
    fullName: 'حسن بن محمد خان',
    phone: '0547654321',
    address: 'حي الروضة، الداير',
    gender: 'male',
    nationality: 'باكستاني',
    branch: 'الداير',
    documentId: 'KH7715408',
    roomNumber: '205',
    notes: '',
    familyId: 'FAM-103',
  },
  {
    id: 9,
    fullName: 'حسن بن عبدالرحمن المدخلي',
    phone: '0501112222',
    address: 'حي الأندلس، الداير',
    gender: 'male',
    nationality: 'هندي',
    branch: 'الداير',
    documentId: '1077778888',
    roomNumber: '207',
    notes: 'كبير بالسن، يحتاج مساعدة أثناء التنقل',
    familyId: 'FAM-104',
  },
  {
    id: 10,
    fullName: 'علي بن حسن الشهري',
    phone: '0523334444',
    address: 'حي الفيصلية، الداير',
    gender: 'male',
    nationality: 'يمني',
    branch: 'الداير',
    documentId: '1088899900',
    roomNumber: '208',
    notes: '',
    familyId: 'FAM-105',
  },
  {
    id: 11,
    fullName: 'عمر بن طالب الزهراني',
    phone: '0575556666',
    address: 'شارع الأمير سلطان، الداير',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'الداير',
    documentId: '2299887766',
    roomNumber: '210',
    notes: '',
    familyId: 'FAM-106',
  },
  {
    id: 12,
    fullName: 'يوسف بن عبدالرحيم الصياد',
    phone: '0559988776',
    address: 'حي السلام، الداير',
    gender: 'male',
    nationality: 'سوري',
    branch: 'الداير',
    documentId: '1033445566',
    roomNumber: '212',
    notes: '',
    familyId: 'FAM-107',
  },
  {
    id: 13,
    fullName: 'عبدالعزيز بن فهد الدوسري',
    phone: '0555566777',
    address: 'حي الوادي، الداير',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'الداير',
    documentId: '1041234567',
    roomNumber: '214',
    notes: '',
    familyId: 'FAM-108',
  },
  {
    id: 14,
    fullName: 'صالح بن سالم العجمي',
    phone: '0531234567',
    address: 'حي المروج، الداير',
    gender: 'male',
    nationality: 'سوري',
    branch: 'الداير',
    documentId: '1079988776',
    roomNumber: '216',
    notes: '',
    familyId: 'FAM-109',
  },
  {
    id: 15,
    fullName: 'نايف بن مبارك القحطاني',
    phone: '0548899001',
    address: 'حي النسيم، الداير',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'الداير',
    documentId: '1045566778',
    roomNumber: '218',
    notes: '',
    familyId: 'FAM-110',
  },
  {
    id: 16,
    fullName: 'راشد بن سالم العتيبي',
    phone: '0553344556',
    address: 'حي الخالدية، جازان',
    gender: 'male',
    nationality: 'يمني',
    branch: 'جازان',
    documentId: '2058899009',
    roomNumber: '301',
    notes: '',
    familyId: 'FAM-201',
  },
  {
    id: 17,
    fullName: 'طارق بن عصام الحربي',
    phone: '0508877665',
    address: 'حي الصفا، جازان',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'جازان',
    documentId: '2067788991',
    roomNumber: '302',
    notes: '',
    familyId: 'FAM-202',
  },
  {
    id: 18,
    fullName: 'زياد بن خالد المطيري',
    phone: '0512345678',
    address: 'شارع الميناء، جازان',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'جازان',
    documentId: '2055566778',
    roomNumber: '303',
    notes: '',
    familyId: 'FAM-203',
  },
  {
    id: 19,
    fullName: 'ماجد بن سعد العنزي',
    phone: '0521236543',
    address: 'حي الزهور، جازان',
    gender: 'male',
    nationality: 'جزر القمر',
    branch: 'جازان',
    documentId: 'KM1188CC',
    roomNumber: '304',
    notes: '',
    familyId: 'FAM-204',
  },
  {
    id: 20,
    fullName: 'طارق بن حسن النمر',
    phone: '0557788990',
    address: 'حي الربوة، جازان',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'جازان',
    documentId: '1064455663',
    roomNumber: '305',
    notes: '',
    familyId: 'FAM-205',
  },
  {
    id: 21,
    fullName: 'فواز بن عبدالله الغامدي',
    phone: '0564455663',
    address: 'حي النور، جازان',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'جازان',
    documentId: '2061122334',
    roomNumber: '306',
    notes: '',
    familyId: 'FAM-206',
  },
  {
    id: 22,
    fullName: 'سلطان بن تركي الشمري',
    phone: '0541122334',
    address: 'حي الياسمين، جازان',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'جازان',
    documentId: '2098765431',
    roomNumber: '307',
    notes: '',
    familyId: 'FAM-207',
  },
  {
    id: 23,
    fullName: 'عبدالمجيد بن مسعود النعيمي',
    phone: '0556677889',
    address: 'حي الفردوس، جازان',
    gender: 'male',
    nationality: 'يمني',
    branch: 'جازان',
    documentId: '1022334455',
    roomNumber: '308',
    notes: 'غير مسبوق بمحرم',
    familyId: 'FAM-208',
  },
  {
    id: 24,
    fullName: 'فواز بن سعد السبيعي',
    phone: '0509988776',
    address: 'حي الأمل، جازان',
    gender: 'male',
    nationality: 'سعودي',
    branch: 'جازان',
    documentId: '2065566778',
    roomNumber: '309',
    notes: '',
    familyId: 'FAM-209',
  },
];
