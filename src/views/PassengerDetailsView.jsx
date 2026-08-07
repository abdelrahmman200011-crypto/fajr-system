import {
  ArrowRight,
  User,
  Users,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  Venus,
  Mars,
  Ban,
  IdCard,
  ReceiptText,
} from 'lucide-react';
import {
  familyMembers,
  familyHead,
  formatSAR,
  invoiceTotals,
} from '../data/mockData';

const GENDER_META = {
  male: { label: 'ذكر', icon: Venus, cls: 'text-sky-700' },
  female: { label: 'أنثى', icon: Mars, cls: 'text-pink-700' },
};

function Field({ label, value, ltr }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400">{label}</p>
      <p
        className="mt-1 font-bold text-gray-800"
        dir={ltr ? 'ltr' : undefined}
      >
        {value || '—'}
      </p>
    </div>
  );
}

export default function PassengerDetailsView({
  passengerId,
  passengers,
  invoices,
  trips,
  packages,
  services,
  onBack,
}) {
  const passenger = passengers.find((p) => p.id === passengerId) || null;

  if (!passenger) {
    return (
      <div className="rounded-2xl border border-white/70 bg-white/70 p-10 text-center shadow-soft backdrop-blur-xl">
        <p className="text-base font-bold text-gray-500">
          الملف غير موجود أو تم حذفه.
        </p>
        <button onClick={onBack} className="btn-primary mt-5">
          <ArrowRight className="h-4 w-4" />
          العودة للمسافرين
        </button>
      </div>
    );
  }

  const head = familyHead(passengers, passenger.familyId);
  const members = familyMembers(passengers, passenger.familyId);
  const companions = members.filter((m) => m.id !== head?.id);
  const isCompanion = head && head.id !== passenger.id;
  const isCanceled = passenger.status === 'canceled';

  const passengerInvoices = invoices.filter(
    (inv) => inv.passengerId === passenger.id
  );

  const mainPerson = head || passenger;

  const renderPerson = (person, { showRelation }) => {
    const g = GENDER_META[person.gender] || GENDER_META.male;
    const GenderIcon = g.icon;
    const canceled = person.status === 'canceled';
    const personInvoices = invoices.filter(
      (inv) => inv.passengerId === person.id
    );
    return (
      <div
        key={person.id}
        className={`rounded-2xl border p-5 transition ${
          canceled
            ? 'border-gray-200 bg-gray-50/70 opacity-70'
            : 'border-white/70 bg-white/70 shadow-soft backdrop-blur-xl'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white shadow-sm ${
                canceled
                  ? 'bg-gray-400'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600'
              }`}
            >
              {person.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`text-base font-extrabold ${
                    canceled ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}
                >
                  {person.fullName}
                </p>
                {canceled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-extrabold text-red-600 ring-1 ring-red-200">
                    <Ban className="h-3 w-3" />
                    ملغى
                  </span>
                )}
                {showRelation && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-extrabold text-violet-700 ring-1 ring-violet-200">
                    <Users className="h-3 w-3" />
                    رفيق/تابع لـ {head?.fullName}
                  </span>
                )}
              </div>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                <GenderIcon className={`h-4 w-4 ${g.cls}`} />
                {g.label}
                <span className="text-gray-300">·</span>
                {person.nationality || '—'}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-extrabold text-violet-700 ring-1 ring-violet-200">
            <IdCard className="h-3.5 w-3.5" />
            {person.familyId}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="رقم الجوال" value={person.phone} ltr />
          <Field label="السجل / الإقامة" value={person.documentId} ltr />
          <Field label="الفرع" value={person.branch} />
          <Field label="العنوان" value={person.address} />
        </div>

        {personInvoices.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50/70 p-3 ring-1 ring-amber-200/60">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-amber-700">
              <ReceiptText className="h-3.5 w-3.5" />
              الفواتير المرتبطة
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {personInvoices.map((inv) => {
                const trip = trips.find((t) => t.id === inv.tripId);
                const { totalAmount: total, paid } = invoiceTotals(
                  inv,
                  packages,
                  services
                );
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-gray-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-800">
                        فاتورة #{inv.id}
                      </p>
                      <p className="truncate text-xs font-medium text-gray-500">
                        {trip?.name || '—'}
                      </p>
                    </div>
                    <div className="shrink-0 text-left">
                      <p className="text-xs font-extrabold text-emerald-700">
                        {formatSAR(total)}
                      </p>
                      <p className="text-[11px] font-bold text-amber-600">
                        مدفوع {formatSAR(paid)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
              aria-label="العودة"
              title="العودة لقائمة المسافرين"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-900">
                  ملف {mainPerson.fullName}
                </h2>
                {isCanceled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-extrabold text-red-600 ring-1 ring-red-200">
                    <Ban className="h-3.5 w-3.5" />
                    حجز ملغى
                  </span>
                )}
                {isCompanion && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-extrabold text-violet-700 ring-1 ring-violet-200">
                    <Users className="h-3.5 w-3.5" />
                    رفيق/تابع لـ {head.fullName} — {head.phone}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isCompanion
                  ? `هذا الملف تابع لعائلة «${head.fullName}» (${head.phone})`
                  : members.length > 1
                    ? `رب العائلة — يشمل ${members.length} أفراد مرتبطين`
                    : 'سجل فردي مستقل'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
              <Building2 className="h-4 w-4" />
              {mainPerson.branch || '—'}
            </span>
            <span className="text-xs font-medium text-gray-400">
              عدد أفراد العائلة: {members.length}
            </span>
          </div>
        </div>
      </div>

      {/* Invoices summary strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
            <ReceiptText className="h-4 w-4" />
            عدد الفواتير
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            {passengerInvoices.length}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
            <CreditCard className="h-4 w-4" />
            إجمالي المدفوع
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            {formatSAR(
              passengerInvoices.reduce(
                (acc, inv) => acc + invoiceTotals(inv, packages, services).paid,
                0
              )
            )}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-[#713639] to-[#5d2c2e] p-5 text-white shadow-soft">
          <p className="flex items-center gap-1.5 text-xs font-bold opacity-80">
            <Phone className="h-4 w-4" />
            رقم الجوال
          </p>
          <p className="mt-2 text-2xl font-extrabold" dir="ltr">
            {mainPerson.phone || '—'}
          </p>
        </div>
      </div>

      {/* Main person card */}
      {renderPerson(mainPerson, { showRelation: false })}

      {/* Companions */}
      {companions.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                الرفقاء والمرافقون
                <span className="mr-2 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-sm font-bold text-violet-700">
                  {companions.length}
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                أفراد عائلة «{mainPerson.fullName}» المرتبطون بالحجز
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {companions.map((c) => renderPerson(c, { showRelation: true }))}
          </div>
        </section>
      )}

      {companions.length === 0 && (
        <p className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-5 py-4 text-sm font-bold text-gray-500 shadow-soft backdrop-blur-xl">
          <MapPin className="h-4 w-4 text-gray-400" />
          لا يوجد رفقاء أو مرافقون مرتبطون بهذا السجل.
        </p>
      )}
    </div>
  );
}
