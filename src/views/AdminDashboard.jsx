import {
  BarChart3,
  Building2,
  CreditCard,
  Route,
  Users,
  Wallet,
} from 'lucide-react';
import { formatSAR } from '../data/mockData';

export default function AdminDashboard({ stats, branchReport }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-gradient-to-l from-primary-green to-primary-green-deep p-6 text-white shadow-premium">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <BarChart3 className="h-6 w-6 text-accent-gold" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold sm:text-2xl">لوحة الإدارة</h1>
            <p className="mt-1 text-sm text-emerald-50/80">نظرة متقدمة على الأداء العام للمنشأة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-bold text-slate-500"><Users className="h-4 w-4 text-primary-green" /> العملاء</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{stats.totalPassengers}</p>
        </div>
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-bold text-emerald-700"><Route className="h-4 w-4" /> الرحلات</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-900">{stats.activeTrips}</p>
        </div>
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-bold text-amber-700"><Wallet className="h-4 w-4" /> الإيرادات</p>
          <p className="mt-2 text-3xl font-extrabold text-amber-900">{formatSAR(stats.totalRevenue)}</p>
        </div>
        <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5 shadow-soft">
          <p className="flex items-center gap-2 text-xs font-bold text-sky-700"><CreditCard className="h-4 w-4" /> القسط</p>
          <p className="mt-2 text-3xl font-extrabold text-sky-900">{stats.aldaer + stats.jazan}</p>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-5 flex items-center gap-2 text-base font-extrabold text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-green/10 text-primary-green">
            <Building2 className="h-5 w-5" />
          </span>
          الأداء حسب الفرع
        </h2>

        <div className="space-y-3">
          {branchReport.map((row) => (
            <div key={row.branch} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-slate-900">{row.branch}</p>
                <p className="text-xs text-slate-500">{row.passengers} عميل</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700">
                <span className="rounded-lg bg-white px-2 py-1">إيرادات: {formatSAR(row.totalRevenue)}</span>
                <span className="rounded-lg bg-white px-2 py-1">مدفوع: {formatSAR(row.paid)}</span>
                <span className="rounded-lg bg-white px-2 py-1">متبقي: {formatSAR(row.remaining)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
