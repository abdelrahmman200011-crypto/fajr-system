import { ReceiptText } from 'lucide-react';
import { PrintFooter, BRAND_GREEN, BRAND_BROWN, BRAND_GOLD } from './PrintLetterhead';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB').split('/').reverse().join('/');
}

const formatSAR = (n) => `${Number(n || 0).toLocaleString('en-US')} ريال`;

export default function PrintInvoice({ invoice }) {
  if (!invoice) return null;

  const {
    id,
    passenger,
    trip,
    pkg,
  } = invoice;

  const total = Number(invoice.totalAmount) || Number(invoice.total) || 0;

  const paymentHistory = Array.isArray(invoice.paymentHistory)
    ? invoice.paymentHistory
    : [];
  const paid = paymentHistory.length
    ? paymentHistory.reduce((acc, p) => acc + Number(p.amount || 0), 0)
    : Number(invoice.paid || 0);

  const remaining = Math.max(total - paid, 0);
  const branch = passenger?.branch || '—';

  const infoCell = 'rounded-lg border border-gray-100 bg-gray-50 p-3';

  const summaryRows = [
    { label: 'إجمالي الفاتورة', value: formatSAR(total), green: true },
    ...paymentHistory
      .slice()
      .sort((a, b) => (a.id || 0) - (b.id || 0))
      .map((p) => ({
        label: `دفعة ${p.id || '—'} (${p.date || ''})`,
        value: formatSAR(p.amount),
        method: p.method || 'كاش',
        green: false,
      })),
    { label: 'المبلغ المتبقى', value: formatSAR(remaining), green: false },
  ];

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>

      <div
        dir="rtl"
        className="hidden bg-white text-black print:block"
        style={{
          fontFamily: "'Tahoma', 'Arial', 'Cairo', sans-serif",
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        }}
      >
        <div
          className="mx-auto flex h-[297mm] w-[210mm] max-h-[297mm] flex-col overflow-hidden bg-white p-6 text-black"
          style={{
            printColorAdjust: 'exact',
            WebkitPrintColorAdjust: 'exact',
          }}
        >
          <div className="shrink-0">
            <div
              className="mb-3 pb-3"
              style={{
                borderBottom: `4px solid ${BRAND_GOLD}`,
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              }}
            >
              <div className="grid grid-cols-3 items-center gap-2">
                <div className="text-right">
                  <p
                    className="text-2xl font-extrabold leading-tight"
                    style={{ color: BRAND_GREEN }}
                  >
                    فجر النسك
                  </p>
                  <p
                    className="mt-1 text-sm font-bold"
                    style={{ color: BRAND_BROWN }}
                  >
                    حج، عمرة، زيارة، نقل، فنادق، تسويق
                  </p>
                </div>

                <img
                  src={import.meta.env.BASE_URL + 'logo.png'}
                  alt="Logo"
                  className="mx-auto h-20 w-auto object-contain"
                  style={{
                    printColorAdjust: 'exact',
                    WebkitPrintColorAdjust: 'exact',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                <div className="text-left" dir="ltr">
                  <p
                    className="text-2xl font-extrabold leading-tight"
                    style={{ color: BRAND_GREEN }}
                  >
                    Fajr Al-Nusk
                  </p>
                  <p
                    className="mt-1 text-sm font-bold"
                    style={{ color: BRAND_BROWN }}
                  >
                    Hajj, Umrah, Visit, Transfer, Hotels, Marketing
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-center text-xl font-extrabold" style={{ color: BRAND_GREEN }}>
              فاتورة حجز / سند قبض
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className={infoCell}>
                <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>رقم الفاتورة</p>
                <p className="mt-0.5 text-sm font-extrabold text-black" dir="ltr">#{id}</p>
              </div>
              <div className={infoCell}>
                <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>تاريخ الإصدار</p>
                <p className="mt-0.5 text-sm font-extrabold text-black">
                  {formatDate(new Date().toISOString())}
                </p>
              </div>
              <div className={infoCell}>
                <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>الفرع</p>
                <p className="mt-0.5 text-sm font-extrabold text-black">{branch}</p>
              </div>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-2 text-sm font-extrabold" style={{ color: BRAND_GREEN }}>
                <ReceiptText className="h-4 w-4" />
                بيانات العميل
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className={infoCell}>
                  <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>اسم العميل</p>
                  <p className="mt-0.5 text-sm font-extrabold text-black">
                    {passenger?.fullName || '—'}
                  </p>
                </div>
                <div className={infoCell}>
                  <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>رقم السجل / الاقامة</p>
                  <p className="mt-0.5 text-sm font-extrabold text-black" dir="ltr">
                    {passenger?.documentId || '—'}
                  </p>
                </div>
                <div className={infoCell}>
                  <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>رقم الجوال</p>
                  <p className="mt-0.5 text-sm font-extrabold text-black" dir="ltr">
                    {passenger?.phone || '—'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-2 text-sm font-extrabold" style={{ color: BRAND_GREEN }}>
                <ReceiptText className="h-4 w-4" />
                تفاصيل الحجز
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className={infoCell}>
                  <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>الرحلة</p>
                  <p className="mt-0.5 text-sm font-extrabold text-black">
                    {trip?.tripNumber || '—'} {trip?.destination ? `· ${trip.destination}` : ''}
                  </p>
                </div>
                <div className={infoCell}>
                  <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>تاريخ الرحلة</p>
                  <p className="mt-0.5 text-sm font-extrabold text-black">
                    {formatDate(trip?.departure) || '—'}
                  </p>
                </div>
                <div className={infoCell}>
                  <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>الباقة</p>
                  <p className="mt-0.5 text-sm font-extrabold text-black">
                    {pkg?.name || formatSAR(invoice.perPerson)}
                  </p>
                </div>
              </div>
              {(invoice.roomNumber || invoice.bookingNotes) && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {invoice.roomNumber && (
                    <div className={infoCell}>
                      <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>رقم الغرفة</p>
                      <p className="mt-0.5 text-sm font-extrabold text-black" dir="ltr">
                        {invoice.roomNumber}
                      </p>
                    </div>
                  )}
                  {invoice.bookingNotes && (
                    <div className={`${infoCell} ${invoice.roomNumber ? 'col-span-2' : 'col-span-3'} whitespace-pre-wrap`}>
                      <p className="text-xs font-bold" style={{ color: BRAND_BROWN }}>ملاحظات الحجز</p>
                      <p className="mt-0.5 text-sm font-semibold text-black">
                        {invoice.bookingNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {Array.isArray(invoice.coveredPassengers) &&
              invoice.coveredPassengers.length > 0 && (
                <div>
                  <p
                    className="mb-1.5 flex items-center gap-2 text-sm font-extrabold"
                    style={{ color: BRAND_GREEN }}
                  >
                    <ReceiptText className="h-4 w-4" />
                    المشمولون في هذه الفاتورة ({invoice.coveredPassengers.length})
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {invoice.coveredPassengers.map((cp) => (
                      <div key={cp.id} className={infoCell}>
                        <p
                          className="text-xs font-bold"
                          style={{ color: BRAND_BROWN }}
                        >
                          {cp.isPrimary ? 'رب الأسرة' : 'مرافق'}
                        </p>
                        <p className="mt-0.5 text-sm font-extrabold text-black">
                          {cp.fullName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-extrabold text-white"
                style={{ backgroundColor: BRAND_GREEN }}
              >
                <ReceiptText className="h-4 w-4" />
                الملخص المالي
              </div>
              <div className="px-4 py-1">
                {summaryRows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-baseline justify-between border-b border-dashed border-gray-200 py-1.5 text-sm last:border-b-0"
                  >
                    <span className="font-bold text-gray-800">{r.label}</span>
                    <span className="text-left">
                      <span
                        className={`font-extrabold ${
                          r.green ? 'text-[#4a8b41]' : 'text-black'
                        }`}
                      >
                        {r.value}
                      </span>
                      {r.method && (
                        <span className="mr-2 text-xs font-semibold text-gray-500">
                          (طريقة الدفع: {r.method})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 px-6 pt-1 text-center text-xs">
              <div>
                <div className="h-10 border-b-2 border-dashed border-gray-300" />
                <p className="mt-1.5 font-bold text-gray-600">توقيع الموظف</p>
              </div>
              <div>
                <div className="h-10 border-b-2 border-dashed border-gray-300" />
                <p className="mt-1.5 font-bold text-gray-600">توقيع العميل</p>
              </div>
            </div>
          </div>

          <div className="mt-auto shrink-0 pt-3">
            <PrintFooter />
          </div>
        </div>
      </div>
    </>
  );
}