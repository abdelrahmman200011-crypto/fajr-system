import { useState, useEffect } from 'react';
import {
  Sparkles,
  Brain,
  TrendingUp,
  Users,
  AlertCircle,
  Zap,
  ArrowUpRight,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';

export default function AIInsightsPanel({ trips = [], invoices = [], passengers = [] }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateInsights();
  }, [trips, invoices, passengers]);

  const generateInsights = () => {
    setLoading(true);
    const newInsights = [];

    // Insight 1: Revenue Optimization
    if (invoices.length > 0) {
      const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.price || 0), 0);
      const avgInvoiceValue = (totalRevenue / invoices.length).toFixed(0);
      newInsights.push({
        id: 'revenue-opt',
        type: 'opportunity',
        icon: TrendingUp,
        title: 'فرصة تحسين الإيرادات',
        description: `متوسط قيمة الفاتورة ${avgInvoiceValue} ريال. يمكن زيادة العروض الإضافية بـ 15-20%`,
        actionLabel: 'عرض الفرص',
        color: 'from-emerald-500 to-teal-600',
        badge: 'توصية',
      });
    }

    // Insight 2: Capacity Planning
    if (trips.length > 0) {
      const utilizationRate = Math.round(
        (trips.reduce((sum, t) => sum + (t.bookedSeats || 0), 0) /
          trips.reduce((sum, t) => sum + (t.totalSeats || 50), 0)) *
          100
      );
      newInsights.push({
        id: 'capacity-plan',
        type: 'metric',
        icon: Users,
        title: 'معدل استخدام الطاقة',
        description: `${utilizationRate}% من السعة المتاحة محجوزة. استهدف 85-90%`,
        actionLabel: 'تحسين الحجز',
        color: 'from-blue-500 to-indigo-600',
        badge: `${utilizationRate}%`,
      });
    }

    // Insight 3: Payment Collection
    if (invoices.length > 0) {
      const unpaid = invoices.filter((inv) => !inv.paid).length;
      if (unpaid > 0) {
        newInsights.push({
          id: 'payment-collect',
          type: 'alert',
          icon: AlertCircle,
          title: 'فواتير معلقة للسداد',
          description: `هناك ${unpaid} فاتورة بانتظار الدفع. اتصل بالعملاء لتسريع التحصيل`,
          actionLabel: 'عرض الفواتير المعلقة',
          color: 'from-amber-500 to-orange-600',
          badge: unpaid,
        });
      }
    }

    // Insight 4: Customer Growth
    if (passengers.length > 0) {
      newInsights.push({
        id: 'customer-growth',
        type: 'positive',
        icon: Sparkles,
        title: 'نمو مستقر في العملاء',
        description: `لديك ${passengers.length} عميل مسجل. حافظ على جودة الخدمة لتحسين التكرار`,
        actionLabel: 'عرض التقرير',
        color: 'from-violet-500 to-purple-600',
        badge: `+${passengers.length}`,
      });
    }

    setInsights(newInsights);
    setLoading(false);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-green to-primary-green-deep shadow-lg shadow-primary-green/20">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">البصائر الذكية</h3>
            <p className="text-xs font-medium text-slate-500">
              توصيات تحليلية مدعومة بالذكاء الاصطناعي
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-green/10 px-3 py-1.5 text-xs font-bold text-primary-green ring-1 ring-primary-green/20">
          <Zap className="h-3.5 w-3.5" />
          فعّال
        </span>
      </div>

      {/* Insights Grid */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-green" />
            <p className="text-sm font-semibold text-slate-400">جاري تحليل البيانات...</p>
          </div>
        </div>
      ) : insights.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
          <p className="text-center text-sm font-semibold text-slate-400">
            لا توجد بصائر متاحة حالياً
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = insight.icon;
            const isAlert = insight.type === 'alert';

            return (
              <div
                key={insight.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isAlert
                    ? 'border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50'
                    : 'border-slate-200 bg-gradient-to-l from-slate-50 to-white'
                }`}
              >
                {/* Background gradient accent */}
                <div
                  className={`pointer-events-none absolute -right-8 top-0 h-20 w-20 opacity-0 blur-2xl transition-opacity group-hover:opacity-10 ${
                    insight.color.includes('emerald')
                      ? 'bg-emerald-500'
                      : insight.color.includes('blue')
                        ? 'bg-blue-500'
                        : insight.color.includes('amber')
                          ? 'bg-amber-500'
                          : 'bg-violet-500'
                  }`}
                />

                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isAlert ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900">{insight.title}</h4>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                          isAlert
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-primary-green/10 text-primary-green'
                        }`}
                      >
                        {insight.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {insight.description}
                    </p>
                    <button className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 ring-1 ring-slate-200">
                      {insight.actionLabel}
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-5 rounded-2xl bg-gradient-to-l from-primary-green/5 to-primary-green-deep/5 p-4 ring-1 ring-primary-green/10">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary-green" />
          <p className="text-sm font-semibold text-slate-700">
            استخدم هذه البصائر لاتخاذ قرارات عملية وتحسين أداء العمل
          </p>
        </div>
      </div>
    </div>
  );
}
