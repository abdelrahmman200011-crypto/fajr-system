import {
  Activity,
  Gauge,
  Zap,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Clock,
} from 'lucide-react';

export default function AIStatusDashboard({
  systemHealth = 'optimal',
  responseTime = 245,
  requestsProcessed = 1842,
  successRate = 98.5,
}) {
  const getHealthColor = (health) => {
    switch (health) {
      case 'optimal':
        return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100' };
      case 'good':
        return { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', badge: 'bg-sky-100' };
      case 'warning':
        return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100' };
      case 'critical':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100' };
    }
  };

  const healthLabel = {
    optimal: 'أمثل',
    good: 'جيد',
    warning: 'تحذير',
    critical: 'حرج',
  };

  const healthColors = getHealthColor(systemHealth);
  const StatusIcon = systemHealth === 'optimal' ? CheckCircle : AlertCircle;

  return (
    <div className={`rounded-[28px] border ${healthColors.border} ${healthColors.bg} p-6 shadow-soft`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${healthColors.badge}`}>
            <Activity className={`h-6 w-6 ${healthColors.text}`} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">صحة نظام الذكاء الاصطناعي</h3>
            <p className="text-xs font-medium text-slate-500">مؤشرات الأداء الحية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon className={`h-6 w-6 ${healthColors.text}`} />
          <span className={`rounded-full ${healthColors.badge} px-3 py-1.5 text-xs font-bold ${healthColors.text}`}>
            {healthLabel[systemHealth]}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Response Time */}
        <div className="rounded-2xl bg-white/60 p-3 ring-1 ring-white/70">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            التأخير الزمني
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{responseTime}</p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-400">ms</p>
        </div>

        {/* Requests Processed */}
        <div className="rounded-2xl bg-white/60 p-3 ring-1 ring-white/70">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <BarChart3 className="h-3.5 w-3.5" />
            الطلبات المعالجة
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{requestsProcessed}</p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-400">طلب</p>
        </div>

        {/* Success Rate */}
        <div className="rounded-2xl bg-white/60 p-3 ring-1 ring-white/70">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Gauge className="h-3.5 w-3.5" />
            معدل النجاح
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{successRate}%</p>
          <p className="mt-0.5 text-[10px] font-medium text-slate-400">عمليات ناجحة</p>
        </div>

        {/* System Status */}
        <div className="rounded-2xl bg-white/60 p-3 ring-1 ring-white/70">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Zap className="h-3.5 w-3.5" />
            حالة النظام
          </div>
          <p className="mt-2 text-lg font-extrabold text-slate-900">جاهز</p>
          <p className="mt-0.5 text-[10px] font-medium text-emerald-600">🔴 متصل</p>
        </div>
      </div>

      {/* Performance Bar */}
      <div className="mt-5 rounded-2xl bg-white/60 p-4">
        <div className="mb-3 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600">استخدام الموارد</span>
          <span className="text-slate-900">68%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[68%] bg-gradient-to-l from-primary-green to-primary-green-deep" />
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 rounded-xl border border-white/40 bg-white/30 p-3 text-[11px] text-slate-600">
        <p className="font-medium">آخر تحديث: الآن</p>
        <p className="mt-1 text-slate-500">نظام الذكاء الاصطناعي يعمل بكفاءة عالية ويجهز البيانات للمعالجة الفورية</p>
      </div>
    </div>
  );
}
