import { useState } from 'react';
import {
  Zap,
  MessageSquare,
  Bell,
  Brain,
  Loader,
  CheckCircle2,
  AlertCircle,
  Settings,
} from 'lucide-react';

export default function AIControlsPanel({
  onGenerateReminders,
  onSuggestBookings,
  isGeneratingReminders = false,
  isGeneratingBookings = false,
}) {
  const [remindersStatus, setRemindersStatus] = useState(null);
  const [bookingsStatus, setBookingsStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleGenerateReminders = async () => {
    setRemindersStatus('loading');
    try {
      await onGenerateReminders?.();
      setRemindersStatus('success');
      setTimeout(() => setRemindersStatus(null), 3000);
    } catch (error) {
      setRemindersStatus('error');
      setTimeout(() => setRemindersStatus(null), 3000);
    }
  };

  const handleSuggestBookings = async () => {
    setBookingsStatus('loading');
    try {
      await onSuggestBookings?.();
      setBookingsStatus('success');
      setTimeout(() => setBookingsStatus(null), 3000);
    } catch (error) {
      setBookingsStatus('error');
      setTimeout(() => setBookingsStatus(null), 3000);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-gold to-amber-600 shadow-lg shadow-amber-600/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">التحكم بالذكاء الاصطناعي</h3>
            <p className="text-xs font-medium text-slate-500">
              فعّل الخصائص الذكية للإدارة الفعالة
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          title="إعدادات"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Generate Reminders Button */}
        <button
          onClick={handleGenerateReminders}
          disabled={isGeneratingReminders || remindersStatus === 'loading'}
          className={`group relative overflow-hidden rounded-2xl px-4 py-4 text-left transition ${
            remindersStatus === 'success'
              ? 'border border-emerald-200 bg-emerald-50'
              : remindersStatus === 'error'
                ? 'border border-red-200 bg-red-50'
                : 'border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
          }`}
        >
          {/* Background accent */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                remindersStatus === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : remindersStatus === 'error'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
              }`}
            >
              {remindersStatus === 'loading' ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : remindersStatus === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : remindersStatus === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-slate-900">
                {remindersStatus === 'loading'
                  ? 'جاري إنشاء التذكيرات...'
                  : remindersStatus === 'success'
                    ? 'تم إنشاء التذكيرات بنجاح'
                    : remindersStatus === 'error'
                      ? 'فشل إنشاء التذكيرات'
                      : 'إنشاء تذكيرات ذكية'}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {remindersStatus === 'loading'
                  ? 'يرجى الانتظار...'
                  : remindersStatus === 'success'
                    ? 'تم إرسال التذكيرات للعملاء'
                    : remindersStatus === 'error'
                      ? 'حاول مرة أخرى'
                      : 'WhatsApp + Email + SMS'}
              </p>
            </div>
          </div>
        </button>

        {/* AI Booking Suggestions Button */}
        <button
          onClick={handleSuggestBookings}
          disabled={isGeneratingBookings || bookingsStatus === 'loading'}
          className={`group relative overflow-hidden rounded-2xl px-4 py-4 text-left transition ${
            bookingsStatus === 'success'
              ? 'border border-emerald-200 bg-emerald-50'
              : bookingsStatus === 'error'
                ? 'border border-red-200 bg-red-50'
                : 'border border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md'
          }`}
        >
          {/* Background accent */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-violet-500/10 blur-xl opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                bookingsStatus === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : bookingsStatus === 'error'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-violet-100 text-violet-600'
              }`}
            >
              {bookingsStatus === 'loading' ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : bookingsStatus === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : bookingsStatus === 'error' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Brain className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-slate-900">
                {bookingsStatus === 'loading'
                  ? 'جاري تحليل الحجوزات...'
                  : bookingsStatus === 'success'
                    ? 'تم إنشاء الحجوزات المقترحة'
                    : bookingsStatus === 'error'
                      ? 'فشل التحليل'
                      : 'اقتراحات حجوزات ذكية'}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {bookingsStatus === 'loading'
                  ? 'يرجى الانتظار...'
                  : bookingsStatus === 'success'
                    ? 'عرض الحجوزات المعلقة للموافقة'
                    : bookingsStatus === 'error'
                      ? 'حاول مرة أخرى'
                      : 'مدعوم بـ Groq/Ollama'}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Settings Panel (Collapsed by default) */}
      {showSettings && (
        <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">إعدادات الذكاء الاصطناعي</p>

          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 transition hover:bg-slate-100">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-primary-green focus:ring-primary-green/20"
              />
              <span className="flex-1 text-sm font-semibold text-slate-700">
                التذكيرات الدورية التلقائية
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 transition hover:bg-slate-100">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-primary-green focus:ring-primary-green/20"
              />
              <span className="flex-1 text-sm font-semibold text-slate-700">
                تحليل الحجوزات المقترحة
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 transition hover:bg-slate-100">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-primary-green focus:ring-primary-green/20"
              />
              <span className="flex-1 text-sm font-semibold text-slate-700">
                إشعارات الأداء المالي
              </span>
            </label>
          </div>

          <div className="border-t border-slate-200 pt-3 text-xs text-slate-500">
            <p className="font-medium">مزود الخدمة الحالي: <span className="text-primary-green font-bold">Groq</span></p>
            <p className="mt-1">النسخة: <span className="text-slate-700 font-semibold">1.2.0</span></p>
          </div>
        </div>
      )}
    </div>
  );
}
