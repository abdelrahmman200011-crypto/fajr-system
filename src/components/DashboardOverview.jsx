import {
  Wallet,
  Users,
  Bus,
  TrendingUp,
  CalendarDays,
  MapPin,
  Sparkles,
} from 'lucide-react';

function StatCard({ label, value, sub, icon: Icon, gradient, iconColor }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">{value}</p>
          <p className="mt-1.5 text-xs font-semibold text-gray-400">{sub}</p>
        </div>
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg ${gradient}`}
        >
          <Icon className={`h-7 w-7 ${iconColor}`} strokeWidth={2.2} />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-transparent via-amber-400/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}

const upcomingTrips = [
  { id: 1, destination: 'مكة المكرمة', date: '2026-08-15', booked: 40, capacity: 49 },
  { id: 2, destination: 'المدينة المنورة', date: '2026-08-22', booked: 33, capacity: 49 },
  { id: 3, destination: 'مكة المكرمة', date: '2026-08-29', booked: 49, capacity: 49 },
];

const branchData = [
  { name: 'فرع جازان', revenue: 73500, passengers: 640, max: 80000, color: 'bg-emerald-500' },
  { name: 'فرع الداير', revenue: 68400, passengers: 600, max: 80000, color: 'bg-amber-400' },
];

function formatDateAr(iso) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

function formatDateShort(iso) {
  const d = new Date(iso);
  return `${d.getDate()} / ${d.getMonth() + 1} / ${d.getFullYear()}`;
}

export default function DashboardOverview() {
  const today = new Date();

  return (
    <div dir="rtl" className="space-y-6">
      {/* Top Header — greeting + today's date */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-700 p-8 shadow-xl shadow-emerald-900/25 sm:p-10">
        <div className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-amber-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-teal-400/25 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              لوحة تحكم الإدارة التنفيذية
            </span>
            <h2 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              مرحباً بك في لوحة تحكم فجر النسك
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-50/90 sm:text-base">
              <CalendarDays className="h-4 w-4 text-amber-300" />
              {formatDateAr(today.toISOString())}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Grid (4 cards) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="إجمالي الإيرادات"
          value="145,500 ريال"
          sub="المدفوع من الفواتير الصادرة"
          icon={Wallet}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-900/20"
          iconColor="text-white"
        />
        <StatCard
          label="إجمالي المعتمرين"
          value="1,240"
          sub="مسجلين في رحلات العمرة"
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-indigo-900/20"
          iconColor="text-white"
        />
        <StatCard
          label="الرحلات النشطة"
          value="8"
          sub="رحلات مجدولة حالياً"
          icon={Bus}
          gradient="bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-900/20"
          iconColor="text-white"
        />
        <StatCard
          label="أرباح الشهر"
          value="32,000 ريال"
          sub="صافي الربح المستهدف"
          icon={TrendingUp}
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-900/20"
          iconColor="text-white"
        />
      </div>

      {/* Main content split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Column 1 — Upcoming trips */}
        <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                <Bus className="h-5 w-5" />
              </span>
              الرحلات القادمة
            </h3>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              {upcomingTrips.length} رحلات
            </span>
          </div>

          <div className="space-y-4">
            {upcomingTrips.map((t) => {
              const pct = Math.min(Math.round((t.booked / t.capacity) * 100), 100);
              const full = t.booked >= t.capacity;
              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-gray-100 bg-white/60 p-4 transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                          full
                            ? 'bg-gradient-to-br from-rose-500 to-red-600'
                            : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        }`}
                      >
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900">{t.destination}</p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-400">
                          {formatDateShort(t.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                        full
                          ? 'bg-rose-50 text-rose-600 ring-rose-200'
                          : 'bg-amber-50 text-amber-700 ring-amber-200'
                      }`}
                    >
                      {full ? 'مكتملة' : `${pct}%`}
                    </span>
                  </div>

                  {/* Capacity progress bar (pure Tailwind) */}
                  <div className="mt-3.5">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-500">{t.booked} / {t.capacity} مقعد</span>
                      <span className={full ? 'text-rose-500' : 'text-emerald-600'}>{pct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          full
                            ? 'bg-gradient-to-l from-rose-400 to-red-500'
                            : pct >= 75
                              ? 'bg-gradient-to-l from-amber-400 to-orange-500'
                              : 'bg-gradient-to-l from-emerald-400 to-teal-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2 — Branches performance */}
        <div className="rounded-2xl border border-white/70 bg-white/80 p-6 shadow-lg backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </span>
              أداء الفروع
            </h3>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
              مبيعات الشهر
            </span>
          </div>

          <div className="space-y-5">
            {branchData.map((b) => {
              const pct = Math.round((b.revenue / b.max) * 100);
              return (
                <div key={b.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-800">{b.name}</span>
                    <span className="font-extrabold text-gray-900">
                      {b.revenue.toLocaleString()} ريال
                    </span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${b.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-xs font-semibold text-gray-400">
                    <span>{b.passengers.toLocaleString()} معتمر</span>
                    <span>{pct}% من الهدف الإيرادي</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-3 text-xs font-bold text-amber-800">
            <Sparkles className="h-4 w-4" />
            صدر الذكاء التنفيذي: إجمالي مبيعات الفرعين هذا الشهر 141,900 ريال
          </div>
        </div>
      </div>
    </div>
  );
}