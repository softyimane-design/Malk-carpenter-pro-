import React, { useState } from 'react';
import { Hammer, Plus, Ruler, Users, Calendar, Award, Mic, Play, Square, FileText, CheckCircle2, ChevronRight, Calculator, Sparkles } from 'lucide-react';
import { Project, Customer, Employee, ProjectType, ProjectStatus, Language } from '../types';
import { translations, calculateAreaAndVolume, formatCurrency } from '../utils';

const malkMascot = new URL('../assets/images/malk_mascot_1783709415882.jpg', import.meta.url).href;

interface ProjectsProps {
  language: Language;
  projects: Project[];
  customers: Customer[];
  employees: Employee[];
  onAddProject: (project: Project) => void;
  onUpdateStatus: (projectId: string, status: ProjectStatus) => void;
  onUpdateProject?: (project: Project) => void;
}

export default function Projects({ language, projects, customers, employees, onAddProject, onUpdateStatus, onUpdateProject }: ProjectsProps) {
  const t = translations[language];
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);

  // Search & Filter States
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<'all' | ProjectType>('all');
  const [projectSortBy, setProjectSortBy] = useState<'newest' | 'budget-desc' | 'budget-asc' | 'deadline'>('newest');

  const filteredProjects = projects
    .filter(p => {
      const cust = customers.find(c => c.id === p.customerId);
      const matchSearch = p.name.toLowerCase().includes(projectSearch.toLowerCase()) || 
                          (cust?.name || '').toLowerCase().includes(projectSearch.toLowerCase()) ||
                          p.id.toLowerCase().includes(projectSearch.toLowerCase());
      const matchStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;
      const matchType = projectTypeFilter === 'all' || p.type === projectTypeFilter;
      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => {
      if (projectSortBy === 'budget-desc') return b.budget - a.budget;
      if (projectSortBy === 'budget-asc') return a.budget - b.budget;
      if (projectSortBy === 'deadline') return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });

  // Voice recorder simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<string[]>([]);
  const [wave, setWave] = useState<number[]>([10, 15, 8, 25, 30, 12, 18, 40, 20, 15, 35, 10]);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('custom');
  const [customerId, setCustomerId] = useState('');
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(800);
  const [depth, setDepth] = useState(600);
  const [unit, setUnit] = useState<'mm' | 'cm' | 'm'>('mm');
  const [budget, setBudget] = useState(5000);
  const [expenses, setExpenses] = useState(1800);
  const [notes, setNotes] = useState('');
  const [workers, setWorkers] = useState<string[]>([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [warranty, setWarranty] = useState(5);

  // Auto Cost Estimator States
  const [calcMaterial, setCalcMaterial] = useState<'walnut' | 'oak' | 'beech' | 'mdf' | 'plywood'>('mdf');
  const [calcLaborLevel, setCalcLaborLevel] = useState<'master' | 'apprentice'>('master');
  const [showAutoCalc, setShowAutoCalc] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !customerId) return;

    // Area & Volume calculation
    const calc = calculateAreaAndVolume(width, height, depth, unit);

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      type,
      customerId,
      status: 'confirmed',
      measurements: {
        width,
        height,
        depth,
        unit,
        area: calc.area,
        volume: calc.volume
      },
      budget,
      expenses,
      profit: budget - expenses,
      workers,
      notes,
      photos: ['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=600'],
      photosBefore: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600'],
      photosAfter: [],
      videos: [],
      voiceNotes: recordedNotes,
      deliveryDate: deliveryDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      installationDate: installationDate || new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      warrantyYears: warranty,
      documents: [{ name: 'Technical Drawing.pdf', url: '#' }],
      createdAt: new Date().toISOString()
    };

    onAddProject(newProject);
    setShowAddModal(false);
    setRecordedNotes([]);

    // Reset Form
    setName('');
    setType('custom');
    setCustomerId('');
    setWidth(1200);
    setHeight(800);
    setDepth(600);
    setUnit('mm');
    setBudget(5000);
    setExpenses(1800);
    setNotes('');
    setWorkers([]);
    setDeliveryDate('');
    setInstallationDate('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // add simulated voice note
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRecordedNotes([...recordedNotes, `Voice Note - Recorded at ${timeStr}`]);
    } else {
      setIsRecording(true);
      // animate voice waves
      const interval = setInterval(() => {
        setWave(Array.from({ length: 12 }, () => Math.floor(Math.random() * 45) + 5));
      }, 150);
      setTimeout(() => clearInterval(interval), 5000); // safety
    }
  };

  const handleAddBeforePhoto = () => {
    if (!selectedProj || !onUpdateProject) return;
    const presets = [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1541535881962-e66058d87336?auto=format&fit=crop&q=80&w=600'
    ];
    const currentBefore = selectedProj.photosBefore || [];
    const nextPhoto = presets[currentBefore.length % presets.length];
    const updated: Project = {
      ...selectedProj,
      photosBefore: [...currentBefore, nextPhoto]
    };
    onUpdateProject(updated);
    setSelectedProj(updated);
  };

  const handleAddAfterPhoto = () => {
    if (!selectedProj || !onUpdateProject) return;
    const presets = [
      'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600'
    ];
    const currentAfter = selectedProj.photosAfter || [];
    const nextPhoto = presets[currentAfter.length % presets.length];
    const updated: Project = {
      ...selectedProj,
      photosAfter: [...currentAfter, nextPhoto]
    };
    onUpdateProject(updated);
    setSelectedProj(updated);
  };

  const getAutoCalculatedRates = () => {
    const calc = calculateAreaAndVolume(width, height, depth, unit);
    const volume = calc.volume;
    const area = calc.area;

    const woodPrices = {
      walnut: 4200,
      oak: 3800,
      beech: 2400,
      mdf: 45,
      plywood: 65
    };

    let materialCost = 150;

    if (calcMaterial === 'walnut' || calcMaterial === 'oak' || calcMaterial === 'beech') {
      const volUsed = Math.max(0.05, volume);
      materialCost += volUsed * woodPrices[calcMaterial];
    } else {
      const sheetsUsed = Math.max(1, Math.ceil(area * 1.5));
      materialCost += sheetsUsed * woodPrices[calcMaterial];
    }

    const typeLaborHours: Record<ProjectType, number> = {
      kitchen: 45,
      bedroom: 30,
      wardrobe: 25,
      door: 12,
      window: 10,
      cabinet: 18,
      tv_unit: 15,
      office: 20,
      table: 8,
      custom: 20
    };

    const baseHours = typeLaborHours[type] || 20;
    const sizeModifier = Math.max(0.8, Math.min(2.5, area / 2));
    const finalHours = Math.round(baseHours * sizeModifier);

    const hourlyRate = calcLaborLevel === 'master' ? 35 : 18;
    const laborCost = finalHours * hourlyRate;

    const estimatedExpenses = Math.round(materialCost);
    const estimatedLabor = Math.round(laborCost);
    const suggestedSelling = Math.round((estimatedExpenses + estimatedLabor) * 1.45);

    return {
      materialCost: estimatedExpenses,
      laborCost: estimatedLabor,
      totalCost: estimatedExpenses + estimatedLabor,
      suggestedSelling,
      hours: finalHours,
      volume,
      area
    };
  };

  const calculatedRates = getAutoCalculatedRates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t.projects}</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Precision Wood Carpentry Orders & CAD Blueprint specs</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addProject}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project List Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Integrated Advanced Search & Multi-Filters Panel */}
          {projects.length > 0 && (
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3 shadow-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'البحث عن مشروع أو زبون...' : 'Search project, client, ID...'}
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 pl-9 pr-4 py-2.5 rounded-xl focus:border-amber-500/50"
                />
                <span className="absolute left-3 top-3.5 text-neutral-500">🔍</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[9px] font-mono uppercase">
                <div>
                  <label className="text-neutral-500 block mb-1">Status</label>
                  <select
                    value={projectStatusFilter}
                    onChange={(e) => setProjectStatusFilter(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg text-white"
                  >
                    <option value="all">All statuses</option>
                    <option value="quotation">Quotation</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cutting">Cutting</option>
                    <option value="assembly">Assembly</option>
                    <option value="painting">Painting</option>
                    <option value="ready">Ready</option>
                    <option value="delivery">Delivery</option>
                    <option value="installation">Installation</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-500 block mb-1">Category</label>
                  <select
                    value={projectTypeFilter}
                    onChange={(e) => setProjectTypeFilter(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg text-white"
                  >
                    <option value="all">All categories</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="bedroom">Bedroom</option>
                    <option value="wardrobe">Wardrobe</option>
                    <option value="door">Door</option>
                    <option value="window">Window</option>
                    <option value="cabinet">Cabinet</option>
                    <option value="table">Table</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-500 block mb-1">Sort by</label>
                  <select
                    value={projectSortBy}
                    onChange={(e) => setProjectSortBy(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="budget-desc">Budget (High)</option>
                    <option value="budget-asc">Budget (Low)</option>
                    <option value="deadline">Delivery Deadline</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-amber-500/15 p-8 space-y-6 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                
                {/* Premium Mascot representation holding tools */}
                <div className="relative inline-block animate-float">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full blur-md opacity-50 animate-pulse" />
                  <div className="relative w-28 h-28 rounded-full p-1 bg-white border-2 border-amber-500 shadow-premium-orange mx-auto overflow-hidden">
                    <img 
                      src={malkMascot} 
                      alt="Maâlem Malik" 
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Simulated tool badges around the mascot */}
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 bg-neutral-800 text-amber-500 p-1.5 rounded-full shadow-md">
                    <Ruler className="w-4 h-4" />
                  </div>
                </div>

                {/* Required messages with elegant design */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-neutral-900">
                    {language === 'ar' ? 'لا توجد مشاريع بعد.' : 'No projects yet.'}
                  </h3>
                  <p className="text-sm font-bold text-amber-600">
                    {language === 'ar' ? 'ابدأ أول مشروع الآن.' : 'Start your first project now.'}
                  </p>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    {language === 'ar' 
                      ? 'قم بإضافة مشروعك الأول وحدد القياسات، العتاد المالي وسجل ملاحظات الصانع مع اقتراحات الذكاء الاصطناعي.'
                      : 'Create a project to optimize your stock usage, calculate accurate wood volume and configure cutting layouts.'}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="mx-auto bg-amber-500 hover:bg-amber-600 text-neutral-950 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.addProject}</span>
                </button>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-400 text-xs">
                No matching projects found
              </div>
            ) : (
              filteredProjects.map((p) => {
              const cust = customers.find(c => c.id === p.customerId);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProj(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer bg-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    selectedProj?.id === p.id
                      ? 'border-amber-500/40 bg-amber-500/5'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                      <Hammer className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{p.name}</h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Client: <span className="text-white font-medium">{cust ? cust.name : 'Unspecified'}</span> • Class: {p.type}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-neutral-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5" />
                          {p.measurements.width}x{p.measurements.height}x{p.measurements.depth} {p.measurements.unit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calculator className="w-3.5 h-3.5" />
                          {p.measurements.area} m² / {p.measurements.volume} m³
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800">
                    <div className="text-left md:text-right">
                      <span className="block text-[11px] text-neutral-500 font-mono">Budget</span>
                      <span className="text-xs font-bold font-mono text-white">{formatCurrency(p.budget, language)}</span>
                    </div>
                    <span className={`text-[10px] uppercase font-mono px-3 py-1 rounded-full ${
                      p.status === 'completed' ? 'bg-green-500/15 text-green-400 border border-green-500/20' :
                      p.status === 'ready' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                      p.status === 'painting' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                      p.status === 'cutting' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                      'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Selected Project Side View */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-5 h-fit text-xs text-neutral-300">
          {selectedProj ? (
            <>
              {/* Cover Image */}
              <div className="relative h-40 rounded-xl overflow-hidden shadow-sm">
                <img 
                  src={selectedProj.photos?.[0] || 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=600'} 
                  alt={selectedProj.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[9px] bg-amber-500 text-neutral-950 font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                    {selectedProj.type}
                  </span>
                  <h3 className="text-sm font-black mt-1 leading-tight">{selectedProj.name}</h3>
                  <p className="text-[9px] text-neutral-400 font-mono mt-0.5">ID: {selectedProj.id}</p>
                </div>
              </div>

              {/* Customer Profile Card */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block">
                  {language === 'ar' ? 'الزبون المرتبط' : 'Associated Client'}
                </span>
                {(() => {
                  const cust = customers.find(c => c.id === selectedProj.customerId);
                  if (!cust) return <p className="text-neutral-500 italic">No customer linked</p>;
                  return (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm border border-amber-500/20">
                        {cust.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white text-xs">{cust.name}</h4>
                        <p className="text-[10px] text-neutral-400">{cust.phone}</p>
                      </div>
                      <a 
                        href={`https://wa.me/${cust.whatsapp || cust.phone}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg transition-colors cursor-pointer text-[10px] font-bold"
                        title="WhatsApp Client"
                      >
                        WhatsApp
                      </a>
                    </div>
                  );
                })()}
              </div>

              {/* Progress Percentage calculated from Status */}
              {(() => {
                const statusProgress: Record<ProjectStatus, number> = {
                  quotation: 10,
                  confirmed: 25,
                  cutting: 40,
                  assembly: 60,
                  painting: 75,
                  ready: 90,
                  delivery: 95,
                  installation: 98,
                  completed: 100
                };
                const percentage = statusProgress[selectedProj.status] || 25;
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-neutral-500 uppercase">Fulfillment Progress</span>
                      <span className="text-amber-500 font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Status Update Dropdown */}
              <div className="space-y-1.5">
                <span className="text-neutral-500 block font-mono text-[10px] uppercase">Update Workshop Status</span>
                <select
                  value={selectedProj.status}
                  onChange={(e) => onUpdateStatus(selectedProj.id, e.target.value as ProjectStatus)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:border-amber-500 font-mono cursor-pointer"
                >
                  <option value="quotation">Quotation / Devis (10%)</option>
                  <option value="confirmed">Confirmed / Confirmé (25%)</option>
                  <option value="cutting">Cutting / Découpe (40%)</option>
                  <option value="assembly">Assembly / Assemblage (60%)</option>
                  <option value="painting">Painting & Finish (75%)</option>
                  <option value="ready">Ready / Prêt (90%)</option>
                  <option value="delivery">Out for Delivery (95%)</option>
                  <option value="installation">Installation on-site (98%)</option>
                  <option value="completed">Completed / Complété (100%)</option>
                </select>
              </div>

              {/* Finances comparison card */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] text-neutral-500 block font-mono">BUDGET</span>
                  <span className="text-xs font-bold text-white font-mono block mt-0.5">{formatCurrency(selectedProj.budget, language)}</span>
                </div>
                <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] text-neutral-500 block font-mono">EXPENSES</span>
                  <span className="text-xs font-bold text-red-400 font-mono block mt-0.5">{formatCurrency(selectedProj.expenses, language)}</span>
                </div>
                <div className="bg-green-500/5 border border-green-500/10 p-2.5 rounded-xl text-center">
                  <span className="text-[9px] text-neutral-500 block font-mono">PROFIT</span>
                  <span className="text-xs font-bold text-green-400 font-mono block mt-0.5">{formatCurrency(selectedProj.profit, language)}</span>
                </div>
              </div>

              {/* Wood & Hardware Materials checklist */}
              <div className="space-y-1.5">
                <span className="text-neutral-500 block font-mono text-[10px] uppercase">Required Materials</span>
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="font-sans text-neutral-200">
                      {selectedProj.type === 'kitchen' ? 'MDF High-Gloss Panels & Hydraulic Hinges' :
                       selectedProj.type === 'door' ? 'Solid Beech Wood & Heavy brass locks' :
                       selectedProj.type === 'table' ? 'Solid Oak Timber & Sandpaper grits 120-240' :
                       'Veneered Plywood Sheets, Wood glue & fasteners'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                    <span>{language === 'ar' ? 'الحجم المقدر:' : 'Est. Volume:'} {selectedProj.measurements.volume} m³</span>
                    <span>•</span>
                    <span>{language === 'ar' ? 'المساحة:' : 'Est. Area:'} {selectedProj.measurements.area} m²</span>
                  </div>
                </div>
              </div>

              {/* Workers assigned */}
              <div className="space-y-2">
                <span className="text-neutral-500 block font-mono text-[10px] uppercase">Assigned Technicians ({selectedProj.workers.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProj.workers.length === 0 ? (
                    <span className="text-neutral-500 italic">No workers assigned</span>
                  ) : (
                    selectedProj.workers.map(wId => {
                      const emp = employees.find(e => e.id === wId);
                      return (
                        <span key={wId} className="bg-neutral-950 text-neutral-300 font-bold px-2.5 py-1 rounded-lg border border-neutral-800 text-[10px]">
                          👤 {emp ? emp.name : wId}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Notes / Instructions */}
              <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 space-y-1">
                <span className="text-neutral-500 block font-mono text-[9px] uppercase">Special Instructions / Notes</span>
                <p className="text-neutral-300 italic leading-relaxed">{selectedProj.notes || "No special instructions written."}</p>
              </div>

              {/* Deadlines */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 block text-[8px] uppercase">DELIVERY DEADLINE</span>
                  <span className="text-white font-bold block mt-0.5">📅 {selectedProj.deliveryDate}</span>
                </div>
                <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 block text-[8px] uppercase">INSTALLATION ON-SITE</span>
                  <span className="text-white font-bold block mt-0.5">📅 {selectedProj.installationDate}</span>
                </div>
              </div>

              {/* Interactive Project Timeline Milestones (Feature 8) */}
              <div className="space-y-3">
                <span className="text-neutral-500 block font-mono text-[10px] uppercase">PROJECT TIMELINE & MILESTONES</span>
                <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-4">
                  {(() => {
                    const milestones = [
                      { label: "Design Draft & 3D Approval", desc: "Client signed off CAD renders", targetStatus: "confirmed" },
                      { label: "Timber Sourcing & Breaking", desc: "Select and rough-cut planks", targetStatus: "cutting" },
                      { label: "Milling & Joint Assembly", desc: "Pocket screw joints & domino check", targetStatus: "assembly" },
                      { label: "Progressive Fine Sanding & Lacquer", desc: "Satin polyurethane coating layers", targetStatus: "painting" },
                      { label: "Secure Dispatch Delivery", desc: "Padded wrap transit to client site", targetStatus: "delivery" },
                      { label: "Custom Installation & Fit-Check", desc: "Secure anchor and final inspect", targetStatus: "completed" }
                    ];

                    const statusOrder = ["quotation", "confirmed", "cutting", "assembly", "painting", "ready", "delivery", "installation", "completed"];
                    const currentIdx = statusOrder.indexOf(selectedProj.status);

                    return (
                      <div className="relative border-l border-neutral-800 pl-4 ml-2.5 space-y-4">
                        {milestones.map((m, idx) => {
                          const targetIdx = statusOrder.indexOf(m.targetStatus);
                          const isDone = currentIdx >= targetIdx;
                          const isCurrent = selectedProj.status === m.targetStatus;

                          return (
                            <div key={idx} className="relative">
                              {/* Dot node */}
                              <div className={`absolute left-[-21px] top-1 w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                                isDone 
                                  ? "bg-amber-500 border-amber-500 shadow-[0_0_8px_#f59e0b]" 
                                  : isCurrent 
                                  ? "bg-neutral-950 border-amber-500 animate-pulse" 
                                  : "bg-neutral-950 border-neutral-800"
                              }`} />
                              
                              <div 
                                onClick={() => onUpdateStatus(selectedProj.id, m.targetStatus as any)}
                                className={`group text-left cursor-pointer transition-all ${isDone ? "text-white animate-fade-in" : "text-neutral-500 hover:text-neutral-300"}`}
                              >
                                <span className={`text-[11px] font-bold block ${isCurrent ? "text-amber-500" : ""}`}>
                                  {m.label} {isDone ? "✓" : ""}
                                </span>
                                <span className="text-[9px] text-neutral-500 block font-mono">{m.desc}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Malik AI suggestions banner */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-xl text-white space-y-1.5 relative overflow-hidden shadow-premium-orange">
                <div className="absolute right-[-10px] bottom-[-20px] w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <h4 className="text-[11px] font-black tracking-wide flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" />
                  <span>{language === 'ar' ? 'توجيهات المعلم ملوك الذكية 🤖' : 'MALIK AI ALGERIAN ADVICE'}</span>
                </h4>
                <p className="text-[10px] leading-relaxed text-amber-50 font-sans">
                  {language === 'ar' 
                    ? `تنبيه الشانطي: رطوبة الطقس راهي 78%. عند تركيب هذا النوع من الخشب، خلّي فراغ تمدد 2 مم تفاديًا لتقوس الهيكل بعد التركيب في ورشات الساحل الجزائري.`
                    : `Workshop Advisory: Humidity is at 78%. Since this uses Oak wood, please ensure a 2mm expansion gap to prevent structural warping in high moisture environments.`}
                </p>
              </div>

              {/* Active Voice Notes Section */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider block">
                    🎙️ {language === 'ar' ? 'المذكرات الصوتية للمشروع' : 'Project Voice Notes'}
                  </span>
                  <button
                    onClick={() => {
                      if (isRecording) {
                        // Stop recording and save a simulated voice note
                        setIsRecording(false);
                        const newVal = `Voice Note #${(selectedProj.voiceNotes || []).length + 1} - ${new Date().toLocaleTimeString()}`;
                        const updated: Project = {
                          ...selectedProj,
                          voiceNotes: [...(selectedProj.voiceNotes || []), newVal]
                        };
                        if (onUpdateProject) {
                          onUpdateProject(updated);
                        }
                        setSelectedProj(updated);
                      } else {
                        // Start recording
                        setIsRecording(true);
                      }
                    }}
                    className={`flex items-center gap-1.5 text-[9px] px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-800 text-amber-500 hover:bg-neutral-700'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-3 h-3 text-white fill-white" />
                        <span>STOP</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 text-amber-500 fill-amber-500/10" />
                        <span>REC NOTE</span>
                      </>
                    )}
                  </button>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-1 justify-center py-1 bg-red-500/5 rounded-lg border border-red-500/10">
                    <span className="text-[9px] text-red-400 font-mono animate-pulse mr-2">Recording...</span>
                    {wave.map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-500 rounded-full transition-all duration-150"
                        style={{ height: `${h}px` }}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-1.5 max-h-[120px] overflow-y-auto">
                  {(!selectedProj.voiceNotes || selectedProj.voiceNotes.length === 0) ? (
                    <p className="text-[10px] text-neutral-500 italic text-center py-1">No voice notes recorded yet</p>
                  ) : (
                    selectedProj.voiceNotes.map((note, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                        <div className="flex items-center gap-2">
                          <Play className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] text-white font-mono">{note}</span>
                        </div>
                        <span className="text-[9px] text-neutral-500 font-mono">0:14</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Before & After Progress photos */}
              <div className="space-y-3 pt-2 border-t border-neutral-800/60">
                <span className="text-white font-bold block flex items-center gap-1.5 font-sans">
                  📷 {language === 'ar' ? 'صور قبل وبعد العمل' : language === 'fr' ? 'Photos Avant / Après' : 'Before & After Progress Journal'}
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Before Column */}
                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-amber-500 font-bold">
                        {language === 'ar' ? 'قبل العمل' : language === 'fr' ? 'Avant Travail' : 'Before starting'}
                      </span>
                      <button
                        onClick={handleAddBeforePhoto}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer"
                      >
                        + {language === 'ar' ? 'إضافة' : 'Add'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1 max-h-[80px] overflow-y-auto">
                      {(!selectedProj.photosBefore || selectedProj.photosBefore.length === 0) ? (
                        <div className="col-span-2 text-center py-4 text-[9px] text-neutral-500 italic">
                          {language === 'ar' ? 'لا توجد صور' : 'No photos'}
                        </div>
                      ) : (
                        selectedProj.photosBefore.map((ph, idx) => (
                          <img
                            key={idx}
                            src={ph}
                            alt="Before work"
                            className="w-full h-10 object-cover rounded border border-neutral-800"
                            referrerPolicy="no-referrer"
                          />
                        ))
                      )}
                    </div>
                  </div>

                  {/* After Column */}
                  <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-green-400 font-bold">
                        {language === 'ar' ? 'بعد العمل' : language === 'fr' ? 'Après Travail' : 'After completion'}
                      </span>
                      <button
                        onClick={handleAddAfterPhoto}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer"
                      >
                        + {language === 'ar' ? 'إضافة' : 'Add'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1 max-h-[80px] overflow-y-auto">
                      {(!selectedProj.photosAfter || selectedProj.photosAfter.length === 0) ? (
                        <div className="col-span-2 text-center py-4 text-[9px] text-neutral-500 italic">
                          {language === 'ar' ? 'لا توجد صور' : 'No photos'}
                        </div>
                      ) : (
                        selectedProj.photosAfter.map((ph, idx) => (
                          <img
                            key={idx}
                            src={ph}
                            alt="After work"
                            className="w-full h-10 object-cover rounded border border-neutral-800"
                            referrerPolicy="no-referrer"
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-14">
              <Ruler className="w-8 h-8 text-neutral-400 mx-auto mb-2.5 animate-pulse" />
              <p className="text-xs text-neutral-500">Select any carpentry order to update delivery schedules, materials layout, and view photo specifications.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <Hammer className="w-5 h-5 text-amber-500" />
              <span>Create New Custom Commission</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Modern Wardrobe Casablanca"
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Project Type / Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ProjectType)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500 font-mono"
                  >
                    <option value="kitchen">Kitchen / Cuisine</option>
                    <option value="bedroom">Bedroom / Chambre</option>
                    <option value="wardrobe">Wardrobe / Dressing</option>
                    <option value="door">Door / Porte</option>
                    <option value="window">Window / Fenêtre</option>
                    <option value="cabinet">Cabinet / Placard</option>
                    <option value="tv_unit">TV Unit / Support TV</option>
                    <option value="office">Office / Bureau</option>
                    <option value="table">Table / Table</option>
                    <option value="custom">Custom / Sur Mesure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Associated Client Profile *</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Dimensions specs */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800/60 space-y-3">
                <div className="flex justify-between items-center border-b border-neutral-800/50 pb-2">
                  <span className="text-neutral-300 font-mono font-bold flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-amber-500" /> Dimension Configuration
                  </span>
                  
                  <div className="flex gap-2">
                    {(['mm', 'cm', 'm'] as const).map(u => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-2 py-0.5 rounded font-mono text-[10px] ${unit === u ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-400'}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-neutral-400 font-mono mb-1 block">Width (Largeur)</label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 font-mono mb-1 block">Height (Hauteur)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-400 font-mono mb-1 block">Depth (Profondeur)</label>
                    <input
                      type="number"
                      value={depth}
                      onChange={(e) => setDepth(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Interactive Auto Cost & Labor Estimator */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-amber-500/20 space-y-3.5">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <span className="text-amber-500 font-bold flex items-center gap-1.5 font-sans">
                    💰 {language === 'ar' ? 'حساب تكلفة المواد واليد العاملة تلقائيًا' : language === 'fr' ? 'Calculateur Auto Matériaux & Main d\'œuvre' : 'Auto Material & Labor Cost Estimator'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAutoCalc(!showAutoCalc)}
                    className="text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded font-mono cursor-pointer transition-all"
                  >
                    {showAutoCalc 
                      ? (language === 'ar' ? 'إخفاء التفاصيل' : 'Hide details') 
                      : (language === 'ar' ? 'تعديل المعايير' : 'Adjust params')}
                  </button>
                </div>

                {/* Parameters (Collapsible for clean design) */}
                {(showAutoCalc || true) && (
                  <div className="grid grid-cols-2 gap-3 transition-all">
                    <div>
                      <label className="text-neutral-400 font-mono mb-1 block">
                        {language === 'ar' ? 'نوع الخشب / المادة' : 'Material Type'}
                      </label>
                      <select
                        value={calcMaterial}
                        onChange={(e) => setCalcMaterial(e.target.value as any)}
                        className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white font-sans focus:border-amber-500"
                      >
                        <option value="walnut">{language === 'ar' ? 'خشب الجوز (American Walnut)' : 'American Walnut'}</option>
                        <option value="oak">{language === 'ar' ? 'خشب البلوط (White Oak)' : 'White Oak'}</option>
                        <option value="beech">{language === 'ar' ? 'خشب الزان (Beechwood)' : 'Beechwood'}</option>
                        <option value="mdf">{language === 'ar' ? 'ألواح MDF (Standard)' : 'MDF Sheet'}</option>
                        <option value="plywood">{language === 'ar' ? 'خشب معاكس (Plywood Marine)' : 'Marine Plywood'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-neutral-400 font-mono mb-1 block">
                        {language === 'ar' ? 'خبرة الحرفي (اليد العاملة)' : 'Labor Expertise'}
                      </label>
                      <select
                        value={calcLaborLevel}
                        onChange={(e) => setCalcLaborLevel(e.target.value as any)}
                        className="w-full bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white font-sans focus:border-amber-500"
                      >
                        <option value="master">{language === 'ar' ? 'معلم محترف (Master Artisan)' : 'Master Artisan'}</option>
                        <option value="apprentice">{language === 'ar' ? 'مساعد مبتدئ (Apprentice)' : 'Apprentice'}</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Calculation Outputs breakdown */}
                <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between text-neutral-400">
                    <span>{language === 'ar' ? 'العبار المحسوب (الحجم / المساحة):' : 'Calculated Size (Vol / Area):'}</span>
                    <span className="text-white font-bold">
                      {calculatedRates.volume > 0 
                        ? `${calculatedRates.volume} m³ / ${calculatedRates.area} m²` 
                        : `${calculatedRates.area} m²`}
                    </span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>{language === 'ar' ? 'تكلفة المواد الأولية والملحقات:' : 'Estimated Wood & Hardware:'}</span>
                    <span className="text-white font-bold">{formatCurrency(calculatedRates.materialCost, language)}</span>
                  </div>

                  <div className="flex justify-between text-neutral-400">
                    <span>{language === 'ar' ? 'تكلفة يد العاملة والخدامين:' : 'Estimated Labor Wages:'}</span>
                    <span className="text-white font-bold">
                      {formatCurrency(calculatedRates.laborCost, language)} ({calculatedRates.hours} {language === 'ar' ? 'ساعة' : 'hours'})
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-neutral-800 pt-2 text-xs font-bold text-amber-500">
                    <span>{language === 'ar' ? 'تكلفة الإنتاج الإجمالية:' : 'Total Cost Price:'}</span>
                    <span>{formatCurrency(calculatedRates.totalCost, language)}</span>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-green-400">
                    <span>{language === 'ar' ? 'سعر البيع الموصى به (ربح +45%):' : 'Suggested Selling (45% margin):'}</span>
                    <span>{formatCurrency(calculatedRates.suggestedSelling, language)}</span>
                  </div>
                </div>

                {/* Quick Auto-Fill Action */}
                <button
                  type="button"
                  onClick={() => {
                    setExpenses(calculatedRates.totalCost);
                    setBudget(calculatedRates.suggestedSelling);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black py-2 rounded-xl text-[10px] tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm shadow-amber-500/10"
                >
                  ⚡ {language === 'ar' ? 'تطبيق تكلفة السلعة والبيع المحسوبة تلقائيًا' : 'Apply AI Material & Selling Prices'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Client Budget ($) *</label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Estimated Material Expenses ($)</label>
                  <input
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Assign Artisan Carpenters</label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/60 max-h-[100px] overflow-y-auto">
                  {employees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-2 text-neutral-300">
                      <input
                        type="checkbox"
                        checked={workers.includes(emp.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWorkers([...workers, emp.id]);
                          } else {
                            setWorkers(workers.filter(id => id !== emp.id));
                          }
                        }}
                        className="accent-amber-500"
                      />
                      <span>{emp.name} ({emp.role})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Simulated Voice Notes Recorder block */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 space-y-2.5">
                <span className="text-neutral-300 font-mono font-bold flex items-center gap-1">
                  <Mic className="w-4 h-4 text-amber-500" /> Audio Voice Notes Spec (Recorder)
                </span>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2 ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-neutral-950 hover:bg-amber-600'
                    }`}
                  >
                    {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'STOP' : 'RECORD VOICE MEMO'}</span>
                  </button>

                  <div className="flex gap-1 h-6 items-end">
                    {wave.map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-amber-500 rounded-t transition-all duration-150"
                        style={{ height: isRecording ? `${h}px` : '4px' }}
                      />
                    ))}
                  </div>
                </div>

                {recordedNotes.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800 space-y-1">
                    {recordedNotes.map((note, index) => (
                      <div key={index} className="flex items-center gap-2 text-[10px] text-amber-500/80 font-mono">
                        <Play className="w-3 h-3 fill-amber-500" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Project Description / Special constraints</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Needs specialized lacquer. Wall molding adjustment needed."
                  rows={2.5}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white focus:border-amber-500"
                />
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
