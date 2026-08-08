import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Store,
  UserSearch,
  UserPlus,
  Users,
  Bus,
  Calculator,
  Wallet,
  CreditCard,
  Banknote,
  CircleCheck,
  CircleAlert,
  ReceiptText,
  Printer,
  X,
  Plus,
  Minus,
  User,
  BadgeCheck,
  ArrowLeft,
  ArrowRight,
  Building2,
} from 'lucide-react';
import {
  formatSAR,
  familyMembers,
  familyHead,
} from '../data/mockData';
import SearchableDropdown from '../components/SearchableDropdown';
import PrintInvoice from '../components/PrintInvoice';

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

const remainingSeats = (trip) =>
  Math.max(trip.capacity - (trip.bookedCount || 0), 0);
const seatsLabel = (count) => (count === 1 ? 'مقعد' : 'مقاعد');

const STEPS = [
  { id: 1, title: 'تحديد العميل', icon: UserSearch },
  { id: 2, title: 'الرحلة والسعر', icon: Bus },
  { id: 3, title: 'الدفع والتأكيد', icon: Wallet },
];

function StepBadge({ step, icon: Icon, color, title, subtitle }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-extrabold text-white shadow-lg bg-gradient-to-br from-emerald-500 to-teal-700">
        {step}
      </span>
      <div>
        <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
          <Icon className="h-5 w-5" style={{ color }} />
          {title}
        </h3>
        <p className="text-xs font-medium text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function UnifiedBookingView({
  passengers,
  trips,
  currentUserBranch,
  onAddPassengers,
  onAddInvoice,
  onViewInvoice,
}) {  const [mode, setMode] = useState('existing');
  const [passengerId, setPassengerId] = useState('');
  const [newMain, setNewMain] = useState(emptyPerson);
  const [newCompanions, setNewCompanions] = useState([]);
  const [companionCount, setCompanionCount] = useState(0);
  const [tripId, setTripId] = useState('');
  const [checkedIds, setCheckedIds] = useState(() => new Set());
  const [paid, setPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [printNode, setPrintNode] = useState(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'print-invoice';
    document.body.appendChild(el);
    setPrintNode(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    setNewCompanions((prev) => {
      const target = Math.max(0, companionCount);
      if (target === 0) return [];
      const arr = prev.slice(0, target);
      while (arr.length < target) arr.push({ ...emptyCompanion });
      return arr;
    });
  }, [companionCount]);

  const primaries = useMemo(
    () =>
      passengers.filter((p) => {
        const head = familyHead(passengers, p.familyId);
        return !(head && head.id !== p.id);
      }),
    [passengers]
  );

  const selectedPassenger =
    mode === 'existing'
      ? passengers.find((p) => p.id === passengerId) || null
      : null;

  const familyList = useMemo(() => {
    if (mode === 'new') {
      const namedComps = newCompanions.filter((c) => c.fullName.trim());
      const list = [
        {
          key: 'n-0',
          fullName: newMain.fullName.trim() || 'المسؤول عن الحجز',
          isPrimary: true,
          gender: newMain.gender,
          familyId: null,
        },
      ];
      namedComps.forEach((c, i) =>
        list.push({
          key: `n-${i + 1}`,
          fullName: c.fullName,
          isPrimary: false,
          gender: c.gender,
          familyId: null,
        })
      );
      return list;
    }
    if (!selectedPassenger) return [];
    if (!selectedPassenger.familyId) {
      return [
        {
          key: `p-${selectedPassenger.id}`,
          id: selectedPassenger.id,
          fullName: selectedPassenger.fullName,
          isPrimary: true,
          gender: selectedPassenger.gender,
          familyId: selectedPassenger.familyId,
        },
      ];
    }
    const members = familyMembers(passengers, selectedPassenger.familyId);
    const head = familyHead(passengers, selectedPassenger.familyId);
    return members.map((m) => ({
      key: `p-${m.id}`,
      id: m.id,
      fullName: m.fullName,
      isPrimary: m.id === head?.id,
      gender: m.gender,
      familyId: m.familyId,
    }));
  }, [mode, selectedPassenger, passengers, newMain.fullName, newMain.gender, newCompanions]);

  const memberKeys = familyList.map((m) => m.key).join('|');

  useEffect(() => {
    setCheckedIds(new Set(familyList.map((m) => m.key)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberKeys]);

  const selectedTrip = trips.find((t) => t.id === tripId) || null;
  const perPerson = Number(selectedTrip?.price) || 0;
  const coveredList = familyList.filter((m) => checkedIds.has(m.key));
  const checkedCount = coveredList.length;
  const total = checkedCount * perPerson;
  const paidValue = Number(paid) || 0;
  const remaining = Math.max(total - paidValue, 0);
  const methodRequired = paidValue > 0;

  const inputClass = 'input-field focus:border-emerald-500 focus:ring-emerald-500/20';
  const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700';
  const cardClass =
    'relative z-10 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:p-6';

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setSuccess(null);
    setPaid('');
    setPaymentMethod('');
    setCheckedIds(new Set());
  };

  const toggleChecked = (key) => {
    setSuccess(null);
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectPassenger = (id) => {
    setSuccess(null);
    setPassengerId(id);
  };

  const handleMainChange = (e) => {
    setSuccess(null);
    const { name, value } = e.target;
    setNewMain((prev) => ({ ...prev, [name]: value }));
  };

  const updateCompanion = (i, field, value) => {
    setSuccess(null);
    setNewCompanions((prev) =>
      prev.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );
  };

  const removeCompanion = (i) => {
    setNewCompanions((prev) => prev.filter((_, idx) => idx !== i));
    setCompanionCount((prev) => Math.max(0, prev - 1));
  };

  const canIssue = Boolean(
    tripId &&
      checkedCount > 0 &&
      paidValue >= 0 &&
      paidValue <= total &&
      selectedTrip &&
      remainingSeats(selectedTrip) >= checkedCount &&
      (!methodRequired || paymentMethod)
  );  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (currentStep !== STEPS.length) return;

    if (mode === 'new') {
      if (!newMain.fullName.trim()) {
        setError('يرجى إدخال اسم المسؤول عن الحجز');
        return;
      }
      if (!newMain.documentId.trim()) {
        setError('يرجى إدخال رقم السجل / الإقامة للمسؤول');
        return;
      }
      if (!newMain.phone.trim()) {
        setError('يرجى إدخال رقم الجوال');
        return;
      }
      if (!newMain.gender) {
        setError('يرجى اختيار الجنس');
        return;
      }
      if (!newMain.nationality) {
        setError('يرجى اختيار الجنسية');
        return;
      }
      for (let i = 0; i < newCompanions.length; i++) {
        const c = newCompanions[i];
        if (!c.fullName.trim()) continue;
        if (!c.documentId.trim()) {
          setError(`يرجى إدخال رقم السجل / الإقامة للمرافق (${i + 1})`);
          return;
        }
        if (!c.gender) {
          setError(`يرجى اختيار جنس المرافق (${i + 1})`);
          return;
        }
        if (!c.nationality) {
          setError(`يرجى اختيار جنسية المرافق (${i + 1})`);
          return;
        }
      }
    } else if (!selectedPassenger) {
      setError('يرجى اختيار معتمر مسجل أو التبديل إلى تسجيل معتمر جديد');
      return;
    }

    if (!tripId) {
      setError('يرجى اختيار الرحلة');
      return;
    }
    if (checkedCount === 0) {
      setError('يرجى تحديد فرد واحد على الأقل مشمول بهذه الفاتورة');
      return;
    }
    if (methodRequired && !paymentMethod) {
      setError('يرجى تحديد طريقة الدفع');
      return;
    }
    if (!selectedTrip) {
      setError('الرحلة المحددة غير موجودة');
      return;
    }
    if (checkedCount > remainingSeats(selectedTrip)) {
      setError(
        `المقاعد المتاحة في الرحلة (${remainingSeats(selectedTrip)} ${seatsLabel(
          remainingSeats(selectedTrip)
        )}) لا تكفي لعدد ${checkedCount} أفراد`
      );
      return;
    }

    let primaryPassenger;
    let coveredPassengers;

    if (mode === 'new') {
      const namedComps = newCompanions.filter((c) => c.fullName.trim());
      const familyId = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;
      const { phone, address } = newMain;
      const branch = currentUserBranch || 'الداير';
      const people = [
        { ...newMain, branch, familyId },
        ...namedComps.map((c) => ({
          ...c,
          phone: c.phone.trim() || phone,
          address: c.address.trim() || address,
          branch,
          familyId,
        })),
      ];
      const created = await onAddPassengers(people);
      primaryPassenger = created[0];
      coveredPassengers = created
        .map((p, i) => ({ ...p, key: i === 0 ? 'n-0' : `n-${i}` }))
        .filter((p) => checkedIds.has(p.key))
        .map((p) => ({ id: p.id, fullName: p.fullName, isPrimary: p.key === 'n-0' }));
    } else {
      primaryPassenger = selectedPassenger;
      coveredPassengers = familyList
        .filter((m) => checkedIds.has(m.key))
        .map((m) => ({ id: m.id, fullName: m.fullName, isPrimary: m.isPrimary }));
    }

    const coveredCount = coveredPassengers.length;
    const invoice = onAddInvoice({
      passengerId: primaryPassenger.id,
      tripId,
      paid: paidValue,
      paidAmount: paidValue,
      paymentMethod: methodRequired ? paymentMethod : '',
      coveredPassengers,
      coveredCount,
    });

    const invoiceTotal = coveredCount * perPerson;

    setInvoiceToPrint({
      ...invoice,
      passenger: primaryPassenger,
      trip: selectedTrip,
      total: invoiceTotal,
      paid: paidValue,
    });

    setSuccess({
      invoiceId: invoice.id,
      passengerName: primaryPassenger.fullName,
      count: coveredCount,
      total: invoiceTotal,
      paid: paidValue,
      remaining: Math.max(invoiceTotal - paidValue, 0),
      tripName: selectedTrip?.tripNumber,
    });

    setPassengerId('');
    setTripId('');
    setPaid('');
    setPaymentMethod('');
    setCheckedIds(new Set());
    setNewMain(emptyPerson);
    setNewCompanions([]);
    setCompanionCount(0);
    setCurrentStep(1);

    window.setTimeout(() => window.print(), 150);
  };

  const resetAll = () => {
    setSuccess(null);
    setInvoiceToPrint(null);
    setPassengerId('');
    setTripId('');
    setPaid('');
    setPaymentMethod('');
    setCheckedIds(new Set());
    setNewMain(emptyPerson);
    setNewCompanions([]);
    setCompanionCount(0);
    setError('');
    setCurrentStep(1);
  };

  const step1Ready =
    mode === 'existing'
      ? Boolean(selectedPassenger)
      : Boolean(
          newMain.fullName.trim() &&
            newMain.documentId.trim() &&
            newMain.phone.trim() &&
            newMain.gender &&
            newMain.nationality
        );
  const step2Ready = Boolean(
    tripId &&
      checkedCount > 0 &&
      selectedTrip &&
      remainingSeats(selectedTrip) >= checkedCount
  );
  const nextDisabled =
    currentStep === 1 ? !step1Ready : currentStep === 2 ? !step2Ready : false;

  const stepHint =
    currentStep === 1
      ? 'أكمل بيانات العميل (أو اختر معتمراً مسجلاً) للمتابعة'
      : currentStep === 2
        ? 'اختر الرحلة وحدّد فرداً واحداً مشمولاً على الأقل'
        : 'راجع الإجمالي وطريقة الدفع ثم أكّد الحجز';

  const goNext = () => {
    setError('');
    setSuccess(null);
    if (currentStep === 1 && !step1Ready) {
      setError('أكمل بيانات العميل قبل المتابعة');
      return;
    }
    if (currentStep === 2 && !step2Ready) {
      setError('اختر الرحلة وحدّد الأفراد المشمولين قبل المتابعة');
      return;
    }
    setCurrentStep((s) => Math.min(STEPS.length, s + 1));
  };

  const goPrev = () => {
    setError('');
    setSuccess(null);
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-4 bg-gradient-to-l from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
              <Store className="h-8 w-8 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">
                نقطة البيع الموحدة
              </h1>
              <p className="mt-1 text-sm font-medium text-white/80">
                سجّل المعتمر، اختر الرحلة، حدّد أفراد العائلة، استلم
                الدفعة، واطبع الفاتورة — في شاشة واحدة دون التنقل بين الأقسام
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm font-bold ring-1 ring-white/20">
            <ReceiptText className="h-5 w-5 text-amber-300" />
            إجمالي الفواتير الصادرة
          </div>
        </div>
      </div>      {success && (
        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-l from-emerald-50 to-teal-50 p-5 shadow-soft sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <BadgeCheck className="h-7 w-7" />
              </span>
              <div>
                <p className="text-base font-extrabold text-emerald-900">
                  تم تأكيد الحجز وإصدار الفاتورة #{success.invoiceId} بنجاح
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {success.passengerName} — {success.count}{' '}
                  {seatsLabel(success.count)} · {success.tripName} · الإجمالي{' '}
                  {formatSAR(success.total)} · المدفوع {formatSAR(success.paid)} ·
                  المتبقي {formatSAR(success.remaining)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Printer className="h-4 w-4" />
                طباعة الفاتورة
              </button>
              {onViewInvoice && (
                <button
                  type="button"
                  onClick={() => onViewInvoice(success.invoiceId)}
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/30 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <ReceiptText className="h-4 w-4" />
                  عرض التفاصيل
                </button>
              )}
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-900"
              >
                <X className="h-4 w-4" />
                فاتورة جديدة
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ===== Stepper header ===== */}
        <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl sm:p-5">
          <ol className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((s, idx) => {
              const n = idx + 1;
              const active = currentStep === n;
              const done = currentStep > n;
              const clickable = done;
              return (
                <li key={s.id} className="flex flex-1 items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => {
                      setError('');
                      setSuccess(null);
                      setCurrentStep(n);
                    }}
                    title={s.title}
                    className={`flex min-w-0 items-center gap-2 rounded-2xl px-2 py-2 text-right transition sm:px-3 ${
                      active
                        ? 'bg-gradient-to-l from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-700/20'
                        : clickable
                          ? 'hover:bg-emerald-50'
                          : 'opacity-55'
                    } disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition ${
                        active
                          ? 'bg-white/20 text-white ring-2 ring-white/40'
                          : done
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {done ? (
                        <CircleCheck className="h-4 w-4" />
                      ) : (
                        <s.icon className="h-4 w-4" />
                      )}
                    </span>
                    <span className="hidden min-w-0 lg:block">
                      <span
                        className={`block truncate text-xs font-extrabold ${
                          active
                            ? 'text-white'
                            : done
                              ? 'text-emerald-700'
                              : 'text-gray-500'
                        }`}
                      >
                        {s.title}
                      </span>
                    </span>
                  </button>
                  {n < STEPS.length && (
                    <span
                      className={`h-0.5 flex-1 rounded-full ${
                        done ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {currentStep === 1 && (
        <section className={cardClass}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <StepBadge
              step={1}
              icon={mode === 'existing' ? UserSearch : UserPlus}
              color="emerald"
              title="تحديد العميل"
              subtitle="اختر معتمراً مسجلاً أو سجّل معتمراً جديداً مع مرافقيه"
            />
            <div className="flex rounded-2xl border border-gray-200 bg-gray-100/70 p-1">
              <button
                type="button"
                onClick={() => switchMode('existing')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  mode === 'existing'
                    ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserSearch className="h-4 w-4" />
                معتمر مسجل
              </button>
              <button
                type="button"
                onClick={() => switchMode('new')}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                  mode === 'new'
                    ? 'bg-white text-violet-700 shadow-sm ring-1 ring-violet-200'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <UserPlus className="h-4 w-4" />
                معتمر جديد
              </button>
            </div>
          </div>

          {mode === 'existing' ? (
            <div>
              <label className={labelClass}>البحث عن معتمر مسجل</label>
              <SearchableDropdown
                options={primaries}
                value={passengerId}
                onChange={selectPassenger}
                placeholder="ابحث بالاسم أو رقم الوثيقة أو الجوال..."
                display={(o) => {
                  const count = o.familyId
                    ? familyMembers(passengers, o.familyId).length
                    : 1;
                  return count > 1
                    ? `${o.fullName} (عائلة: ${count} أفراد)`
                    : o.fullName;
                }}
              />
              {selectedPassenger && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-base font-extrabold text-white shadow-sm">
                    {selectedPassenger.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-gray-900">
                      {selectedPassenger.fullName}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">
                      {selectedPassenger.documentId} ·{' '}
                      <span dir="ltr">{selectedPassenger.phone}</span> ·{' '}
                      {selectedPassenger.branch}
                    </p>
                  </div>
                  {selectedPassenger.familyId && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
                      <Users className="h-3.5 w-3.5" />
                      {familyMembers(passengers, selectedPassenger.familyId).length}{' '}
                      أفراد في العائلة
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-gradient-to-l from-violet-50 to-fuchsia-50 p-4 ring-1 ring-violet-100">
                <div>
                  <label className="mb-1 block text-xs font-bold text-violet-800">
                    عدد المرافقين
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCompanionCount((p) => p + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700"
                      aria-label="إضافة مرافق"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <span className="flex h-10 w-16 items-center justify-center rounded-xl bg-white text-lg font-extrabold text-violet-800 shadow-sm ring-1 ring-violet-200">
                      {companionCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCompanionCount((p) => Math.max(0, p - 1))
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 text-gray-700 transition hover:bg-gray-300"
                      aria-label="إزالة مرافق"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="text-sm font-medium text-violet-700">
                  <p>
                    <span className="font-extrabold">1</span> — المسؤول عن الحجز
                  </p>
                  <p className="text-xs text-violet-500">
                    ثم نموذج مبسط لكل مرافق (الجوال والعنوان اختياريان)
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4">
                <p className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold text-emerald-700">
                  <User className="h-4 w-4" />
                  المسؤول عن الحجز
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className={labelClass}>الاسم الكامل</label>
                    <input
                      type="text"
                      name="fullName"
                      value={newMain.fullName}
                      onChange={handleMainChange}
                      placeholder="مثال: خالد بن محمد العتيبي"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>السجل / الإقامة</label>
                    <input
                      type="text"
                      name="documentId"
                      value={newMain.documentId}
                      onChange={handleMainChange}
                      placeholder="رقم الهوية أو الإقامة"
                      className={inputClass}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>رقم الجوال</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newMain.phone}
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
                      value={newMain.gender}
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
                      value={newMain.nationality}
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
                    <input
                      type="text"
                      name="address"
                      value={newMain.address}
                      onChange={handleMainChange}
                      placeholder="مثال: حي النخيل، الداير"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>الفرع</label>
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-extrabold text-emerald-700">
                        {currentUserBranch || newMain.branch}
                      </span>
                      <span className="mr-auto text-[11px] font-bold text-emerald-600/80">
                        يحدد تلقائياً من حسابك
                      </span>
                    </div>
                  </div>
                </div>
              </div>              {newCompanions.length > 0 && (
                <div className="space-y-3">
                  <p className="inline-flex items-center gap-2 text-sm font-extrabold text-violet-700">
                    <Users className="h-4 w-4" />
                    المرافقون
                  </p>
                  {newCompanions.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-sm font-extrabold text-gray-700">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-xs font-extrabold text-white">
                            {i + 1}
                          </span>
                          مرافق {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCompanion(i)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                          aria-label={`حذف مرافق ${i + 1}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="sm:col-span-2 lg:col-span-3">
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
                        <div className="sm:col-span-2 lg:col-span-1">
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
              )}
            </div>
          )}
          </section>
        )}

        {currentStep === 2 && (
        <section className={cardClass}>
          <div className="mb-5">
            <StepBadge
              step={2}
              icon={Bus}
              color="sky"
              title="الرحلة والسعر وأفراد الحجز"
              subtitle="حدد الرحلة، ثم علّم على من تشملهم هذه الفاتورة"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>الرحلة</label>
              <div className="relative">
                <Bus className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={tripId}
                  onChange={(e) => {
                    setSuccess(null);
                    setTripId(e.target.value);
                  }}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="">— اختر الرحلة —</option>
                  {trips.map((t) => {
                    const free = remainingSeats(t);
                    const isFull = free <= 0;
                    return (
                      <option key={t.id} value={t.id} disabled={isFull}>
                        [{t.tripNumber}] {t.destination} · {formatSAR(t.price)} (
                        {isFull
                          ? 'مكتملة العدد'
                          : `متبقي ${free} ${seatsLabel(free)}`}
                        )
                      </option>
                    );
                  })}
                </select>
              </div>
              {selectedTrip && (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <CircleCheck className="h-3.5 w-3.5" />
                  المقاعد المتاحة: {remainingSeats(selectedTrip)}{' '}
                  {seatsLabel(remainingSeats(selectedTrip))}
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>سعر الرحلة للفرد</label>
              <div className="flex h-11 items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/70 px-4 text-sm font-extrabold text-emerald-900">
                <span>{formatSAR(perPerson)}</span>
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-400">
                مأخوذ مباشرة من سعر الرحلة المحددة، ويُضرب تلقائياً في عدد
                الأفراد المشمولين
              </p>
            </div>
          </div>

          {familyList.length > 0 && (
            <div className="mt-5 rounded-2xl border border-violet-200/70 bg-violet-50/40 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-extrabold text-violet-900">
                  <Users className="h-4 w-4" />
                  المشمولون في هذه الفاتورة
                </p>
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-extrabold text-white">
                  {checkedCount} / {familyList.length} مشمول
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {familyList.map((m) => {
                  const checked = checkedIds.has(m.key);
                  return (
                    <label
                      key={m.key}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
                        checked
                          ? m.isPrimary
                            ? 'border-emerald-300 bg-white ring-1 ring-emerald-200'
                            : 'border-violet-300 bg-white ring-1 ring-violet-200'
                          : 'border-gray-200 bg-white/60 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChecked(m.key)}
                        className="h-4 w-4 accent-violet-600"
                      />
                      <span className={m.isPrimary ? 'text-emerald-800' : 'text-gray-800'}>
                        {m.fullName}
                      </span>
                      {m.isPrimary && (
                        <span className="rounded-full bg-emerald-50 px-2 py-px text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                          رب الأسرة
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-xs font-semibold text-violet-700/80">
                العدد المختار يُحسب تلقائياً في الإجمالي، ويُخصم من مقاعد
                الرحلة، وتُدرج أسماؤهم في الفاتورة.
              </p>
            </div>
          )}
          </section>
        )}

        {currentStep === 3 && (
        <section className={cardClass}>
          <div className="mb-5">
            <StepBadge
              step={3}
              icon={Wallet}
              color="amber"
              title="المالية والدفع"
              subtitle="يُحسب الإجمالي تلقائياً حسب عدد الأفراد المحددين"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50/80 p-5 ring-1 ring-emerald-200/60">
              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Calculator className="h-4 w-4" />
                الإجمالي ({checkedCount || 0} × {formatSAR(perPerson)})
              </p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-900">
                {formatSAR(total)}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50/80 p-5 ring-1 ring-amber-200/60">
              <label className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <CreditCard className="h-4 w-4" />
                المبلغ المدفوع الآن
              </label>
              <div className="relative mt-2">
                <input
                  type="number"
                  min="0"
                  value={paid}
                  onChange={(e) => {
                    setSuccess(null);
                    setPaid(e.target.value);
                  }}
                  placeholder="0"
                  className="w-full rounded-xl border border-amber-300/70 bg-white px-4 py-2 text-3xl font-extrabold text-amber-900 outline-none transition placeholder:text-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                  ر.س
                </span>
              </div>
            </div>

            <div
              className={`rounded-2xl p-5 ring-1 ${
                remaining === 0 && paidValue > 0
                  ? 'bg-emerald-600 text-white ring-emerald-700'
                  : 'bg-gray-900 text-white ring-gray-800'
              }`}
            >
              <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
                {remaining === 0 && paidValue > 0 ? (
                  <CircleCheck className="h-4 w-4" />
                ) : (
                  <Wallet className="h-4 w-4" />
                )}
                المبلغ المتبقي
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {formatSAR(remaining)}
              </p>
              {remaining === 0 && paidValue > 0 && (
                <p className="mt-1 text-[11px] font-bold opacity-90">
                  مدفوع بالكامل
                </p>
              )}
            </div>
          </div>

          {paidValue > total && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              <CircleAlert className="h-4 w-4" />
              المدفوع أكبر من إجمالي الفاتورة، راجع القيمة
            </p>
          )}

          <div className="mt-4">
            <label
              className={`mb-1.5 flex items-center gap-1.5 text-sm font-semibold ${
                methodRequired ? 'text-gray-700' : 'text-gray-400'
              }`}
            >
              <Banknote className="h-4 w-4" />
              طريقة الدفع
              {methodRequired && (
                <span className="text-xs font-bold text-amber-600">(مطلوبة)</span>
              )}
            </label>
            <select
              value={paymentMethod}
              disabled={!methodRequired}
              onChange={(e) => {
                setSuccess(null);
                setPaymentMethod(e.target.value);
              }}
              className={`${inputClass} max-w-sm disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
            >
              <option value="">— اختر طريقة الدفع —</option>
              <option value="كاش">كاش</option>
              <option value="فيزا / شبكة">فيزا / شبكة</option>
              <option value="تحويل بنكي">تحويل بنكي</option>
            </select>
            {!methodRequired && (
              <p className="mt-1.5 text-xs font-medium text-gray-400">
                لا يُطلب تحديد طريقة دفع عندما يكون المدفوع 0
              </p>
            )}
          </div>
          </section>
        )}

        {error && (
          <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
            <CircleAlert className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {/* Step navigation footer */}
        <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
              >
                <ArrowRight className="h-4 w-4" />
                السابق
              </button>
            )}
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {currentStep < STEPS.length ? (
              <>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={nextDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  التالي
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {nextDisabled && (
                  <p className="max-w-xs text-xs font-semibold text-gray-400">
                    {stepHint}
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 sm:items-end">
                <p className="text-sm font-extrabold text-emerald-900">
                  ملخص الحجز: {checkedCount || 0}{' '}
                  {seatsLabel(checkedCount || 0)} · {formatSAR(total)}
                </p>
                <button
                  type="submit"
                  disabled={!canIssue}
                  className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-700 px-10 py-4 text-lg font-extrabold text-white shadow-xl transition hover:scale-[1.02] hover:from-emerald-700 hover:to-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ReceiptText className="h-6 w-6" />
                  تأكيد الحجز وإصدار الفاتورة
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {printNode &&
        invoiceToPrint &&
        createPortal(<PrintInvoice invoice={invoiceToPrint} />, printNode)}
    </div>
  );
}
