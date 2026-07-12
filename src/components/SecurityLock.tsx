import React, { useState } from 'react';
import { 
  Lock, ShieldAlert, Fingerprint, ShieldCheck, 
  Eye, EyeOff, Mail, KeyRound, ArrowRight, Sparkles 
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils';
import { 
  auth, googleProvider, signInWithPopup, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from '../firebase';

const malkMascot = new URL('../assets/images/malk_mascot_1783709415882.jpg', import.meta.url).href;

interface SecurityLockProps {
  language: Language;
  onUnlocked: () => void;
}

export default function SecurityLock({ language, onUnlocked }: SecurityLockProps) {
  const t = translations[language];
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [loginMode, setLoginMode] = useState<'pin' | 'cloud'>('pin');
  
  // Cloud Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [simulatedBiometric, setSimulatedBiometric] = useState<'none' | 'scanning' | 'success' | 'failed'>('none');

  const CORRECT_PIN = '1234';

  const handleKeyPress = (num: string) => {
    setPinError(false);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin === CORRECT_PIN) {
        setTimeout(() => onUnlocked(), 300);
      } else if (newPin.length === 4) {
        setTimeout(() => {
          setPinError(true);
          setPin('');
        }, 300);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setPinError(false);
  };

  const triggerBiometric = () => {
    setSimulatedBiometric('scanning');
    setTimeout(() => {
      setSimulatedBiometric('success');
      setTimeout(() => {
        onUnlocked();
      }, 500);
    }, 1500);
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onUnlocked();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Google Sign-In failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Email/Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onUnlocked();
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 select-none relative overflow-hidden font-sans">
      {/* Decorative luxury wood golden ambient background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-yellow-600/10 rounded-full blur-[120px]" />

      <div className="max-w-md w-full bg-neutral-900/85 border border-amber-900/30 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center shadow-2xl relative z-10">
        
        {/* Brand Header with Malk Mascot */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="relative mb-3 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity animate-pulse" />
            <img 
              src={malkMascot} 
              alt="Maâlem Malik Mascot" 
              className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 shadow-2xl relative z-10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-neutral-900 border border-amber-500/40 p-1.5 rounded-full z-20 text-amber-500 shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <h1 className="text-xl font-black text-white tracking-wider font-sans uppercase">
            MAÂLEM MALIK PRO
          </h1>
          <p className="text-[10px] text-amber-500 font-mono mt-1 uppercase tracking-widest font-semibold">
            {language === 'ar' ? 'النجارة الفنية والذكاء الاصطناعي' : 'Artisan Woodcraft & Spatial AI'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-neutral-950 p-1 rounded-xl w-full mb-6 border border-neutral-800">
          <button
            onClick={() => { setLoginMode('pin'); setAuthError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'pin' 
                ? 'bg-amber-500 text-neutral-950 font-black' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>🔢</span>
            <span>{language === 'ar' ? 'رمز الدخول PIN' : 'Master PIN'}</span>
          </button>
          <button
            onClick={() => { setLoginMode('cloud'); setPinError(false); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginMode === 'cloud' 
                ? 'bg-amber-500 text-neutral-950 font-black' 
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <span>☁️</span>
            <span>{language === 'ar' ? 'سحابي (Firestore)' : 'Cloud Account'}</span>
          </button>
        </div>

        {/* MODE 1: MASTER PIN ENTRY */}
        {loginMode === 'pin' && (
          <div className="w-full flex flex-col items-center">
            {/* PIN Indicators */}
            <div className="mb-6 flex flex-col items-center">
              <div className="flex gap-4 justify-center mb-3">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 ${
                      pinError
                        ? 'border-red-500 bg-red-500 animate-bounce'
                        : pin.length > index
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-neutral-700 bg-transparent'
                    }`}
                  />
                ))}
              </div>
              
              <div className="h-6">
                {pinError && (
                  <p className="text-red-500 text-[10px] font-mono flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> Incorrect PIN. Try again.
                  </p>
                )}
                {simulatedBiometric === 'scanning' && (
                  <p className="text-amber-500 text-[10px] font-mono animate-pulse">
                    Verifying biometric credentials...
                  </p>
                )}
                {simulatedBiometric === 'success' && (
                  <p className="text-green-500 text-[10px] font-mono flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Access Granted. Welcome.
                  </p>
                )}
                {!pinError && simulatedBiometric === 'none' && (
                  <p className="text-neutral-500 text-[10px] font-mono">
                    Enter master PIN code <span className="text-amber-600/70">(1234)</span>
                  </p>
                )}
              </div>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="w-14 h-14 rounded-full bg-neutral-800/40 hover:bg-neutral-800 active:bg-amber-500/20 text-white font-medium text-lg border border-neutral-800/60 active:border-amber-500/50 flex items-center justify-center transition-all cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="w-14 h-14 rounded-full text-neutral-400 hover:text-white text-[10px] font-mono flex items-center justify-center cursor-pointer"
              >
                CLEAR
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="w-14 h-14 rounded-full bg-neutral-800/40 hover:bg-neutral-800 active:bg-amber-500/20 text-white font-medium text-lg border border-neutral-800/60 active:border-amber-500/50 flex items-center justify-center transition-all cursor-pointer"
              >
                0
              </button>
              <button
                onClick={triggerBiometric}
                className="w-14 h-14 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/20 cursor-pointer"
                title="Simulate Fingerprint / Face ID"
              >
                <Fingerprint className="w-5.5 h-5.5" />
              </button>
            </div>
          </div>
        )}

        {/* MODE 2: FIREBASE EMAIL / PASSWORD CLOUD AUTH */}
        {loginMode === 'cloud' && (
          <form onSubmit={handleEmailAuth} className="w-full space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-neutral-400 block uppercase">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-neutral-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@workshop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 pl-9 pr-3 py-2 text-xs rounded-xl text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono text-neutral-400 block uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[9px] font-mono text-amber-500 hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-neutral-500">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 pl-9 pr-3 py-2 text-xs rounded-xl text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {authError && (
              <p className="text-red-500 text-[10px] font-mono leading-relaxed bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
                ⚠️ {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-55 active:scale-[0.98] cursor-pointer"
            >
              {authLoading ? (
                <span className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? (language === 'ar' ? 'إنشاء حساب جديد' : 'Register Account') : (language === 'ar' ? 'دخول آمن' : 'Secure Login')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
                className="text-[10px] font-mono text-amber-500 hover:underline"
              >
                {isRegistering 
                  ? (language === 'ar' ? 'لديك حساب بالفعل؟ سجل الدخول' : 'Already have an account? Sign in') 
                  : (language === 'ar' ? 'حساب جديد؟ اضغط هنا للتسجيل' : "New workspace? Create an account")}
              </button>
            </div>
          </form>
        )}

        {/* Social Logins & Guest Mode */}
        <div className="w-full space-y-2.5 border-t border-neutral-800/60 pt-5 mt-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{language === 'ar' ? 'الدخول بحساب Google' : 'Sign in with Google'}</span>
          </button>

          <button
            onClick={onUnlocked}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-black text-xs transition-all cursor-pointer shadow-sm active:scale-[0.98] text-center"
          >
            {language === 'ar' ? 'الدخول كزائر (بدون حساب)' : 'Guest Mode (Quick Access)'}
          </button>
        </div>

        {/* Extra Security Context Info */}
        <div className="w-full pt-4 mt-2 text-center flex flex-col gap-2">
          <div className="flex justify-center gap-6 text-[10px] text-neutral-500 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {t.offlineMode}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              {t.cloudSync}
            </span>
          </div>
          <p className="text-[9px] text-neutral-600 font-sans leading-relaxed">
            Authorized workshop personnel only. All changes automatically synced with Cloud Firestore.
          </p>
        </div>
      </div>
    </div>
  );
}
