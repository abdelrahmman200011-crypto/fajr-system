import {
  Users,
  Route,
  Wallet,
  Sparkles,
  ArrowLeftRight,
  Package,
  Building2,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { formatSAR } from '../data/mockData';

function StatCard({ label, value, hint, icon: Icon, gradient, iconClass }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/5 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-gray-500">{label}</p>
          <p className="mt-2 text-4xl font-extrabold text-gray-900">{value}</p>
          <p className="mt-1.5 text-xs font-semibold text-gray-400">{hint}</p>
        </div>
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-emerald-900/10 ${gradient}`}
        >
          <Icon className={`h-7 w-7 ${iconClass}`} strokeWidth={2.2} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-transparent via-amber-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

export default function DashboardView({ stats, invoices, trips, onNavigate }) {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-700 p-8 shadow-xl shadow-emerald-900/25 sm:p-10">
        <div className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              موسم العمرة 2026
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              مرحباً بك في لوحة فجر النسك
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/90 sm:text-base">
              راقب سجل المعتمرين، تابع الرحلات النشطة، وأصدر الفواتير
              واربطها بالباقات والخدمات بسلاسة
            </p>
          </div>
          <button
            onClick={() => onNavigate('invoices')}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-emerald-950 shadow-lg shadow-amber-900/30 transition hover:bg-amber-300 active:scale-95"
          >
            <ArrowLeftRight className="h-5 w-5" />
            إصدار فاتورة جديدة
          </button>
        </div>
      </div>

      {/* 3 stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="إجمالي الركاب"
          value={stats.totalPassengers}
          hint="مسجلين في رحلات العمرة"
          icon={Users}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          iconClass="text-white"
        />
        <StatCard
          label="الرحلات النشطة"
          value={stats.activeTrips}
          hint={`من أصل ${trips.length} رحلات مجدولة`}
          icon={Route}
          gradient="bg-gradient-to-br from-amber-400 to-amber-600"
          iconClass="text-white"
        />
        <StatCard
          label="إجمالي الإيرادات"
          value={formatSAR(stats.totalRevenue)}
          hint="المدفوع من الفواتير الصادرة"
          icon={Wallet}
          gradient="bg-gradient-to-br from-teal-500 to-cyan-700"
          iconClass="text-white"
        />
      </div>

      {/* Bottom grid: invoices summary + trips snapshot */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Recent invoices */}
        <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                <ArrowLeftRight className="h-5 w-5" />
              </span>
              أحدث الفواتير الصادرة
            </h3>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
            >
              عرض الكل
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {invoices.slice(0, 4).map((inv) => {
              const remaining = inv.remaining ?? (inv.paid ?? 0);
              return (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-sm font-extrabold text-emerald-800">
                      {(inv.passenger?.fullName || '?').charAt(0)}
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-bold text-gray-800">
                        {inv.passenger?.fullName || 'معتمر غير معروف'}
                      </p>
                      <p className="text-xs font-medium text-gray-400">
                        {inv.package?.name || 'بدون باقة'} ·{' '}
                        {inv.trip?.name || 'بدون رحلة'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-extrabold text-gray-900">
                      {formatSAR(remaining)}
                    </p>
                    <p className="text-xs font-semibold text-gray-400">
                      {remaining === 0 ? 'مسددة بالكامل' : 'متبقي على الفاتورة'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trips snapshot */}
        <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
          <h3 className="mb-4 flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Package className="h-5 w-5" />
            </span>
            لمحة سريعة
          </h3>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between rounded-xl bg-emerald-50/80 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <Building2 className="h-4 w-4 text-emerald-600" />
                فرع الداير
              </span>
              <span className="text-sm font-extrabold text-emerald-900">
                {stats.aldaer} راكب
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-teal-50/80 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-bold text-teal-800">
                <MapPin className="h-4 w-4 text-teal-600" />
                فرع جازان
              </span>
              <span className="text-sm font-extrabold text-teal-900">
                {stats.jazan} راكب
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-amber-50/80 px-4 py-3">
              <span className="flex items-center gap-2 text-sm font-bold text-amber-800">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                باقات معروضة
              </span>
              <span className="text-sm font-extrabold text-amber-900">
                {stats.packageCount} باقة
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}