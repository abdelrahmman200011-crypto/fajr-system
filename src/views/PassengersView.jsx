import { useEffect, useState } from 'react';
import { Users, Bus, Armchair, CircleCheck, CircleAlert, Lock } from 'lucide-react';
import PassengerTable from '../components/PassengerTable';
import PassengerForm from '../components/PassengerForm';
import { isTripCompleted } from '../data/mockData';

const DEFAULT_CAPACITY = 49;

export default function PassengersView({
  passengers,
  passengersLoading,
  trips,
  invoices,
  currentUser,
  currentUserBranch,
  onAdd,
  onEdit,
  onCancel,
  onReactivate,
  onDelete,
  onOpenDetails,
}) {
  const [viewMode, setViewMode] = useState('list');
  const [editing, setEditing] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(null);

  useEffect(() => {
    if (trips.length > 0 && !trips.some((t) => t.id === selectedTripId)) {
      setSelectedTripId(trips[0].id);
    }
  }, [trips, selectedTripId]);

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || null;
  const capacity = selectedTrip?.capacity || DEFAULT_CAPACITY;
  const tripLocked = selectedTrip
    ? isTripCompleted(selectedTrip.returnDate)
    : false;

  const currentPassengersCount = invoices.reduce((acc, inv) => {
    if (inv.tripId !== selectedTripId) return acc;
    const passenger = passengers.find((p) => p.id === inv.passengerId);
    if (!passenger || passenger.status === 'canceled') {
      return acc;
    }
    return acc + (Number(inv.coveredCount) || inv.coveredPassengers?.length || 1);
  }, 0);

  const seatsLeft = Math.max(capacity - currentPassengersCount, 0);
  const isFull = currentPassengersCount >= capacity;

  const openAddForm = () => {
    if (tripLocked || isFull) return;
    setEditing(null);
    setViewMode('form');
  };

  const openEditForm = (passenger) => {
    if (tripLocked) return;
    setEditing(passenger);
    setViewMode('form');
  };

  const closeForm = () => {
    setViewMode('list');
    setEditing(null);
  };

  const handleCancel = (passenger) => {
    if (tripLocked) return;
    if (!window.confirm(`هل تريد إلغاء حجز "${passenger.fullName}"؟`)) return;
    onCancel(passenger.id);
  };

  const handleDelete = (passenger) => {
    if (!window.confirm(`هل تريد حذف "${passenger.fullName}" نهائياً من السجل؟`))
      return;
    onDelete(passenger.id);
  };

  const handleReactivate = (passenger) => {
    if (tripLocked) return;
    if (!window.confirm(`هل تريد إعادة تفعيل حجز "${passenger.fullName}"؟`)) return;
    onReactivate(passenger.id);
  };

  const handleSavePassenger = (list) => {
    const newSeated = list.length;
    if (!editing && currentPassengersCount + newSeated > capacity) {
      alert('عفواً، لا توجد مقاعد كافية في هذه الرحلة!');
      return;
    }
    if (editing) {
      onEdit(editing.id, list[0]);
    } else {
      onAdd(list);
    }
    setViewMode('list');
    setEditing(null);
  };

  /* ---------- Full-screen form mode ---------- */
  if (viewMode === 'form') {
    return (
      <PassengerForm
        initialData={editing}
        onClose={closeForm}
        onSubmit={handleSavePassenger}
        trip={selectedTrip}
        seatsLeft={seatsLeft}
        isFull={isFull}
        currentUserBranch={currentUserBranch}
      />
    );
  }

  /* ---------- List mode ---------- */
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/70 p-6 shadow-soft backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
              <Users className="h-5 w-5" />
            </span>
            سجل المسافرين
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            إدارة كاملة لقاعدة بيانات المعتمرين في فروع الداير وجازان
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Bus className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedTripId ?? ''}
              onChange={(e) => setSelectedTripId(Number(e.target.value) || null)}
              className="input-field appearance-none pr-10 sm:w-72"
            >
              <option value="">اختر الرحلة</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.tripNumber}] — {t.destination}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openAddForm}
            disabled={tripLocked || isFull}
            className={`btn-primary ${
              tripLocked || isFull ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            إضافة معتمر جديد
          </button>
        </div>
      </div>

      {/* Completed & locked warning banner */}
      {tripLocked && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300/80 bg-gradient-to-l from-amber-50 to-yellow-50 px-5 py-4 shadow-soft">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-amber-800">
              ⚠️ هذه الرحلة مكتملة ومغلقة. لا يمكن التعديل على بياناتها أو إضافة
              معتمرين جدد.
            </p>
            <p className="mt-1 text-xs font-medium text-amber-600/90">
              الأرشفة تمنع أي تغيير على سجل هذه الرحلة للحفاظ على السلامة
              المالية والتاريخية.
            </p>
          </div>
        </div>
      )}

      {/* Capacity status badge */}
      {selectedTrip && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-5 py-4 shadow-soft backdrop-blur-xl">
          <p className="flex items-center gap-2 text-sm font-extrabold text-gray-800">
            <Armchair className="h-5 w-5 text-emerald-600" />
            {selectedTrip.name}
            <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
              {currentPassengersCount} / {capacity}
            </span>
          </p>
          {isFull ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-red-500 to-amber-500 px-4 py-1.5 text-sm font-extrabold text-white shadow-sm">
              <CircleAlert className="h-4 w-4" />
              الرحلة ممتلئة ({capacity}/{capacity}) — لا يمكن إضافة المزيد
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">
              <CircleCheck className="h-4 w-4" />
              المقاعد المتاحة: {seatsLeft} من {capacity}
            </span>
          )}
        </div>
      )}

      <PassengerTable
        passengers={passengers}
        locked={tripLocked}
        loading={passengersLoading}
        canDelete={currentUser?.role === 'admin'}
        onEdit={openEditForm}
        onCancel={handleCancel}
        onReactivate={handleReactivate}
        onDelete={handleDelete}
        onAdd={openAddForm}
        onView={(p) => onOpenDetails(p.id)}
      />
    </div>
  );
}
