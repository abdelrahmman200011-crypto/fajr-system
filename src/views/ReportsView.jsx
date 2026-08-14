import {
  BarChart3,
  BellRing,
  Building2,
  Download,
  Printer,
  Route,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { formatSAR } from '../data/mockData';
import {
  buildBranchReport,
  buildCustomerReport,
  buildTripCompletionReport,
} from '../services/reports';
import {
  exportReportCsv,
  printHtmlReport,
} from '../services/export';
import AIAgentPanel from '../components/AIAgentPanel';
import { buildSmartAlerts } from '../services/notifications';

export default function ReportsView({
  passengers,
  trips,
  invoices,
  packages,
  services,
  pendingBookings = [],
  onCreatePendingBooking,
}) {
  const branchReport = buildBranchReport(passengers, trips, invoices, packages, services);
  const tripReport = buildTripCompletionReport(trips);
  const customerReport = buildCustomerReport(passengers);
  const alerts = buildSmartAlerts({ trips, pendingBookings, invoices });
  const pendingCount = pendingBookings.filter((item) => item.status === 'pending').length;

  const reportRows = branchReport.map((row) => ({
    branch: row.branch,
    passengers: row.passengers,
    totalRevenue: row.totalRevenue,
    paid: row.paid,
    remaining: row.remaining,
    pending: row.pending,
  }));

  const handleExportCsv = () => {
    exportReportCsv(
      'branch-report.csv',
      ['branch', 'passengers', 'totalRevenue', 'paid', 'remaining', 'pending'],
      reportRows
    );
  };

  const handlePrintReport = () => {
    printHtmlReport(
      'تقرير الأداء حسب الفرع',
      reportRows,
      ['branch', 'passengers', 'totalRevenue', 'paid', 'remaining', 'pending']
    );
  };

  const cards = [
    {
      label: 'إجمالي العملاء',
      value: customerReport.total,
      icon: Users,
      tone: 'from-emerald-500 to-teal-700',
    },
    {
      label: 'المدفوع',
      value: formatSAR(branchReport.reduce((acc, row) => acc + row.paid, 0)),
      icon: Wallet,
      tone: 'from-amber-500 to-orange-600',
    },
    {
      label: 'قائمة الانتظار',
      value: pendingCount,
      icon: BellRing,
      tone: 'from-rose-500 to-red-600',
    },
    {
      label: 'الرحلات النشطة',
      value: tripReport.active,
      icon: Route,
      tone: 'from-sky-500 to-blue-700',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-700/20">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">التقارير والإحصاءات</h1>
              <p className="mt-1 text-sm text-gray-500">ملخص الأداء العام لأعمال الحج والعمرة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Download className="h-4 w-4" />
              تصدير CSV
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" />
              طباعة PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-gray-900">{value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <BellRing className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">لوحة التشغيل اليومية</h2>
            <p className="text-sm text-gray-500">التحكم السريع في الحجوزات والتنبيهات</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {alerts.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500 md:col-span-2 xl:col-span-3">
              لا توجد تنبيهات قيد التنفيذ الآن.
            </div>
          )}

          {alerts.map((alert) => (
            <div key={alert.type} className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
              <p className="text-xs font-bold text-gray-500">{alert.title}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-gray-700">{alert.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <AIAgentPanel
        trips={trips}
        passengers={passengers}
        invoices={invoices}
        onCreatePendingBooking={onCreatePendingBooking}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
          <h2 className="mb-5 flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
              <Building2 className="h-5 w-5" />
            </span>
            الأداء حسب الفرع
          </h2>

          <div className="space-y-3">
            {branchReport.map((row) => (
              <div key={row.branch} className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-extrabold text-gray-800">{row.branch}</span>
                  <span className="text-xs font-bold text-emerald-700">{row.passengers} عميل</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="rounded-lg bg-white p-2">إيرادات: {formatSAR(row.totalRevenue)}</div>
                  <div className="rounded-lg bg-white p-2">مدفوع: {formatSAR(row.paid)}</div>
                  <div className="rounded-lg bg-white p-2">متبقي: {formatSAR(row.remaining)}</div>
                  <div className="rounded-lg bg-white p-2">معلق: {row.pending}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
          <h2 className="mb-5 flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <TrendingUp className="h-5 w-5" />
            </span>
            ملخص العملاء والرحلات
          </h2>

          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-700">العملاء النشطون</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-900">{customerReport.active}</p>
            </div>
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs font-bold text-red-700">العملاء الملغون</p>
              <p className="mt-2 text-2xl font-extrabold text-red-900">{customerReport.canceled}</p>
            </div>
            <div className="rounded-xl bg-sky-50 p-4">
              <p className="text-xs font-bold text-sky-700">تقسيم النوع</p>
              <p className="mt-2 text-sm font-bold text-sky-900">ذكر: {customerReport.male} · أنثى: {customerReport.female}</p>
            </div>
            <div className="rounded-xl bg-violet-50 p-4">
              <p className="text-xs font-bold text-violet-700">حالة الرحلات</p>
              <p className="mt-2 text-sm font-bold text-violet-900">إجمالي: {tripReport.total} · مكتمل: {tripReport.completed}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
