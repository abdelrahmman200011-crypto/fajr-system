import {
  LayoutDashboard,
  Route,
  Users,
  ReceiptText,
  ShoppingCart,
  BarChart3,
  X,
} from 'lucide-react';

export const NAV_TABS = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'booking', label: 'نقطة البيع', icon: ShoppingCart },
  { id: 'trips', label: 'الرحلات', icon: Route },
  { id: 'passengers', label: 'المسافرون', icon: Users },
  { id: 'invoices', label: 'الفواتير والمالية', icon: ReceiptText },
  { id: 'reports', label: 'التقارير', icon: BarChart3 },
];

export default function Sidebar({ active, onNavigate, open, onClose }) {
  const logoUrl = import.meta.env.BASE_URL + 'logo.png';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-white/10 bg-primary-green text-white shadow-2xl shadow-primary-green/30 transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-6 pt-7">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-sm">
              <img src={logoUrl} alt="فجر النسك" className="h-11 w-11 object-contain p-1" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-extrabold text-white">فجر النسك</h1>
              <p className="text-[11px] font-medium text-emerald-100/80">
                نظام إدارة الحج والعمرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/80 transition hover:bg-white/10 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100/70">
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
                className={`group relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-right transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-accent-gold shadow-inner shadow-white/5 ring-1 ring-white/10'
                    : 'text-emerald-50/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`absolute right-0 top-2 h-8 w-1 rounded-full ${
                    isActive ? 'bg-accent-gold opacity-100' : 'opacity-0'
                  }`}
                />
                <tab.icon
                  className={`h-5 w-5 ${isActive ? 'text-accent-gold' : 'text-emerald-100/80'}`}
                  strokeWidth={2.2}
                />
                <span className="flex-1 text-right">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}