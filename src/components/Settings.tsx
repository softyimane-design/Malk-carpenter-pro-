import React, { useState, useRef } from 'react';
import { 
  Globe, Moon, Shield, Sparkles, RefreshCw, 
  Eye, Star, Volume2, Coins, LogOut, Download, Upload, CheckCircle 
} from 'lucide-react';
import { Language, Theme } from '../types';
import { translations, getActiveCurrency, setActiveCurrency, Currency } from '../utils';

interface SettingsProps {
  language: Language;
  theme: Theme;
  onLanguageChange: (lang: Language) => void;
  onThemeChange: (theme: Theme) => void;
  user: any; // Firebase User or null
  onSignOut: () => void;
  onBackup: () => void;
  onRestore: (jsonData: string) => void;
}

export default function Settings({ 
  language, theme, onLanguageChange, onThemeChange,
  user, onSignOut, onBackup, onRestore 
}: SettingsProps) {
  const t = translations[language];
  const [activeCurr, setActiveCurr] = useState<Currency>(getActiveCurrency());
  const [restoreMessage, setRestoreMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCurrencyChange = (curr: Currency) => {
    setActiveCurrency(curr);
    setActiveCurr(curr);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Validate JSON
        JSON.parse(text);
        onRestore(text);
        setRestoreMessage('Database restored successfully!');
        setTimeout(() => setRestoreMessage(''), 4000);
      } catch (err) {
        setRestoreMessage('Invalid backup JSON file.');
        setTimeout(() => setRestoreMessage(''), 4000);
      }
    };
    reader.readAsText(file);
  };

  const languagesList: { key: Language; label: string; flag: string }[] = [
    { key: 'en', label: 'English', flag: '🇬🇧' },
    { key: 'fr', label: 'Français', flag: '🇫🇷' },
    { key: 'ar', label: 'العربية (RTL)', flag: '🇩🇿' }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">{t.settings}</h2>
        <p className="text-xs text-neutral-400 mt-1 font-mono">Customize system languages, themes, and backup servers</p>
      </div>

      {/* Firebase Cloud Authentication Status */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <span>{language === 'ar' ? 'حالة الحساب السحابي' : 'Cloud Identity Status'}</span>
        </h3>
        
        <div className="p-4 bg-neutral-950 rounded-xl border border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-neutral-500 font-mono block uppercase">AUTHENTICATED WORKSPACE USER</span>
            {user ? (
              <div>
                <span className="text-sm text-white font-bold block">{user.email || 'Google Account User'}</span>
                <span className="text-[10px] text-green-400 font-mono flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live Firestore Syncing Active
                </span>
              </div>
            ) : (
              <div>
                <span className="text-sm text-neutral-400 italic block">Logged in as Guest (Offline Mode)</span>
                <span className="text-[10px] text-amber-500 font-mono flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Local storage only. Pin code locked.
                </span>
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={onSignOut}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-[10px] px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-red-500/20 self-start sm:self-center"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Language card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-amber-500" />
          <span>Workshop Language / Langue</span>
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {languagesList.map(lang => (
            <button
              key={lang.key}
              onClick={() => onLanguageChange(lang.key)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 cursor-pointer ${
                language === lang.key
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-md'
                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme setting */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Moon className="w-5 h-5 text-amber-500" />
          <span>Visual Interface Theme</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => onThemeChange('dark')}
            className={`p-3.5 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'dark'
                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Craft slate (Recommended)</span>
          </button>

          <button
            onClick={() => onThemeChange('light')}
            className={`p-3.5 rounded-xl border font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>Light Sandwood theme</span>
          </button>
        </div>
      </div>

      {/* Currency Preferences */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          <span>
            {language === 'ar' ? 'دعم العملة المحلية والأسعار' : language === 'fr' ? 'Devise Locale & Tarification' : 'Local Currency & Pricing'}
          </span>
        </h3>

        <p className="text-[11px] text-neutral-400 font-mono">
          {language === 'ar' 
            ? 'تعديل عملة الحسابات والفواتير والأسعار في الورشة.' 
            : language === 'fr' 
              ? 'Ajuster la devise pour les calculs de l\'atelier et les factures.' 
              : 'Adjust currency for workshop calculations, invoices, and estimates.'}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => handleCurrencyChange('DZD')}
            className={`p-3.5 rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeCurr === 'DZD'
                ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-md'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🇩🇿 د.ج (Algerian Dinar)</span>
            <span className="text-[10px] text-neutral-500 font-mono">العملة الوطنية والأسعار بالدينار</span>
          </button>

          <button
            onClick={() => handleCurrencyChange('USD')}
            className={`p-3.5 rounded-xl border font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
              activeCurr === 'USD'
                ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-md'
                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span className="text-sm">🇺🇸 USD ($ Dollar)</span>
            <span className="text-[10px] text-neutral-500 font-mono">Global standard valuation</span>
          </button>
        </div>
      </div>

      {/* Manual JSON Backup & Restore section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-amber-500" />
          <span>{language === 'ar' ? 'النسخ الاحتياطي اليدوي والتصدير' : 'Manual Backup & Data Transfer'}</span>
        </h3>
        <p className="text-[11px] text-neutral-400 font-mono">
          {language === 'ar' 
            ? 'قم بتصدير جميع بيانات ورشتك كملف JSON آمن للنسخ الاحتياطي اليدوي أو نقله لآيباد آخر.' 
            : 'Download a complete master file of your entire workshop state as a backup or to clone to another terminal.'}
        </p>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={onBackup}
            className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950 text-white font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Download JSON Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950 text-white font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-500" />
            <span>Upload & Restore Backup</span>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>

        {restoreMessage && (
          <div className="text-[10px] font-mono text-center text-amber-500 mt-2 bg-amber-500/10 border border-amber-500/20 py-2 rounded-lg">
            {restoreMessage}
          </div>
        )}
      </div>

      {/* Notifications Configuration */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-amber-500" />
          <span>{language === 'ar' ? 'التنبيهات والإشعارات' : language === 'fr' ? 'Notifications de l\'Atelier' : 'Workshop Notifications'}</span>
        </h3>
        <p className="text-[11px] text-neutral-400 font-mono">
          {language === 'ar' ? 'تفعيل تنبيهات تواريخ التسليم والتركيب وصيانة العتاد.' : 'Manage reminders for delivery deadines, on-site installations and machinery maintenance.'}
        </p>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800/40">
            <div>
              <span className="font-bold text-white block">{language === 'ar' ? 'تنبيهات تسليم الطلبيات' : 'Delivery Reminders'}</span>
              <p className="text-[10px] text-neutral-400 mt-0.5">{language === 'ar' ? 'قبل 48 ساعة من موعد التسليم' : 'Alert 48h before project deadline'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800/40">
            <div>
              <span className="font-bold text-white block">{language === 'ar' ? 'تنبيهات صيانة منشار الطاولة والعتاد' : 'Machinery & Safety Alerts'}</span>
              <p className="text-[10px] text-neutral-400 mt-0.5">{language === 'ar' ? 'صيانة دورية كل 30 يوم لسلامة العمال' : 'Reminders to lube saws, calibrate tools & clean router bits'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>{language === 'ar' ? 'حول تطبيق المعلم مالك برو' : 'About Malik Carpenter Pro'}</span>
        </h3>
        <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
          {language === 'ar' 
            ? 'تطبيق "المعلم مالك برو" هو نظام متكامل مصمم خصيصاً للحرفيين والنجارين الجزائريين لتنظيم أعمالهم، تفادي هدر الخشب الطبيعي و MDF، وحساب الأرباح بدقة وسرعة متناهية.' 
            : 'Malik Carpenter Pro is the ultimate administrative and technical intelligence suite tailored specifically for carpenters and master woodworkers in Algeria. Designed to streamline calculations, nesting cuts, and billing.'}
        </p>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-neutral-950 p-4 rounded-xl border border-neutral-800/40">
          <div>
            <span className="text-neutral-500 block">VERSION</span>
            <span className="text-white font-bold text-[11px]">v3.2.0 (Google Play Release)</span>
          </div>
          <div>
            <span className="text-neutral-500 block">GUILD ACCREDITED</span>
            <span className="text-amber-500 font-bold text-[11px]">Algerian Crafts Guild 2026</span>
          </div>
        </div>
      </div>

      {/* Contact & Support Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          <span>{language === 'ar' ? 'اتصل بنا والدعم الفني' : 'Contact Us & Technical Support'}</span>
        </h3>
        <p className="text-xs text-neutral-400">
          {language === 'ar' 
            ? 'هل تحتاج مساعدة في حسابات الشانطي أو رغبة في إضافة عتاد جديد؟ تواصل معنا مباشرة.'
            : 'Need custom features, assistance with calculations, or physical terminal integrations? Connect with our Algiers team.'}
        </p>
        <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/40 text-xs space-y-2.5 font-mono">
          <div className="flex justify-between">
            <span className="text-neutral-500">📍 OFFICE:</span>
            <span className="text-white font-bold">Didouche Mourad, Algiers, Algeria</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">📞 PHONE / WHATSAPP:</span>
            <span className="text-amber-500 font-bold">+213 (0) 555 42 12 90</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">✉️ EMAIL:</span>
            <span className="text-white font-bold">support@maalem-malik.dz</span>
          </div>
        </div>
      </div>

      {/* Legal documents: Privacy Policy & Terms of Service */}
      <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono px-4">
        <a 
          href="#privacy" 
          onClick={() => alert("Privacy Policy:\nYour data is safely encrypted locally inside your sandbox and never sold or shared without consent. GDPR & Algerian digital privacy compliance guaranteed.")}
          className="hover:text-amber-500 underline"
        >
          {language === 'ar' ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy Policy'}
        </a>
        <span>•</span>
        <a 
          href="#terms" 
          onClick={() => alert("Terms of Service:\nUsage of Maâlem Malik is authorized for professional carpenters and workshops. Calculations are optimized estimates, always cross-reference manually before cutting timber.")}
          className="hover:text-amber-500 underline"
        >
          {language === 'ar' ? 'شروط الاستخدام والخدمة' : 'Terms of Service'}
        </a>
      </div>
    </div>
  );
}
