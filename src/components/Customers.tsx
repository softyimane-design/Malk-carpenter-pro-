import React, { useState } from 'react';
import { Search, Plus, MapPin, Phone, MessageSquare, Mail, UserPlus, FileText, Check, AlertCircle } from 'lucide-react';
import { Customer, Language } from '../types';
import { translations, formatCurrency } from '../utils';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const malkMascot = new URL('../assets/images/malk_mascot_1783709415882.jpg', import.meta.url).href;

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

interface CustomersProps {
  language: Language;
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onSelectCustomer?: (customer: Customer) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
];

export default function Customers({ language, customers, onAddCustomer }: CustomersProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'financials'>('profile');

  // Filters & sorting states
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'with-balance' | 'settled'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'balance-desc' | 'paid-desc' | 'newest'>('newest');

  // New Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gps, setGps] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(AVATAR_PRESETS[0]);

  const filteredCustomers = customers
    .filter(c => {
      const matchQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.phone.includes(searchQuery) ||
                         c.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchBalance = balanceFilter === 'all' 
        ? true 
        : balanceFilter === 'with-balance' 
          ? c.outstandingBalance > 0 
          : c.outstandingBalance === 0;
      return matchQuery && matchBalance;
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'balance-desc') return b.outstandingBalance - a.outstandingBalance;
      if (sortBy === 'paid-desc') return b.totalPaid - a.totalPaid;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name,
      photo: photo.trim() || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      phone,
      whatsapp: phone.replace(/[^0-9]/g, ''),
      email,
      address,
      gps: gps || '33.5951, -7.6432', // default Casabalanca
      outstandingBalance: 0,
      totalPaid: 0,
      notes,
      createdAt: new Date().toISOString()
    };

    onAddCustomer(newCustomer);
    setShowAddModal(false);
    
    // reset
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setGps('');
    setNotes('');
    setPhoto('');
  };

  const openWhatsApp = (whatsapp: string) => {
    const formatted = whatsapp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t.customers}</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Premium Client Database & Craft History</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.addCustomer}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl flex flex-col md:flex-row gap-3 shadow-md">
        <div className="relative flex-1">
          <Search className="w-4.5 h-4.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 pl-10 pr-4 py-2.5 rounded-xl focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
          />
        </div>

        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Balance:</span>
            <select
              value={balanceFilter}
              onChange={(e) => setBalanceFilter(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-850 p-2 rounded-xl text-xs text-white"
            >
              <option value="all">All Clients</option>
              <option value="with-balance">Outstanding Debt</option>
              <option value="settled">Settled Accounts</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-850 p-2 rounded-xl text-xs text-white"
            >
              <option value="newest">Newest First</option>
              <option value="name-asc">A - Z Name</option>
              <option value="name-desc">Z - A Name</option>
              <option value="balance-desc">Debt (Highest)</option>
              <option value="paid-desc">Total Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List Column */}
        <div className="lg:col-span-2 space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-neutral-900 rounded-2xl border border-neutral-800/60 p-6 space-y-4">
              <img 
                src={malkMascot} 
                alt="Maâlem Malik Mascot" 
                className="w-16 h-16 rounded-full object-cover border border-amber-500/20 mx-auto opacity-70 filter grayscale-50"
                referrerPolicy="no-referrer"
              />
              <p className="text-xs text-neutral-400 italic">
                {language === 'ar' ? 'ما صبنا حتى زبون يطابق البحث نتاعك يا معلّم.' : 'No customers matched your search criteria.'}
              </p>
            </div>
          ) : (
            filteredCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedCust(c);
                  setActiveTab('profile');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedCust?.id === c.id
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-md shadow-amber-500/5'
                    : 'bg-neutral-900 hover:bg-neutral-900/60 border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={c.photo}
                    alt={c.name}
                    className="w-12 h-12 rounded-full object-cover border border-amber-500/20"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{c.phone}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-neutral-500 font-mono">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{c.address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {c.outstandingBalance > 0 ? (
                    <div className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-mono">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formatCurrency(c.outstandingBalance, language)}</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-mono">
                      <Check className="w-3 h-3" />
                      <span>Settle</span>
                    </div>
                  )}
                  <span className="block text-[10px] text-neutral-500 mt-1 font-mono">Paid: {formatCurrency(c.totalPaid, language)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Customer profile detail panel */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl space-y-4 h-fit">
          {selectedCust ? (() => {
            // Generate customized simulation data based on selected customer to keep CRM hyper-realistic
            const isSmail = selectedCust.name.toLowerCase().includes('smail');
            const isAmine = selectedCust.name.toLowerCase().includes('amine');
            
            const simulatedProjects = isSmail ? [
              { name: 'Luxury Oak Walk-In Wardrobe', status: 'Assembly', progress: 75, budget: 4500, deadline: 'July 25, 2026' },
              { name: 'Sawn Oak Dining Table v2', status: 'Delivered', progress: 100, budget: 3200, deadline: 'May 10, 2026' }
            ] : isAmine ? [
              { name: 'Bespoke Scandinavian Kitchen', status: 'Cutting', progress: 35, budget: 14500, deadline: 'August 12, 2026' }
            ] : [
              { name: 'Custom Office Cabinet Sets', status: 'Planning', progress: 10, budget: 2800, deadline: 'September 02, 2026' }
            ];

            const simulatedInvoices = isSmail ? [
              { id: 'INV-2026-089', item: 'Bespoke Walk-In Wardrobe (Deposit)', total: 4500, paid: 3000, date: '06/10/2026', status: 'Partially Paid' },
              { id: 'INV-2026-012', item: 'Sawn Oak Dining Table (Final)', total: 3200, paid: 3200, date: '05/01/2026', status: 'Fully Paid' }
            ] : isAmine ? [
              { id: 'INV-2026-104', item: 'Scandinavian Kitchen (Material Sourcing)', total: 14500, paid: 14500, date: '07/02/2026', status: 'Fully Paid' }
            ] : [
              { id: 'INV-2026-112', item: 'Custom Office Cabinet (Downpayment)', total: 2800, paid: 1400, date: '07/08/2026', status: 'Partially Paid' }
            ];

            return (
              <>
                <div className="flex flex-col items-center text-center border-b border-neutral-800 pb-3">
                  <img
                    src={selectedCust.photo}
                    alt={selectedCust.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <h3 className="text-sm font-bold text-white mt-2">{selectedCust.name}</h3>
                  <p className="text-[10px] text-amber-500 font-mono">ID: {selectedCust.id} • Joined: {new Date(selectedCust.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Tab selector */}
                <div className="grid grid-cols-3 bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'profile' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'projects' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    History
                  </button>
                  <button
                    onClick={() => setActiveTab('financials')}
                    className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'financials' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Invoices
                  </button>
                </div>

                {activeTab === 'profile' && (
                  <div className="space-y-3.5 text-[11px] pt-1">
                    <div className="flex justify-between border-b border-neutral-850 pb-2">
                      <span className="text-neutral-400">Main Phone:</span>
                      <a href={`tel:${selectedCust.phone}`} className="text-white font-bold hover:underline font-mono">
                        {selectedCust.phone}
                      </a>
                    </div>
                    <div className="flex justify-between border-b border-neutral-850 pb-2">
                      <span className="text-neutral-400">Email Address:</span>
                      <span className="text-neutral-200 font-mono font-medium truncate max-w-[170px]">{selectedCust.email}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-neutral-400 font-mono block">Custom Design Preferences:</span>
                      <p className="text-neutral-300 italic text-[10px] leading-relaxed bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                        {selectedCust.notes || "No custom design or wood moisture requirements logged."}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 font-mono">Site GPS Coordinates:</span>
                        <span className="text-[10px] text-neutral-500">{selectedCust.gps}</span>
                      </div>
                      
                      {(() => {
                        const gpsParts = selectedCust?.gps ? selectedCust.gps.split(',') : [];
                        const lat = gpsParts[0] ? parseFloat(gpsParts[0].trim()) : 36.7538;
                        const lng = gpsParts[1] ? parseFloat(gpsParts[1].trim()) : 3.0588;

                        return hasValidKey ? (
                          <div className="w-full h-[120px] rounded-xl overflow-hidden border border-neutral-800 shadow-inner">
                            <APIProvider apiKey={API_KEY} version="weekly">
                              <Map
                                defaultCenter={{ lat, lng }}
                                center={{ lat, lng }}
                                defaultZoom={13}
                                zoom={13}
                                mapId="DEMO_MAP_ID"
                                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                                style={{ width: '100%', height: '100%' }}
                                gestureHandling={'cooperative'}
                                disableDefaultUI={true}
                              >
                                <AdvancedMarker position={{ lat, lng }}>
                                  <Pin background="#f59e0b" glyphColor="#000" borderColor="#d97706" />
                                </AdvancedMarker>
                              </Map>
                            </APIProvider>
                          </div>
                        ) : (
                          <div className="w-full h-[100px] rounded-xl bg-neutral-950 border border-neutral-850 flex flex-col items-center justify-center p-3 text-center">
                            <MapPin className="w-4.5 h-4.5 text-neutral-700 mb-1 animate-pulse" />
                            <p className="text-[9px] text-neutral-400 leading-normal max-w-[190px]">
                              {language === 'ar' 
                                ? 'أدخل مفتاح الخريطة GOOGLE_MAPS_PLATFORM_KEY في الإعدادات لرؤية خريطة قوقل.' 
                                : 'Provide GOOGLE_MAPS_PLATFORM_KEY in Settings to enable interactive maps.'}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-2.5 pt-1">
                    <span className="text-neutral-500 font-mono text-[10px] uppercase block">COMMISSION WORK HISTORY</span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                      {simulatedProjects.map((p, i) => (
                        <div key={i} className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850 space-y-1.5">
                          <div className="flex justify-between items-start">
                            <h4 className="text-[11px] font-bold text-white line-clamp-1">{p.name}</h4>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono uppercase font-black ${
                              p.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              {p.status}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                              <span>Workshop Progress:</span>
                              <span className="text-white">{p.progress}%</span>
                            </div>
                            <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500" style={{ width: `${p.progress}%` }} />
                            </div>
                          </div>

                          <div className="flex justify-between text-[9px] font-mono text-neutral-500">
                            <span>Est: {p.deadline}</span>
                            <span className="text-green-400">${p.budget.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'financials' && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-mono">
                      <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-850">
                        <span className="text-[9px] text-neutral-500 block">TOTAL PAID</span>
                        <span className="text-green-400 font-black text-xs">{formatCurrency(selectedCust.totalPaid, language)}</span>
                      </div>
                      <div className="p-2 bg-neutral-950 rounded-xl border border-neutral-850">
                        <span className="text-[9px] text-neutral-500 block">DEBTS / OUTSTANDING</span>
                        <span className={`font-black text-xs ${selectedCust.outstandingBalance > 0 ? 'text-red-400' : 'text-neutral-400'}`}>
                          {formatCurrency(selectedCust.outstandingBalance, language)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-neutral-500 font-mono text-[10px] uppercase block">PREVIOUS INVOICES & PAYMENTS</span>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                        {simulatedInvoices.map((inv, idx) => (
                          <div key={idx} className="bg-neutral-950 p-2 rounded-lg border border-neutral-850 flex justify-between items-center">
                            <div>
                              <span className="text-[9px] font-mono text-neutral-500 block">{inv.id} • {inv.date}</span>
                              <span className="text-[10px] font-bold text-white block truncate max-w-[140px]">{inv.item}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-white block">${inv.total.toLocaleString()}</span>
                              <span className={`text-[8px] font-mono uppercase ${
                                inv.status === 'Fully Paid' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {inv.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Communication buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-850">
                  <button
                    onClick={() => openWhatsApp(selectedCust.whatsapp)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 px-3 rounded-xl text-[10px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer border border-neutral-750"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-green-500" />
                    <span>WhatsApp</span>
                  </button>
                  <a
                    href={`mailto:${selectedCust.email}`}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-2 px-3 rounded-xl text-[10px] font-mono transition-all flex items-center justify-center gap-1 cursor-pointer border border-neutral-750 text-center"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Send Email</span>
                  </a>
                </div>
              </>
            );
          })() : (
            <div className="text-center py-14">
              <FileText className="w-8 h-8 text-neutral-600 mx-auto mb-2.5 animate-pulse" />
              <p className="text-xs text-neutral-400">Select a customer profile to view extensive notes, invoices, & payments.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <UserPlus className="w-5 h-5 text-amber-500" />
              <span>Register New Client</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jean Dupont"
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+212 6..."
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Physical Delivery Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Boulevard d'Anfa, Residence..."
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">GPS Location Coordinates</label>
                  <input
                    type="text"
                    value={gps}
                    onChange={(e) => setGps(e.target.value)}
                    placeholder="33.5951, -7.6432"
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Custom Photo URL (Optional)</label>
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="https://images.unsplash..."
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-neutral-400 font-mono mb-1.5 block">Select Client Avatar Profile *</label>
                  <div className="flex gap-2.5 items-center overflow-x-auto py-1">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhoto(preset)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all shrink-0 ${
                          photo === preset ? 'border-amber-500 scale-110 shadow-md shadow-amber-500/20' : 'border-neutral-800 opacity-65'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Design & Woodwork Preferences / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Likes high gloss MDF, solid walnut table joints..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3.5 border-t border-neutral-800/60 pt-4 mt-4">
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
