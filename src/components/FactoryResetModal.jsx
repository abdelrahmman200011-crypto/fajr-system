import { useState } from 'react';
import { X, AlertTriangle, KeyRound, Loader, CircleCheck, Trash2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function FactoryResetModal({ onClose, onReset, adminEmail }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);

  const close = () => {
    if (verifying) return;
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('يرجى إدخال كلمة المرور للتأكيد');
      return;
    }
    setVerifying(true);
    try {
      const email = auth.currentUser?.email || adminEmail;
      if (!email) {
        setVerifying(false);
        setError('تعذر العثور على حساب المدير الحالي — أعد تسجيل الدخول');
        return;
      }
      await signInWithEmailAndPassword(auth, email, password);
      await onReset();
      setVerifying(false);
      setDone(true);
      setPassword('');
    } catch {
      setVerifying(false);
      setError('كلمة المرور غير صحيحة — لم تتم إعادة الضبط');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={close}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(10,61,46,0.25)] sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-1 ring-red-200">
            {done ? (
              <CircleCheck className="h-7 w-7" />
            ) : (
              <AlertTriangle className="h-7 w-7" />
            )}
          </span>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div>
            <h3 className="text-lg font-extrabold text-emerald-700">
              تمت إعادة ضبط المصنع بنجاح
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              تم حذف جميع الفنادق والرحلات والمسافرين والفواتير نهائياً من
              النظام.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-2xl bg-gradient-to-l from-primary-green to-primary-green-deep px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-primary-green/20"
            >
              حسناً
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-red-600">
                إعادة ضبط المصنع
              </h3>
              <p className="mt-1.5 text-sm font-semibold text-slate-500">
                سيتم حذف جميع الفنادق، الرحلات، المسافرين، والفواتير بشكل نهائي
                ولا يمكن التراجع عن هذه العملية.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                أدخل كلمة مرور المدير للتأكيد
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-3 pr-11 text-left text-sm font-semibold text-slate-800 outline-none transition focus:border-primary-green focus:bg-white focus:ring-4 focus:ring-primary-green/10"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-600">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={verifying}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-red-600 to-red-700 py-3 text-sm font-extrabold text-white shadow-lg shadow-red-700/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifying ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    جارٍ التأكيد والحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    نعم، احذف كل شيء نهائياً
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={close}
                disabled={verifying}
                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
