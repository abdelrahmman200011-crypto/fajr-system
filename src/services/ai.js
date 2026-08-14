const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

export async function checkOllamaAvailability(model = 'llama3.2') {
  try {
    const response = await fetch(`${(import.meta.env.VITE_OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL)}/api/tags`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return { available: false, model };
    const payload = await response.json();
    const availableModels = payload?.models || [];
    const hasModel = availableModels.some((entry) => String(entry.name).includes(model));

    return { available: hasModel || availableModels.length > 0, model };
  } catch (error) {
    return { available: false, model };
  }
}

export async function askLocalOllama(prompt, model = 'llama3.2') {
  const baseUrl = import.meta.env.VITE_OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL;

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.3 },
      }),
    });

    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.response?.trim() || null;
  } catch (error) {
    return null;
  }
}

export function buildTripAvailabilityReply({ question = '', trips = [] }) {
  const lowerQuestion = question.toLowerCase();
  const relevantTrips = (trips || []).filter((trip) => {
    const destination = (trip?.destination || '').toLowerCase();
    const tripNumber = String(trip?.tripNumber || '').toLowerCase();
    const seatsLeft = Number(trip?.capacity || 0) - Number(trip?.bookedCount || 0);
    return (
      seatsLeft > 0 &&
      (lowerQuestion.includes(destination) ||
        lowerQuestion.includes('رحلة') ||
        lowerQuestion.includes(tripNumber) ||
        lowerQuestion.includes('مكة') ||
        lowerQuestion.includes('المدينة'))
    );
  });

  if (!relevantTrips.length) {
    return 'لا توجد رحلات متاحة حاليًا في هذا النطاق، لكن يمكنني متابعة قوائم الرحلات القادمة أو تجهيز عرض مخصص عند رغبتك.';
  }

  const items = relevantTrips
    .slice(0, 5)
    .map((trip) => {
      const seatsLeft = Number(trip?.capacity || 0) - Number(trip?.bookedCount || 0);
      return `- ${trip.tripNumber || trip.destination || 'رحلة'}: ${trip.destination || 'وجهة غير محددة'} | المتبقي ${seatsLeft} مقعد | تاريخ ${trip.departure || 'غير محدد'}`;
    })
    .join('\n');

  return `بناءً على الاستفسار الحالي، توجد رحلات متاحة كالتالي:\n${items}\nيمكنك تأكيد الحجز مباشرة من نقطة البيع أو حفظ الطلب كحجز معلق للمتابعة.`;
}

export async function generateBookingAgentReply({ question, trips = [], passengers = [], invoices = [] }) {
  const fallback = buildTripAvailabilityReply({ question, trips });
  const prompt = `أنت وكيل خدمة عملاء في منظومة حج وعمرة. اقرأ بيانات الرحلات التالية وقدم ردًا محددًا بالعربية. السؤال: ${question}\n\nالرحلات المتاحة:\n${(trips || []).map((trip) => `- ${trip.tripNumber || trip.destination}: ${trip.destination}, المقاعد: ${Number(trip.capacity || 0) - Number(trip.bookedCount || 0)}, تاريخ: ${trip.departure || 'غير محدد'}`).join('\n')}\n\nالهدف: أجب بشفافية، واذكر الرحلات المتاحة فقط، واطلب من العميل تأكيد الحجز أو طلب تفاصيل إضافية.`;

  const aiResponse = await askLocalOllama(prompt, 'llama3.2');
  if (aiResponse) return aiResponse;

  return fallback;
}

export function buildReminderMessage({ passenger, trip, hotel, notes = '' }) {
  const fullName = passenger?.fullName || 'العزيز';
  const destination = trip?.destination || 'رحلة الحج والعمرة';
  const gatheringPoint = trip?.gatheringPoint || 'أمام محطة رمسيس';
  const roomNumber = passenger?.roomNumber || 'غير محدد';
  const hotelName = hotel?.name || 'الفندق المخصص';

  const extraNotes = notes ? `\nملاحظات: ${notes}` : '';

  return `أهلاً ${fullName}، نذكرك برحلتك غدًا إلى ${destination}. نقطة التجمع: ${gatheringPoint}. رقم غرفتك في ${hotelName} هو ${roomNumber}. يرجى الالتزام بالتعليمات المرفقة.${extraNotes}\nرحلة سعيدة!`;
}

export function buildFinanceInsight({ invoices = [], passengers = [], trips = [] }) {
  const byBranch = new Map();

  (passengers || []).forEach((person) => {
    const branch = person?.branch || 'غير محدد';
    if (!byBranch.has(branch)) {
      byBranch.set(branch, { branch, revenue: 0, count: 0, passengers: 0 });
    }
    byBranch.get(branch).passengers += 1;
  });

  (invoices || []).forEach((invoice) => {
    const passenger = (passengers || []).find((person) => String(person.id) === String(invoice.passengerId));
    const branch = passenger?.branch || 'غير محدد';
    if (!byBranch.has(branch)) {
      byBranch.set(branch, { branch, revenue: 0, count: 0, passengers: 0 });
    }
    const entry = byBranch.get(branch);
    entry.revenue += Number(invoice?.paid || 0);
    entry.count += 1;
  });

  const branchList = [...byBranch.values()].sort((a, b) => b.revenue - a.revenue);
  const strongestBranch = branchList[0];
  const regularClients = (passengers || []).filter((person) => {
    const match = (invoices || []).filter((invoice) => String(invoice.passengerId) === String(person.id));
    return match.length >= 2;
  });

  if (!strongestBranch) {
    return 'لا توجد بيانات مالية كافية حاليًا لتحليل الاتجاهات. أضف بعض الفواتير أو الرحلات لتوليد التوقعات.';
  }

  const tripInsights = (trips || []).filter((trip) => Number(trip?.bookedCount || 0) >= Number(trip?.capacity || 0) * 0.8);
  const suggestion = regularClients.length > 0
    ? `تم اكتشاف ${regularClients.length} عميل منتظم، ومن المنطقي إرسال عروض مخصصة لهم لتقوية الاحتفاظ.`
    : 'لا توجد زيارات متكررة كافية الآن، لكن يمكن توجيه حملات ترويجية للفرع الأقوى.';

  return `فرع ${strongestBranch.branch} يتصدر الإيرادات الحالية بقيمة ${strongestBranch.revenue} ريال، ويُوصى بتكثيف الرحلات من هذا الفرع خلال الأسبوع القادم. ${suggestion} ${tripInsights.length > 0 ? `كما أن ${tripInsights.length} رحلة في حالة قرب الاكتمال، ما يبرر حجز مبكر.` : 'الطلب مستقر في الوقت الحالي.'}`;
}
