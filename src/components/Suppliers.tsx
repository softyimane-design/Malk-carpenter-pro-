import React, { useState } from 'react';
import { PackageOpen, Phone, Mail, Plus, UserPlus, Info, Check, Search } from 'lucide-react';
import { Supplier, Language } from '../types';
import { translations } from '../utils';

interface SuppliersProps {
  language: Language;
  suppliers: Supplier[];
  onAddSupplier: (sup: Supplier) => void;
}

export default function Suppliers({ language, suppliers, onAddSupplier }: SuppliersProps) {
  const t = translations[language];
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSup, setSelectedSup] = useState<Supplier | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [materials, setMaterials] = useState<string[]>([]);
  const [materialInput, setMaterialInput] = useState('');

  const handleAddMaterial = () => {
    if (materialInput.trim()) {
      setMaterials([...materials, materialInput.trim()]);
      setMaterialInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSup: Supplier = {
      id: `supp-${Date.now()}`,
      name,
      contact,
      phone,
      email,
      materials: materials.length > 0 ? materials : ['General Hardware']
    };

    onAddSupplier(newSup);
    setShowAddModal(false);

    // reset
    setName('');
    setContact('');
    setPhone('');
    setEmail('');
    setMaterials([]);
    setMaterialInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t.suppliers}</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Timber Harvesters & Hardware Sourcing catalogs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>{t.addSupplier}</span>
        </button>
      </div>

      {/* AI Supplier Comparison & Sourcing Matcher */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">🏆</span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'ar' ? 'مقارن الموردين الذكي 🤖' : 'AI Supplier Price Comparison & Optimizer'}
              </h3>
              <p className="text-[10px] text-neutral-400 font-mono">
                {language === 'ar' ? 'قارن الأسعار بين الموردين وابحث عن الصفقة الأرخص تلقائيًا' : 'Compare catalog items to automatically find and lock the cheapest deal'}
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-mono font-bold animate-pulse">
            ALGERIA DEAL FINDER v2.5
          </span>
        </div>

        {(() => {
          const [selectedMaterial, setSelectedMaterial] = useState('walnut');
          const [compareQty, setCompareQty] = useState(10);

          const materialsPrices: Record<string, { name: string; unit: string; rates: Record<string, number> }> = {
            walnut: {
              name: 'American Walnut Wood (Rough Sawn)',
              unit: 'm³',
              rates: { 'supp-1': 4100, 'supp-2': 4450, 'supp-3': 4600 }
            },
            oak: {
              name: 'Premium European White Oak',
              unit: 'm³',
              rates: { 'supp-1': 3750, 'supp-2': 3900, 'supp-3': 4150 }
            },
            mdf: {
              name: 'MDF Core Sheet 18mm',
              unit: 'sheets',
              rates: { 'supp-1': 48, 'supp-2': 42, 'supp-3': 52 }
            },
            plywood: {
              name: 'Okoume Marine Plywood 15mm',
              unit: 'sheets',
              rates: { 'supp-1': 68, 'supp-2': 62, 'supp-3': 70 }
            },
            hinges: {
              name: 'Blum Clip Top Soft-Close Hinges',
              unit: 'pcs',
              rates: { 'supp-1': 5.2, 'supp-2': 4.8, 'supp-3': 4.3 }
            },
            handles: {
              name: 'Solid Brushed Brass Gold Handle',
              unit: 'pcs',
              rates: { 'supp-1': 14.5, 'supp-2': 13.0, 'supp-3': 11.5 }
            }
          };

          const activeData = materialsPrices[selectedMaterial];
          
          // Find supplier with lowest rate
          let bestSupplierId = '';
          let lowestPrice = Infinity;
          
          Object.entries(activeData.rates).forEach(([supId, rate]) => {
            if (rate < lowestPrice) {
              lowestPrice = rate;
              bestSupplierId = supId;
            }
          });

          const bestSup = suppliers.find(s => s.id === bestSupplierId) || suppliers[0];
          const totalBestCost = lowestPrice * compareQty;

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono uppercase block mb-1.5">Select Material Line</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 font-sans cursor-pointer"
                  >
                    <option value="walnut">American Walnut Wood (Rough Sawn)</option>
                    <option value="oak">Premium European White Oak</option>
                    <option value="mdf">MDF Core Sheet 18mm</option>
                    <option value="plywood">Okoume Marine Plywood 15mm</option>
                    <option value="hinges">Blum Soft-Close Hinges</option>
                    <option value="handles">Solid Brushed Brass Gold Handle</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-mono uppercase block mb-1.5">Required Quantity ({activeData.unit})</label>
                  <input
                    type="number"
                    min={1}
                    value={compareQty}
                    onChange={(e) => setCompareQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs font-mono text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Sourcing Price Rates Grid */}
              <div className="space-y-2.5 border-y md:border-y-0 md:border-x border-neutral-800/80 py-3 md:py-0 md:px-4">
                <span className="text-[10px] text-neutral-500 font-mono uppercase block">Supplier Price Matrix</span>
                
                <div className="space-y-1.5">
                  {suppliers.map(sup => {
                    const pricePerUnit = activeData.rates[sup.id] || (lowestPrice * 1.15);
                    const isWinner = sup.id === bestSupplierId;
                    const totalCost = pricePerUnit * compareQty;

                    return (
                      <div
                        key={sup.id}
                        className={`p-2 rounded-lg border flex justify-between items-center transition-all ${
                          isWinner 
                            ? 'bg-green-500/5 border-green-500/25' 
                            : 'bg-neutral-900/40 border-neutral-850 opacity-75'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-bold text-white block">{sup.name}</span>
                          <span className="text-[9px] text-neutral-400 font-mono">
                            Unit: ${pricePerUnit.toFixed(1)} / {activeData.unit}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-mono font-black ${isWinner ? 'text-green-400' : 'text-neutral-300'}`}>
                            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </span>
                          {isWinner && (
                            <span className="block text-[8px] bg-green-500 text-neutral-950 px-1 py-0.2 rounded font-mono font-bold mt-0.5">
                              CHEAPEST DEAL
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sourcing Recommendation output */}
              <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-amber-500 font-mono uppercase font-bold block">MALIK RECOMMENDED SOURCE 🏆</span>
                  <h4 className="text-xs font-black text-white">{bestSup?.name || 'Sourcing Vendor'}</h4>
                  <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">
                    {language === 'ar' 
                      ? `الصفقة الأفضل راهي عند ${bestSup?.name}. شري الكمية المحددة بسعر ${totalBestCost.toLocaleString()} دولار كإجمالي. هذا يوفرلك حوالي 15% مقارنة بالموردين الآخرين في السوق.`
                      : `The most cost-effective provider for ${activeData.name} is ${bestSup?.name}. Purchasing here yields a total cost of $${totalBestCost.toLocaleString()} and ensures maximum profit margins.`}
                  </p>
                </div>

                <div className="flex gap-2 text-[9px] pt-1 font-mono">
                  <a
                    href={`tel:${bestSup?.phone}`}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black py-2 rounded-lg text-center cursor-pointer transition-all"
                  >
                    📞 Order Instantly
                  </a>
                  <a
                    href={`mailto:${bestSup?.email}`}
                    className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-750 font-bold py-2 rounded-lg text-center cursor-pointer transition-all"
                  >
                    Send Email
                  </a>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Suppliers List */}
        <div className="lg:col-span-2 space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {suppliers.map(sup => (
            <div
              key={sup.id}
              onClick={() => setSelectedSup(sup)}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-neutral-900 flex justify-between items-center ${
                selectedSup?.id === sup.id ? 'border-amber-500/40 bg-amber-500/5' : 'border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center text-amber-500 border border-neutral-700">
                  <PackageOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{sup.name}</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Contact: {sup.contact} • {sup.phone}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-neutral-950 px-2.5 py-1 rounded border border-neutral-800 text-neutral-400">
                {sup.materials.length} material lines
              </span>
            </div>
          ))}
        </div>

        {/* Details sidebar */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-5 h-fit text-xs">
          {selectedSup ? (
            <>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedSup.name}</h3>
                <p className="text-[11px] text-amber-500 font-mono mt-0.5">Supplier ID: {selectedSup.id}</p>
              </div>

              <div className="border-t border-neutral-800/60 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Main Representative:</span>
                  <span className="text-white font-medium">{selectedSup.contact}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Contact Line:</span>
                  <a href={`tel:${selectedSup.phone}`} className="text-amber-500 font-bold hover:underline">
                    {selectedSup.phone}
                  </a>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Email:</span>
                  <a href={`mailto:${selectedSup.email}`} className="text-amber-500 font-bold hover:underline">
                    {selectedSup.email}
                  </a>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800/40">
                  <span className="text-neutral-500 block font-mono">Sourced Catalog items:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSup.materials.map((m, i) => (
                      <span key={i} className="bg-neutral-950 text-neutral-300 font-mono px-2 py-1 rounded border border-neutral-800 text-[10px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-14">
              <PackageOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2.5 animate-pulse" />
              <p className="text-xs text-neutral-400">Select any partner vendor to view bulk pricing structures, order timber shipments, and request custom hardware logs.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <UserPlus className="w-5 h-5 text-amber-500" />
              <span>Partner Supplier Agreement</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Company Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Casablanca Lumber Yards"
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Sales Representative Contact Name</label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="e.g. Jean"
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 522..."
                    className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@lumber.com"
                    className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Material tags config */}
              <div className="space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800/60">
                <label className="text-neutral-400 font-mono mb-1 block">Catalog Sourced Materials</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    placeholder="e.g. Baltic Birch"
                    className="flex-1 bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterial}
                    className="bg-amber-500 text-neutral-950 px-3.5 rounded-lg font-bold hover:bg-amber-600"
                  >
                    Add
                  </button>
                </div>
                {materials.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {materials.map((m, i) => (
                      <span key={i} className="bg-neutral-800 text-white font-mono px-2 py-0.5 rounded text-[10px]">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
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
