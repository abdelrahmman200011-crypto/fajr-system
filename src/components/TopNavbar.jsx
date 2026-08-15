import { useState } from 'react';
import {
  Bell,
  Globe,
  LogOut,
  Menu,
  Store,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import FactoryResetModal from './FactoryResetModal';

export default function TopNavbar({
  title,
  onOpenSidebar,
  user,
  onLogout,
  onFactoryReset,
}) {
  const [resetOpen, setResetOpen] = useState(false);
  const branch = user?.branch || 'الداير';
  const branchInitial = branch === 'الداير' ? 'د' : 'ج';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-primary-green hover:text-primary-green lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Fajr Al Nusuk
            </p>
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-primary-green hover:text-primary-green">
            <Globe className="h-4 w-4" />
            <span>العربية</span>
            <span className="text-slate-400">-</span>
            <span>English</span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm transition hover:border-accent-gold hover:text-accent-gold">
            <Bell className="h-5 w-5" />
            <span className="absolute left-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-green to-primary-green-deep text-sm font-extrabold text-white">
              {branchInitial}
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-extrabold text-slate-900">{user?.name || 'مدير النظام'}</p>
              <p className="text-[11px] font-medium text-slate-500">{branch}</p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setResetOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 text-sm font-extrabold text-red-600 transition hover:bg-red-100"
              title="إعادة ضبط المصنع"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">إعادة ضبط المصنع</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-600"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {resetOpen && (
        <FactoryResetModal
          onClose={() => setResetOpen(false)}
          onReset={onFactoryReset}
          adminEmail={user?.email}
        />
      )}
    </header>
  );
}