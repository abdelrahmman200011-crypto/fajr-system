import { useMemo } from 'react';
import {
  TrendingUp,
  Building2,
  Wallet,
  Users,
  BarChart3,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { formatSAR } from '../data/mockData';
import { buildBranchReport } from '../services/reports';
import { buildFinanceInsight } from '../services/ai';

export default function Analytics({ passengers, trips, invoices, packages, services }) {
  const branchReport = useMemo(
    () => buildBranchReport(passengers, trips, invoices, packages, services),
    [passengers, trips, invoices, packages, services]
  );

  const financeInsight = useMemo(
    () => buildFinanceInsight({ invoices, passengers, trips }),
    [invoices, passengers, trips]
  );

  const totalRevenue = useMemo(
    () => invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0),
    [invoices]
  );

  const totalCollected = useMemo(
    () => invoices.reduce((sum, inv) => sum + Number(inv.paid || 0), 0),
    [invoices]
  );

  const totalRemaining = useMemo(
    () => totalRevenue - totalCollected,
    [totalRevenue, totalCollected]
  );

  const collectionRate = useMemo(
    () => totalRevenue > 0 ? Math.round((totalCollected / totalRevenue) * 100) : 0,
    [totalRevenue, totalCollected]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-l from-primary-green to-primary-green-deep p-6 text-white shadow-premium">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <BarChart3 className="h-6 w-6 text-accent-gold" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">التحليلات الذكية</h1>
            <p className="mt-1 text-sm text-emerald-50/80">تحليل شامل للأداء المالي والإيرادات حسب الفرع</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Wallet className="h-4 w-4 text-primary-green" />
            إجمالي الإيرادات
          </p>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">{formatSAR(totalRevenue)}</p>
          <p className="mt-1 text-xs text-slate-400">من جميع الفواتير الصادرة</p>
        </div>

        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <ArrowUpRight className="h-4 w-4" />
            المحصّل
          </p>
          <p className="mt-3 text-2xl font-extrabold text-emerald-900">{formatSAR(totalCollected)}</p>
          <p className="mt-1 text-xs text-emerald-600/80">مبلغ مسدد فعلي</p>
        </div>

        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-bold text-amber-700">
            <ArrowDownLeft className="h-4 w-4" />
            المتبقي
          </p>
          <p className="mt-3 text-2xl font-extrabold text-amber-900">{formatSAR(totalRemaining)}</p>
          <p className="mt-1 text-xs text-amber-600/80">قيمة الديون المعلقة</p>
        </div>

        <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-bold text-sky-700">
            <TrendingUp className="h-4 w-4" />
            معدل التحصيل
          </p>
          <p className="mt-3 text-2xl font-extrabold text-sky-900">{collectionRate}%</p>
          <p className="mt-1 text-xs text-sky-600/80">نسبة المدفوع من الإجمالي</p>
        </div>
      </div>

      {/* Financial Insight */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">الرؤى المالية الذكية</h3>
            <p className="text-sm text-gray-500">توصيات بناءً على تحليل البيانات الحالية</p>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-l from-violet-50 to-purple-50 p-5">
          <p className="leading-8 text-gray-800">{financeInsight}</p>
        </div>
      </div>

      {/* Branch Performance */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">الأداء حسب الفرع</h3>
            <p className="text-sm text-gray-500">مقارنة شاملة بين الأفرع وأداؤها المالي</p>
          </div>
        </div>

        <div className="space-y-3">
          {branchReport.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center text-sm text-gray-500">
              لا توجد بيانات للعرض حاليًا
            </div>
          ) : (
            branchReport.map((row) => (
              <div key={row.branch} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">{row.branch}</p>
                    <p className="text-xs text-gray-500">{row.passengers} عميل</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round((row.paid / row.totalRevenue) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <p className="font-bold text-gray-500">الإيرادات</p>
                    <p className="mt-1 font-extrabold text-gray-900">{formatSAR(row.totalRevenue)}</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <p className="font-bold text-emerald-600">المحصّل</p>
                    <p className="mt-1 font-extrabold text-emerald-900">{formatSAR(row.paid)}</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <p className="font-bold text-amber-600">المتبقي</p>
                    <p className="mt-1 font-extrabold text-amber-900">{formatSAR(row.remaining)}</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 text-xs">
                    <p className="font-bold text-sky-600">معلق</p>
                    <p className="mt-1 font-extrabold text-sky-900">{row.pending}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-extrabold text-gray-900">التوصيات</h3>
        </div>

        <div className="space-y-2 text-sm">
          {collectionRate < 70 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
              ⚠️ معدل التحصيل منخفض ({collectionRate}%). يُنصح بمتابعة العملاء بخصوص الفواتير المتبقية.
            </div>
          )}
          {branchReport.length > 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
              ✓ فرع {branchReport[0].branch} هو الأفضل أداءً. يُنصح بتقوية الخدمات والتسويق له.
            </div>
          )}
          {passengers.length > 0 && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sky-900">
              💡 لديك {passengers.length} عميل مسجل. راقب العملاء المنتظمين وأرسل لهم عروض مخصصة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
