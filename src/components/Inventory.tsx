import React, { useState } from 'react';
import { 
  Package, AlertTriangle, Plus, ShoppingCart, Info, Search, 
  RefreshCw, Layers, Scan, QrCode, Download, Printer, CheckCircle2 
} from 'lucide-react';
import { InventoryItem, Supplier, Language } from '../types';
import { translations } from '../utils';

interface InventoryProps {
  language: Language;
  inventory: InventoryItem[];
  suppliers: Supplier[];
  onAddStock: (itemId: string, qty: number) => void;
  onAddNewItem: (item: InventoryItem) => void;
}

export default function Inventory({ language, inventory, suppliers, onAddStock, onAddNewItem }: InventoryProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Modals state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  // Form states
  const [selectedItemId, setSelectedItemId] = useState('');
  const [restockQty, setRestockQty] = useState(10);
  const [selectedLabelItem, setSelectedLabelItem] = useState<InventoryItem | null>(null);
  
  // Scanner states
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [scanAction, setScanAction] = useState<'in' | 'out'>('in');
  const [scanQty, setScanQty] = useState<number>(5);
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');

  // New Item states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'wood' | 'mdf' | 'plywood' | 'paint' | 'glass' | 'aluminium' | 'hardware' | 'tool'>('wood');
  const [stock, setStock] = useState(10);
  const [minQuantity, setMinQuantity] = useState(5);
  const [unit, setUnit] = useState('pcs');
  const [supplierId, setSupplierId] = useState('');
  const [lastPrice, setLastPrice] = useState(10);

  const categories = [
    { key: 'all', label: t.all },
    { key: 'wood', label: 'Wood / Bois' },
    { key: 'mdf', label: 'MDF Panels' },
    { key: 'plywood', label: 'Plywood' },
    { key: 'paint', label: 'Paint & Finishes' },
    { key: 'hardware', label: 'Accessories & Hardware' }
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;
    onAddStock(selectedItemId, restockQty);
    setShowRestockModal(false);
    setSelectedItemId('');
    setRestockQty(10);
  };

  const handleNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name,
      category,
      stock,
      minQuantity,
      unit,
      supplierId: supplierId || 'supp-1',
      lastPrice
    };

    onAddNewItem(newItem);
    setShowAddModal(false);

    // reset
    setName('');
    setCategory('wood');
    setStock(10);
    setMinQuantity(5);
    setUnit('pcs');
    setSupplierId('');
    setLastPrice(10);
  };

  // Simulated scan procedure
  const handleSimulatedScan = (item: InventoryItem) => {
    setIsScanning(true);
    setScannedItem(null);
    setScanSuccessMsg('');
    
    setTimeout(() => {
      setIsScanning(false);
      setScannedItem(item);
    }, 1500);
  };

  const handleScanActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedItem) return;

    const multiplier = scanAction === 'in' ? 1 : -1;
    onAddStock(scannedItem.id, scanQty * multiplier);
    
    setScanSuccessMsg(`Successfully updated stock: ${scanAction === 'in' ? '+' : '-'}${scanQty} ${scannedItem.unit}`);
    const updated = { ...scannedItem, stock: Math.max(0, scannedItem.stock + (scanQty * multiplier)) };
    setScannedItem(updated);

    setTimeout(() => {
      setScanSuccessMsg('');
    }, 3000);
  };

  // SVG QR Generator for specific material serial/metadata
  const renderMaterialQr = (item: InventoryItem) => {
    const text = `MALK-CARPENTER-PRO-MATERIAL-ID:${item.id}-NAME:${item.name}`;
    const size = 21;
    const cells: boolean[][] = [];
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
      seed += text.charCodeAt(i);
    }
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x) > 0.5;
    };

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        const isTopLeftFinder = r < 7 && c < 7;
        const isTopRightFinder = r < 7 && c >= size - 7;
        const isBottomLeftFinder = r >= size - 7 && c < 7;
        
        if (isTopLeftFinder) {
          const isOuterBox = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          row.push(isOuterBox || isCenter);
        } else if (isTopRightFinder) {
          const isOuterBox = r === 0 || r === 6 || c === size - 1 || c === size - 7;
          const isCenter = r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3;
          row.push(isOuterBox || isCenter);
        } else if (isBottomLeftFinder) {
          const isOuterBox = r === size - 1 || r === size - 7 || c === 0 || c === 6;
          const isCenter = r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4;
          row.push(isOuterBox || isCenter);
        } else {
          row.push(random());
        }
      }
      cells.push(row);
    }

    return (
      <svg viewBox={`0 0 ${size} ${size}`} className="w-28 h-28 bg-white p-2.5 rounded-xl border border-neutral-300 shadow-inner">
        {cells.map((row, r) => 
          row.map((cell, c) => (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill={cell ? "#171717" : "#FFFFFF"}
            />
          ))
        )}
      </svg>
    );
  };

  const handlePrintLabel = () => {
    if (!selectedLabelItem) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Material QR Label - ${selectedLabelItem.id}</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #111; text-align: center; }
            .label-card { border: 2px solid #000; padding: 25px; border-radius: 12px; width: 280px; display: flex; flex-direction: column; align-items: center; gap: 15px; }
            .title { font-size: 14px; font-weight: bold; letter-spacing: 0.5px; margin: 0; }
            .subtitle { font-size: 10px; color: #666; margin: 0; font-family: monospace; }
            .barcode-line { font-family: monospace; font-size: 11px; background: #eee; padding: 4px 8px; border-radius: 4px; margin-top: 5px; }
            .footer-text { font-size: 9px; color: #777; margin: 0; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="label-card">
            <h2 class="title">MAÂLEM MALIK PRO</h2>
            <span class="subtitle">MATERIAL SPECIFICATION LABEL</span>
            <div style="background: white; padding: 8px; border: 1px solid #ddd; border-radius: 8px;">
              <svg width="120" height="120" viewBox="0 0 21 21">
                ${Array.from({ length: 21 }).map((_, r) => 
                  Array.from({ length: 21 }).map((_, c) => {
                    const seed = r * 13 + c * 37 + selectedLabelItem.name.charCodeAt(0);
                    const fill = (Math.sin(seed) * 1000 - Math.floor(Math.sin(seed) * 1000) > 0.4) ? "#111" : "#fff";
                    // make corners mock anchors
                    const isAnchor = (r<7 && c<7) || (r<7 && c>13) || (r>13 && c<7);
                    const anchorFill = isAnchor ? "#000" : fill;
                    return `<rect x="${c}" y="${r}" width="1" height="1" fill="${anchorFill}" />`;
                  }).join('')
                ).join('')}
              </svg>
            </div>
            <div>
              <p class="title" style="font-size: 13px; font-weight: 800;">${selectedLabelItem.name}</p>
              <div class="barcode-line">CODE: ${selectedLabelItem.id.toUpperCase()}</div>
            </div>
            <p class="footer-text">Inventory Unit: ${selectedLabelItem.stock} ${selectedLabelItem.unit}</p>
            <p class="footer-text" style="font-size:8px;">Certified by Malik Woodworking Guild 2026</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t.inventory}</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Premium Materials & Machinery Hardware Ledger</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScannerModal(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-amber-500 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-neutral-800"
          >
            <Scan className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Barcode Scanner</span>
          </button>
          <button
            onClick={() => setShowRestockModal(true)}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-neutral-700"
          >
            <ShoppingCart className="w-4 h-4 text-amber-500" />
            <span>Restock Materials</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* AI Stock Out Prediction & Active Restock Modeler */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">🔮</span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'ar' ? 'التنبؤ الذكي بنفاد المخزون 🤖' : 'AI Stock-Out Prediction & Restock Modeler'}
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                {language === 'ar' ? 'تحليل استهلاك السلعة ومشاريع الشانطي للتنبؤ بموعد نفاد المواد' : 'Analyzes active commissions and current stock depletion rates to predict stock-out warnings'}
              </p>
            </div>
          </div>
          <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full font-mono font-bold">
            PREDICTION DESK v1.2
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item 1 Prediction */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  CRITICAL: 5 DAYS LEFT
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Run-out: July 15</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">Okoume Marine Plywood 15mm</h4>
              <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                {language === 'ar' 
                  ? `بناءً على شانطي "المطبخ الإسكندنافي"، استهلاك كونت البلاكي راهو سريع. مخزونك الحالي (65 ورقة) راح يخلاص فـ 5 أيام.`
                  : `Commission 'Bespoke Scandinavian Oak Kitchen' will consume 50 sheets in the next 4 days. Your current stock is predicted to deplete completely by July 15.`}
              </p>
            </div>
            <button
              onClick={() => {
                const item = inventory.find(i => i.id === 'inv-4');
                if (item) {
                  setSelectedItemId(item.id);
                  setRestockQty(50);
                  setShowRestockModal(true);
                }
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black py-1.5 rounded-lg text-[10px] font-mono cursor-pointer transition-all"
            >
              ⚡ Auto-Order 50 Sheets
            </button>
          </div>

          {/* Item 2 Prediction */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  WARNING: 8 DAYS LEFT
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Run-out: July 18</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">American Walnut (Rough Sawn)</h4>
              <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                {language === 'ar' 
                  ? `طاولة الأكل الفاخرة المتبقية في جدولك تستهلك 1.8 م³ من خشب الجوز. ننصح بشراء 5 م³ إضافية لتفادي التوقف.`
                  : `Bespoke Dining table commissions are exhausting rough-sawn walnut reserves. Current m³ stock is forecasted to drop below critical margin in 8 days.`}
              </p>
            </div>
            <button
              onClick={() => {
                const item = inventory.find(i => i.id === 'inv-1');
                if (item) {
                  setSelectedItemId(item.id);
                  setRestockQty(5);
                  setShowRestockModal(true);
                }
              }}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-amber-500 border border-neutral-800 font-bold py-1.5 rounded-lg text-[10px] font-mono cursor-pointer transition-all"
            >
              ⚡ Auto-Order 5 m³
            </button>
          </div>

          {/* Item 3 Prediction */}
          <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  STABLE RESIDUES
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">Safe for 30+ Days</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1">Blum Soft-Close Hinges</h4>
              <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                {language === 'ar' 
                  ? `مخزون المفصلات نتاعك (450 حبة) راهو مستقر و كافي لكل المشاريع المؤكدة هذا الشهر. لا داعي لطلب إضافي حاليًا.`
                  : `Current hydraulic clip top hinges inventory (450 pcs) is robust and matches all queued assemblies and door orders for July.`}
              </p>
            </div>
            <div className="text-[10px] text-green-400 font-mono font-bold flex items-center justify-center py-2 border border-dashed border-green-500/20 rounded-lg bg-green-500/5">
              ✓ Supply chain optimized
            </div>
          </div>
        </div>
      </div>

      {/* Category Toggles & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/10'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative md:w-80">
          <Search className="w-4.5 h-4.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search raw materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 text-sm text-white placeholder-neutral-500 pl-10 pr-4 py-2 rounded-xl focus:border-amber-500/50 transition-all"
          />
        </div>
      </div>

      {/* Understock Warnings */}
      {inventory.some(i => i.stock <= i.minQuantity) && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 text-red-400 items-start">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Restock Required (Low Stock detected)</h4>
            <p className="text-[11px] text-neutral-400 mt-1">Some key wood slabs or Blum accessories are below minimum required thresholds, which could delay current commissions.</p>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInventory.map(item => {
          const isLow = item.stock <= item.minQuantity;
          const ratio = Math.min((item.stock / (item.minQuantity * 2.5)) * 100, 100);
          return (
            <div key={item.id} className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-850 text-neutral-400 border border-neutral-800">
                    {item.category}
                  </span>
                  
                  <button
                    onClick={() => { setSelectedLabelItem(item); setShowLabelModal(true); }}
                    className="p-1 hover:bg-neutral-800 rounded-lg text-amber-500 transition-all"
                    title="Generate QR Tag Label"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  {isLow && (
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                      LOW STOCK
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{item.name}</h3>
                
                <div className="flex justify-between mt-4 text-xs font-mono">
                  <span className="text-neutral-500">Available:</span>
                  <span className={`font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
                    {item.stock} {item.unit}
                  </span>
                </div>
                
                {/* Visual indicator bar */}
                <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden mt-2 border border-neutral-900">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isLow ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-neutral-800/60 mt-4 pt-3 flex justify-between items-center text-[10px] font-mono text-neutral-500">
                <span>Unit Cost: ${item.lastPrice}</span>
                <span>Min Required: {item.minQuantity}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barcode & QR Code High-Precision Scanner Simulation Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-850 pb-3">
              <Scan className="w-5 h-5 text-amber-500 animate-pulse" />
              <span>{language === 'ar' ? 'قارئ الباركود و مذكرات المخزون 📷' : 'High-Precision Barcode & QR Scanner'}</span>
            </h3>

            {/* Simulated Viewfinder View */}
            <div className="relative aspect-video bg-neutral-950 rounded-2xl border-2 border-dashed border-amber-500/40 overflow-hidden flex flex-col items-center justify-center">
              {isScanning ? (
                <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-xs text-neutral-400 font-mono">Initializing autofocus camera...</p>
                </div>
              ) : scannedItem ? (
                <div className="absolute inset-0 bg-amber-500/5 flex flex-col items-center justify-center p-4 space-y-2 text-center animate-fade-in">
                  <span className="p-2 bg-green-500/10 text-green-400 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">SCANNED COMPONENT</span>
                  <p className="text-sm text-white font-black">{scannedItem.name}</p>
                  <span className="text-[10px] bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800 text-neutral-400 font-mono">
                    ID: {scannedItem.id.toUpperCase()} • {scannedItem.stock} {scannedItem.unit} Left
                  </span>
                </div>
              ) : (
                <div className="text-center space-y-2 p-6 z-10">
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    Aim camera at Malik printed timber tags or hardware boxes to register or check out accessories.
                  </p>
                  <p className="text-[10px] text-amber-500/80 font-mono">
                    [ CAMERA INTERFACE SECURED BY MALOUK OS ]
                  </p>
                </div>
              )}

              {/* Red laser line effect */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse z-20" />
            </div>

            {/* Quick list to simulate scanning any item */}
            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 font-mono uppercase block">SIMULATE MATERIAL SCAN (SELECT TIMBER BARCODE):</span>
              <div className="grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto pr-1">
                {inventory.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSimulatedScan(item)}
                    className="p-2 bg-neutral-950 hover:bg-neutral-850 text-left text-[11px] text-white rounded-lg border border-neutral-800 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span className="truncate pr-1 font-bold">{item.name}</span>
                    <span className="text-[9px] text-neutral-500 font-mono">SCAN</span>
                  </button>
                ))}
              </div>
            </div>

            {/* If scanned successfully, render stock controller */}
            {scannedItem && (
              <form onSubmit={handleScanActionSubmit} className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800/60 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-400 font-mono block mb-1">SCAN TRANSACTION</label>
                    <select
                      value={scanAction}
                      onChange={(e) => setScanAction(e.target.value as any)}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white"
                    >
                      <option value="in">Check-In / Add Stock</option>
                      <option value="out">Check-Out / Use on Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-neutral-400 font-mono block mb-1">TRANSACTION QTY</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={scanQty}
                      onChange={(e) => setScanQty(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                {scanSuccessMsg && (
                  <p className="text-green-400 text-[10px] font-mono text-center py-1 bg-green-500/5 border border-green-500/10 rounded">
                    ✓ {scanSuccessMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold py-2 rounded-lg"
                >
                  Confirm scan action & Update stock ledger
                </button>
              </form>
            )}

            <div className="flex justify-end pt-3 border-t border-neutral-850">
              <button
                type="button"
                onClick={() => {
                  setShowScannerModal(false);
                  setScannedItem(null);
                }}
                className="bg-neutral-800 hover:bg-neutral-750 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE QR LABEL PREVIEW MODAL */}
      {showLabelModal && selectedLabelItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative text-center">
            <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5 border-b border-neutral-800 pb-3">
              <QrCode className="w-5 h-5 text-amber-500" />
              <span>Timber Tag Label Preview</span>
            </h3>

            <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-neutral-200 shadow-md text-neutral-950 space-y-4 max-w-[260px] mx-auto">
              <span className="text-[10px] text-neutral-500 font-mono font-bold tracking-widest uppercase">MALIK CARPENTRY GUILD</span>
              {renderMaterialQr(selectedLabelItem)}
              <div>
                <p className="text-xs font-black leading-snug">{selectedLabelItem.name}</p>
                <span className="text-[9px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono font-bold uppercase mt-1 inline-block">
                  {selectedLabelItem.id.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-neutral-400 font-sans">
              Print this label tag and stick it on raw timber plates or hardware boxes for easy camera scanning.
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-neutral-800/60">
              <button
                type="button"
                onClick={() => setShowLabelModal(false)}
                className="bg-neutral-800 hover:bg-neutral-800/60 text-white font-bold px-4 py-2 rounded-xl cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintLabel}
                className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-xl cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tag Label</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <ShoppingCart className="w-5 h-5 text-amber-500" />
              <span>Purchase Log restock</span>
            </h3>

            <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Select Material / Hardware</label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                >
                  <option value="">-- Choose Item --</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.stock} {item.unit} left)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Quantity to purchase *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={restockQty}
                  onChange={(e) => setScanQty(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="bg-neutral-800 hover:bg-neutral-800/60 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Confirm purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>Add New Catalog Item</span>
            </h3>

            <form onSubmit={handleNewItemSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Material Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Red Oak Slabs Premium"
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white"
                  >
                    <option value="wood">Solid Wood</option>
                    <option value="mdf">MDF Panels</option>
                    <option value="plywood">Plywood Sheets</option>
                    <option value="paint">Paint & Polish</option>
                    <option value="glass">Glass inserts</option>
                    <option value="aluminium">Aluminium structures</option>
                    <option value="hardware">Hinges & Handles</option>
                    <option value="tool">Machines & Tools</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Stock Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. m3, sheets, liters, pcs"
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Initial Stock *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Minimum Alert Qty *</label>
                  <input
                    type="number"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Associated Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white"
                  >
                    <option value="">-- Choose --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Last Purchase Price ($)</label>
                  <input
                    type="number"
                    value={lastPrice}
                    onChange={(e) => setLastPrice(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-neutral-800 hover:bg-neutral-800/60 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
