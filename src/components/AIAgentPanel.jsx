import { useEffect, useMemo, useState } from 'react';
import { Bot, Sparkles, MessageSquareText, Send, CheckCircle2, Clock3 } from 'lucide-react';
import {
  generateBookingAgentReply,
  checkOllamaAvailability,
  checkGroqAvailability,
  buildFinanceInsight,
} from '../services/ai';
import { buildPendingBooking, buildWhatsAppMessageForPending } from '../services/pendingBookings';

export default function AIAgentPanel({ trips = [], passengers = [], invoices = [], onCreatePendingBooking }) {
  const [question, setQuestion] = useState('إيه الرحلات المتاحة لمكة؟');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [queueState, setQueueState] = useState('idle');
  const [providerState, setProviderState] = useState({
    available: false,
    model: 'llama3.2',
    provider: 'Ollama',
  });

  const quickPrompts = [
    'إيه الرحلات المتاحة لمكة؟',
    'هل توجد رحلات متبقية إلى المدينة؟',
    'أريد تفاصيل حول حالة الدفع للعميل',
    'أخبرني عن أفضل الرحلات المتاحة هذا الأسبوع',
  ];

  useEffect(() => {
    const syncProviderState = async () => {
      const groqState = checkGroqAvailability();
      const ollamaState = await checkOllamaAvailability('llama3.2');

      if (groqState.available) {
        setProviderState({ ...groqState, provider: 'Groq' });
        return;
      }

      setProviderState({
        available: ollamaState.available,
        model: ollamaState.model,
        provider: ollamaState.available ? 'Ollama' : 'غير متصل',
      });
    };

    syncProviderState();
  }, []);

  const financeInsight = useMemo(() => buildFinanceInsight({ invoices, passengers, trips }), [invoices, passengers, trips]);

  const suggestedTrip = useMemo(() => {
    const lower = question.toLowerCase();
    return (trips || []).find((trip) => {
      const destination = (trip?.destination || '').toLowerCase();
      const tripNumber = String(trip?.tripNumber || '').toLowerCase();
      return lower.includes(destination) || lower.includes(tripNumber);
    }) || (trips || [])[0];
  }, [question, trips]);

  const handleAsk = async () => {
    setLoading(true);
    const aiReply = await generateBookingAgentReply({ question, trips, passengers, invoices });
    setReply(aiReply || 'لا توجد إجابة حالياً من الذكاء الاصطناعي.');
    setLoading(false);
  };

  const handleQueueFromAI = () => {
    if (!onCreatePendingBooking) return;
    const booking = buildPendingBooking({
      customerName: 'طلب من الذكاء الاصطناعي',
      phone: '',
      tripId: suggestedTrip?.id || '',
      tripTitle: suggestedTrip?.destination || 'رحلة مخصصة',
      notes: `${question}\n\n${reply || 'لا توجد إجابة منشورة حاليًا.'}`,
      source: 'ai',
    });

    onCreatePendingBooking(booking);
    setQueueState('queued');
  };

  const whatsappMessage = useMemo(() => {
    const booking = buildPendingBooking({
      customerName: 'العميل',
      phone: '',
      tripId: suggestedTrip?.id || '',
      tripTitle: suggestedTrip?.destination || 'رحلة مخصصة',
      notes: reply || question,
      source: 'ai',
    });
    return buildWhatsAppMessageForPending(booking);
  }, [question, reply, suggestedTrip]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-700/20">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">وكيل خدمة العملاء الذكي</h3>
              <p className="text-sm text-gray-500">يدعم Groq إذا تم تفعيله عبر مفتاح API، أو Ollama محليًا</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${providerState.available ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
            <Sparkles className="h-3.5 w-3.5" />
            {providerState.available ? `${providerState.provider} جاهز` : 'غير متصل'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-base font-extrabold text-gray-900">
            <MessageSquareText className="h-5 w-5 text-violet-600" />
            دردشة الوكيل
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuestion(prompt)}
                className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
              >
                {prompt}
              </button>
            ))}
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-right text-sm font-medium text-gray-800 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
            placeholder="اكتب سؤال العميل..."
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleAsk}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {loading ? 'جارٍ التحليل...' : 'إرسال السؤال'}
            </button>

            <button
              onClick={handleQueueFromAI}
              disabled={!reply || !onCreatePendingBooking}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-extrabold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clock3 className="h-4 w-4" />
              {queueState === 'queued' ? 'تمت الإضافة للقائمة' : 'إضافة للحجوزات المعلقة'}
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-violet-50 p-4 text-sm font-medium leading-7 text-violet-900">
            {reply || 'سيظهر رد الوكيل هنا تلقائيًا بعد السؤال.'}
          </div>

          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold leading-6 text-emerald-800">
            رسالة واتساب الجاهزة: {whatsappMessage}
          </div>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
          <div className="mb-3 flex items-center gap-2 text-base font-extrabold text-gray-900">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            تحليل مالي ذكي
          </div>

          <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium leading-7 text-emerald-900">
            {financeInsight}
          </div>
        </div>
      </div>
    </div>
  );
}
