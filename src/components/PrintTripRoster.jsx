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
      name: r.name || r.passenger?.fullName || '',
      nationalId: r.documentId || r.passenger?.documentId || '',
      phone: r.phone || r.passenger?.phone || '',
      nationality: r.nationality || r.passenger?.nationality || '',
      paymentType: r.payType || invoiceMethod(r.inv),
      paidAmount: r.amount ?? r.inv?.paidAmount ?? r.inv?.paid ?? '',
      address: r.address || r.passenger?.address || '',
      roomNumber: r.roomNumber || r.passenger?.roomNumber || '',
      notes: r.notes || r.passenger?.notes || '',
    };
  });

  const th =
    'p-2 text-xs font-bold leading-tight text-white border border-gray-300';
  const td =
    'px-2 py-2 text-xs leading-tight border border-gray-300';

  return (
    <div
      dir="rtl"
      className="hidden min-h-screen flex-col bg-white text-black print:flex"
      style={{
        fontFamily: "'Tahoma', 'Arial', 'Cairo', sans-serif",
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <style>{`@media print { @page { size: A4 portrait; margin: 10mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .print-footer { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; } .print-footer-spacer { height: 24mm; } }`}</style>

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
                  الكشف الرسمي لركاب الرحلة رقم: {trip.tripNumber}
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
      </table>

      {/* SECTION 2b — Trip notes (if any) */}
      {(trip?.luggageInstructions || trip?.generalNotes) && (
        <div className="mt-6 break-inside-avoid print:break-inside-avoid">
          <p
            className="mb-2 text-xs font-extrabold"
            style={{ color: BRAND_BROWN }}
          >
            ملاحظات الرحلة العامة
          </p>
          <div className="grid grid-cols-2 gap-3">
            {trip?.luggageInstructions && (
              <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
                <p
                  className="text-[11px] font-extrabold"
                  style={{ color: BRAND_BROWN }}
                >
                  تعليمات الأمتعة (للسائق / المشرف)
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-black">
                  {trip.luggageInstructions}
                </p>
              </div>
            )}
            {trip?.generalNotes && (
              <div className="rounded-md border border-gray-300 bg-gray-50 p-3">
                <p
                  className="text-[11px] font-extrabold"
                  style={{ color: BRAND_BROWN }}
                >
                  ملاحظات عامة على الرحلة
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-black">
                  {trip.generalNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3b — Formal signature block */}
      <div className="mt-8 break-inside-avoid print:break-inside-avoid">
        <p
          className="mb-2 text-xs font-extrabold text-center"
          style={{ color: BRAND_BROWN }}
        >
          اعتماد الكشف
        </p>
        <div className="flex items-start justify-between gap-10">
          {['توقيع المشرف', 'توقيع السائق', 'ختم الشركة'].map((label) => (
            <div key={label} className="flex-1 text-center">
              <div className="h-12 border-b-2 border-dashed border-gray-400" />
              <p className="mt-2 text-sm font-extrabold text-black">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spacer so the pinned footer never overlaps the last page's content */}
      <div className="print-footer-spacer" />

      {/* SECTION 4 — Pin contact footer to bottom of the printed page */}
      <footer className="print-footer">
        <RibbonFooter />
      </footer>
    </div>
  );
}
