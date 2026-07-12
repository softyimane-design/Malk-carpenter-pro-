import React, { useState, useEffect } from 'react';
import { 
  Calculator, Ruler, Hammer, DollarSign, Plus, Trash2, Percent, 
  Layers, Settings, Share2, Clipboard, Printer, HelpCircle, RefreshCw, 
  ChevronRight, ArrowRight, BookOpen, AlertCircle
} from 'lucide-react';
import { Language } from '../types';
import { translations, formatCurrency, getActiveCurrency } from '../utils';

interface CalculatorsProps {
  language: Language;
}

interface MaterialItem {
  id: string;
  name: string;
  type: 'volume' | 'sheet' | 'unit';
  unitPrice: number;
  length: number; // in mm
  width: number;  // in mm
  thickness: number; // in mm
  qty: number;
  calculatedCost: number;
  unitLabel: string;
}

interface HardwareItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export default function Calculators({ language }: CalculatorsProps) {
  const t = translations[language];
  const activeCurrency = getActiveCurrency();
  const [activeTab, setActiveTab] = useState<'material' | 'labor' | 'profit' | 'measurement'>('material');

  const [shareToast, setShareToast] = useState<string | null>(null);

  // Helper to trigger toast notifications
  const showToast = (msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(null), 3000);
  };

  // -------------------------------------------------------------
  // Tab 1: Material Cost Calculator States & Logic
  // -------------------------------------------------------------
  const woodPresets = [
    { name: language === 'ar' ? 'خشب الجوز الأمريكي' : language === 'fr' ? 'Noyer Américain' : 'American Walnut', type: 'volume', price: activeCurrency === 'DZD' ? 4200 : 420, unit: 'm³' },
    { name: language === 'ar' ? 'خشب البلوط الأبيض' : language === 'fr' ? 'Chêne Blanc' : 'White Oak', type: 'volume', price: activeCurrency === 'DZD' ? 3800 : 380, unit: 'm³' },
    { name: language === 'ar' ? 'خشب الزان الممتاز' : language === 'fr' ? 'Hêtre Premium' : 'Beechwood Premium', type: 'volume', price: activeCurrency === 'DZD' ? 3100 : 310, unit: 'm³' },
    { name: language === 'ar' ? 'لوح خشب MDF سمك 18ملم' : language === 'fr' ? 'Panneau MDF 18mm' : 'MDF Sheet 18mm', type: 'sheet', price: activeCurrency === 'DZD' ? 450 : 45, unit: 'sheets' },
    { name: language === 'ar' ? 'لوح كونت البلاكي 15ملم' : language === 'fr' ? 'Contreplaqué Okoumé 15mm' : 'Marine Plywood 15mm', type: 'sheet', price: activeCurrency === 'DZD' ? 650 : 65, unit: 'sheets' },
    { name: language === 'ar' ? 'خشب صنوبر محلي' : language === 'fr' ? 'Bois Rouge Pin' : 'Pine Wood Sawn', type: 'volume', price: activeCurrency === 'DZD' ? 2200 : 220, unit: 'm³' }
  ];

  const hardwarePresets = [
    { name: language === 'ar' ? 'مفصلات هيدروليك بلوم' : language === 'fr' ? 'Charnières Blum' : 'Blum Soft Hinges', price: activeCurrency === 'DZD' ? 45 : 4.5 },
    { name: language === 'ar' ? 'قبضات خشبية ذهبية' : language === 'fr' ? 'Poignées Laiton Doré' : 'Brushed Brass Handles', price: activeCurrency === 'DZD' ? 120 : 12 },
    { name: language === 'ar' ? 'سكك أدراج تلسكوبية' : language === 'fr' ? 'Coulisses Tiroir' : 'Drawer Runners Pair', price: activeCurrency === 'DZD' ? 180 : 18 },
    { name: language === 'ar' ? 'غراء خشب أصلي' : language === 'fr' ? 'Colle à bois forte' : 'High-Bond Wood Glue', price: activeCurrency === 'DZD' ? 150 : 15 }
  ];

  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [customMaterialName, setCustomMaterialName] = useState<string>('');
  const [customMaterialPrice, setCustomMaterialPrice] = useState<number>(100);
  const [customMaterialType, setCustomMaterialType] = useState<'volume' | 'sheet'>('volume');

  const [matLength, setMatLength] = useState<number>(2000); // mm
  const [matWidth, setMatWidth] = useState<number>(300);   // mm
  const [matThickness, setMatThickness] = useState<number>(40); // mm
  const [matQty, setMatQty] = useState<number>(5);

  const [materialList, setMaterialList] = useState<MaterialItem[]>([
    {
      id: 'm-1',
      name: woodPresets[0].name,
      type: 'volume',
      unitPrice: woodPresets[0].price,
      length: 2400,
      width: 1000,
      thickness: 50,
      qty: 1,
      calculatedCost: Number((woodPresets[0].price * (2400 * 1000 * 50 / 1e9) * 1).toFixed(2)),
      unitLabel: 'm³'
    }
  ]);

  const [hardwareList, setHardwareList] = useState<HardwareItem[]>([
    { id: 'h-1', name: hardwarePresets[0].name, qty: 8, unitPrice: hardwarePresets[0].price, total: 8 * hardwarePresets[0].price },
    { id: 'h-2', name: hardwarePresets[1].name, qty: 4, unitPrice: hardwarePresets[1].price, total: 4 * hardwarePresets[1].price }
  ]);

  const [hwSelectedIdx, setHwSelectedIdx] = useState<number>(0);
  const [hwCustomQty, setHwCustomQty] = useState<number>(4);

  // Calculations for materials
  const calculateCostOfMaterial = (
    type: 'volume' | 'sheet',
    price: number,
    l: number,
    w: number,
    t: number,
    q: number
  ): number => {
    if (type === 'volume') {
      // Volume in m3: (L * W * T) / 10^9
      const vol = (l * w * t) / 1e9;
      return vol * price * q;
    } else {
      // Sheet count based on standard plywood sheet (2.44m x 1.22m = 2.97 m2)
      // sheet area = 2.97 m2
      const singlePieceArea = (l * w) / 1e6; // in m2
      const totalArea = singlePieceArea * q;
      const sheetsNeeded = Math.ceil(totalArea / 2.97);
      return sheetsNeeded * price;
    }
  };

  const handleAddMaterialItem = () => {
    const isCustom = selectedPresetIdx === -1;
    const name = isCustom ? customMaterialName || 'Custom Wood' : woodPresets[selectedPresetIdx].name;
    const type = isCustom ? customMaterialType : woodPresets[selectedPresetIdx].type as 'volume' | 'sheet';
    const price = isCustom ? customMaterialPrice : woodPresets[selectedPresetIdx].price;

    const cost = calculateCostOfMaterial(type, price, matLength, matWidth, matThickness, matQty);

    const newItem: MaterialItem = {
      id: `m-${Date.now()}`,
      name,
      type,
      unitPrice: price,
      length: matLength,
      width: matWidth,
      thickness: matThickness,
      qty: matQty,
      calculatedCost: Number(cost.toFixed(2)),
      unitLabel: type === 'volume' ? 'm³' : 'sheets'
    };

    setMaterialList([...materialList, newItem]);
    showToast(language === 'ar' ? 'تم إضافة الخامة بنجاح 🪵' : 'Material added successfully!');
  };

  const handleAddHardwareItem = () => {
    const preset = hardwarePresets[hwSelectedIdx];
    const existing = hardwareList.find(h => h.name === preset.name);

    if (existing) {
      setHardwareList(hardwareList.map(h => {
        if (h.name === preset.name) {
          const newQty = h.qty + hwCustomQty;
          return { ...h, qty: newQty, total: newQty * h.unitPrice };
        }
        return h;
      }));
    } else {
      setHardwareList([...hardwareList, {
        id: `h-${Date.now()}`,
        name: preset.name,
        qty: hwCustomQty,
        unitPrice: preset.price,
        total: hwCustomQty * preset.price
      }]);
    }
    showToast(language === 'ar' ? 'تم إضافة الإكسسوارات 🔩' : 'Accessories added!');
  };

  const handleRemoveMaterialItem = (id: string) => {
    setMaterialList(materialList.filter(item => item.id !== id));
  };

  const handleRemoveHardwareItem = (id: string) => {
    setHardwareList(hardwareList.filter(item => item.id !== id));
  };

  const totalMaterialsCost = materialList.reduce((sum, item) => sum + item.calculatedCost, 0);
  const totalHardwareCost = hardwareList.reduce((sum, item) => sum + item.total, 0);
  const grandMaterialCost = totalMaterialsCost + totalHardwareCost;

  // -------------------------------------------------------------
  // Tab 2: Labor Cost Calculator States & Logic
  // -------------------------------------------------------------
  const [laborHoursInput, setLaborHoursInput] = useState<number>(36);
  const [artisanRate, setArtisanRate] = useState<number>(activeCurrency === 'DZD' ? 250 : 25);
  const [workersCount, setWorkersCount] = useState<number>(2);
  const [complexityFactor, setComplexityFactor] = useState<number>(1.25); // Medium complexity
  const [transportFee, setTransportFee] = useState<number>(activeCurrency === 'DZD' ? 1500 : 150);

  const calculatedLaborCost = (laborHoursInput * artisanRate * workersCount * complexityFactor) + transportFee;

  // Complexity level tags
  const complexityLevels = [
    { label: language === 'ar' ? 'بسيط (1.0x)' : language === 'fr' ? 'Standard (1.0x)' : 'Standard (1.0x)', value: 1.0 },
    { label: language === 'ar' ? 'مـتوسط (1.25x)' : language === 'fr' ? 'Modéré (1.25x)' : 'Moderate (1.25x)', value: 1.25 },
    { label: language === 'ar' ? 'صنعة يد ممتازة (1.6x)' : language === 'fr' ? 'Artisanal Premium (1.6x)' : 'Premium Handcraft (1.6x)', value: 1.6 },
    { label: language === 'ar' ? 'زخرفة ونقش معقد (2.0x)' : language === 'fr' ? 'Trés Complexe (2.0x)' : 'Very Complex / Carved (2.0x)', value: 2.0 }
  ];

  // -------------------------------------------------------------
  // Tab 3: Profit & Overheads Calculator States & Logic
  // -------------------------------------------------------------
  const [linkCosts, setLinkCosts] = useState<boolean>(true);
  const [manualMatCost, setManualMatCost] = useState<number>(activeCurrency === 'DZD' ? 18000 : 1800);
  const [manualLaborCost, setManualLaborCost] = useState<number>(activeCurrency === 'DZD' ? 12000 : 1200);
  const [workshopOverhead, setWorkshopOverhead] = useState<number>(activeCurrency === 'DZD' ? 1500 : 150);
  const [profitMargin, setProfitMargin] = useState<number>(35); // 35% margin

  const finalMatCost = linkCosts ? grandMaterialCost : manualMatCost;
  const finalLaborCost = linkCosts ? calculatedLaborCost : manualLaborCost;
  
  const totalCostPrice = finalMatCost + finalLaborCost + workshopOverhead;
  
  // Selling price based on margin formula: Selling Price = Total Cost / (1 - Margin%)
  const calculatedSellingPrice = totalCostPrice / (1 - (profitMargin / 100));
  const calculatedNetProfit = calculatedSellingPrice - totalCostPrice;

  // -------------------------------------------------------------
  // Tab 4: Measurement Calculator & Unit Converter States
  // -------------------------------------------------------------
  const [convertVal, setConvertVal] = useState<number>(1500);
  const [convertFrom, setConvertFrom] = useState<'mm' | 'cm' | 'm'>('mm');
  const [convertTo, setConvertTo] = useState<'mm' | 'cm' | 'm'>('cm');

  // Huber's Log Volume formula states: V = pi * (d_mid)^2 * L / 4
  const [logMidDiameter, setLogMidDiameter] = useState<number>(45); // cm
  const [logLength, setLogLength] = useState<number>(4.2);        // m
  const [calculatedLogVol, setCalculatedLogVol] = useState<number>(0);

  useEffect(() => {
    // Volume in m3 = pi * (diameter_in_meters)^2 * length_in_meters / 4
    const dM = logMidDiameter / 100; // cm to m
    const vol = (Math.PI * Math.pow(dM, 2) * logLength) / 4;
    setCalculatedLogVol(Number(vol.toFixed(4)));
  }, [logMidDiameter, logLength]);

  // Board feet calculator
  const [bfThickness, setBfThickness] = useState<number>(2); // inches
  const [bfWidth, setBfWidth] = useState<number>(8);       // inches
  const [bfLength, setBfLength] = useState<number>(12);     // feet
  const [calculatedBf, setCalculatedBf] = useState<number>(0);

  useEffect(() => {
    const bf = (bfThickness * bfWidth * bfLength) / 12;
    setCalculatedBf(Number(bf.toFixed(2)));
  }, [bfThickness, bfWidth, bfLength]);

  // Nesting panel sheet calculator
  const [sheetLength, setSheetLength] = useState<number>(2440); // mm
  const [sheetWidth, setSheetWidth] = useState<number>(1220);  // mm
  const [partLength, setPartLength] = useState<number>(600);   // mm
  const [partWidth, setPartWidth] = useState<number>(450);    // mm
  const [bladeKerf, setBladeKerf] = useState<number>(3);       // mm (blade thickness cut)
  const [nestedResult, setNestedResult] = useState<{ total: number; rows: number; cols: number }>({ total: 0, rows: 0, cols: 0 });

  useEffect(() => {
    // Simple 2D grid nesting without rotation
    const colCount = Math.floor((sheetLength + bladeKerf) / (partLength + bladeKerf));
    const rowCount = Math.floor((sheetWidth + bladeKerf) / (partWidth + bladeKerf));
    const totalWithNoRotation = Math.max(0, colCount * rowCount);

    setNestedResult({
      total: totalWithNoRotation,
      rows: rowCount,
      cols: colCount
    });
  }, [sheetLength, sheetWidth, partLength, partWidth, bladeKerf]);

  // Convert Measurement handler
  const handleConvert = (): string => {
    let valInMm = convertVal;
    if (convertFrom === 'cm') valInMm = convertVal * 10;
    else if (convertFrom === 'm') valInMm = convertVal * 1000;

    let finalVal = valInMm;
    if (convertTo === 'cm') finalVal = valInMm / 10;
    else if (convertTo === 'm') finalVal = valInMm / 1000;

    return `${finalVal.toLocaleString()} ${convertTo}`;
  };

  // WhatsApp and PDF actions
  const handleCopySummary = () => {
    const summary = `
🪵 MALK CARPENTER PRO CALCULATOR REPORT 🪵
==========================================
Active Currency: ${activeCurrency}

1. MATERIALS COST DETAIL:
- Wooden Materials Subtotal: ${formatCurrency(totalMaterialsCost, language)}
- Hardware & Fixings Subtotal: ${formatCurrency(totalHardwareCost, language)}
- Grand Materials Cost: ${formatCurrency(grandMaterialCost, language)}

2. LABOUR ESTIMATION:
- Work hours: ${laborHoursInput} hrs x ${workersCount} artisans
- Hourly Rate: ${artisanRate} /hr
- Handcraft Complexity Factor: ${complexityFactor}x
- Labor Cost Total: ${formatCurrency(calculatedLaborCost, language)}

3. COMPREHENSIVE QUOTATION:
- Combined Cost Price: ${formatCurrency(totalCostPrice, language)}
- Desired Margin: ${profitMargin}%
- Net Profit: ${formatCurrency(calculatedNetProfit, language)}
- RECOMMENDED SELLING PRICE: ${formatCurrency(calculatedSellingPrice, language)}

==========================================
Crafted intelligently using Malk Carpenter Pro
    `;
    navigator.clipboard.writeText(summary.trim());
    showToast(language === 'ar' ? 'تم نسخ التقرير الحسابي إلى الحافظة 📋' : 'Quotation report copied to clipboard!');
  };

  const handleShareWhatsApp = () => {
    const text = `*Malk Carpenter Pro - Quotation Estimate*%0A===================================%0A*Materials:* ${formatCurrency(grandMaterialCost, language)}%0A*Labor & Artisans:* ${formatCurrency(calculatedLaborCost, language)}%0A*Workshop Overheads:* ${formatCurrency(workshopOverhead, language)}%0A*Selling Price Proposal:* *${formatCurrency(calculatedSellingPrice, language)}*%0A*Estimated Profit:* ${formatCurrency(calculatedNetProfit, language)}%0A===================================%0A_Generated via Malik AI Woodwork Engine_`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-amber-500 text-neutral-950 font-sans text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-white/20 flex items-center gap-2 animate-bounce">
          <HelpCircle className="w-4 h-4" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Calculator className="w-5.5 h-5.5 text-amber-500 animate-pulse" />
            <span>
              {language === 'ar' ? 'حاسبة التكاليف والنجارة الاحترافية 🪵' : language === 'fr' ? 'Calculateurs & Devis de Menuiserie' : 'Carpentry Cost & Sizing Suite'}
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {language === 'ar' ? 'احسب تكلفة الخشب، سعر اليد العاملة، هامش الربح والقياسات بدقة' : 'Estimate lumber raw materials, artisan labor hours, and nesting sheets instantly'}
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold border border-neutral-800 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy all calculations"
          >
            <Clipboard className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">{language === 'ar' ? 'نسخ التقرير' : 'Copy'}</span>
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="px-3 py-2 bg-green-500/15 hover:bg-green-500/20 text-green-400 rounded-xl text-xs font-bold border border-green-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{language === 'ar' ? 'مشاركة واتساب' : 'WhatsApp'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-bold border border-neutral-800 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'ar' ? 'طباعة' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Calculator Navigation Menu Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-neutral-900/40 p-1.5 rounded-2xl border border-neutral-900">
        <button
          onClick={() => setActiveTab('material')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'material'
              ? 'bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{language === 'ar' ? 'حاسبة الخامات' : language === 'fr' ? 'Coût Matériaux' : 'Material Cost'}</span>
        </button>

        <button
          onClick={() => setActiveTab('labor')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'labor'
              ? 'bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
          }`}
        >
          <Hammer className="w-4 h-4" />
          <span>{language === 'ar' ? 'سعر اليد العاملة' : language === 'fr' ? 'Tarif Main d\'œuvre' : 'Labor Cost'}</span>
        </button>

        <button
          onClick={() => setActiveTab('profit')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'profit'
              ? 'bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{language === 'ar' ? 'الربح وعرض السعر' : language === 'fr' ? 'Bénéfice & Devis' : 'Profit & Devis'}</span>
        </button>

        <button
          onClick={() => setActiveTab('measurement')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'measurement'
              ? 'bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>{language === 'ar' ? 'حاسبة القياسات' : language === 'fr' ? 'Mesures & Volume' : 'Measurement Tools'}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Input panel (occupies 2 cols on wide screens) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* MATERIAL TAB */}
          {activeTab === 'material' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Wood / Panels Section */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{language === 'ar' ? '1. قص اللوح وحساب خامات الخشب' : '1. Estimate Woodcut & Board Material Cost'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Wood Preset */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-neutral-400 block">SELECT TIMBER / SUBSTRATE PRESET</label>
                    <select
                      value={selectedPresetIdx}
                      onChange={(e) => setSelectedPresetIdx(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {woodPresets.map((p, idx) => (
                        <option key={idx} value={idx}>
                          {p.name} ({p.price} {activeCurrency === 'DZD' ? 'DA' : '$'} / {p.unit})
                        </option>
                      ))}
                      <option value="-1">-- {language === 'ar' ? 'خامة مخصصة' : 'Custom Material'} --</option>
                    </select>
                  </div>

                  {/* Quantity input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-neutral-400 block">{language === 'ar' ? 'الكمية (عدد القطع المتشابهة)' : 'QUANTITY (IDENTICAL PIECES)'}</label>
                    <input
                      type="number"
                      value={matQty}
                      onChange={(e) => setMatQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Custom material fields if selected */}
                {selectedPresetIdx === -1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-neutral-950 rounded-xl border border-neutral-850 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 block">CUSTOM MATERIAL NAME</label>
                      <input
                        type="text"
                        placeholder="E.g. Walnut slab"
                        value={customMaterialName}
                        onChange={(e) => setCustomMaterialName(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 block">UNIT PRICE</label>
                      <input
                        type="number"
                        value={customMaterialPrice}
                        onChange={(e) => setCustomMaterialPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 block">PRICING UNIT</label>
                      <select
                        value={customMaterialType}
                        onChange={(e) => setCustomMaterialType(e.target.value as 'volume' | 'sheet')}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      >
                        <option value="volume">Per Cubic Meter (m³)</option>
                        <option value="sheet">Per Panel / Sheet</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Dimensions HUD */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 mt-4">
                  <span className="text-[10px] font-mono text-neutral-400 block mb-3">SINGLE WOODCUT DIMENSIONS (IN MILLIMETERS)</span>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-neutral-500 block">LENGTH (mm)</span>
                      <input
                        type="number"
                        value={matLength}
                        onChange={(e) => setMatLength(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 text-center text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-neutral-500 block">WIDTH (mm)</span>
                      <input
                        type="number"
                        value={matWidth}
                        onChange={(e) => setMatWidth(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 text-center text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-neutral-500 block">THICKNESS (mm)</span>
                      <input
                        type="number"
                        value={matThickness}
                        disabled={selectedPresetIdx !== -1 && woodPresets[selectedPresetIdx].type === 'sheet'}
                        onChange={(e) => setMatThickness(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-neutral-900 disabled:bg-neutral-950 border border-neutral-800 rounded-lg py-2 text-center text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Volume Estimations banner */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
                    <div>
                      <span>Calculated Volume: </span>
                      <span className="text-amber-500 font-bold">
                        {((matLength * matWidth * matThickness * matQty) / 1e9).toFixed(4)} m³
                      </span>
                    </div>
                    <div>
                      <span>Estimated Board Area: </span>
                      <span className="text-amber-500 font-bold">
                        {((matLength * matWidth * matQty) / 1e6).toFixed(2)} m²
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAddMaterialItem}
                    className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'ar' ? 'إضافة إلى لائحة المواد' : 'Add Woodcut Item'}</span>
                  </button>
                </div>
              </div>

              {/* Accessories Section */}
              <div>
                <h3 className="text-sm font-bold text-white mb-4 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{language === 'ar' ? '2. الملحقات والإكسسوارات (Hinges, Slides)' : '2. Premium Accessories & Hardware Fittings'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[11px] font-mono text-neutral-400 block">SELECT ACCESSORY PRESET</label>
                    <select
                      value={hwSelectedIdx}
                      onChange={(e) => setHwSelectedIdx(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {hardwarePresets.map((h, idx) => (
                        <option key={idx} value={idx}>
                          {h.name} ({h.price} {activeCurrency === 'DZD' ? 'DA' : '$'} / unit)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-neutral-400 block">QUANTITY</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={hwCustomQty}
                        onChange={(e) => setHwCustomQty(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        onClick={handleAddHardwareItem}
                        className="bg-green-500 text-neutral-950 px-4 rounded-xl text-xs font-bold hover:bg-green-600 transition-all cursor-pointer flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* LABOR TAB */}
          {activeTab === 'labor' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white mb-4 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{language === 'ar' ? 'سعر اليد العاملة والخدامين' : 'Labor Cost & Technical Work rates'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Total labor hours */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400">
                    <label>ESTIMATED LABOR HOURS</label>
                    <span className="text-amber-500 font-bold">{laborHoursInput} hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="120"
                    value={laborHoursInput}
                    onChange={(e) => setLaborHoursInput(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                    <span>1 hour</span>
                    <span>60 hrs (Standard cabinet)</span>
                    <span>120 hrs</span>
                  </div>
                </div>

                {/* Artisan hourly wage */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 block">
                    HOURLY RATE PER ARTISAN ({activeCurrency})
                  </label>
                  <input
                    type="number"
                    value={artisanRate}
                    onChange={(e) => setArtisanRate(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Team size count */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 block">
                    NUMBER OF ARTISANS WORKING ON SITE
                  </label>
                  <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => setWorkersCount(num)}
                        className={`flex-1 py-2 text-xs font-mono font-black rounded-lg transition-all border cursor-pointer ${
                          workersCount === num
                            ? 'bg-amber-500 text-neutral-950 border-amber-500'
                            : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Complexity Multiplier */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 block">HANDCRAFT COMPLEXITY MULTIPLIER</label>
                  <select
                    value={complexityFactor}
                    onChange={(e) => setComplexityFactor(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {complexityLevels.map((c, idx) => (
                      <option key={idx} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Transport and delivery fees */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 block">
                    TRANSPORT, LOGISTICS & INSTALLATION FEES ({activeCurrency})
                  </label>
                  <input
                    type="number"
                    value={transportFee}
                    onChange={(e) => setTransportFee(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

              </div>

              {/* Informative advice box */}
              <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/15 text-[11px] leading-relaxed text-neutral-400">
                <p className="flex gap-2">
                  <span className="text-sm">💡</span>
                  <span>
                    {language === 'ar' 
                      ? 'يتم حساب سعر اليد العاملة بضرب الساعات الإجمالية في أجر العامل الفردي، مع تطبيق معامل الصعوبة للمشروعات الفخمة التي تتطلب دقة ونقش يدوي، بالإضافة لمصاريف النقل والتركيب.'
                      : 'The hourly rate encompasses master craftsmen, joiners, and painters. Antique or carved work commands a 1.6x - 2.0x modifier to safely cover extra sanding and precision-fit hours.'}
                  </span>
                </p>
              </div>

            </div>
          )}

          {/* PROFIT & DEVIS TAB */}
          {activeTab === 'profit' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white mb-4 border-b border-neutral-800 pb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{language === 'ar' ? 'هامش الربح وتصميم العرض المالي' : 'Margin Optimizer & Selling Price Proposal'}</span>
              </h3>

              {/* Checkbox to link values */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block text-xs">
                    {language === 'ar' ? 'ربط الحسابات مع لائحة المواد والعمالة' : 'LINK WITH CURRENT CALCULATORS DATA'}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-sans mt-0.5 block">
                    {language === 'ar' ? 'سحب المجموع من الجداول السابقة تلقائيًا' : 'Pull total cost structures from Mat & Labor tabs'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={linkCosts}
                  onChange={(e) => setLinkCosts(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Manual cost inputs if unlinked */}
              {!linkCosts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-neutral-400 block">MANUAL MATERIALS COST ({activeCurrency})</label>
                    <input
                      type="number"
                      value={manualMatCost}
                      onChange={(e) => setManualMatCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-neutral-400 block">MANUAL LABOR COST ({activeCurrency})</label>
                    <input
                      type="number"
                      value={manualLaborCost}
                      onChange={(e) => setManualLaborCost(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Workshop Overheads and Margin Slider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Overhead expenses */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 block">
                    WORKSHOP GENERAL OVERHEADS (Power, Rent, Sandpaper, Wear)
                  </label>
                  <input
                    type="number"
                    value={workshopOverhead}
                    onChange={(e) => setWorkshopOverhead(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Profit Margin slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-mono text-neutral-400">
                    <label>DESIRED PROFIT MARGIN</label>
                    <span className="text-green-400 font-bold">{profitMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="75"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(Number(e.target.value))}
                    className="w-full accent-green-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono">
                    <span>5% (Thin)</span>
                    <span>25% - 35% (Safe)</span>
                    <span>75% (Premium design)</span>
                  </div>
                </div>

              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-neutral-500 block">SELECT MARGIN PRESET</span>
                <div className="flex gap-2">
                  {[15, 25, 35, 50, 60].map(m => (
                    <button
                      key={m}
                      onClick={() => setProfitMargin(m)}
                      className={`flex-1 py-2 text-xs font-mono font-bold rounded-xl transition-all border cursor-pointer ${
                        profitMargin === m
                          ? 'bg-green-500 text-neutral-950 border-green-500 font-black'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:text-white'
                      }`}
                    >
                      {m}%
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* MEASUREMENT TOOLS TAB */}
          {activeTab === 'measurement' && (
            <div className="space-y-6">
              
              {/* Unit Converter Widget */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{language === 'ar' ? '1. محول وحدات القياس (مم / سم / م)' : '1. Quick Sizing & Unit Converter'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 block">VALUE</label>
                    <input
                      type="number"
                      value={convertVal}
                      onChange={(e) => setConvertVal(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 block">FROM UNIT</label>
                    <select
                      value={convertFrom}
                      onChange={(e) => setConvertFrom(e.target.value as 'mm' | 'cm' | 'm')}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-neutral-400 block">TO UNIT</label>
                    <select
                      value={convertTo}
                      onChange={(e) => setConvertTo(e.target.value as 'mm' | 'cm' | 'm')}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="mm">Millimeters (mm)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="m">Meters (m)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 text-center text-xs font-mono font-bold text-amber-500 h-[38px] flex items-center justify-center">
                    {handleConvert()}
                  </div>
                </div>
              </div>

              {/* Huber's Log Volume & Board Feet Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Timber Log Volume (Huber's Formula) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>{language === 'ar' ? '2. حساب حجم جذوع الأشجار (Huber)' : '2. Circular Log Volume (Huber)'}</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 block">MID-LOG DIAMETER (cm)</label>
                      <input
                        type="number"
                        value={logMidDiameter}
                        onChange={(e) => setLogMidDiameter(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 block">LOG LENGTH (meters)</label>
                      <input
                        type="number"
                        value={logLength}
                        onChange={(e) => setLogLength(Math.max(0.1, Number(e.target.value)))}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-850 text-center">
                      <span className="text-[9px] text-neutral-500 font-mono block uppercase">TOTAL SOLID TIMBER VOLUME</span>
                      <span className="text-lg font-mono font-black text-amber-500">{calculatedLogVol} m³</span>
                    </div>
                  </div>
                </div>

                {/* Board Feet Calculator */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-sm font-bold text-white border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>{language === 'ar' ? '3. حساب قياس اللوح بالقدم (Board Feet)' : '3. Board Feet Converter (BF)'}</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-neutral-500 font-mono block">THICKNESS (in)</span>
                        <input
                          type="number"
                          value={bfThickness}
                          onChange={(e) => setBfThickness(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 text-center text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-neutral-500 font-mono block">WIDTH (in)</span>
                        <input
                          type="number"
                          value={bfWidth}
                          onChange={(e) => setBfWidth(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 text-center text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-neutral-500 font-mono block">LENGTH (ft)</span>
                        <input
                          type="number"
                          value={bfLength}
                          onChange={(e) => setBfLength(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-neutral-950 border border-neutral-850 rounded-xl py-2 text-center text-xs font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-850 text-center">
                      <span className="text-[9px] text-neutral-500 font-mono block uppercase">CALCULATED VOLUME (BOARD FEET)</span>
                      <span className="text-lg font-mono font-black text-amber-500">{calculatedBf} BF</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 2D Panel Nesting Sheet Estimator (AI Sheet cut layout) */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white border-b border-neutral-850 pb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                  <span>{language === 'ar' ? '4. مخطط قص ألواح الـ MDF والكونتر بدون هدر' : '4. 2D Nesting Cabinet Sheet Sizer (Offcut Minimizer)'}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left input details */}
                  <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                    <span className="text-[9px] font-mono text-neutral-500 block uppercase">Enter sheet & cut sizes (mm)</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] text-neutral-500 font-mono">SHEET L</span>
                        <input type="number" value={sheetLength} onChange={e => setSheetLength(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-800 text-xs font-mono py-1 px-2 rounded" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-neutral-500 font-mono">SHEET W</span>
                        <input type="number" value={sheetWidth} onChange={e => setSheetWidth(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-800 text-xs font-mono py-1 px-2 rounded" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] text-neutral-500 font-mono">CABINET PART L</span>
                        <input type="number" value={partLength} onChange={e => setPartLength(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-800 text-xs font-mono py-1 px-2 rounded" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] text-neutral-500 font-mono">CABINET PART W</span>
                        <input type="number" value={partWidth} onChange={e => setPartWidth(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-800 text-xs font-mono py-1 px-2 rounded" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-500 font-mono">SAW BLADE THICKNESS / KERF (mm)</span>
                      <input type="number" value={bladeKerf} onChange={e => setBladeKerf(Number(e.target.value))} className="w-full bg-neutral-900 border border-neutral-800 text-xs font-mono py-1 px-2 rounded" />
                    </div>
                  </div>

                  {/* Right visual nesting preview */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-400 block uppercase mb-1">NESTING REPORT:</span>
                      <p className="text-xs text-white leading-relaxed font-sans">
                        You can secure up to <strong className="text-amber-500 text-sm">{nestedResult.total}</strong> pieces from a single sheet layout.
                      </p>
                      <span className="text-[10px] text-neutral-500 font-mono block mt-1">Grid alignment: {nestedResult.cols} cols x {nestedResult.rows} rows</span>
                    </div>

                    {/* Virtual preview drawing */}
                    <div className="relative aspect-video bg-neutral-900 rounded-lg border border-neutral-800 mt-4 overflow-hidden p-1 flex items-center justify-center">
                      <div className="absolute inset-1 border border-dashed border-amber-500/20 bg-neutral-950 flex flex-wrap gap-1 p-1 items-start justify-start overflow-hidden">
                        {Array.from({ length: Math.min(24, nestedResult.total) }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="w-[32px] h-[22px] bg-amber-500/10 border border-amber-500/35 rounded flex items-center justify-center text-[7px] font-mono font-bold text-amber-500"
                          >
                            #{idx + 1}
                          </div>
                        ))}
                        {nestedResult.total > 24 && (
                          <div className="text-[8px] text-amber-500 font-mono font-bold self-center ml-2">
                            +{nestedResult.total - 24} more
                          </div>
                        )}
                        {nestedResult.total === 0 && (
                          <span className="text-[9px] text-neutral-600 font-mono m-auto">PANEL LARGER THAN SHEET</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Output details / Combined Live Bill of Materials (BOM) & Quote proposal widget */}
        <div className="space-y-6">
          
          {/* Bill of materials display */}
          {activeTab === 'material' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white tracking-wide border-b border-neutral-850 pb-2">
                {language === 'ar' ? 'لائحة المواد الحالية (BOM)' : 'Active Bill of Materials (BOM)'}
              </h3>

              {/* Timber Items */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">🪵 WOODS & BOARDS</span>
                
                {materialList.length === 0 ? (
                  <p className="text-[11px] text-neutral-500 italic py-2">{language === 'ar' ? 'لا توجد خامات خشب مضافة' : 'No timber panels added yet'}</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {materialList.map(item => (
                      <div key={item.id} className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-850 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="text-white font-bold block">{item.name}</span>
                          <span className="text-neutral-500 text-[10px] font-mono">
                            {item.qty} pcs • {item.length}x{item.width}x{item.thickness}mm
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-amber-500 font-bold">{formatCurrency(item.calculatedCost, language)}</span>
                          <button
                            onClick={() => handleRemoveMaterialItem(item.id)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hardware Items */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">🔩 HARDWARE & ACCESSORIES</span>
                
                {hardwareList.length === 0 ? (
                  <p className="text-[11px] text-neutral-500 italic py-2">{language === 'ar' ? 'لا توجد إكسسوارات مضافة' : 'No hardware pieces added yet'}</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {hardwareList.map(item => (
                      <div key={item.id} className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-850 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="text-white font-bold block">{item.name}</span>
                          <span className="text-neutral-500 text-[10px] font-mono">
                            Qty: {item.qty} pcs
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-green-400 font-bold">{formatCurrency(item.total, language)}</span>
                          <button
                            onClick={() => handleRemoveHardwareItem(item.id)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Material Subtotals summary */}
              <div className="border-t border-neutral-800 pt-4 space-y-2 font-mono text-[11px]">
                <div className="flex justify-between text-neutral-400">
                  <span>Timber Material Cost:</span>
                  <span>{formatCurrency(totalMaterialsCost, language)}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Hardware fittings Cost:</span>
                  <span>{formatCurrency(totalHardwareCost, language)}</span>
                </div>
                <div className="flex justify-between text-white font-black text-xs border-t border-neutral-950 pt-2">
                  <span>Grand Total Materials:</span>
                  <span className="text-amber-500">{formatCurrency(grandMaterialCost, language)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick summary of Labor */}
          {activeTab === 'labor' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white tracking-wide border-b border-neutral-850 pb-2 font-sans">
                {language === 'ar' ? 'ملخص أجر اليد العاملة' : 'Artisan Labor Summary'}
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between text-neutral-400">
                  <span>Base artisan hours:</span>
                  <span className="text-white font-bold">{laborHoursInput} hrs</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Team size count:</span>
                  <span className="text-white font-bold">{workersCount} active artisans</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Complexity Multiplier:</span>
                  <span className="text-amber-500 font-bold">{complexityFactor}x</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Transport & Assembly:</span>
                  <span className="text-white font-bold">{formatCurrency(transportFee, language)}</span>
                </div>

                <div className="border-t border-neutral-950 pt-3 flex justify-between items-center text-sm font-bold text-white">
                  <span>Total Labor Cost:</span>
                  <span className="text-amber-500 text-base">{formatCurrency(calculatedLaborCost, language)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Profit Quote Proposal Widget */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-center border-b border-neutral-850 pb-3 mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{language === 'ar' ? 'الدوفي وعرض السعر المقترح' : 'PROPOSED CLIENT QUOTATION'}</span>
                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-mono font-bold uppercase">SECURE</span>
              </div>

              {/* Quote Breakdown List */}
              <div className="space-y-3 text-[11px] font-mono leading-none">
                <div className="flex justify-between text-neutral-400">
                  <span>Total Raw Materials:</span>
                  <span className="text-white font-bold">{formatCurrency(finalMatCost, language)}</span>
                </div>

                <div className="flex justify-between text-neutral-400">
                  <span>Artisan Labor Wages:</span>
                  <span className="text-white font-bold">{formatCurrency(finalLaborCost, language)}</span>
                </div>

                <div className="flex justify-between text-neutral-400">
                  <span>Workshop Overheads:</span>
                  <span className="text-white font-bold">{formatCurrency(workshopOverhead, language)}</span>
                </div>

                <div className="flex justify-between text-neutral-400 border-t border-neutral-850 pt-2">
                  <span>Combined Base Cost:</span>
                  <span className="text-neutral-300">{formatCurrency(totalCostPrice, language)}</span>
                </div>

                <div className="flex justify-between text-neutral-400">
                  <span>Desired Net Margin:</span>
                  <span className="text-green-400 font-bold">{profitMargin}%</span>
                </div>

                <div className="flex justify-between text-green-400 border-t border-dashed border-neutral-800 pt-2.5">
                  <span>Project Net Profit:</span>
                  <span className="font-bold text-xs">{formatCurrency(calculatedNetProfit, language)}</span>
                </div>
              </div>

              {/* Giant final selling price */}
              <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-850 mt-5 text-center relative overflow-hidden">
                <span className="text-[9px] text-neutral-500 font-mono block uppercase tracking-wider">RECOMMENDED SELLING PRICE</span>
                <span className="text-xl font-mono font-black text-amber-500 block mt-1">
                  {formatCurrency(calculatedSellingPrice, language)}
                </span>
                <span className="text-[9px] text-green-500 font-mono block mt-1">Markup Multiplier: {((calculatedSellingPrice / totalCostPrice) || 1).toFixed(2)}x</span>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <button
                onClick={handleCopySummary}
                className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-sans text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Clipboard className="w-4 h-4" />
                <span>{language === 'ar' ? 'نسخ الفطورة بالكامل' : 'Copy Full Quote Report'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-green-400 font-sans text-xs font-bold py-2.5 rounded-xl transition-all border border-green-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{language === 'ar' ? 'إرسال سريع إلى الواتساب' : 'Fast Share to WhatsApp'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
