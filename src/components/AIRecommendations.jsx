import React, { useState } from 'react';
import {
  Lightbulb,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Zap,
} from 'lucide-react';

const defaultRecommendations = [
  {
    id: 1,
    type: 'optimization',
    priority: 'high',
    title: 'تحسين معدل التحويل',
    description: 'زيادة عروض الخدمات الإضافية بـ 15% يمكن أن يزيد الإيرادات بـ 8,500 ريال شهرياً',
    action: 'تفعيل الآن',
    icon: TrendingUp,
  },
  {
    id: 2,
    type: 'risk',
    priority: 'high',
    title: 'تحذير: تأخير في الدفعات',
    description: 'هناك 12 فاتورة معلقة بمجموع 28,400 ريال. اتصل بالعملاء اليوم',
    action: 'عرض التفاصيل',
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: 'opportunity',
    priority: 'medium',
    title: 'فرصة حجز جماعي',
    description: 'تم اكتشاف نمط: 23 عميل يبحثون عن رحلات مكة في الفترة 15-20 سبتمبر',
    action: 'عرض الفرصة',
    icon: Zap,
  },
  {
    id: 4,
    type: 'efficiency',
    priority: 'medium',
    title: 'تحسين توزيع المركبات',
    description: 'يمكن دمج رحلتين صغيرتين في رحلة واحدة وتوفير 2,100 ريال في التكاليف',
    action: 'المراجعة',
    icon: Check,
  },
];

export default function AIRecommendations({ recommendations = defaultRecommendations }) {
  const [dismissed, setDismissed] = useState([]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', text: 'عالي' };
      case 'medium':
        return { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', text: 'متوسط' };
      case 'low':
        return { bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', text: 'منخفض' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', text: '' };
    }
  };

  const filteredRecs = recommendations.filter((rec) => !dismissed.includes(rec.id));

  const handleDismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

  if (filteredRecs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100">
          <Lightbulb className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">توصيات ذكية مخصصة</h3>
          <p className="text-xs font-medium text-slate-500">
            {filteredRecs.length} توصية تحتاج إلى انتباهك اليوم
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {filteredRecs.map((rec) => {
          const priorityColors = getPriorityColor(rec.priority);
          const Icon = rec.icon;

          return (
            <div
              key={rec.id}
              className={`group relative overflow-hidden rounded-2xl border transition-all ${priorityColors.border} ${priorityColors.bg}`}
            >
              {/* Gradient accent on hover */}
              <div className="pointer-events-none absolute -right-8 top-0 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-10 group-hover:bg-primary-green" />

              <div className="relative flex items-start gap-4 p-4 sm:items-center sm:justify-between">
                {/* Content */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  {/* Icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${priorityColors.badge}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900">{rec.title}</h4>
                      <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${priorityColors.badge}`}>
                        {getPriorityColor(rec.priority).text}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600">{rec.description}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary-green/10 px-3 py-2 text-xs font-bold text-primary-green transition hover:bg-primary-green/20">
                    {rec.action}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDismiss(rec.id)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                    title="إخفاء"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRecs.length === 0 && dismissed.length > 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm font-semibold text-slate-500">تم إخفاء جميع التوصيات</p>
          <button
            onClick={() => setDismissed([])}
            className="mt-2 text-xs font-bold text-primary-green underline"
          >
            عرض الجميع مجددًا
          </button>
        </div>
      )}
    </div>
  );
}
