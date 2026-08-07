import { useMemo, useState } from 'react';
import {
  Hotel,
  MapPin,
  BedDouble,
  Plus,
  X,
  KeyRound,
  Venus,
  Mars,
  UsersRound,
  Trash2,
  CircleCheck,
  Building2,
} from 'lucide-react';

const ROOM_TYPE_META = {
  رجال: {
    label: 'رجال',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    tile: 'from-sky-500 to-sky-700',
    icon: Mars,
  },
  نساء: {
    label: 'نساء',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    tile: 'from-rose-500 to-rose-700',
    icon: Venus,
  },
  عائلي: {
    label: 'عائلي',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    tile: 'from-amber-400 to-amber-600',
    icon: UsersRound,
  },
};

const ROOM_CATEGORIES = ['مفردة', 'مزدوجة', 'ثلاثية', 'رباعية', 'عائلية'];

const CATEGORY_META = {
  مفردة: { beds: 1, badge: 'bg-gray-50 text-gray-600 ring-gray-200' },
  مزدوجة: { beds: 2, badge: 'bg-sky-50 text-sky-700 ring-sky-200' },
  ثلاثية: { beds: 3, badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200' },
  رباعية: { beds: 4, badge: 'bg-teal-50 text-teal-700 ring-teal-200' },
  عائلية: { beds: 4, badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

const DEFAULT_CAPACITY = {
  مفردة: 1,
  مزدوجة: 2,
  ثلاثية: 3,
  رباعية: 4,
  عائلية: 4,
};

const nextId = (list) =>
  list.length > 0 ? Math.max(...list.map((x) => x.id)) + 1 : 1;

const inputClass = 'input-field focus:border-emerald-500 focus:ring-emerald-500/20';

function RoomTypeBadge({ type }) {
  const meta = ROOM_TYPE_META[type] || ROOM_TYPE_META['عائلي'];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ring-1 ${meta.badge}`}
    >
      <meta.icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}

function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] || CATEGORY_META['رباعية'];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ring-1 ${meta.badge}`}
    >
      <BedDouble className="h-3 w-3" />
      {category}
    </span>
  );
}

export default function HotelsView({
  hotels,
  rooms,
  passengers,
  onAddHotel,
  onDeleteHotel,
  onAddRoom,
  onDeleteRoom,
}) {
  const [selectedHotelId, setSelectedHotelId] = useState(hotels[0]?.id ?? null);
  const [newHotel, setNewHotel] = useState({ name: '', location: '' });
  const [hotelError, setHotelError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    number: '',
    category: 'رباعية',
    type: 'رجال',
    capacity: '4',
  });
  const [roomError, setRoomError] = useState('');

  const selectedHotel =
    hotels.find((h) => h.id === selectedHotelId) || null;

  const hotelRooms = useMemo(
    () =>
      selectedHotel
        ? rooms.filter((r) => r.hotelId === selectedHotel.id)
        : [],
    [rooms, selectedHotel]
  );

  const occupiedCount = (roomId) =>
    passengers.filter((p) => p.roomId === roomId).length;

  const hotelStats = useMemo(() => {
    const totalRooms = hotelRooms.length;
    const totalBeds = hotelRooms.reduce((a, r) => a + r.capacity, 0);
    const occupiedBeds = hotelRooms.reduce(
      (a, r) => a + occupiedCount(r.id),
      0
    );
    return {
      totalRooms,
      totalBeds,
      occupiedBeds,
      freeBeds: Math.max(totalBeds - occupiedBeds, 0),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelRooms, passengers]);

  const totalRoomsAll = rooms.length;
  const totalBedsAll = rooms.reduce((a, r) => a + r.capacity, 0);

  const addHotel = (e) => {
    e.preventDefault();
    const name = newHotel.name.trim();
    if (!name) {
      setHotelError('يرجى إدخال اسم الفندق');
      return;
    }
    const created = onAddHotel({ ...newHotel, name });
    setNewHotel({ name: '', location: '' });
    setHotelError('');
    setSelectedHotelId(created?.id ?? null);
  };

  const removeHotel = (h) => {
    const roomCount = rooms.filter((r) => r.hotelId === h.id).length;
    const msg =
      roomCount > 0
        ? `سيتم حذف فندق «${h.name}» مع غرفه الـ ${roomCount}. هل أنت متأكد؟`
        : `سيتم حذف فندق «${h.name}». هل أنت متأكد؟`;
    if (!window.confirm(msg)) return;
    onDeleteHotel(h.id);
    if (selectedHotelId === h.id) {
      const remaining = hotels.filter((x) => x.id !== h.id);
      setSelectedHotelId(remaining[0]?.id ?? null);
    }
  };

  const changeCategory = (category) => {
    setNewRoom((prev) => ({
      ...prev,
      category,
      capacity: String(DEFAULT_CAPACITY[category] ?? 4),
    }));
  };

  const openModal = () => {
    setNewRoom({ number: '', category: 'رباعية', type: 'رجال', capacity: '4' });
    setRoomError('');
    setModalOpen(true);
  };

  const submitRoom = (e) => {
    e.preventDefault();
    const number = newRoom.number.trim();
    if (!number) {
      setRoomError('يرجى إدخال رقم الغرفة');
      return;
    }
    const capacity = Number(newRoom.capacity);
    if (!newRoom.capacity.trim() || !Number.isInteger(capacity) || capacity < 1) {
      setRoomError('يرجى إدخال سعة صحيحة (1 فأكثر)');
      return;
    }
    if (
      rooms.some(
        (r) => r.number === number && r.hotelId === selectedHotel?.id
      )
    ) {
      setRoomError('رقم الغرفة مستخدم مسبقاً في هذا الفندق');
      return;
    }
    onAddRoom({
      number,
      category: newRoom.category,
      type: newRoom.type,
      capacity,
      hotelId: selectedHotel?.id,
    });
    setModalOpen(false);
  };

  const summary = [
    { label: 'الفنادق', value: hotels.length, icon: Building2, tint: 'bg-emerald-500/10', color: 'text-emerald-600' },
    { label: 'إجمالي الغرف', value: totalRoomsAll, icon: KeyRound, tint: 'bg-amber-500/10', color: 'text-amber-600' },
    { label: 'إجمالي الأسرة', value: totalBedsAll, icon: BedDouble, tint: 'bg-teal-500/10', color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
          <Hotel className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 sm:text-xl">
            الفنادق والغرف
          </h3>
          <p className="text-sm text-gray-500">
            أضف الفنادق ثم حدّد غرف كل فندق — وتُربط الرحلات بالفنادق من قسم
            «الرحلات»
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-soft backdrop-blur-xl"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.tint}`}
            >
              <s.icon className={`h-5 w-5 ${s.color}`} strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-gray-500">{s.label}</p>
              <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Master-detail split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Right: hotels list (first in DOM = right in RTL) */}
        <aside className="lg:col-span-4">
          <div className="flex h-full flex-col rounded-2xl border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-gray-100/80 p-5">
              <h4 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700">
                  <Hotel className="h-5 w-5" />
                </span>
                الفنادق المسجلة
              </h4>
              <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700">
                {hotels.length} فندق
              </span>
            </div>

            <form onSubmit={addHotel} className="space-y-3 border-b border-gray-100/80 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  اسم الفندق
                </label>
                <input
                  type="text"
                  value={newHotel.name}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, name: e.target.value })
                  }
                  placeholder="مثال: فندق الحرمان مكة"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  الموقع / العنوان
                </label>
                <input
                  type="text"
                  value={newHotel.location}
                  onChange={(e) =>
                    setNewHotel({ ...newHotel, location: e.target.value })
                  }
                  placeholder="مثال: العزيزية - مكة المكرمة"
                  className={inputClass}
                />
              </div>
              {hotelError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
                  {hotelError}
                </p>
              )}
              <button type="submit" className="btn-primary w-full">
                <Plus className="h-4 w-4" />
                إضافة الفندق
              </button>
            </form>

            <div
              className="flex-1 space-y-3 overflow-y-auto p-5"
              style={{ maxHeight: '520px' }}
            >
              {hotels.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-10 text-center">
                  <Hotel className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm font-bold text-gray-600">
                    لا توجد فنادق بعد
                  </p>
                </div>
              )}
              {hotels.map((h) => {
                const roomCount = rooms.filter((r) => r.hotelId === h.id).length;
                const beds = rooms
                  .filter((r) => r.hotelId === h.id)
                  .reduce((a, r) => a + r.capacity, 0);
                const active = selectedHotelId === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHotelId(h.id)}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl border p-4 text-right transition ${
                      active
                        ? 'border-emerald-300 bg-emerald-50/70 ring-2 ring-emerald-200'
                        : 'border-gray-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/40'
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-700/20">
                      <Hotel className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-sm font-extrabold text-gray-800">
                        {h.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{h.location || 'بدون عنوان'}</span>
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-teal-500/10 px-2 py-px text-[10px] font-extrabold text-teal-700">
                          {roomCount} غرفة
                        </span>
                        <span className="rounded-full bg-amber-500/10 px-2 py-px text-[10px] font-extrabold text-amber-700">
                          {beds} سرير
                        </span>
                      </span>
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        removeHotel(h);
                      }}
                      onKeyDown={(ev) => {
                        if (ev.key === 'Enter' || ev.key === ' ') {
                          ev.stopPropagation();
                          removeHotel(h);
                        }
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                      title="حذف الفندق"
                      aria-label={`حذف ${h.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Left: selected hotel profile */}
        <section className="lg:col-span-8">
          {!selectedHotel ? (
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-20 text-center backdrop-blur">
              <Building2 className="mb-3 h-14 w-14 text-gray-300" />
              <p className="text-base font-bold text-gray-600">
                اختر فندقاً أو أضف فندقاً جديداً
              </p>
              <p className="mt-1 text-sm text-gray-400">
                ستظهر غرف الفندق هنا لتتم إدارتها وربطها بالرحلات
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Hotel header */}
              <div className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
                      <Hotel className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold text-gray-900">
                        {selectedHotel.name}
                      </h4>
                      <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-gray-500">
                        <MapPin className="h-4 w-4 text-amber-600" />
                        {selectedHotel.location || 'بدون عنوان'}
                      </p>
                    </div>
                  </div>
                  <button onClick={openModal} className="btn-primary w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    إضافة غرفة
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { label: 'غرف الفندق', value: hotelStats.totalRooms, tint: 'bg-emerald-500/10', color: 'text-emerald-600' },
                    { label: 'إجمالي الأسرة', value: hotelStats.totalBeds, tint: 'bg-amber-500/10', color: 'text-amber-600' },
                    { label: 'أسرة مشغولة', value: hotelStats.occupiedBeds, tint: 'bg-rose-500/10', color: 'text-rose-600' },
                    { label: 'أسرة متاحة', value: hotelStats.freeBeds, tint: 'bg-teal-500/10', color: 'text-teal-600' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-gray-50/60 p-3"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.tint}`}
                      >
                        <BedDouble className={`h-4 w-4 ${s.color}`} />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[11px] font-bold text-gray-500">
                          {s.label}
                        </p>
                        <p className="text-base font-extrabold text-gray-900">
                          {s.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rooms grid */}
              <div>
                <div className="flex items-center justify-between p-1 pb-4">
                  <h5 className="flex items-center gap-2 text-base font-extrabold text-gray-900">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600/10 text-teal-700">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    غرف الفندق
                    <span className="rounded-full bg-teal-600/10 px-3 py-1 text-xs font-bold text-teal-700">
                      {hotelRooms.length} غرفة
                    </span>
                  </h5>
                </div>

                {hotelRooms.length === 0 ? (
                  <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 bg-white/50 py-16 text-center backdrop-blur">
                    <Hotel className="mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-base font-bold text-gray-600">
                      لا توجد غرف في هذا الفندق بعد
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      أضف الغرف لتتمكن نقطة البيع من تسكين المعتمرين هنا
                    </p>
                    <button onClick={openModal} className="btn-primary mt-5">
                      <Plus className="h-4 w-4" />
                      إضافة الغرفة الأولى
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {hotelRooms.map((room) => {
                      const occupied = occupiedCount(room.id);
                      const isFull = occupied >= room.capacity;
                      const percent = Math.min(
                        (occupied / room.capacity) * 100,
                        100
                      );
                      return (
                        <div
                          key={room.id}
                          className="flex flex-col rounded-2xl border border-white/70 bg-white/70 p-4 shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${
                                  ROOM_TYPE_META[room.type]?.tile || 'from-emerald-600 to-teal-700'
                                } shadow-md shadow-gray-900/10`}
                              >
                                <BedDouble className="h-5 w-5 text-white" />
                              </div>
                              <div className="leading-tight">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <p className="text-base font-extrabold text-gray-900">
                                    غرفة {room.number}
                                  </p>
                                  <RoomTypeBadge type={room.type} />
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <CategoryBadge category={room.category} />
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `حذف غرفة ${room.number} من فندق «${selectedHotel.name}»؟`
                                  )
                                ) {
                                  onDeleteRoom(room.id);
                                }
                              }}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                              title="حذف الغرفة"
                              aria-label={`حذف غرفة ${room.number}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFull
                                  ? 'bg-gradient-to-l from-amber-500 to-amber-400'
                                  : 'bg-gradient-to-l from-emerald-600 to-emerald-400'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-500">
                              {occupied} / {room.capacity} أسرة مشغولة
                            </p>
                            {isFull ? (
                              <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-extrabold text-amber-700 ring-1 ring-amber-300/60">
                                ممتلئة
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                                {room.capacity - occupied} متاح
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Add Room Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-500"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-700/25">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  إضافة غرفة جديدة
                </h3>
                <p className="text-sm text-gray-500">{selectedHotel?.name}</p>
              </div>
            </div>

            <form onSubmit={submitRoom} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  رقم الغرفة
                </label>
                <input
                  type="text"
                  value={newRoom.number}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, number: e.target.value })
                  }
                  placeholder="مثال: 104"
                  autoFocus
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  الفئة
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ROOM_CATEGORIES.map((c) => {
                    const active = newRoom.category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => changeCategory(c)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-extrabold transition ${
                          active
                            ? 'border-teal-500 bg-teal-50 text-teal-700 ring-2 ring-teal-200'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-teal-200'
                        }`}
                      >
                        {active && <CircleCheck className="h-3.5 w-3.5" />}
                        {c}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs font-medium text-gray-400">
                  مفردة / مزدوجة / ثلاثية / رباعية — تحدد السعة الافتراضية
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  نوع الدخول
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['رجال', 'نساء', 'عائلي'].map((t) => {
                    const meta = ROOM_TYPE_META[t];
                    const active = newRoom.type === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setNewRoom({ ...newRoom, type: t })
                        }
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-extrabold transition ${
                          active
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-emerald-200'
                        }`}
                      >
                        <meta.icon className="h-3.5 w-3.5" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs font-medium text-gray-400">
                  يفرض النظام فصل الجنسين تلقائياً في نقطة البيع
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  سعة الغرفة
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={newRoom.capacity}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, capacity: e.target.value })
                  }
                  placeholder="مثال: 4"
                  className={inputClass}
                />
              </div>

              {roomError && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
                  {roomError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-outline w-full sm:w-auto"
                >
                  إلغاء
                </button>
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  إضافة الغرفة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
