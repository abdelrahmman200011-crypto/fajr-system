import { useState } from 'react';
import {
  Route,
  Bus,
  Hotel,
  MapPin,
  CalendarDays,
  Clock,
  Armchair,
  Wallet,
  Car,
  User,
  CreditCard,
  Phone,
  Plus,
  ArrowRight,
} from 'lucide-react';

const emptyTrip = {
  tripNumber: '',
  destination: '',
  gatheringPoint: '',
  departure: '',
  returnDate: '',
  time: '10:00',
  capacity: 49,
  hotelName: '',
  price: '',
  driverName: '',
  driverIqama: '',
  driverPhone: '',
  plate: '',
};

const inputClass = 'input-field focus:border-emerald-500 focus:ring-emerald-500/20';
const labelClass = 'mb-1.5 block text-sm font-semibold text-gray-700';

export default function AddTrip({ onAddTrip, onCancel, onCreated }) {
  const [trip, setTrip] = useState(emptyTrip);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) =>
    setTrip((prev) => ({ ...prev, [field]: value }));

  const canSubmit =
    trip.tripNumber.trim() &&
    trip.destination.trim() &&
    Boolean(trip.departure) &&
    (trip.price === '' || !Number.isNaN(Number(trip.price)));

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setSaving(true);
    try {
      const created = await onAddTrip({ ...trip, price: Number(trip.price) || 0 });
      setTrip(emptyTrip);
      onCreated?.(created);
    } catch (err) {
      console.error(err);
      setError('تعذر إنشاء الرحلة، حاول مجدداً');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
            <Route className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
              إضافة رحلة جديدة
            </h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              أدخل بيانات الرحلة والأسطول ثم أنشئ الرحلة لتظهر في القائمة
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="btn-outline w-full sm:w-auto">
          <ArrowRight className="h-4 w-4" />
          العودة إلى الرحلات
        </button>
      </div>

      {/* Trip creation form */}
      <div className="rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
        <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
            <Route className="h-5 w-5" />
          </span>
          إدارة الرحلة والأسطول
          <span className="rounded-full bg-emerald-600/10 px-3 py-0.5 text-xs font-bold text-emerald-700">
            رحلة جديدة
          </span>
        </h3>

        <form onSubmit={submit} className="space-y-6">
          {/* Core trip info */}
          <section>
            <div className="mb-4 flex items-center gap-2.5">
              <Bus className="h-5 w-5 text-emerald-700" />
              <h4 className="text-sm font-extrabold text-gray-800">
                معلومات الرحلة
              </h4>
              <span className="h-px flex-1 bg-gradient-to-l from-emerald-200 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>رقم الرحلة</label>
                  <input
                    type="text"
                    value={trip.tripNumber}
                    onChange={(e) => set('tripNumber', e.target.value)}
                    placeholder="مثال: TR-123"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>نقطة التجمع / نقطة الانطلاق</label>
                  <input
                    type="text"
                    value={trip.gatheringPoint}
                    onChange={(e) => set('gatheringPoint', e.target.value)}
                    placeholder="مثال: محطة رمسيس أمام المدخل الرئيسي"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>الوجهة</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={trip.destination}
                    onChange={(e) => set('destination', e.target.value)}
                    placeholder="مكة المكرمة"
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>تاريخ الذهاب</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={trip.departure}
                    onChange={(e) => set('departure', e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>تاريخ العودة</label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={trip.returnDate}
                    onChange={(e) => set('returnDate', e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>الوقت</label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    value={trip.time}
                    onChange={(e) => set('time', e.target.value)}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>الطاقة الاستيعابية / الحمولة</label>
                <div className="relative">
                  <Armchair className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    value={trip.capacity}
                    onChange={(e) => set('capacity', Number(e.target.value))}
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Accommodation hotel + price */}
          <section>
            <div className="mb-4 flex items-center gap-2.5">
              <Hotel className="h-5 w-5 text-teal-600" />
              <h4 className="text-sm font-extrabold text-gray-800">
                الإقامة والتسعير
              </h4>
              <span className="h-px flex-1 bg-gradient-to-l from-teal-200 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>اسم الفندق (نص حر)</label>
                <div className="relative">
                  <Hotel className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={trip.hotelName}
                    onChange={(e) => set('hotelName', e.target.value)}
                    placeholder="مثال: فندق أبراج الراحة — مكة"
                    className={`${inputClass} pr-10`}
                  />
                </div>
                <p className="mt-1.5 text-xs font-medium text-gray-400">
                  اسم الفندق يُكتب يدوياً ولا يرتبط بقسم إدارة الفنادق
                </p>
              </div>

              <div>
                <label className={labelClass}>سعر الرحلة للفرد</label>
                <div className="relative">
                  <Wallet className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    value={trip.price}
                    onChange={(e) => set('price', e.target.value)}
                    placeholder="0"
                    className={`${inputClass} pr-10`}
                  />
                </div>
                <p className="mt-1.5 text-xs font-medium text-gray-400">
                  يُستخدم هذا السعر تلقائياً عند إصدار الفواتير
                </p>
              </div>
            </div>
          </section>

          {/* Driver & bus info */}
          <section>
            <div className="mb-4 flex items-center gap-2.5">
              <Car className="h-5 w-5 text-amber-600" />
              <h4 className="text-sm font-extrabold text-gray-800">
                السائق والحافلة
              </h4>
              <span className="h-px flex-1 bg-gradient-to-l from-amber-200 to-transparent" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>اسم السائق</label>
                <div className="relative">
                  <User className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={trip.driverName}
                    onChange={(e) => set('driverName', e.target.value)}
                    placeholder="مثال: عبدالله سالم الزهراني"
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رقم الإقامة</label>
                <div className="relative">
                  <CreditCard className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={trip.driverIqama}
                    onChange={(e) => set('driverIqama', e.target.value)}
                    placeholder="رقم الإقامة / الهوية"
                    className={`${inputClass} pr-10`}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رقم جوال السائق</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={trip.driverPhone}
                    onChange={(e) => set('driverPhone', e.target.value)}
                    placeholder="05xxxxxxxx"
                    className={`${inputClass} pr-10`}
                    inputMode="tel"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>رقم اللوحة</label>
                <input
                  type="text"
                  value={trip.plate}
                  onChange={(e) => set('plate', e.target.value)}
                  placeholder="4875 د ن"
                  className={`${inputClass} text-center font-bold tracking-widest`}
                  dir="ltr"
                />
              </div>
            </div>
          </section>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'جارٍ الإنشاء...' : 'إنشاء الرحلة'}
            </button>
            <button type="button" onClick={onCancel} className="btn-outline w-full sm:w-auto">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}