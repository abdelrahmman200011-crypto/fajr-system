import {
  Users,
  Route,
  Wallet,
  ArrowUpRight,
  Building2,
  BellRing,
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
import { calculateTripStatus } from '../services/trips';
import { invoiceTotals } from '../data/mockData';

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function formatTripDate(dateStr) {
  if (!dateStr) return '—';
  const dt = new Date(dateStr);
  if (Number.isNaN(dt.getTime())) return String(dateStr);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
}

function statusTone(text) {
  if (text.includes('منتهية')) return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
  if (text.includes('انطلقت')) return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
  if (text.includes('مكتملة')) return 'bg-red-100 text-red-700 ring-1 ring-red-200';
  return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
}

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

const bookingColors = ['bg-primary-green', 'bg-accent-gold', 'bg-slate-300', 'bg-emerald-200'];

export default function DashboardView({
  stats,
  invoices,
  trips,
  passengers = [],
  pendingBookings = [],
  onNavigate,
  onAddPendingBooking,
  onApprovePendingBooking,
}) {
  const alerts = buildSmartAlerts({ trips, pendingBookings, invoices });

  const totalBookings = invoices.length;
  const activeTrips = Number(stats?.activeTrips) || 0;
  const totalRevenue = Number(stats?.totalRevenue) || 0;
  const totalClients = Number(stats?.totalPassengers) || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingTrips = (trips || [])
    .map((trip) => ({
      trip,
      status: calculateTripStatus(trip, trip?.bookedCount ?? 0),
    }))
    .filter(({ trip }) => {
      const end = new Date(trip?.returnDate || trip?.endDate);
      return !(Number.isFinite(end.getTime()) && end < today);
    })
    .sort((a, b) => {
      const da = new Date(a.trip?.departure || '');
      const db = new Date(b.trip?.departure || '');
      return (Number.isFinite(da.getTime()) ? da.getTime() : 0) - (Number.isFinite(db.getTime()) ? db.getTime() : 0);
    })
    .slice(0, 5);

  const destinationCounts = (trips || []).reduce((acc, trip) => {
    const dest = (trip?.destination || 'أخرى').trim();
    const count = Number(trip?.bookedCount) || 0;
    acc[dest] = (acc[dest] || 0) + count;
    return acc;
  }, {});
  const breakdownEntries = Object.entries(destinationCounts).sort((a, b) => b[1] - a[1]);
  const totalDestBookings = breakdownEntries.reduce((sum, [, count]) => sum + count, 0);
  const topDest = breakdownEntries[0]?.[0] || '—';
  const topDestPercent = totalDestBookings > 0 ? Math.round((breakdownEntries[0]?.[1] || 0) * 100 / totalDestBookings) : 0;
  const bookingBreakdown = breakdownEntries.slice(0, 4).map(([name, count], i) => ({
    name,
    count,
    percent: totalDestBookings > 0 ? Math.round(count * 100 / totalDestBookings) : 0,
    color: bookingColors[i % bookingColors.length],
  }));

  const donutStops = (() => {
    if (bookingBreakdown.length === 0) return 'bg-slate-100';
    let cursor = 0;
    const stops = bookingBreakdown.map((item, i) => {
      const from = cursor;
      const to = from + item.percent;
      cursor = to;
      const hex = ['#114b39', '#cda036', '#94a3b8', '#6ee7b7'][i % 4];
      return `${hex} ${from}% ${to}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  })();

  const monthlyMap = new Map();
  (invoices || []).forEach((inv) => {
    const { paid } = invoiceTotals(inv, [], []);
    const history = Array.isArray(inv?.paymentHistory) && inv.paymentHistory.length
      ? inv.paymentHistory
      : (paid > 0 ? [{ amount: paid, date: inv?.date }] : []);
    history.forEach((entry) => {
      if (!Number(entry?.amount)) return;
      const dt = new Date(entry?.date);
      if (!Number.isFinite(dt.getTime())) return;
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(entry.amount));
    });
  });
  const monthlyRevenue = [...monthlyMap.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .slice(-7);
  const maxMonthly = Math.max(...monthlyRevenue.map(([, v]) => v), 1);

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي الحجوزات"
          value={totalBookings.toLocaleString('en-US')}
          hint="فاتورة مسجلة"
          trend={`${invoices.length} فاتورة`}
          icon={Users}
          iconBg="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          label="الرحلات القادمة"
          value={activeTrips.toLocaleString('en-US')}
          hint="رحلة نشطة"
          trend={`${trips.length} رحلة إجمالًا`}
          icon={Route}
          iconBg="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="إجمالي الإيرادات"
          value={totalRevenue.toLocaleString('en-US')}
          hint="SAR"
          trend={formatSAR(totalRevenue)}
          icon={Wallet}
          iconBg="bg-sky-50 text-sky-700"
        />
        <StatCard
          label="إجمالي العملاء"
          value={totalClients.toLocaleString('en-US')}
          hint="عميل مسجل"
          trend={`${stats?.aldaer || 0} الداير · ${stats?.jazan || 0} جازان`}
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
                  <th className="pb-3 pr-2 font-bold">رقم الرحلة</th>
                  <th className="pb-3 pr-2 font-bold">الوجهة</th>
                  <th className="pb-3 pr-2 font-bold">تاريخ الانطلاق</th>
                  <th className="pb-3 pr-2 font-bold">نقطة التجمع</th>
                  <th className="pb-3 pr-2 font-bold">المقاعد</th>
                  <th className="pb-3 pr-2 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {upcomingTrips.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      لا توجد رحلات قادمة حاليًا.
                    </td>
                  </tr>
                ) : (
                  upcomingTrips.map(({ trip, status }) => (
                    <tr key={trip.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-2 font-bold text-slate-800">{trip.tripNumber || '—'}</td>
                      <td className="py-3 pr-2 text-slate-600">{trip.destination || '—'}</td>
                      <td className="py-3 pr-2 text-slate-600">{formatTripDate(trip.departure)}</td>
                      <td className="py-3 pr-2 text-slate-600">{trip.gatheringPoint || '—'}</td>
                      <td className="py-3 pr-2 text-slate-600">
                        {trip.bookedCount ?? 0} / {trip.capacity ?? 0}
                      </td>
                      <td className="py-3 pr-2">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(status.text)}`}>
                          {status.text}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
            <div
              className="mx-auto flex h-36 w-36 items-center justify-center rounded-full shadow-inner"
              style={{ background: donutStops }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-center">
                <div>
                  <p className="text-xl font-black text-slate-900">
                    {topDestPercent > 0 ? `${topDestPercent}%` : '0%'}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">{topDest}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {bookingBreakdown.length === 0 ? (
                <p className="text-center text-sm text-slate-400">لا توجد حجوزات بعد.</p>
              ) : (
                bookingBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{item.percent}%</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-600">الإيرادات المحصّلة</p>
              <TrendingUp className="h-4 w-4 text-primary-green" />
            </div>

            <div className="flex h-20 items-end gap-2">
              {monthlyRevenue.length === 0 ? (
                <div className="flex w-full items-center justify-center text-sm text-slate-400">
                  لا توجد مدفوعات مسجلة بعد.
                </div>
              ) : (
                monthlyRevenue.map(([key, value]) => (
                  <div key={key} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[9px] font-black text-slate-700">
                      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                    </span>
                    <span
                      className="w-full rounded-t-xl bg-gradient-to-t from-primary-green to-accent-gold"
                      style={{ height: `${Math.max(Math.round((value / maxMonthly) * 100), 4)}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-400">
                      {AR_MONTHS[Number(key.split('-')[1]) - 1]}
                    </span>
                  </div>
                ))
              )}
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
        <AIInsightsPanel trips={trips} invoices={invoices} passengers={passengers} />
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