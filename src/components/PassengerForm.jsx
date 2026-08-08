import { useEffect, useState } from 'react';
import {
  X,
  UserPlus,
  Save,
  User,
  Users,
  MapPin,
  Building2,
  ArrowRight,
  Bus,
  Armchair,
  CircleAlert,
  CircleCheck,
  IdCard,
} from 'lucide-react';

const emptyPerson = {
  fullName: '',
  phone: '',
  address: '',
  gender: '',
  nationality: '',
  branch: 'الداير',
  documentId: '',
};

const emptyCompanion = {
  fullName: '',
  documentId: '',
  gender: '',
  nationality: '',
  phone: '',
  address: '',
};

const nationalities = [
  'سعودي',
  'يمني',
  'هندي',
  'باكستاني',
  'سوري',
  'مصري',
  'جزر القمر',
  'إفريقي',
  'أخرى',
];

const mapInitial = (d) => ({
  ...emptyPerson,
  ...d,
  fullName: d.fullName ?? d.name ?? '',
  documentId: d.documentId ?? d.nationalId ?? '',
});

export default function PassengerForm({
  initialData,
  onClose,
  onSubmit,
  trip,
  seatsLeft,
  isFull,
  currentUserBranch,
}) {
  const [main, setMain] = useState(emptyPerson);
  const [companions, setCompanions] = useState([]);
  const [count, setCount] = useState(1);
  const [error, setError] = useState('');

  const isEdit = Boolean(initialData);

  useEffect(() => {
    setMain(initialData ? mapInitial(initialData) : emptyPerson);
    setCompanions([]);
    setCount(1);
    setError('');
  }, [initialData]);

  const handleCountChange = (val) => {
    const clamped = Math.max(1, Number(val) || 1);
    setCount(clamped);
    setCompanions((prev) => {
      const target = clamped - 1;
      if (target === 0) return [];
      const arr = prev.slice(0, target);
      while (arr.length < target) arr.push({ ...emptyCompanion });
      return arr;
    });
  };

  const updateCompanion = (index, field, value) =>
    setCompanions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );

  const removeCompanion = (index) => {
    setCompanions((prev) => prev.filter((_, i) => i !== index));
    setCount((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!main.fullName.trim()) {
      setError('يرجى إدخال اسم المسؤول عن الحجز كاملاً');
      return;
    }
    if (!main.documentId.trim()) {
      setError('يرجى إدخال رقم السجل / الإقامة');
      return;
    }
    if (!main.phone.trim()) {
      setError('يرجى إدخال رقم الجوال');
      return;
    }
    if (!main.gender) {
      setError('يرجى اختيار الجنس');
      return;
    }
    if (!main.nationality) {
      setError('يرجى اختيار الجنسية');
      return;
    }

    for (const c of companions) {
      if (!c.fullName.trim()) {
        setError('يرجى إدخال اسم المرافق كاملاً');
        return;
      }
      if (!c.documentId.trim()) {
        setError('يرجى إدخال رقم السجل / الإقامة للمرافق');
        return;
      }
      if (!c.gender) {
        setError('يرجى اختيار جنس المرافق');
        return;
      }
      if (!c.nationality) {
        setError('يرجى اختيار جنسية المرافق');
        return;
      }
    }

    const familyId = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;
    const { phone, address } = main;
    const branch = isEdit
      ? main.branch || currentUserBranch
      : currentUserBranch || main.branch || 'الداير';

    const people = [
      { ...main, branch, familyId },
      ...companions.map((c) => ({
        ...c,
        phone: c.phone.trim() || phone,
        address: c.address.trim() || address,
        branch,
        familyId,
      })),
    ];

    onSubmit(people);
  };

  const inputClass =
    'input-field focus:border-emerald-500 focus:ring-emerald-500/20';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700';
  const sectionTitle =
    'mb-5 flex items-center gap-3 text-base font-extrabold text-gray-900';

  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setMain((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Prominent top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-gray-800 to-gray-900 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-gray-900/20 transition hover:from-gray-700 hover:to-gray-800"
            aria-label="العودة لقائمة المعتمرين"
          >
            <ArrowRight className="h-5 w-5" />
            عودة لقائمة المعتمرين
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">
              {isEdit ? 'تعديل بيانات مسافر' : 'إضافة مسافر جديد'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit
                ? 'قم بتحديث بيانات المسافر ثم احفظ التغييرات'
                : 'سجل مسافراً واحداً أو عائلة كاملة دفعة واحدة'}
            </p>
          </div>
        </div>

        {!isEdit && (
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-l from-emerald-50 to-amber-50 px-5 py-3 ring-1 ring-emerald-100">
            <div>
              <label className="mb-1 block text-xs font-bold text-emerald-800">
                عدد الأفراد
              </label>
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={count}
                onChange={(e) => handleCountChange(e.target.value)}
                className={`${inputClass} w-24 text-center text-lg font-extrabold text-emerald-800`}
              />
            </div>
            <div className="text-sm font-medium text-gray-500">
              <p>
                <span className="font-bold text-emerald-700">1</span> — المسؤول
                عن الحجز
              </p>
              <p className="text-xs text-gray-400">
                ثم نموذج مبسط لكل مرافق
                <span className="mr-1 inline-flex h-5 items-center rounded-full bg-emerald-600/10 px-2 text-xs font-bold text-emerald-700">
                  عائلة واحدة
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===== Section: بيانات الحجز ===== */}
        {!isEdit && trip && (
          <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:p-6">
            <h3 className={sectionTitle}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#713639]/10 text-[#713639]">
                <Bus className="h-5 w-5" />
              </span>
              بيانات الحجز
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold text-gray-400">رقم الرحلة</p>
                <p className="mt-1 font-extrabold text-gray-900">
                  {trip.tripNumber}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400">الوجهة</p>
                <p className="mt-1 font-bold text-gray-800">
                  {trip.destination || '—'}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs font-bold text-gray-400">
                  <Armchair className="h-3 w-3" />
                  المقاعد المتاحة
                </p>
                {isFull ? (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-extrabold text-red-600 ring-1 ring-red-200">
                    <CircleAlert className="h-3.5 w-3.5" />
                    الرحلة ممتلئة — لا يمكن الإضافة
                  </p>
                ) : (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                    <CircleCheck className="h-3.5 w-3.5" />
                    {seatsLeft} مقعد متاح
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===== Section: البيانات الأساسية ===== */}
        <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                {isEdit ? 'بيانات المسافر' : 'البيانات الأساسية — المسؤول عن الحجز'}
              </h3>
              <p className="text-xs text-gray-400">
                الجوال والعنوان والفرع يتم توريثها تلقائياً للمرافقين
              </p>
            </div>
            {!isEdit && (
              <span className="mr-auto inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
                <Users className="h-3.5 w-3.5" />
                سيتولّد رقم عائلة عند الحفظ
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelClass}>الاسم الكامل</label>
              <div className="relative">
                <User className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={main.fullName}
                  onChange={handleMainChange}
                  placeholder="مثال: خالد بن محمد العتيبي"
                  className={`${inputClass} pr-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>السجل / الإقامة</label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="documentId"
                  value={main.documentId}
                  onChange={handleMainChange}
                  placeholder="رقم الهوية أو الإقامة"
                  className={`${inputClass} pr-10`}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>رقم الجوال</label>
              <input
                type="tel"
                name="phone"
                value={main.phone}
                onChange={handleMainChange}
                placeholder="05xxxxxxxx"
                className={inputClass}
                inputMode="tel"
              />
            </div>

            <div>
              <label className={labelClass}>الجنس</label>
              <select
                name="gender"
                value={main.gender}
                onChange={handleMainChange}
                className={inputClass}
              >
                <option value="">اختر الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>الجنسية</label>
              <select
                name="nationality"
                value={main.nationality}
                onChange={handleMainChange}
                className={inputClass}
              >
                <option value="">اختر الجنسية</option>
                {nationalities.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>العنوان</label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={main.address}
                  onChange={handleMainChange}
                  placeholder="مثال: حي النخيل، الداير"
                  className={`${inputClass} pr-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>الفرع</label>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                <Building2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-extrabold text-emerald-700">
                  {isEdit ? main.branch : currentUserBranch || main.branch}
                </span>
                <span className="mr-auto text-[11px] font-bold text-emerald-600/80">
                  {isEdit ? 'يحتفظ بالفرع الحالي' : 'يحدد تلقائياً من حسابك'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Section: المرافقين ===== */}
        {!isEdit && count > 1 && (
          <section className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  المرافقون
                  <span className="mr-2 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-sm font-bold text-amber-700">
                    {count - 1}
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  الفرع يُورّث تلقائياً من المسؤول، والجوال والعنوان
                  اختياريان — يورّثان من المسؤول عند تركهما فارغين
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {companions.map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gray-50/80 p-4 ring-1 ring-gray-200/70"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-sm font-extrabold text-gray-700">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-extrabold text-white">
                        {i + 1}
                      </span>
                      مرافق {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCompanion(i)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      aria-label={`حذف مرافق ${i + 1}`}
                      title="إزالة المرافق"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-3">
                      <label className={labelClass}>الاسم الكامل</label>
                      <input
                        type="text"
                        value={c.fullName}
                        onChange={(e) =>
                          updateCompanion(i, 'fullName', e.target.value)
                        }
                        placeholder="مثال: فاطمة عبدالله العتيبي"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>السجل / الإقامة</label>
                      <input
                        type="text"
                        value={c.documentId}
                        onChange={(e) =>
                          updateCompanion(i, 'documentId', e.target.value)
                        }
                        placeholder="رقم الهوية / الإقامة"
                        className={inputClass}
                        inputMode="numeric"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        رقم الجوال
                        <span className="mr-1 text-xs font-bold text-gray-400">
                          (اختياري)
                        </span>
                      </label>
                      <input
                        type="tel"
                        value={c.phone}
                        onChange={(e) =>
                          updateCompanion(i, 'phone', e.target.value)
                        }
                        placeholder="05xxxxxxxx"
                        className={inputClass}
                        inputMode="tel"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>الجنس</label>
                      <select
                        value={c.gender}
                        onChange={(e) =>
                          updateCompanion(i, 'gender', e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">اختر الجنس</option>
                        <option value="male">ذكر</option>
                        <option value="female">أنثى</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>الجنسية</label>
                      <select
                        value={c.nationality}
                        onChange={(e) =>
                          updateCompanion(i, 'nationality', e.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">اختر الجنسية</option>
                        {nationalities.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        العنوان
                        <span className="mr-1 text-xs font-bold text-gray-400">
                          (اختياري)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={c.address}
                        onChange={(e) =>
                          updateCompanion(i, 'address', e.target.value)
                        }
                        placeholder="مثال: حي النخيل، الداير"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
            <CircleAlert className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Sticky actions */}
        <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-medium text-gray-400">
            {!isEdit && count > 1
              ? `سيتم تسجيل ${count} أفراد (مسؤول + ${count - 1} مرافق) في الرحلة رقم ${trip?.tripNumber || 'الرحلة المحددة'}`
              : trip
                ? `سيتم تسجيل المسافر في الرحلة رقم ${trip.tripNumber}`
                : 'سيتم حفظ البيانات في سجل المعتمرين'}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button type="button" onClick={onClose} className="btn-outline w-full sm:w-auto">
              إلغاء
            </button>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              <Save className="h-4 w-4" />
              {isEdit
                ? 'حفظ التعديلات'
                : count > 1
                  ? `حفظ العائلة (${count} أفراد)`
                  : 'حفظ المسافر'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
