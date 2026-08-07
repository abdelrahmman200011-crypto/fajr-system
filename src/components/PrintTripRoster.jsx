import { Mail, MapPin, Phone } from 'lucide-react';
import Twitter from './TwitterIcon';
import {
  PrintHeader,
  BRAND_GREEN,
  BRAND_BROWN,
  BRAND_GOLD,
} from './PrintLetterhead';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB').split('/').reverse().join('/');
}

function invoiceMethod(inv) {
  if (!inv) return '';
  return (
    inv.paymentMethod ||
    (inv.paymentType === 'بنك' ? 'تحويل بنكي' : inv.paymentType) ||
    'كاش'
  );
}

function TripDetails({ trip, capacity }) {
  const facts = [
    { label: 'تاريخ الذهاب', value: formatDate(trip?.departure), ltr: false },
    { label: 'تاريخ العودة', value: formatDate(trip?.returnDate), ltr: false },
    { label: 'اسم السائق', value: trip?.driverName || '—', ltr: false },
    { label: 'رقم الاقامة', value: trip?.driverIqama || '—', ltr: true },
    { label: 'رقم اللوحة', value: trip?.plate || '—', ltr: true },
    { label: 'الحمولة', value: `${capacity} راكب`, ltr: false },
    { label: 'الوقت', value: `${trip?.time || '10:00'} ص`, ltr: true },
    { label: 'رقم الجوال', value: trip?.driverPhone || '—', ltr: true },
  ];

  return (
    <div className="mb-8 grid grid-cols-4 gap-6">
      {facts.map((f) => (
        <div
          key={f.label}
          className="rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-center"
        >
          <p
            className="text-xs font-bold leading-tight"
            style={{ color: BRAND_BROWN }}
          >
            {f.label}
          </p>
          <p
            className="mt-1 text-base font-extrabold leading-tight text-black"
            dir={f.ltr ? 'ltr' : 'rtl'}
          >
            {f.value || '—'}
          </p>
        </div>
      ))}
    </div>
  );
}

function RibbonFooter() {
  return (
    <div
      className="w-full bg-white pt-2"
      style={{
        borderTop: `3px solid ${BRAND_GOLD}`,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <div className="grid grid-cols-2 gap-x-8 gap-y-1 px-1 py-2 text-[11px] font-bold text-black">
        <div className="space-y-1">
          <p className="flex items-start gap-1.5">
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: BRAND_GREEN }}
            />
            <span>
              المركز الرئيسي: مكة المكرمة برج الصفا الاداري - العزيزية
              <span dir="ltr"> 0555467671</span>
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: BRAND_GREEN }}
            />
            <span>
              المدينة المنورة: مجمع الداودية <span dir="ltr">0555208993</span>
            </span>
          </p>
        </div>
        <div className="space-y-1">
          <p className="flex items-start gap-1.5">
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: BRAND_GREEN }}
            />
            <span>
              جازان: شارع المطار مقابل مطعم القرموشي
              <span dir="ltr"> 0500545418</span>
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: BRAND_GREEN }}
            />
            <span>
              الداير: مقابل فندق الرؤية <span dir="ltr">0502896918</span>
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
              style={{ color: BRAND_GREEN }}
            />
            <span>
              صبياء - شارع الملك فيصل <span dir="ltr">0580777981</span>
            </span>
          </p>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 rounded-lg px-4 py-1.5 text-xs font-extrabold text-gray-900"
        style={{ backgroundColor: BRAND_GOLD }}
      >
        <span className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" />
          الإدارة: 05 093 50032
        </span>
        <span className="flex items-center gap-1.5">
          <Twitter className="h-3.5 w-3.5" />
          fajr_Hajj_Umrah
        </span>
        <span className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          Reservations@fajralnusuk.com
        </span>
      </div>
    </div>
  );
}

