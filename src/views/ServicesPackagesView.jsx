import { useState } from 'react';
import {
  Plus,
  Trash2,
  Package,
  Ticket,
  Boxes,
  Layers,
  CircleDollarSign,
} from 'lucide-react';
import { formatSAR, packagePrice } from '../data/mockData';

const emptyService = { name: '', category: 'تأشيرات', price: '' };

export default function ServicesPackagesView({
  services,
  packages,
  onAddService,
  onAddPackage,
  onDeleteService,
  onDeletePackage,
}) {
  const [service, setService] = useState(emptyService);
  const [pkgName, setPkgName] = useState('');
  const [pkgServiceIds, setPkgServiceIds] = useState([]);

  const toggleServiceId = (id) =>
    setPkgServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const submitService = (e) => {
    e.preventDefault();
    if (!service.name.trim() || !service.price) return;
    onAddService({
      name: service.name.trim(),
      category: service.category,
      price: Number(service.price),
    });
    setService(emptyService);
  };

  const submitPackage = (e) => {
    e.preventDefault();
    if (!pkgName.trim() || pkgServiceIds.length === 0) return;
    onAddPackage({ name: pkgName.trim(), serviceIds: pkgServiceIds });
    setPkgName('');
    setPkgServiceIds([]);
  };

  const previewPackage = () => ({
    name: pkgName || 'باقة جديدة',
    serviceIds: pkgServiceIds,
  });

  const inputClass =
    'input-field focus:border-emerald-500 focus:ring-emerald-500/20';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Services */}
        <div className="rounded-2xl border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl">
          <div className="border-b border-gray-100/80 p-6 pb-4">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                <Ticket className="h-5 w-5" />
              </span>
              الخدمات الفردية
            </h3>
          </div>

          <form
            onSubmit={submitService}
            className="grid grid-cols-1 gap-3 border-b border-gray-100/80 bg-gray-50/50 p-6 sm:grid-cols-12"
          >
            <input
              type="text"
              value={service.name}
              onChange={(e) => setService({ ...service, name: e.target.value })}
              placeholder="اسم الخدمة، مثال: تأشيرة عمرة"
              className={`${inputClass} sm:col-span-5`}
            />
            <select
              value={service.category}
              onChange={(e) =>
                setService({ ...service, category: e.target.value })
              }
              className={`${inputClass} sm:col-span-3`}
            >
              <option value="تأشيرات">تأشيرات</option>
              <option value="نقل">نقل</option>
              <option value="سكن">سكن</option>
              <option value="إطعام">إطعام</option>
              <option value="زيارات">زيارات</option>
              <option value="خدمات">خدمات</option>
            </select>
            <div className="relative sm:col-span-2">
              <input
                type="number"
                value={service.price}
                onChange={(e) =>
                  setService({ ...service, price: e.target.value })
                }
                placeholder="السعر"
                className={`${inputClass} pl-14`}
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                ر.س
              </span>
            </div>
            <button
              type="submit"
              className="btn-primary sm:col-span-2"
            >
              <Plus className="h-4 w-4" />
              إضافة
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-right text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3 text-right">الخدمة</th>
                  <th className="px-6 py-3 text-right">الفئة</th>
                  <th className="px-6 py-3 text-right">السعر</th>
                  <th className="px-6 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-gray-100 transition-colors hover:bg-emerald-50/40"
                  >
                    <td className="px-6 py-3.5 font-bold text-gray-800">
                      {s.name}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-extrabold text-emerald-700">
                      {formatSAR(s.price)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => onDeleteService(s.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="حذف الخدمة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Packages */}
        <div className="rounded-2xl border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-gray-100/80 p-6 pb-4">
            <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Boxes className="h-5 w-5" />
              </span>
              الباقات المجمعة
            </h3>
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700">
              {packages.length} باقة
            </span>
          </div>

          <form onSubmit={submitPackage} className="border-b border-gray-100/80 p-6">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              اسم الباقة
            </label>
            <input
              type="text"
              value={pkgName}
              onChange={(e) => setPkgName(e.target.value)}
              placeholder="مثال: الباقة الذهبية"
              className={inputClass}
            />

            <label className="mb-1.5 mt-4 block text-sm font-semibold text-gray-700">
              اختر الخدمات المشمولة
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {services.map((s) => {
                const checked = pkgServiceIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          checked
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {checked && (
                          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" fill="none">
                            <path
                              d="M2 6l3 3 5-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {s.name}
                    </span>
                    <span className="text-xs font-bold text-gray-400">
                      {formatSAR(s.price)}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleServiceId(s.id)}
                    />
                  </label>
                );
              })}
            </div>

            {/* Live preview */}
            {pkgServiceIds.length > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-l from-emerald-700 to-teal-700 px-5 py-3.5">
                <span className="flex items-center gap-2 text-sm font-bold text-emerald-50">
                  <Layers className="h-4 w-4 text-amber-300" />
                  إجمالي الباقة الافتراضي
                </span>
                <span className="text-lg font-extrabold text-amber-300">
                  {formatSAR(packagePrice(previewPackage(), services))}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={!pkgName.trim() || pkgServiceIds.length === 0}
              className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              إضافة الباقة
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-right text-sm">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-3 text-right">الباقة</th>
                  <th className="px-6 py-3 text-right">الخدمات</th>
                  <th className="px-6 py-3 text-right">الإجمالي</th>
                  <th className="px-6 py-3 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-t border-gray-100 transition-colors hover:bg-emerald-50/40"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{pkg.name}</p>
                      <p className="text-xs font-medium text-gray-400">
                        {pkg.serviceIds.length} خدمات
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1.5">
                        {pkg.serviceIds.map((id) => {
                          const s = services.find((x) => x.id === id);
                          return s ? (
                            <span
                              key={id}
                              className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200"
                            >
                              {s.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-700">
                        <CircleDollarSign className="h-4 w-4" />
                        {formatSAR(packagePrice(pkg, services))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onDeletePackage(pkg.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                        aria-label="حذف الباقة"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}