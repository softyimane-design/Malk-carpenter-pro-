import React from 'react';
import { TrendingUp, DollarSign, Users, PackageOpen, AlertTriangle, Hammer, Calendar, ArrowUpRight, ArrowUpRight as ArrowUpRightIcon, Plus, Camera, Sparkles, FileText, Receipt } from 'lucide-react';
import { Language, Customer, Project, InventoryItem } from '../types';
import { translations, formatCurrency } from '../utils';

const malkMascot = new URL('../assets/images/malk_mascot_1783709415882.jpg', import.meta.url).href;

interface DashboardProps {
  language: Language;
  customers: Customer[];
  projects: Project[];
  inventory: InventoryItem[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ language, customers, projects, inventory, onNavigate }: DashboardProps) {
  const t = translations[language];

  // Interactive Chart state
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [chartMode, setChartMode] = React.useState<'combined' | 'profit'>('combined');

  // Calculations
  const activeProjectsCount = projects.filter(p => p.status !== 'completed').length;
  
  // Outstanding balances calculation
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPaid, 0) + totalOutstanding;
  const totalExpenses = projects.reduce((sum, p) => sum + p.expenses, 0) + 12400; // adding overheads
  const netProfit = totalRevenue - totalExpenses;

  // Alerts: inventory below minQuantity
  const lowStockItems = inventory.filter(item => item.stock <= item.minQuantity);

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 160;

  // Monthly Revenue data (simulated for last 6 months)
  const revenueTrend = [
    { month: 'Jan', rev: 45000, exp: 12000 },
    { month: 'Feb', rev: 60000, exp: 18000 },
    { month: 'Mar', rev: 55000, exp: 15000 },
    { month: 'Apr', rev: 72000, exp: 22000 },
    { month: 'May', rev: 85000, exp: 28000 },
    { month: 'Jun', rev: 120000, exp: 45000 }
  ];

  const maxVal = Math.max(...revenueTrend.map(d => d.rev));
  const points = revenueTrend.map((d, i) => {
    const x = (i / (revenueTrend.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.rev / maxVal) * (chartHeight - 40) - 20;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `20,${chartHeight - 20} ` + points + ` ${chartWidth - 20},${chartHeight - 20}`;

  // Fallback project images by type
  const getProjectFallbackImage = (type: string) => {
    const t = type ? type.toLowerCase() : '';
    if (t.includes('kitchen') || t.includes('مطبخ') || t.includes('cuis')) {
      return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=250';
    }
    if (t.includes('wardrobe') || t.includes('خزانة') || t.includes('plac') || t.includes('bed') || t.includes('غرفة') || t.includes('خشب')) {
      return 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=250';
    }
    if (t.includes('table') || t.includes('طاولة') || t.includes('tabl')) {
      return 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=250';
    }
    if (t.includes('chair') || t.includes('كرسي') || t.includes('chaise')) {
      return 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=250';
    }
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=250';
  };

  // Status to completion % mapping
  const getProjectProgressPercent = (status: string) => {
    switch (status ? status.toLowerCase() : '') {
      case 'completed': return 100;
      case 'painting': return 85;
      case 'assembly': return 65;
      case 'cutting': return 35;
      case 'pending': return 10;
      default: return 50;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Mascot Welcome Header */}
      <div className="bg-white border border-amber-500/15 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        {/* Ambient premium glowing backdrops */}
        <div className="absolute top-[-30%] left-[-10%] w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-60 h-60 bg-green-500/5 rounded-full blur-[70px] pointer-events-none" />
        
        {/* Redesigned 120px AI Mascot with floating, glow and shadow */}
        <div className="relative flex-shrink-0 animate-float z-10">
          <div className="absolute inset-[-4px] bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full blur-md opacity-70 animate-pulse" />
          <div className="relative w-[120px] h-[120px] rounded-full p-1 bg-white border-2 border-amber-500 shadow-premium-orange">
            <img 
              src={malkMascot} 
              alt="Maâlem Malik" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute bottom-1 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full z-20 shadow-sm" />
        </div>

        {/* Text Greeting with localized premium message */}
        <div className="flex-1 text-center md:text-left space-y-2 z-10">
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight leading-none">
            {language === 'ar' ? 'مرحبًا مالك 👋' : language === 'fr' ? 'Bonjour Malik 👋' : 'Welcome Malik 👋'}
          </h2>
          <h3 className="text-lg font-bold text-amber-600">
            {language === 'ar' ? 'جاهز لإدارة ورشتك بذكاء؟' : language === 'fr' ? 'Prêt à gérer votre atelier intelligemment ?' : 'Ready to manage your workshop with intelligence?'}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl font-sans">
            {language === 'ar' 
              ? 'احسب التكاليف، أنشئ الفواتير، تابع المشاريع، واستعن بالذكاء الاصطناعي في مكان واحد.'
              : language === 'fr'
              ? 'Estimez les coûts, créez des factures, suivez les projets et utilisez l\'IA au même endroit.'
              : 'Calculate costs, generate invoices, track projects, and consult the AI in one central hub.'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2 text-[10px] font-mono text-neutral-400">
            <span className="bg-amber-500/10 text-amber-700 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              {language === 'ar' ? 'نمط العمل دون اتصال' : 'Offline Engine Active'}
            </span>
            <span className="bg-green-500/10 text-green-700 px-2.5 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
              {language === 'ar' ? 'نسخ احتياطي تلقائي' : 'Auto Backup Secure'}
            </span>
          </div>
        </div>

        {/* Quick action button pointing to the Assistant */}
        <button
          onClick={() => onNavigate('assistant')}
          className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2 font-mono"
        >
          <span>{language === 'ar' ? 'مساعد المعلّم مالك الذكي' : 'Malik Assistant'}</span>
          <ArrowUpRightIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Large Premium Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => onNavigate('projects')}
          className="bg-white hover:bg-amber-500/5 border border-amber-500/20 hover:border-amber-500 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-5.5 h-5.5" />
          </div>
          <span className="text-xs font-bold text-neutral-800">
            {language === 'ar' ? 'مشروع جديد' : language === 'fr' ? 'Nouveau Projet' : 'New Project'}
          </span>
          <span className="text-[10px] text-neutral-400 font-sans hidden sm:inline">
            {language === 'ar' ? 'إضافة مخطط ودفتر شروط' : 'Add custom timber specs'}
          </span>
        </button>

        <button 
          onClick={() => onNavigate('scanner')}
          className="bg-white hover:bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-5.5 h-5.5" />
          </div>
          <span className="text-xs font-bold text-neutral-800">
            {language === 'ar' ? 'مسح الورشة بالـ كاميرا' : language === 'fr' ? 'Scanner Atelier' : 'Scan Workshop'}
          </span>
          <span className="text-[10px] text-neutral-400 font-sans hidden sm:inline">
            {language === 'ar' ? 'قياس ذكي تفاديًا للهدر' : 'AI Room Dimensioning'}
          </span>
        </button>

        <button 
          onClick={() => onNavigate('assistant')}
          className="bg-white hover:bg-purple-500/5 border border-purple-500/20 hover:border-purple-500 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <span className="text-xs font-bold text-neutral-800">
            {language === 'ar' ? 'اسأل مساعد مالك الذكي' : language === 'fr' ? 'Demander à Malik AI' : 'Ask Malik AI'}
          </span>
          <span className="text-[10px] text-neutral-400 font-sans hidden sm:inline">
            {language === 'ar' ? 'حساب خشب وتفصال مثالي' : 'Timber nesting optimizer'}
          </span>
        </button>

        <button 
          onClick={() => onNavigate('invoices')}
          className="bg-white hover:bg-blue-500/5 border border-blue-500/20 hover:border-blue-500 p-4.5 rounded-2xl shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-2 group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-5.5 h-5.5" />
          </div>
          <span className="text-xs font-bold text-neutral-800">
            {language === 'ar' ? 'إنشاء فاتورة' : language === 'fr' ? 'Créer Facture' : 'Create Invoice'}
          </span>
          <span className="text-[10px] text-neutral-400 font-sans hidden sm:inline">
            {language === 'ar' ? 'فاتورة مع رمز QR جاهزة' : 'Generate branded PDF'}
          </span>
        </button>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Revenue Card with Sparkline */}
        <div className="bg-white border border-amber-500/10 rounded-2xl p-5 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-4 right-4 p-3 bg-amber-500/10 rounded-xl text-amber-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">{t.revenue}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            {formatCurrency(totalRevenue, language)}
          </p>
          
          {/* Sparkline Chart */}
          <div className="mt-4 h-8 flex items-end justify-between gap-1 w-full opacity-80">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M 0 25 Q 15 15 30 20 T 60 5 T 90 10 L 100 5 L 100 30 L 0 30 Z" fill="rgba(245, 158, 11, 0.1)" />
              <path d="M 0 25 Q 15 15 30 20 T 60 5 T 90 10 L 100 5" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-green-600 mt-2 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.8% {language === 'ar' ? 'الشهر الحالي' : 'vs last month'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-500" />
        </div>

        {/* Expenses Card with Sparkline */}
        <div className="bg-white border border-amber-500/10 rounded-2xl p-5 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-4 right-4 p-3 bg-red-500/10 rounded-xl text-red-500">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">{t.expenses}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            {formatCurrency(totalExpenses, language)}
          </p>

          {/* Sparkline Chart */}
          <div className="mt-4 h-8 flex items-end justify-between gap-1 w-full opacity-80">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M 0 10 Q 20 20 40 15 T 70 25 T 100 18 L 100 30 L 0 30 Z" fill="rgba(239, 68, 68, 0.1)" />
              <path d="M 0 10 Q 20 20 40 15 T 70 25 T 100 18" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-2 font-mono">
            <span>{language === 'ar' ? 'سلعة + تكاليف الورشة' : 'Material costs + Overheads'}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-red-500" />
        </div>

        {/* Profit Card with Sparkline */}
        <div className="bg-white border border-amber-500/10 rounded-2xl p-5 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-4 right-4 p-3 bg-green-500/10 rounded-xl text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">{t.profit}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            {formatCurrency(netProfit, language)}
          </p>

          {/* Sparkline Chart */}
          <div className="mt-4 h-8 flex items-end justify-between gap-1 w-full opacity-80">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M 0 25 Q 15 10 40 8 T 80 5 L 100 2 L 100 30 L 0 30 Z" fill="rgba(16, 185, 129, 0.1)" />
              <path d="M 0 25 Q 15 10 40 8 T 80 5 L 100 2" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-green-600 mt-2 font-mono">
            <span>Margin: {((netProfit / totalRevenue) * 100).toFixed(1)}%</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-green-500" />
        </div>

        {/* Active Projects Card with Sparkline */}
        <div className="bg-white border border-amber-500/10 rounded-2xl p-5 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all">
          <div className="absolute top-4 right-4 p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <Hammer className="w-6 h-6" />
          </div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">{t.activeProjects}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-2 font-mono">
            {activeProjectsCount}
          </p>

          {/* Sparkline Chart */}
          <div className="mt-4 h-8 flex items-end justify-between gap-1 w-full opacity-80">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M 0 20 Q 25 15 50 18 T 100 10 L 100 30 L 0 30 Z" fill="rgba(59, 130, 246, 0.1)" />
              <path d="M 0 20 Q 25 15 50 18 T 100 10" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-2 font-mono">
            <span>{projects.length - activeProjectsCount} completed total</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500" />
        </div>

      </div>

      {/* Main Grid: Telemetry Charts & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 lg:col-span-2 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                {language === 'ar' ? 'التحليلات والمبيعات الذكية 📊' : 'Workshop Sales Telemetry'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {language === 'ar' ? 'مقارنة المداخيل مع المصاريف والربح الصافي' : 'Monthly earnings compared with operational overheads'}
              </p>
            </div>
            
            {/* View Mode Switcher */}
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setChartMode('combined')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  chartMode === 'combined'
                    ? 'bg-amber-500 text-neutral-950'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'المداخيل والمصاريف' : 'Revenue & Expenses'}
              </button>
              <button
                onClick={() => setChartMode('profit')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  chartMode === 'profit'
                    ? 'bg-green-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {language === 'ar' ? 'صافي الأرباح' : 'Net Profit Trend'}
              </button>
            </div>
          </div>

          {/* Custom Interactive SVG Line & Area Chart */}
          <div className="w-full h-44 overflow-hidden relative" onMouseLeave={() => setHoveredIndex(null)}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="20" y1="20" x2={chartWidth - 20} y2="20" stroke="#262626" strokeWidth="1" strokeDasharray="3" />
              <line x1="20" y1="60" x2={chartWidth - 20} y2="60" stroke="#262626" strokeWidth="1" strokeDasharray="3" />
              <line x1="20" y1="100" x2={chartWidth - 20} y2="100" stroke="#262626" strokeWidth="1" strokeDasharray="3" />
              <line x1="20" y1="140" x2={chartWidth - 20} y2="140" stroke="#404040" strokeWidth="1" />

              {chartMode === 'combined' ? (
                <>
                  {/* Expense Column Bars */}
                  {revenueTrend.map((d, i) => {
                    const x = (i / (revenueTrend.length - 1)) * (chartWidth - 40) + 20;
                    const barWidth = 14;
                    const barHeight = (d.exp / maxVal) * (chartHeight - 40);
                    const y = chartHeight - barHeight - 20;
                    return (
                      <rect
                        key={`bar-${i}`}
                        x={x - barWidth / 2}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill="#3f3f46"
                        stroke="#71717a"
                        strokeWidth="1"
                        rx="2"
                        className="transition-all duration-300 opacity-60"
                      />
                    );
                  })}

                  {/* Revenue Area & Line */}
                  <polygon 
                    points={`20,${chartHeight - 20} ` + points + ` ${chartWidth - 20},${chartHeight - 20}`} 
                    fill="url(#revenueGrad)" 
                  />
                  <polyline 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    points={points} 
                  />

                  {/* Dots with dynamic hover scale */}
                  {revenueTrend.map((d, i) => {
                    const x = (i / (revenueTrend.length - 1)) * (chartWidth - 40) + 20;
                    const y = chartHeight - (d.rev / maxVal) * (chartHeight - 40) - 20;
                    const isHovered = hoveredIndex === i;
                    return (
                      <g key={`dot-${i}`}>
                        <circle 
                          cx={x} 
                          cy={y} 
                          r={isHovered ? 7 : 4} 
                          fill="#FFFFFF" 
                          stroke="#f59e0b" 
                          strokeWidth="2" 
                          className="transition-all duration-150"
                        />
                        <circle cx={x} cy={y} r="1.5" fill="#f59e0b" />
                      </g>
                    );
                  })}
                </>
              ) : (
                <>
                  {/* Profit Trend view */}
                  {(() => {
                    const profitPoints = revenueTrend.map((d, i) => {
                      const x = (i / (revenueTrend.length - 1)) * (chartWidth - 40) + 20;
                      const profit = d.rev - d.exp;
                      const y = chartHeight - (profit / maxVal) * (chartHeight - 40) - 20;
                      return `${x},${y}`;
                    }).join(' ');

                    const profitArea = `20,${chartHeight - 20} ` + profitPoints + ` ${chartWidth - 20},${chartHeight - 20}`;

                    return (
                      <>
                        <polygon points={profitArea} fill="url(#profitGrad)" />
                        <polyline 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="3" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          points={profitPoints} 
                        />
                        {revenueTrend.map((d, i) => {
                          const x = (i / (revenueTrend.length - 1)) * (chartWidth - 40) + 20;
                          const profit = d.rev - d.exp;
                          const y = chartHeight - (profit / maxVal) * (chartHeight - 40) - 20;
                          const isHovered = hoveredIndex === i;
                          return (
                            <g key={`profit-dot-${i}`}>
                              <circle 
                                cx={x} 
                                cy={y} 
                                r={isHovered ? 7 : 4} 
                                fill="#FFFFFF" 
                                stroke="#10b981" 
                                strokeWidth="2" 
                                className="transition-all duration-150"
                              />
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </>
              )}

              {/* Dynamic Interactive Slice Lines & Hover Triggers */}
              {hoveredIndex !== null && (
                <line
                  x1={(hoveredIndex / (revenueTrend.length - 1)) * (chartWidth - 40) + 20}
                  y1="10"
                  x2={(hoveredIndex / (revenueTrend.length - 1)) * (chartWidth - 40) + 20}
                  y2={chartHeight - 20}
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  strokeDasharray="2"
                />
              )}

              {/* Invisible interactive vertical segments */}
              {revenueTrend.map((d, i) => {
                const x = (i / (revenueTrend.length - 1)) * (chartWidth - 40) + 20;
                const segmentWidth = chartWidth / revenueTrend.length;
                return (
                  <rect
                    key={`trigger-${i}`}
                    x={x - segmentWidth / 2}
                    y="0"
                    width={segmentWidth}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                  />
                );
              })}
            </svg>
          </div>

          {/* Interactive Tooltip Card overlay on hover */}
          {hoveredIndex !== null && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-neutral-950/95 border border-neutral-800 p-3 rounded-xl shadow-2xl z-20 flex gap-4 text-[10px] backdrop-blur-md animate-fade-in">
              <div>
                <span className="text-neutral-500 font-mono block uppercase">Month</span>
                <span className="text-white font-bold">{revenueTrend[hoveredIndex].month}</span>
              </div>
              <div className="border-l border-neutral-800 pl-3">
                <span className="text-amber-500 font-mono block uppercase">Revenue</span>
                <span className="text-white font-bold font-mono">{formatCurrency(revenueTrend[hoveredIndex].rev, language)}</span>
              </div>
              <div className="border-l border-neutral-800 pl-3">
                <span className="text-neutral-400 font-mono block uppercase">Expenses</span>
                <span className="text-white font-bold font-mono">{formatCurrency(revenueTrend[hoveredIndex].exp, language)}</span>
              </div>
              <div className="border-l border-neutral-800 pl-3">
                <span className="text-green-400 font-mono block uppercase">Profit</span>
                <span className="text-green-400 font-bold font-mono">
                  {formatCurrency(revenueTrend[hoveredIndex].rev - revenueTrend[hoveredIndex].exp, language)}
                </span>
              </div>
            </div>
          )}

          {/* Month labels */}
          <div className="flex justify-between px-5 text-xs text-neutral-500 font-mono mt-2">
            {revenueTrend.map((d, i) => (
              <span key={i} className={`transition-all ${hoveredIndex === i ? 'text-amber-500 font-bold' : ''}`}>
                {d.month}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-white tracking-wide">Workshop Status</h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-mono">ONLINE</span>
            </div>
            
            <div className="space-y-4">
              
              {/* Stock status indicator */}
              <div className="flex items-center gap-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-800/60">
                <div className={`p-2 rounded-lg ${lowStockItems.length > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.lowStockAlerts}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {lowStockItems.length > 0 
                      ? `${lowStockItems.length} materials currently run below safe levels`
                      : 'All woods, panels & hardwares optimal'
                    }
                  </p>
                </div>
              </div>

              {/* Attendance Tracker */}
              <div className="flex items-center gap-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-800/60">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{t.attendanceRate}</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">92.5% of technicians checked in today</p>
                </div>
              </div>

              {/* Next Delivery calendar */}
              <div className="flex items-center gap-3 p-3 bg-neutral-800/40 rounded-xl border border-neutral-800/60">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Upcoming Installation</h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Youssef Al-Fassi: Walnut Table (July 15)</p>
                </div>
              </div>

            </div>
          </div>

          <button 
            onClick={() => onNavigate('scanner')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-amber-500/10 mt-6"
          >
            <span>Launch AI Scanner</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Recent Projects & AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Projects Card Panel */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {language === 'ar' ? 'المشاريع الأخيرة 🪵' : 'Recent Carpentry Commissions'}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {language === 'ar' ? 'متابعة مراحل التصنيع ونسب الإنجاز لكل عميل' : 'Live timber sizing, assembly, and finishing metrics'}
                </p>
              </div>
              <button 
                onClick={() => onNavigate('projects')}
                className="text-xs text-amber-500 hover:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1 transition-all"
              >
                <span>{language === 'ar' ? 'عرض الكل' : 'View all'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 px-4 bg-neutral-950/40 rounded-2xl border border-dashed border-neutral-800">
                <svg className="w-12 h-12 mx-auto mb-3 text-neutral-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h4 className="text-xs font-bold text-neutral-400">{language === 'ar' ? 'لا توجد مشاريع مسجلة' : 'No active projects yet'}</h4>
                <p className="text-[10px] text-neutral-500 mt-1 max-w-xs mx-auto">
                  {language === 'ar' ? 'قم بإضافة مشروعك الأول لبدء حساب الخامات ومتابعة العمل.' : 'Create your first project to start tracking woodcuts, paint phases, and invoices.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 3).map((p) => {
                  const cust = customers.find(c => c.id === p.customerId);
                  const progress = getProjectProgressPercent(p.status);
                  const image = getProjectFallbackImage(p.type);
                  
                  return (
                    <div 
                      key={p.id} 
                      className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60 hover:border-amber-500/30 hover:bg-neutral-950 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:scale-[1.01]"
                    >
                      {/* Image & Main Info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <img 
                          src={image} 
                          alt={p.name} 
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-800/80 bg-neutral-900 group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                          <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                            👤 {cust ? cust.name : 'Unknown client'} • <span className="font-mono">{p.type}</span>
                          </p>
                        </div>
                      </div>

                      {/* Progress bar in middle */}
                      <div className="flex-1 max-w-xs space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-neutral-500">{language === 'ar' ? 'مستوى الإنجاز' : 'Progress'}</span>
                          <span className="text-amber-500 font-bold">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Right Action/Status Badge */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[100px] text-right">
                        <span className="text-xs font-mono font-bold text-white hidden sm:inline">
                          {formatCurrency(p.budget, language)}
                        </span>
                        <span className={`text-[9px] uppercase font-mono font-bold tracking-wider px-2 py-1 rounded-lg ${
                          p.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          p.status === 'painting' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          p.status === 'assembly' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          p.status === 'cutting' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-neutral-800 text-neutral-400 border border-neutral-700/60'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Malik AI Smart Insights & Advisories */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'ar' ? 'توصيات مالك بالذكاء الاصطناعي ✨' : 'Malik AI Intelligence Insights'}
              </h3>
              <p className="text-[10px] text-amber-500 font-mono tracking-widest uppercase">Predictive Workshop Diagnostics</p>
            </div>
          </div>

          <div className="space-y-3.5 text-[11px] leading-relaxed">
            
            {/* Dynamic Sizing Tip */}
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-850 hover:border-amber-500/20 transition-all">
              <div className="flex gap-2.5">
                <span className="text-sm">📏</span>
                <div>
                  <span className="text-white font-bold block mb-0.5">
                    {language === 'ar' ? 'تحسين قص الألواح الخشبية' : 'Nesting Cut Optimizer Proposal'}
                  </span>
                  <span className="text-neutral-400">
                    {projects.length > 0 
                      ? `${language === 'ar' ? 'وفّر ما يصل إلى' : 'Save up to'} 1.5 MDF ${language === 'ar' ? 'ألواح خشبية في مشروع' : 'sheets on'} "${projects[0].name}" ${language === 'ar' ? 'باستخدام مخطط القص الموفر للمساحة.' : 'by running the AI Nesting Optimizer under the Assistant tab.'}`
                      : `${language === 'ar' ? 'حسّن استهلاك الخامات في مشروعاتك المستقبلية لتفادي الهدر.' : 'Utilize Malik AI laser measurements to map complex cabinet depths and prevent sheet offcut waste.'}`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Inventory Advisory */}
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-850 hover:border-amber-500/20 transition-all">
              <div className="flex gap-2.5">
                <span className="text-sm">🪵</span>
                <div>
                  <span className="text-white font-bold block mb-0.5">
                    {language === 'ar' ? 'مستويات مخزون الخشب' : 'Timber Supply & Sourcing'}
                  </span>
                  <span className="text-neutral-400">
                    {lowStockItems.length > 0
                      ? `${language === 'ar' ? 'تنبيه عاجل: مخزون' : 'Urgent Restock Needed:'} ${lowStockItems.map(i => i.name).slice(0, 2).join(', ')} ${language === 'ar' ? 'أقل من مستويات الأمان. نوصي بالشراء فورًا.' : 'is critically low. Pre-purchase now to prevent active cabinet workshop bottlenecks.'}`
                      : `${language === 'ar' ? 'مستويات المخزون ممتازة. أسعار خشب البلوط والزان مستقرة هذا الأسبوع.' : 'Sourcing status: Wood market prices are optimal. Timber margins are projected to stabilize. safe stockpiling recommended.'}`
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Accounts Receivable Advice */}
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-850 hover:border-amber-500/20 transition-all">
              <div className="flex gap-2.5">
                <span className="text-sm">💳</span>
                <div>
                  <span className="text-white font-bold block mb-0.5">
                    {language === 'ar' ? 'مستحقات الخزينة المعلقة' : 'Accounts Receivable Cashflow'}
                  </span>
                  <span className="text-neutral-400">
                    {totalOutstanding > 0
                      ? `${language === 'ar' ? 'لديك مبالغ معلقة قيمتها' : 'Outstanding dues:'} ${formatCurrency(totalOutstanding, language)}. ${language === 'ar' ? 'نوصي بإرسال تذكير واتساب تلقائي للعملاء.' : 'Malik AI recommends sending friendly WhatsApp invoice follow-ups to customers.'}`
                      : `${language === 'ar' ? 'مستحقات الخزينة ممتازة، تدفقات كاش ورشة مالك مستقرة بالكامل.' : 'All customer accounts are settled perfectly. Capital reserves are at maximum capacity.'}`
                    }
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Critical Restock Alerts Block */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              {language === 'ar' ? 'إنذارات نفاد المخزون ⚠️' : 'Critical Material Shortages'}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {language === 'ar' ? 'الخامات والملحقات التي يقل مخزونها الحالي عن مستويات الأمان' : 'Hardware fittings, glues, and wood panels below safety levels'}
            </p>
          </div>
          <button 
            onClick={() => onNavigate('inventory')}
            className="text-xs text-amber-500 hover:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1 transition-all"
          >
            <span>{language === 'ar' ? 'إدارة المخزون' : 'Manage Inventory'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="text-center py-10 bg-neutral-950/30 rounded-2xl border border-dashed border-neutral-800">
            <svg className="w-12 h-12 mx-auto mb-2 text-green-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-neutral-400 italic">
              {language === 'ar' ? 'كل خامات الخشب والملحقات والبراغي متوفرة بمستويات آمنة.' : 'All timber panels, glue adhesives, and handles are at safe stock thresholds.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStockItems.slice(0, 4).map((item) => (
              <div 
                key={item.id} 
                className="p-4 bg-neutral-950 rounded-xl border border-neutral-800/80 hover:border-red-500/20 transition-all flex justify-between items-center group hover:scale-[1.02]"
              >
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">{item.name}</h4>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {language === 'ar' ? 'الصنف:' : 'Category:'} {item.category}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-400 font-mono block">
                    {item.stock} {item.unit}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    {language === 'ar' ? 'الحد الأدنى:' : 'Min:'} {item.minQuantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
