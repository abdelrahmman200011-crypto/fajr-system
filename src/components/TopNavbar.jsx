import { useState } from 'react';
import { Menu, LogOut, Store, Trash2 } from 'lucide-react';
import FactoryResetModal from './FactoryResetModal';

export default function TopNavbar({
  title,
  onOpenSidebar,
  user,
  onLogout,
  onFactoryReset,
}) {
  const [resetOpen, setResetOpen] = useState(false);
  const branch = user?.branch || '';
  const branchInitial = branch === 'الداير' ? 'د' : 'ج';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/60 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200/70 bg-white/60 text-gray-600 transition hover:bg-white hover:text-emerald-700 lg:hidden"
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="leading-tight">
            <h2 className="text-lg font-extrabold text-gray-900 sm:text-xl">
              {title}
            </h2>
            <p className="text-xs font-medium text-gray-400">
              {new Date().toLocaleDateString('ar-SA', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Logged-in branch */}
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-4 py-2 text-sm font-bold text-emerald-700">
            <Store className="h-4 w-4 text-emerald-600" />
            مرحباً بك في فرع: {branch}
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-sm font-extrabold text-white shadow-md shadow-emerald-700/25 sm:h-11 sm:w-11">
            {branchInitial}
          </div>

          {isAdmin && (
            <button
              onClick={() => setResetOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200/80 bg-red-50/80 px-3.5 text-sm font-extrabold text-red-600 transition hover:bg-red-100 hover:text-red-700"
              title="إعادة ضبط المصنع"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">إعادة ضبط المصنع</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200/70 bg-white/70 text-red-500 transition hover:bg-red-50 hover:text-red-600"
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