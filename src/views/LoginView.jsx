import { useState } from 'react';
import { Building2, Store, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const BRANCHES = [
  {
    user: { username: 'dair', branch: 'الداير', role: 'user' },
    label: 'فرع الداير',
    icon: Building2,
    description: 'مقر الفرع الرئيسي',
  },
  {
    user: { username: 'jazami', branch: 'جازان', role: 'user' },
    label: 'فرع جازان',
    icon: Store,
    description: 'فرع جازان',
  },
];

export default function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  const submitAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    if (!email.trim() || !password) {
      setAdminError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }
    setSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      const sessionEmail = auth.currentUser?.email || email.trim();
      onLogin({
        username: 'admin',
        branch: 'الإدارة العامة',
        role: 'admin',
        email: sessionEmail,
      });
    } catch {
      setAdminError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 bg-islamic-pattern bg-pattern-sm p-4">
      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl sm:p-10">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-xl shadow-emerald-900/15 ring-1 ring-emerald-100">
              <img
                src={import.meta.env.BASE_URL + 'logo.png'}
                alt="فجر النسك"
                className="h-16 w-16 object-contain"
              />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold text-emerald-800">
              فجر النسك
            </h1>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              الرجاء اختيار الفرع أو تسجيل دخول الإدارة للمتابعة
            </p>
          </div>

          {/* Branch selection */}
          <div className="grid grid-cols-1 gap-4">
            {BRANCHES.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => onLogin(b.user)}
                className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-right shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-700/10"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-700/20 transition-transform duration-200 group-hover:scale-105">
                  <b.icon className="h-7 w-7" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 text-right">
                  <span className="block text-lg font-extrabold text-gray-900 transition-colors group-hover:text-emerald-700">
                    {b.label}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-gray-400">
                    <b.icon className="h-3.5 w-3.5" />
                    {b.description}
                  </span>
                </span>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-all duration-200 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <ArrowLeft className="h-5 w-5" />
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
              <ShieldCheck className="h-4 w-4" />
              أو تسجيل دخول الإدارة
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Admin login */}
          <form onSubmit={submitAdmin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                البريد الإلكتروني للإدارة
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fajr.com"
                  dir="ltr"
                  className="input-field pr-11 text-left"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                كلمة المرور
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="input-field pr-11 text-left"
                />
              </div>
            </div>

            {adminError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-600">
                {adminError}
              </p>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-slate-700 to-slate-900 py-3 text-base font-extrabold text-white shadow-lg shadow-slate-900/25 transition hover:from-slate-800 hover:to-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-5 w-5" />
              {signingIn ? 'جارٍ التحقق...' : 'دخول كمدير'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs font-medium text-gray-400">
          © 2026 فجر النسك لخدمات الحج والعمرة — الصلاحيات الكاملة متاحة لمدير
          النظام فقط
        </p>
      </div>
    </div>
  );
}