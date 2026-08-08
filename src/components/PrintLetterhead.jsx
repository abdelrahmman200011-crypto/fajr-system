import { Mail } from 'lucide-react';
import Twitter from './TwitterIcon';

export const BRAND_GREEN = '#4a8b41';
export const BRAND_BROWN = '#713639';
export const BRAND_GOLD = '#d8a45c';

export function PrintHeader({ compact = false, logoClass }) {
  const name = compact ? 'text-2xl' : 'text-4xl';
  const sub = compact ? 'text-sm' : 'text-lg';
  const pad = compact ? 'pb-3 mb-3' : 'pb-4 mb-6';
  const logo = logoClass || (compact ? 'h-20' : 'h-28');
  return (
    <div
      className={`w-full ${pad}`}
      style={{
        borderBottom: `4px solid ${BRAND_GOLD}`,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <div className={`grid grid-cols-3 items-center ${compact ? 'gap-2' : 'gap-4'}`}>
        <div className="text-right">
          <p className={`${name} font-extrabold leading-tight`} style={{ color: BRAND_GREEN }}>
            فجر النسك
          </p>
          <p className={`mt-1 font-bold ${sub}`} style={{ color: BRAND_BROWN }}>
            حج، عمرة، زيارة، نقل، فنادق، تسويق
          </p>
        </div>

        <img
          src={import.meta.env.BASE_URL + 'logo.png'}
          alt="Logo"
          className={`mx-auto w-auto object-contain ${logo}`}
          style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />

        <div className="text-left" dir="ltr">
          <p className={`${name} font-extrabold leading-tight`} style={{ color: BRAND_GREEN }}>
            Fajr Al-Nusk
          </p>
          <p className={`mt-1 font-bold ${sub}`} style={{ color: BRAND_BROWN }}>
            Hajj, Umrah, Visit, Transfer, Hotels, Marketing
          </p>
        </div>
      </div>
    </div>
  );
}

export function PrintFooter() {
  return (
    <div
      className="w-full bg-white pt-3"
      style={{
        borderTop: `4px solid ${BRAND_GOLD}`,
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 py-2 text-xs font-bold text-black">
        <div className="space-y-1">
          <p>المركز الرئيسي : مكة المكرمة برج الصفا الاداري - العزيزية 0555467671</p>
          <p>المدينة المنورة: مجمع الداودية 0555208993</p>
        </div>
        <div className="space-y-1">
          <p>جازان: شارع المطار مقابل مطعم القرموشي 0500545418</p>
          <p>الداير : مقابل فندق الرؤية 0502896918</p>
          <p>صبياء - شارع الملك فيصل : 0580777981</p>
        </div>
      </div>

      <div
        className="flex items-center justify-between rounded-lg px-4 py-1.5 text-xs font-extrabold text-gray-900"
        style={{ backgroundColor: BRAND_GOLD }}
      >
        <span className="flex items-center gap-1.5">الإدارة : 05 093 50032</span>
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