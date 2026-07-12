import React, { useState } from 'react';
import { Camera, RefreshCw, Layers, Sparkles, Check, Ruler, Hammer, DollarSign, ArrowUpRight, Barcode, Package, QrCode, Search, Plus, Minus, Info } from 'lucide-react';
import { Language } from '../types';
import { translations, formatCurrency } from '../utils';

interface RoomScannerProps {
  language: Language;
}

export default function RoomScanner({ language }: RoomScannerProps) {
  const t = translations[language];
  const [scannerMode, setScannerMode] = useState<'room' | 'barcode'>('room');
  
  // Room Scanner state
  const [activePreset, setActivePreset] = useState<string>('kitchen');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanReport, setScanReport] = useState<any | null>(null);

  // Barcode Scanner state
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [barcodeProgress, setBarcodeProgress] = useState(0);
  const [scannedItem, setScannedItem] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const presets = [
    {
      key: 'kitchen',
      label: 'Unfinished Kitchen space',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400'
    },
    {
      key: 'bedroom',
      label: 'Bedroom wall layout',
      image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=400'
    },
    {
      key: 'office',
      label: 'Empty corporate office corner',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=400'
    }
  ];

  const barcodeCatalog = [
    {
      barcode: '6191024850123',
      name: 'Oak Timber Wood Plank',
      category: 'Wood',
      stock: 45,
      unit: 'boards',
      supplier: 'Sarl Bois Algerie',
      location: 'Aisle B - Row 4',
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=200'
    },
    {
      barcode: '6191024850456',
      name: 'Premium Walnut Wood Slab',
      category: 'Exotic Wood',
      stock: 12,
      unit: 'slabs',
      supplier: 'Oran Lumber Import',
      location: 'Special Reserve Cage A',
      image: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&q=80&w=200'
    },
    {
      barcode: '6191024850789',
      name: 'High-Bond Wood Adhesive Glue',
      category: 'Consumables',
      stock: 84,
      unit: 'bottles',
      supplier: 'Quincaillerie El-Eulma',
      location: 'Cabinet 2 - Shelf C',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=200'
    },
    {
      barcode: '6191024850999',
      name: 'Heavy-Duty Brass Cabinet Hinges',
      category: 'Hardware',
      stock: 250,
      unit: 'units',
      supplier: 'Chine Premium Hardware',
      location: 'Drawer Bin 18',
      image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=200'
    }
  ];

  const handleScanTrigger = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanReport(null);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 250);

    try {
      const selectedImage = presets.find(p => p.key === activePreset)?.image || '';
      const response = await fetch('/api/gemini/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          category: activePreset,
          language
        })
      });

      const data = await response.json();
      setScanReport(data.report);
    } catch (err) {
      console.error("Scan API Error:", err);
      setScanReport({
        dimensions: { width: "3.2m", height: "2.8m", depth: "0.6m" },
        materials: [
          { name: "Premium Oak Slabs", quantity: "4.5 m3" },
          { name: "Melamine Backing board", quantity: "18 sheets" }
        ],
        estimatedCost: 3500,
        summary: "Modern cabinetry space with adequate ventilation alignments. Safe corners detected."
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleBarcodeScanTrigger = () => {
    setIsScanningBarcode(true);
    setBarcodeProgress(0);
    setScannedItem(null);

    const interval = setInterval(() => {
      setBarcodeProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Pick random item from catalog
          const randomIdx = Math.floor(Math.random() * barcodeCatalog.length);
          setScannedItem({ ...barcodeCatalog[randomIdx] });
          setIsScanningBarcode(false);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleAdjustStock = (amount: number) => {
    if (!scannedItem) return;
    const updated = { ...scannedItem, stock: Math.max(0, scannedItem.stock + amount) };
    setScannedItem(updated);

    // Save update in simulated barcode session
    setSuccessToast(`Successfully updated stock for ${scannedItem.name}! New stock: ${updated.stock} ${updated.unit}`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Premium Header and Tab Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {language === 'ar' ? 'الماسح الضوئي الذكي 🎥' : 'Maâlem AI Spatial & Barcode Suite'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {language === 'ar' ? 'التقاط قياسات الغرف ومسح الباركود للسلع الذكي' : 'Measure room walls and verify stock levels with real-time feedback'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setScannerMode('room')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              scannerMode === 'room'
                ? 'bg-amber-500 text-neutral-950 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'ar' ? 'مسح الغرفة' : 'Spatial Laser Scan'}</span>
          </button>
          <button
            onClick={() => setScannerMode('barcode')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              scannerMode === 'barcode'
                ? 'bg-amber-500 text-neutral-950 font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Barcode className="w-4 h-4" />
            <span>{language === 'ar' ? 'مسح باركود المخزن' : 'Barcode Scanner'}</span>
          </button>
        </div>
      </div>

      {successToast && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3.5 rounded-xl text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {scannerMode === 'room' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Radar Camera viewport panel */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
            
            {/* Top selection bar */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex gap-2 overflow-x-auto scrollbar-none">
              {presets.map(p => (
                <button
                  key={p.key}
                  onClick={() => {
                    setActivePreset(p.key);
                    setScanReport(null);
                  }}
                  disabled={isScanning}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase font-bold tracking-wider transition-all cursor-pointer ${
                    activePreset === p.key
                      ? 'bg-amber-500 text-neutral-950 shadow'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  {p.key} preset
                </button>
              ))}
            </div>

            {/* Lens Stage */}
            <div className="relative aspect-video bg-neutral-950 flex items-center justify-center group overflow-hidden">
              <img
                src={presets.find(p => p.key === activePreset)?.image}
                alt="Scan preset"
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />

              {/* Sweep laser line animation */}
              {isScanning && (
                <div
                  className="absolute left-0 right-0 h-1 bg-amber-500 shadow-[0_0_15px_#f59e0b] z-20 animate-bounce"
                  style={{ top: `${scanProgress}%` }}
                />
              )}

              {/* Simulated target dots */}
              <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-amber-500 rounded-full border border-white animate-ping" />
              <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-amber-500 rounded-full border border-white animate-ping" />

              {/* Telemetry frame HUD overlays */}
              <div className="absolute inset-4 border border-amber-500/10 pointer-events-none flex flex-col justify-between p-3 font-mono text-[9px] text-amber-500/70">
                <div className="flex justify-between">
                  <span>[ANGLE: 42.8°]</span>
                  <span>[LASER ACTIVE]</span>
                </div>
                <div className="flex justify-between">
                  <span>[GRID SCAN PROGRESS: {scanProgress}%]</span>
                  <span>[ISO CALIBRATION 300]</span>
                </div>
              </div>
            </div>

            {/* Scan control trigger bar */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800">
              <button
                onClick={handleScanTrigger}
                disabled={isScanning}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Camera className="w-4 h-4" />
                <span>{isScanning ? `COMPUTING BOUNDARIES... (${scanProgress}%)` : 'EXECUTE RADAR SCAN'}</span>
              </button>
            </div>
          </div>

          {/* Spatial Report Detail output panel */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs h-fit">
            {scanReport ? (
              <>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>AI Spatial Analysis Report</span>
                  </h3>
                  <p className="text-[10px] text-amber-500 font-mono mt-0.5 uppercase tracking-widest">
                    Target: {activePreset} • Layout verified
                  </p>
                </div>

                <div className="border-t border-neutral-800/60 pt-4 space-y-4">
                  
                  {/* Dimensions */}
                  <div className="space-y-1.5">
                    <span className="text-neutral-500 font-mono block">Estimated boundaries:</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                      <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-850">
                        <span className="text-[9px] text-neutral-500 block">WIDTH</span>
                        <span className="text-white text-xs">{scanReport.dimensions.width}</span>
                      </div>
                      <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-850">
                        <span className="text-[9px] text-neutral-500 block">HEIGHT</span>
                        <span className="text-white text-xs">{scanReport.dimensions.height}</span>
                      </div>
                      <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-850">
                        <span className="text-[9px] text-neutral-500 block">DEPTH</span>
                        <span className="text-white text-xs">{scanReport.dimensions.depth}</span>
                      </div>
                    </div>
                  </div>

                  {/* Wood quantity & Materials requirements */}
                  <div className="space-y-2 bg-neutral-950 p-3.5 rounded-xl border border-neutral-850">
                    <span className="text-neutral-500 font-mono text-[9px] tracking-wide uppercase block">🪵 Wood & Substrate Volumes:</span>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center text-white pb-1.5 border-b border-neutral-900">
                        <span>Total Solid Wood Volume:</span>
                        <span className="font-mono text-amber-500 font-bold">{scanReport.woodQuantity || "0.8 m3"}</span>
                      </div>
                      <div className="space-y-1.5 font-sans">
                        {scanReport.materials.map((m: any, i: number) => (
                          <div key={i} className="flex justify-between text-neutral-300">
                            <span className="font-bold text-white">{m.name}</span>
                            <span className="font-mono text-amber-500 font-bold">{m.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Hardware & Consumables */}
                  <div className="space-y-1 bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 text-[11px]">
                    <span className="text-neutral-500 font-mono text-[9px] tracking-wide uppercase block">🔩 Hardware & Fixings:</span>
                    <p className="text-neutral-200 mt-1">
                      {scanReport.hardware || (language === 'ar' 
                        ? "36 مفصلة تبلع وحدها (Soft-Close)، 800 برغي صلب لينوكس، ومقابض معدنية برونزية."
                        : "36 Soft-Close Hinges, 800 Premium Stainless Assembly Screws, and Custom Bronze Handles.")}
                    </p>
                  </div>

                  {/* Paint & Finishing Volume */}
                  <div className="space-y-1 bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 text-[11px]">
                    <span className="text-neutral-500 font-mono text-[9px] tracking-wide uppercase block">🧪 Protective Coating / Paint:</span>
                    <p className="text-neutral-200 mt-1 flex justify-between items-center">
                      <span>Finishing Lacquer / Varnish:</span>
                      <span className="font-mono text-amber-500 font-bold">{scanReport.paint || "15 Liters (Polyurethane Satin)"}</span>
                    </p>
                  </div>

                  {/* Labor Estimation */}
                  <div className="space-y-1 bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 text-[11px]">
                    <span className="text-neutral-500 font-mono text-[9px] tracking-wide uppercase block">⏱️ Workshop Labor Wages:</span>
                    <div className="flex justify-between items-center text-neutral-200 mt-1">
                      <span>Artisan Labor hours required:</span>
                      <span className="font-mono text-amber-500 font-bold">{scanReport.laborHours || "48 Hours (including finishing)"}</span>
                    </div>
                  </div>

                  {/* Sourced cost */}
                  <div className="flex justify-between items-center border-t border-neutral-800/50 pt-3 text-xs">
                    <span className="text-neutral-500 font-mono">Approx Selling Commission Price:</span>
                    <span className="font-mono text-base font-black text-green-400">
                      {formatCurrency(scanReport.estimatedCost, language)}
                    </span>
                  </div>

                  {/* Summary narrative */}
                  <div className="space-y-1 pt-2 border-t border-neutral-800/50">
                    <span className="text-neutral-500 font-mono block">Design briefing:</span>
                    <p className="text-neutral-300 italic leading-relaxed text-[11px] bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                      {scanReport.summary}
                    </p>
                  </div>

                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <Camera className="w-10 h-10 text-neutral-600 mx-auto mb-3 animate-pulse" />
                <p className="text-neutral-400">Trigger a spatial sweep to forecast lumber volumes, trace cabinet depth planes, and draft project price tags instantly.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Barcode Camera Feed Viewport */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <span className="text-xs font-mono text-amber-500">📷 FEED: REAR WORKSHOP SCANNER</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            {/* Simulated Live View Finder with dynamic scan crosshair */}
            <div className="relative aspect-video bg-neutral-950 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
              
              {/* Target Scan Window Frame */}
              <div className="relative w-72 h-36 border-2 border-dashed border-amber-500/40 rounded-xl flex flex-col items-center justify-center p-4">
                {/* Red Laser Sweep line */}
                <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] z-10 animate-pulse" />
                
                {isScanningBarcode ? (
                  <div className="space-y-2 text-center z-20">
                    <Barcode className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
                    <span className="text-[10px] font-mono text-amber-500 animate-pulse">READING BARCODE... {barcodeProgress}%</span>
                  </div>
                ) : scannedItem ? (
                  <div className="space-y-1 text-center z-20">
                    <Check className="w-8 h-8 text-green-500 mx-auto bg-green-500/10 rounded-full p-1" />
                    <span className="text-[10px] font-mono text-green-400 font-bold block">{scannedItem.barcode}</span>
                    <span className="text-[10px] text-white block truncate max-w-[200px]">{scannedItem.name}</span>
                  </div>
                ) : (
                  <div className="text-center z-20 text-neutral-500">
                    <Barcode className="w-12 h-12 text-neutral-600 mx-auto mb-1" />
                    <span className="text-[9px] font-mono">ALIGN WOOD PACK BARCODE HERE</span>
                  </div>
                )}
              </div>

              {/* HUD corner marks */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800">
              <button
                onClick={handleBarcodeScanTrigger}
                disabled={isScanningBarcode}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Barcode className="w-4 h-4" />
                <span>{isScanningBarcode ? 'DECODING PRODUCT DATA...' : 'SIMULATE BARCODE SCAN'}</span>
              </button>
            </div>
          </div>

          {/* Barcode Match Result Card Panel */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-5 text-xs h-fit">
            {scannedItem ? (
              <>
                <div className="flex gap-4">
                  <img
                    src={scannedItem.image}
                    alt={scannedItem.name}
                    className="w-20 h-20 rounded-xl object-cover border border-neutral-800 bg-neutral-950 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full font-mono font-bold">
                      {scannedItem.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{scannedItem.name}</h3>
                    <p className="text-[10px] text-neutral-500 font-mono flex items-center gap-1">
                      <Barcode className="w-3.5 h-3.5" /> Barcode: {scannedItem.barcode}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-800/60 pt-4 space-y-4">
                  
                  {/* Stock counter and live modifier */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 flex items-center justify-between">
                    <div>
                      <span className="text-neutral-500 font-mono block text-[9px]">CURRENT WORKSHOP STOCK</span>
                      <span className="text-2xl font-mono font-bold text-white">{scannedItem.stock}</span>
                      <span className="text-neutral-400 text-[10px] font-mono ml-1.5">{scannedItem.unit}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAdjustStock(-10)}
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-red-400 font-bold flex items-center justify-center cursor-pointer transition-all border border-neutral-750"
                        title="Deduct 10 sheets"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleAdjustStock(-1)}
                        className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center cursor-pointer transition-all border border-neutral-750"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(1)}
                        className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold flex items-center justify-center cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(10)}
                        className="w-8 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold flex items-center justify-center cursor-pointer transition-all border border-amber-500/30"
                        title="Add 10 sheets"
                      >
                        +10
                      </button>
                    </div>
                  </div>

                  {/* Stock Location details */}
                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 block">WAREHOUSE SPOT</span>
                      <span className="text-white font-bold">{scannedItem.location}</span>
                    </div>
                    <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-850">
                      <span className="text-neutral-500 block">LICENSED DISTRIBUTOR</span>
                      <span className="text-amber-500 font-bold">{scannedItem.supplier}</span>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-neutral-400 leading-relaxed text-[10px] flex gap-2">
                    <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span>This barcode is registered to the official Algerian wood standards database. Adjusting quantities automatically updates stock logs in the primary inventory dashboard.</span>
                  </div>

                </div>
              </>
            ) : (
              <div className="text-center py-20 text-neutral-500">
                <Barcode className="w-10 h-10 text-neutral-600 mx-auto mb-3 animate-pulse" />
                <p>Scan a timber bundle, hardware box, or adhesive glue container barcode to immediately inspect storage metrics, aisle locations, and modify inventory registers.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
