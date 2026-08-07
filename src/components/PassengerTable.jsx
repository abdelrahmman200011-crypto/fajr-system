import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Pencil,
  Ban,
  Trash2,
  Users,
  Building2,
  MapPin,
  Venus,
  Mars,
  RotateCcw,
  Eye,
  ChevronDown,
} from 'lucide-react';
import { familyHead, familyMembers } from '../data/mockData';

const GENDER_META = {
  male: { label: 'ذكر', icon: Mars, cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  female: {
    label: 'أنثى',
    icon: Venus,
    cls: 'bg-pink-50 text-pink-700 ring-pink-200',
  },
};

function BranchBadge({ branch }) {
  const aldaer = branch === 'الداير';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
        aldaer
          ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
          : 'bg-teal-50 text-teal-700 ring-1 ring-teal-200'
      }`}
    >
      {aldaer ? <Building2 className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
      {branch}
    </span>
  );
}

export default function PassengerTable({
  passengers,
  locked,
  canDelete,
  loading,
  onEdit,
  onCancel,
  onReactivate,
  onDelete,
  onAdd,
  onView,
}) {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [expanded, setExpanded] = useState(() => new Set());

  const familySizes = useMemo(() => {
    const map = new Map();
    passengers.forEach((p) => {
      if (p.familyId) map.set(p.familyId, (map.get(p.familyId) || 0) + 1);
    });
    return map;
  }, [passengers]);

  const isCompanionPassenger = (p) => {
    const head = familyHead(passengers, p.familyId);
    return Boolean(head && head.id !== p.id);
  };

  const companionsOf = (p) =>
    p.familyId
      ? familyMembers(passengers, p.familyId).filter((m) => m.id !== p.id)
      : [];

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [];
    const autoExpand = new Set();
    passengers.forEach((p) => {
      if (isCompanionPassenger(p)) return;
      const matchesBranch = branchFilter === 'all' || p.branch === branchFilter;
      const selfMatch =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        (p.documentId || '').includes(q) ||
        (p.phone || '').includes(q);
      const comps = companionsOf(p);
      const compMatch =
        !q ||
        comps.some(
          (c) =>
            c.fullName.toLowerCase().includes(q) ||
            (c.documentId || '').includes(q) ||
            (c.phone || '').includes(q)
        );
      const matchesSearch = selfMatch || compMatch;
      if (matchesBranch && matchesSearch) {
        rows.push(p);
        if (q && compMatch && !selfMatch) autoExpand.add(p.id);
      }
    });
    return { rows, autoExpand };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passengers, search, branchFilter]);

  useEffect(() => {
    if (filtered.autoExpand.size === 0) return;
    setExpanded((prev) => new Set([...prev, ...filtered.autoExpand]));
  }, [filtered.autoExpand]);

  return (
    <section className="glass-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-gray-200/60 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
              <Users className="h-5 w-5" />
            </span>
            قائمة المسافرين
            <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-sm font-bold text-emerald-700">
              {filtered.rows.length}
            </span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            سجل الركاب المسجلين في رحلة العمرة الحالية
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث بالاسم أو رقم الوثيقة أو رب العائلة..."
              className="input-field pr-10 sm:w-72"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="input-field appearance-none pr-10 sm:w-44"
            >
              <option value="all">كل الفروع</option>
              <option value="الداير">فرع الداير</option>
              <option value="جازان">فرع جازان</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead>
            <tr className="bg-gray-50/80 text-xs font-bold uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3.5">م</th>
              <th className="px-5 py-3.5 text-right">الاسم</th>
              <th className="px-5 py-3.5 text-right">السجل / الإقامة</th>
              <th className="px-5 py-3.5 text-right">الجنس</th>
              <th className="px-5 py-3.5 text-right">الجوال</th>
              <th className="px-5 py-3.5 text-right">الفرع</th>
              <th className="px-5 py-3.5 text-center">المرافقين</th>
              <th className="px-5 py-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.rows.map((p) => {
              const g = GENDER_META[p.gender] || GENDER_META.male;
              const GenderIcon = g.icon;
              const inFamily = (familySizes.get(p.familyId) || 0) > 1;
              const isCanceled = p.status === 'canceled';
              const companions = companionsOf(p);
              const isExpanded = expanded.has(p.id);
              return (
                <Fragment key={p.id}>
                  <tr
                    className={`group cursor-default border-t border-gray-100 transition-colors ${
                      isCanceled
                        ? 'bg-gray-50/60 opacity-60 hover:bg-gray-100/60'
                        : 'hover:bg-emerald-50/50'
                    }`}
                  >
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {companions.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(p.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-violet-50 hover:text-violet-600"
                            aria-label={
                              isExpanded ? 'طي المرافقين' : 'عرض المرافقين'
                            }
                            title={
                              isExpanded ? 'طي المرافقين' : 'عرض المرافقين'
                            }
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform duration-300 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                        <span className="font-bold text-gray-400">{p.id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-sm ${
                            isCanceled
                              ? 'bg-gray-400'
                              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                          }`}
                        >
                          {p.fullName.charAt(0)}
                        </div>
                        <div>
                          <p
                            className={`font-bold ${
                              isCanceled
                                ? 'text-gray-500 line-through'
                                : 'text-gray-800 group-hover:text-emerald-800'
                            }`}
                          >
                            {p.fullName}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            {isCanceled && (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-px text-[10px] font-extrabold text-red-600 ring-1 ring-red-200">
                                <Ban className="ml-1 h-3 w-3" />
                                ملغى
                              </span>
                            )}
                            {inFamily && (
                              <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-px text-[10px] font-extrabold text-violet-700 ring-1 ring-violet-200">
                                <Users className="ml-1 h-3 w-3" />
                                رب العائلة · {p.familyId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-600" dir="ltr">
                      {p.documentId}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${g.cls}`}
                      >
                        <GenderIcon className="h-3.5 w-3.5" />
                        {g.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-gray-600" dir="ltr">
                      {p.phone}
                    </td>
                    <td className="px-5 py-4">
                      <BranchBadge branch={p.branch} />
                    </td>
                    <td className="px-5 py-4 text-center">
                      {companions.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(p.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ring-1 transition ${
                            isExpanded
                              ? 'bg-violet-100 text-violet-800 ring-violet-300'
                              : 'bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100'
                          }`}
                          title={
                            isExpanded ? 'طي المرافقين' : 'عرض المرافقين'
                          }
                        >
                          <Users className="h-3.5 w-3.5" />
                          {companions.length}
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {onView && (
                          <button
                            onClick={() => onView(p)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                            aria-label="عرض الملف"
                            title="عرض ملف المسافر والعائلة"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(p)}
                          disabled={locked || isCanceled}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            locked || isCanceled
                              ? 'cursor-not-allowed text-gray-200'
                              : 'text-gray-400 hover:bg-amber-50 hover:text-amber-600'
                          }`}
                          aria-label="تعديل"
                          title={
                            locked
                              ? 'لا يمكن التعديل على رحلة مكتملة'
                              : isCanceled
                                ? 'لا يمكن تعديل حجز ملغى'
                                : 'تعديل'
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {isCanceled ? (
                          <button
                            onClick={() => onReactivate(p)}
                            disabled={locked}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              locked
                                ? 'cursor-not-allowed text-gray-200'
                                : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                            aria-label="إعادة التفعيل"
                            title={
                              locked
                                ? 'لا يمكن التعديل على رحلة مكتملة'
                                : 'إعادة تفعيل الحجز'
                            }
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : canDelete ? (
                          <button
                            onClick={() => onCancel(p)}
                            disabled={locked}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              locked
                                ? 'cursor-not-allowed text-gray-200'
                                : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                            }`}
                            aria-label="إلغاء الحجز"
                            title={
                              locked
                                ? 'لا يمكن التعديل على رحلة مكتملة'
                                : 'إلغاء الحجز'
                            }
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : null}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(p)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="حذف نهائي"
                            title="حذف المسافر نهائياً من السجل"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && companions.length > 0 && (
                    <tr className="bg-violet-50/40">
                      <td colSpan={8} className="px-5 pb-4 pt-1">
                        <div className="overflow-hidden rounded-xl border border-violet-200/70 bg-white">
                          <div className="flex items-center gap-2 border-b border-violet-100 bg-violet-50/60 px-4 py-2.5">
                            <Users className="h-4 w-4 text-violet-600" />
                            <p className="text-xs font-extrabold text-violet-800">
                              مرافقو {p.fullName} ({companions.length})
                            </p>
                          </div>
                          <table className="w-full text-right text-sm">
                            <thead>
                              <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500">
                                <th className="px-4 py-2 text-center">م</th>
                                <th className="px-4 py-2 text-right">الاسم</th>
                                <th className="px-4 py-2 text-right">السجل / الإقامة</th>
                                <th className="px-4 py-2 text-right">الجنس</th>
                                <th className="px-4 py-2 text-right">الجوال</th>
                                <th className="px-4 py-2 text-right">الفرع</th>
                                <th className="px-4 py-2 text-center">إجراءات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {companions.map((c) => {
                                const cg = GENDER_META[c.gender] || GENDER_META.male;
                                const CGIcon = cg.icon;
                                const cCanceled = c.status === 'canceled';
                                const cHead = familyHead(passengers, c.familyId);
                                return (
                                  <tr
                                    key={c.id}
                                    className={`border-t border-gray-100 transition-colors ${
                                      cCanceled
                                        ? 'bg-gray-50/60 opacity-60'
                                        : 'hover:bg-violet-50/50'
                                    }`}
                                  >
                                    <td className="px-4 py-3 text-center font-bold text-gray-400">
                                      {c.id}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2.5">
                                        <div
                                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white shadow-sm ${
                                            cCanceled
                                              ? 'bg-gray-400'
                                              : 'bg-gradient-to-br from-violet-500 to-purple-600'
                                          }`}
                                        >
                                          {c.fullName.charAt(0)}
                                        </div>
                                        <div>
                                          <p
                                            className={`font-bold ${
                                              cCanceled
                                                ? 'text-gray-500 line-through'
                                                : 'text-gray-800'
                                            }`}
                                          >
                                            {c.fullName}
                                          </p>
                                          <span className="mt-0.5 inline-flex items-center rounded-full bg-violet-50 px-2 py-px text-[10px] font-extrabold text-violet-700 ring-1 ring-violet-200">
                                            <Users className="ml-1 h-3 w-3" />
                                            رفيق/تابع لـ {cHead?.fullName || p.fullName}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-600" dir="ltr">
                                      {c.documentId}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${cg.cls}`}
                                      >
                                        <CGIcon className="h-3.5 w-3.5" />
                                        {cg.label}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-600" dir="ltr">
                                      {cHead?.phone || c.phone}
                                    </td>
                                    <td className="px-4 py-3">
                                      <BranchBadge branch={c.branch} />
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center justify-center gap-1">
                                        {onView && (
                                          <button
                                            onClick={() => onView(c)}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                                            aria-label="عرض الملف"
                                            title="عرض ملف المسافر والعائلة"
                                          >
                                            <Eye className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => onEdit(c)}
                                          disabled={locked || cCanceled}
                                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                                            locked || cCanceled
                                              ? 'cursor-not-allowed text-gray-200'
                                              : 'text-gray-400 hover:bg-amber-50 hover:text-amber-600'
                                          }`}
                                          aria-label="تعديل"
                                          title={
                                            locked
                                              ? 'لا يمكن التعديل على رحلة مكتملة'
                                              : cCanceled
                                                ? 'لا يمكن تعديل حجز ملغى'
                                                : 'تعديل'
                                          }
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        {cCanceled ? (
                                          <button
                                            onClick={() => onReactivate(c)}
                                            disabled={locked}
                                            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                                              locked
                                                ? 'cursor-not-allowed text-gray-200'
                                                : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
                                            }`}
                                            aria-label="إعادة التفعيل"
                                            title={
                                              locked
                                                ? 'لا يمكن التعديل على رحلة مكتملة'
                                                : 'إعادة تفعيل الحجز'
                                            }
                                          >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                          </button>
                                        ) : canDelete ? (
                                          <button
                                            onClick={() => onCancel(c)}
                                            disabled={locked}
                                            className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                                              locked
                                                ? 'cursor-not-allowed text-gray-200'
                                                : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                                            }`}
                                            aria-label="إلغاء الحجز"
                                            title={
                                              locked
                                                ? 'لا يمكن التعديل على رحلة مكتملة'
                                                : 'إلغاء الحجز'
                                            }
                                          >
<Ban className="h-3.5 w-3.5" />
                                            </button>
                                          ) : null}
                                        {canDelete && (
                                          <button
                                            onClick={() => onDelete(c)}
                                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                            aria-label="حذف نهائي"
                                            title="حذف المرافق نهائياً من السجل"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            {filtered.rows.length === 0 && loading && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 animate-pulse text-emerald-300" />
                  <p className="text-base font-bold text-emerald-700">
                    جارٍ تحميل بيانات المسافرين من السحابة…
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    المزامنة الفورية بين الفروع قيد التشغيل
                  </p>
                </td>
              </tr>
            )}

            {filtered.rows.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-base font-bold text-gray-500">
                    لا توجد نتائج مطابقة
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    جرب تغيير كلمة البحث أو تصفية الفرع
                  </p>
                  <button onClick={onAdd} className="btn-primary mt-5">
                    إضافة مسافر جديد
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
