import {
  Users,
  Route,
  Wallet,
  ArrowUpRight,
  Building2,
  Car,
  BellRing,
  MapPin,
  TrendingUp,
  CalendarRange,
} from 'lucide-react';
import PendingBookingsPanel from '../components/PendingBookingsPanel';
import AIInsightsPanel from '../components/AIInsightsPanel';
import AIControlsPanel from '../components/AIControlsPanel';
import AIStatusDashboard from '../components/AIStatusDashboard';
import AIRecommendations from '../components/AIRecommendations';
import { formatSAR } from '../data/mockData';
import { buildSmartAlerts } from '../services/notifications';

function StatCard({ label, value, hint, icon: Icon, iconBg, trend }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-premium">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
          <ArrowUpRight className="h-3.5 w-3.5" />
          {trend}
        </span>
        <span className="text-[11px] font-medium text-slate-400">{hint}</span>
      </div>
    </div>
  );
}

const upcomingTrips = [
  {
    tripNo: 'TR-1042',
    type: 'مكة',
    date: '25/08/2026',
    from: 'الرياض',
    to: 'مكة',
    vehicle: 'BUS-12',
    seats: '28 / 40',
    status: 'مؤكدة',
    tone: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  {
    tripNo: 'TR-1068',
    type: 'المدينة',
    date: '27/08/2026',
    from: 'مكة',
    to: 'المدينة',
    vehicle: 'BUS-08',
    seats: '15 / 35',
    status: 'قيد التنفيذ',
    tone: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  {
    tripNo: 'TR-1101',
    type: 'مكة',
    date: '30/08/2026',
    from: 'جدة',
    to: 'مكة',
    vehicle: 'BUS-17',
    seats: '22 / 30',
    status: 'مؤكدة',
    tone: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  {
    tripNo: 'TR-1154',
    type: 'المدينة',
    date: '02/09/2026',
    from: 'الداير',
    to: 'المدينة',
    vehicle: 'BUS-05',
    seats: '12 / 25',
    status: 'قيد التنفيذ',
    tone: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
];

const bookingBreakdown = [
  { name: 'مكة', value: 42, color: 'bg-primary-green' },
  { name: 'المدينة', value: 31, color: 'bg-accent-gold' },
  { name: 'جدة', value: 17, color: 'bg-slate-300' },
  { name: 'أخرى', value: 10, color: 'bg-emerald-200' },
];

export default function DashboardView({
  stats,
  invoices,
  trips,
  pendingBookings = [],
  onNavigate,
  onAddPendingBooking,
  onApprovePendingBooking,
}) {
  const alerts = buildSmartAlerts({ trips, pendingBookings, invoices });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-l from-primary-green via-primary-green to-primary-green-deep p-6 text-white shadow-premium sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-accent-gold ring-1 ring-white/10">
              <Building2 className="h-3.5 w-3.5" />
              Fajr Al Nusuk ERP
            </p>
            <h2 className="mt-4 text-2xl font-black sm:text-3xl">لوحة القيادة الرئيسية</h2>
            <p className="mt-2 max-w-xl text-sm text-emerald-50/80">
              راقب الأداء اليومي، متابعة الرحلات، وتحسين القرار الإداري عبر مؤشرات التشغيل المالية.
            </p>
          </div>

          <button
            onClick={() => onNavigate('invoices')}
            className="inline-flex items-center justify-center rounded-2xl bg-accent-gold px-5 py-3 text-sm font-extrabold text-primary-green shadow-lg shadow-accent-gold/20 transition hover:bg-[#d7ba58]"
          >
            <CalendarRange className="ml-2 h-4 w-4" />
            إدارة الحجوزات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="إجمالي الحجوزات"
          value="128"
          hint="إجمالي"
          trend="+12%"
          icon={Users}
          iconBg="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="الرحلات القادمة"
          value="14"
          hint="قريبًا"
          trend="+4%"
          icon={Route}
          iconBg="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="إجمالي الإيرادات"
          value="152,840"
          hint="SAR"
          trend="+18%"
          icon={Wallet}
          iconBg="bg-sky-50 text-sky-700"
        />
        <StatCard
          label="المركبات المتاحة"
          value="23"
          hint="جاهزة"
          trend="+3%"
          icon={Car}
          iconBg="bg-violet-50 text-violet-700"
        />
        <StatCard
          label="إجمالي العملاء"
          value="1,256"
          hint="مسجلين"
          trend="+9%"
          icon={Building2}
          iconBg="bg-rose-50 text-rose-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-400">جدول التشغيل</p>
              <h3 className="text-xl font-black text-slate-900">الرحلات القادمة</h3>
            </div>
            <button className="text-sm font-bold text-primary-green">عرض الكل</button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-2 font-bold">Trip No</th>
                  <th className="pb-3 pr-2 font-bold">النوع</th>
                  <th className="pb-3 pr-2 font-bold">التاريخ</th>
                  <th className="pb-3 pr-2 font-bold">من</th>
                  <th className="pb-3 pr-2 font-bold">إلى</th>
                  <th className="pb-3 pr-2 font-bold">المركبة</th>
                  <th className="pb-3 pr-2 font-bold">المقاعد</th>
                  <th className="pb-3 pr-2 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTrips.map((trip) => (
                  <tr key={trip.tripNo} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-2 font-bold text-slate-800">{trip.tripNo}</td>
                    <td className="py-3 pr-2 text-slate-600">{trip.type}</td>
                    <td className="py-3 pr-2 text-slate-600">{trip.date}</td>
                    <td className="py-3 pr-2 text-slate-600">{trip.from}</td>
                    <td className="py-3 pr-2 text-slate-600">{trip.to}</td>
                    <td className="py-3 pr-2 text-slate-600">{trip.vehicle}</td>
                    <td className="py-3 pr-2 text-slate-600">{trip.seats}</td>
                    <td className="py-3 pr-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${trip.tone}`}>
                        {trip.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5">
            <p className="text-sm font-bold text-slate-400">المزيج التشغيلي</p>
            <h3 className="text-xl font-black text-slate-900">الحجوزات حسب النوع</h3>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[conic-gradient(#114b39_0_42%,#cda036_42%_73%,#dfe6e3_73%_90%,#d7e8df_90%_100%)] shadow-inner">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-center">
                <div>
                  <p className="text-xl font-black text-slate-900">42%</p>
                  <p className="text-[10px] font-bold text-slate-500">مكة</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {bookingBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-600">إيرادات هذا الشهر</p>
              <TrendingUp className="h-4 w-4 text-primary-green" />
            </div>

            <div className="flex h-20 items-end gap-2">
              {[40, 58, 52, 78, 71, 88, 96].map((bar, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-t-xl bg-gradient-to-t from-primary-green to-accent-gold"
                  style={{ height: `${bar}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">التنبيهات والتذكيرات</h3>
            <p className="text-sm text-slate-500">تنبيهات ذكية تدعم المراجعة اليومية</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 md:col-span-2 xl:col-span-4">
              لا توجد تنبيهات حاليًا. كل شيء يعمل بشكل طبيعي.
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.type} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold text-slate-500">{alert.title}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{alert.detail}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Insights & Controls Section */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AIInsightsPanel trips={trips} invoices={invoices} passengers={[]} />
        <AIControlsPanel
          onGenerateReminders={async () => {
            console.log('Generating reminders...');
          }}
          onSuggestBookings={async () => {
            console.log('Generating booking suggestions...');
          }}
        />
      </div>

      {/* AI Status & Recommendations */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AIStatusDashboard
          systemHealth="optimal"
          responseTime={245}
          requestsProcessed={1842}
          successRate={98.5}
        />
        <AIRecommendations />
      </div>

      {/* Pending Bookings Panel */}
      <PendingBookingsPanel
        trips={trips}
        initialItems={pendingBookings}
        onAddBooking={onAddPendingBooking}
        onApproveBooking={onApprovePendingBooking}
      />
    </div>
  );
}