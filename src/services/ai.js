const DEFAULT_OLLAMA_URL = 'http://localhost:11434';
const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';

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

export function checkGroqAvailability(model = DEFAULT_GROQ_MODEL) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  return {
    available: Boolean(key),
    model: model || DEFAULT_GROQ_MODEL,
    provider: 'Groq',
  };
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

export async function askGroq(prompt, model = DEFAULT_GROQ_MODEL) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'أنت وكيل خدمة عملاء عربي متخصص في الحج والعمرة. أجب بدقة بالعربية، مختصرًا وواضحًا، وركز على المعلومات العملية فقط.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('Groq API error:', await response.text());
      return null;
    }

    const payload = await response.json();
    return payload?.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('فشل استدعاء Groq:', error);
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
  const prompt = buildAICustomerPrompt({ question, trips, passengers, invoices });

  const groqModel = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-8b-instant';
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  if (groqKey) {
    const aiResponse = await askGroq(prompt, groqModel);
    if (aiResponse) return aiResponse;
  }

  const ollamaResponse = await askLocalOllama(prompt, 'llama3.2');
  if (ollamaResponse) return ollamaResponse;

  return fallback;
}

export function buildReminderMessage({ passenger, trip, hotel, notes = '' }) {
  const fullName = passenger?.fullName || 'العزيز';
  const destination = trip?.destination || 'رحلة الحج والعمرة';
  const gatheringPoint = trip?.gatheringPoint || 'أمام الفرع';

  const passengerRoom = passenger?.roomNumber || '';
  const tripPassengers = Array.isArray(trip?.passengers) ? trip.passengers : [];
  const matchedTripPassenger = tripPassengers.find((row) => {
    const rowName = row?.name || row?.fullName || '';
    const rowId = row?.clientId || row?.id || '';
    return (
      (!rowId && rowName && passenger?.fullName && rowName === passenger.fullName) ||
      (rowId && passenger?.id && String(rowId) === String(passenger.id)) ||
      (rowName && passenger?.fullName && rowName.includes(passenger.fullName)) ||
      (passenger?.fullName && rowName && passenger.fullName.includes(rowName))
    );
  });
  const roomNumber =
    passengerRoom ||
    matchedTripPassenger?.roomNumber ||
    matchedTripPassenger?.room ||
    'غير محدد';

  const hotelName = hotel?.name || trip?.hotelName || 'الفندق المخصص';
  const extraNotes = notes ? `\nملاحظات: ${notes}` : '';

  return `أهلاً ${fullName}، نذكرك برحلتك غدًا إلى ${destination}. نقطة التجمع: ${gatheringPoint}. رقم غرفتك في ${hotelName} هو ${roomNumber}. يرجى الالتزام بالتعليمات المرفقة.${extraNotes}\nرحلة سعيدة!`;
}

export function buildTripContextSummary({ trips = [], passengers = [], invoices = [] }) {
  const activeTrips = (trips || []).slice(0, 8).map((trip) => {
    const seatsLeft = Math.max(Number(trip?.capacity || 0) - Number(trip?.bookedCount || 0), 0);
    return {
      tripNumber: trip?.tripNumber || '—',
      destination: trip?.destination || 'غير محدد',
      departure: trip?.departure || 'غير محدد',
      gatheringPoint: trip?.gatheringPoint || 'غير محدد',
      seatsLeft,
      hotelName: trip?.hotelName || 'غير محدد',
      status: seatsLeft <= 0 ? 'مكتملة' : seatsLeft <= 3 ? 'قريبة من الاكتمال' : 'متاحة',
    };
  });

  const invoiceTotal = (invoices || []).reduce((sum, invoice) => sum + Number(invoice?.paid || 0), 0);
  const pendingCustomers = (passengers || []).filter((person) => person?.status !== 'canceled').length;

  return `
بيانات النظام الحالية:
- عدد الرحلات المعروضة: ${activeTrips.length}
- عدد المسافرين المسجلين: ${pendingCustomers}
- إجمالي المحصل من الفواتير: ${invoiceTotal} ريال
- أبرز الرحلات المتاحة:
${activeTrips
  .map(
    (trip) =>
      `  • ${trip.tripNumber} | ${trip.destination} | ${trip.departure} | المقاعد المتبقية: ${trip.seatsLeft} | نقطة التجمع: ${trip.gatheringPoint} | الفندق: ${trip.hotelName}`
  )
  .join('\n')}
`;
}

export function buildAICustomerPrompt({ question, trips = [], passengers = [], invoices = [] }) {
  const context = buildTripContextSummary({ trips, passengers, invoices });

  return `أنت وكيل خدمة عملاء عربي متخصص في منظومة الحج والعمرة.
الرد باللغة العربية الفصحى فقط.
التزم بالبيانات الموجودة في النظام فقط، ولا تختلق معلومات.
إذا لم توجد بيانات كافية، أخبر العميل بوضوح وقدم اقتراحًا عمليًا.

قواعد الرد:
- اجب بصياغة موجزة وواضحة.
- ركز على الرحلات المتاحة، المقاعد، نقطة التجمع، المواعيد والهدايا/التذكيرات إذا لزم الأمر.
- لا تذكر أي معلومة غير مؤكدة.
- إذا كان السؤال عن الحجز أو الدفع، فاقترح الخطوة التالية بوضوح.

السؤال: ${question}

${context}

الهدف: أعطِ إجابة عملية ومفيدة للعميل، مناسبة لنظام حج وعمرة، مع اقتراحات سريعة إذا كان ذلك مناسبًا.`;
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
