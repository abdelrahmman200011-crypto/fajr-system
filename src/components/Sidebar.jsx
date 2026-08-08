import {
  LayoutDashboard,
  Route,
  Users,
  ReceiptText,
  ShoppingCart,
  X,
} from 'lucide-react';

export const NAV_TABS = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'booking', label: 'نقطة البيع', icon: ShoppingCart },
  { id: 'trips', label: 'الرحلات', icon: Route },
  { id: 'passengers', label: 'المسافرون', icon: Users },
  { id: 'invoices', label: 'الفواتير والمالية', icon: ReceiptText },
];

export default function Sidebar({ active, onNavigate, open, onClose }) {
  const logoUrl = import.meta.env.BASE_URL + 'logo.png';
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-white/40 bg-white/70 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-emerald-900/10 ring-1 ring-emerald-100">
              <img src={logoUrl} alt="فجر النسك" className="h-12 w-12 object-contain p-1" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-extrabold text-emerald-800">
                فجر النسك
              </h1>
              <p className="text-xs font-semibold text-gray-400">
                نظام إدارة الحج والعمرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-500 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 pb-6">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            القائمة الرئيسية
          </p>
          {NAV_TABS.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onNavigate(tab.id);
                  onClose();
                }}
                className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-l from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-700/30'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                <span
                  className={`absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full transition-opacity ${
                    isActive ? 'bg-amber-400 opacity-100' : 'opacity-0'
                  }`}
                />
                <tab.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-amber-300'
                      : 'text-gray-400 group-hover:text-emerald-600'
                  }`}
                  strokeWidth={2.1}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}