export default function PrintTripRoster({ trip, passengers }) {
  const totalRows = 49;
  const capacity = trip?.capacity || 49;

  const manifestRows = Array.from({ length: totalRows }, (_, i) => {
    const r = passengers[i];
    if (!r) return { id: i + 1 };
    return {
      id: i + 1,
      name: r.passenger?.fullName || '',
      nationalId: r.passenger?.documentId || '',
      phone: r.passenger?.phone || '',
      nationality: r.passenger?.nationality || '',
      paymentType: invoiceMethod(r.inv),
      paidAmount: r.inv?.paidAmount ?? r.inv?.paid ?? '',
      address: r.passenger?.address || '',
      roomNumber: r.passenger?.roomNumber || '',
      notes: r.passenger?.notes || '',
    };
  });

  const medinaTotal = 12;
  const medinaRows = Array.from({ length: medinaTotal }, (_, i) => manifestRows[i] || { id: i + 1 });

  const stamps = Array.from({ length: 15 }, (_, i) => i + 1);

  const th =
    'p-2 text-xs font-bold leading-tight text-white border border-gray-300';
  const td =
    'px-2 py-2 text-xs leading-tight border border-gray-300';

  return (
    <div
      dir="rtl"
      className="hidden bg-white text-black print:block"
      style={{
        fontFamily: "'Tahoma', 'Arial', 'Cairo', sans-serif",
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <style>{`@media print { @page { size: A4 portrait; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

      {/* SECTION 2 — Main passengers table (exactly 49 rows) */}
      <table className="w-full border-collapse text-center">
        <thead>
          {/* Spacious letterhead — repeats at the top of every page */}
          <tr>
            <th colSpan={10} className="p-0 align-top">
              <div className="pt-6">
                <PrintHeader compact logoClass="h-20" />
                <p
                  className="my-3 text-center text-lg font-extrabold leading-tight"
                  style={{ color: BRAND_GREEN }}
                >
                  الكشف الرسمي لركاب رحلة: {trip.name}
                  {trip.destination ? ` — ${trip.destination}` : ''}
                </p>
                <TripDetails trip={trip} capacity={capacity} />
              </div>
            </th>
          </tr>
          <tr>
            <th rowSpan={2} className={`${th} text-center`} style={{ backgroundColor: BRAND_GREEN }}>م</th>
            <th rowSpan={2} className={th} style={{ backgroundColor: BRAND_GREEN }}>الاسم</th>
            <th rowSpan={2} className={th} style={{ backgroundColor: BRAND_GREEN }}>السجل / الاقامة</th>
            <th rowSpan={2} className={th} style={{ backgroundColor: BRAND_GREEN }}>رقم الجوال</th>
            <th rowSpan={2} className={th} style={{ backgroundColor: BRAND_GREEN }}>الجنسية</th>
            <th colSpan={2} className={th} style={{ backgroundColor: BRAND_GREEN }}>حالة الدفع</th>
            <th rowSpan={2} className={th} style={{ backgroundColor: BRAND_GREEN }}>العنوان</th>
            <th rowSpan={2} className={th} style={{ backgroundColor: BRAND_GREEN }}>رقم الغرفة</th>
            <th rowSpan={2} className={th} style={{ backgroundColor: BRAND_GREEN }}>ملاحظة</th>
          </tr>
          <tr>
            <th className={th} style={{ backgroundColor: BRAND_GREEN }}>النوع</th>
            <th className={th} style={{ backgroundColor: BRAND_GREEN }}>القيمة</th>
          </tr>
        </thead>
        <tbody>
          {manifestRows.map((r) => (
            <tr key={r.id} className="odd:bg-white even:bg-[#f6f9f5] print:break-inside-avoid">
              <td className={`${td} text-center`}>{r.id}</td>
              <td className={td}>{r.name || ''}</td>
              <td className={`${td} text-center`} dir="ltr">{r.nationalId || ''}</td>
              <td className={`${td} text-center`} dir="ltr">{r.phone || ''}</td>
              <td className={td}>{r.nationality || ''}</td>
              <td className={td}>{r.paymentType || ''}</td>
              <td className={`${td} text-center`} dir="ltr">{r.paidAmount ?? ''}</td>
              <td className={td}>{r.address || ''}</td>
              <td className={td}>{r.roomNumber || ''}</td>
              <td className={td}>{r.notes || ''}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={10} className="pt-2">
              <RibbonFooter />
            </td>
          </tr>
        </tfoot>
      </table>

      {/* SECTION 3 — Stamps / signatures */}
      <div className="mt-6 break-inside-avoid print:break-inside-avoid">
        <p className="mb-2 text-xs font-extrabold" style={{ color: BRAND_BROWN }}>
          الأختام والتوقيعات
        </p>
        <table className="w-full border-collapse border border-gray-300 text-xs">
          <tbody>
            {[0, 1, 2].map((rowIdx) => (
              <tr key={rowIdx} className="odd:bg-white even:bg-[#f6f9f5] print:break-inside-avoid">
                {[0, 1, 2, 3, 4].map((colIdx) => {
                  const n = rowIdx * 5 + colIdx + 1;
                  const stamp = stamps[n - 1];
                  return (
                    <td
                      key={colIdx}
                      className={`${td} text-center`}
                    >
                      الرقم: {stamp} | نوعها: .............
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECTION 4 — Page break + Medina roster */}
      <div className="break-before-page print:break-before-page">
        <div className="pt-6">
          <PrintHeader compact logoClass="h-20" />
          <p
            className="my-3 text-center text-lg font-extrabold leading-tight"
            style={{ color: BRAND_GREEN }}
          >
            كشف بيانات زوار المدينة المنورة
            {trip.destination ? ` — ${trip.destination}` : ''}
          </p>
        </div>
        <table className="w-full border-collapse border border-gray-300 text-center text-xs">
          <thead>
            <tr>
              <th className={`${th} text-center`} style={{ backgroundColor: BRAND_GREEN }}>م</th>
              <th className={th} style={{ backgroundColor: BRAND_GREEN }}>الاسم</th>
              <th className={th} style={{ backgroundColor: BRAND_GREEN }}>السجل / الاقامة</th>
              <th className={th} style={{ backgroundColor: BRAND_GREEN }}>رقم الجوال</th>
              <th className={th} style={{ backgroundColor: BRAND_GREEN }}>ملاحظة</th>
            </tr>
          </thead>
          <tbody>
            {medinaRows.map((r) => (
              <tr key={r.id} className="odd:bg-white even:bg-[#f6f9f5] print:break-inside-avoid">
                <td className={`${td} text-center`}>{r.id}</td>
                <td className={td}>{r.name || ''}</td>
                <td className={`${td} text-center`} dir="ltr">{r.nationalId || ''}</td>
                <td className={`${td} text-center`} dir="ltr">{r.phone || ''}</td>
                <td className={td}>{r.notes || ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="pt-2">
                <RibbonFooter />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
