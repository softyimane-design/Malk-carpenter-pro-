import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  Hammer,
  ShieldAlert,
  ArrowRight,
  Calculator,
  Ruler,
  DollarSign,
  Calendar,
  ChevronRight,
  Check,
  Trash2,
  Plus,
  Info,
  RotateCcw,
  AlertTriangle,
  List,
  Activity,
  FileText,
  Briefcase,
  Printer,
  Eye,
  Info as InfoIcon
} from 'lucide-react';
import { Language } from '../types';
import { translations, formatCurrency } from '../utils';

const malkMascot = new URL('../assets/images/malk_mascot_1783709415882.jpg', import.meta.url).href;

interface AssistantProps {
  language: Language;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface PartItem {
  id: string;
  name: string;
  length: number; // in cm
  width: number;  // in cm
  quantity: number;
}

interface PlannerResult {
  woodQuantity: string;
  materialEstimation: string;
  costEstimation: string;
  cuttingInstructions: string;
  boardOptimization: string;
  wasteReductionTips: string;
  woodTypeAnalysis: string;
  projectDuration: string;
  quotationItems: Array<{ description: string; quantity: number; price: number; total: number }>;
  sellingPriceRecommendation: string;
  projectRisks: string;
  cheaperAlternatives: string;
  safetyRecommendations: string;
  toolRecommendations: string;
  dailyWorkPlan: string;
  profitAnalysis: string;
}

export default function Assistant({ language }: AssistantProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'planner' | 'chat'>('planner');

  // ----------------------------------------------------
  // CHAT COPILOT STATE
  // ----------------------------------------------------
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: language === 'ar'
        ? "أهلاً بيك! أنا المساعد الذكي للمعلّم مالك. اسألني على أي حاجة تهم تفصال اللوح، حساب السلعة، التعشيقات الصحيحة، ولا كيفاش تقطع بلاك لتقليل الهدر."
        : language === 'fr'
        ? "Bonjour ! Je suis l'assistant intelligent de l'Atelier Maâlem Malik. Posez-moi vos questions sur le débit de bois, l'optimisation des panneaux, les assemblages ou les devis."
        : "Hello! I am your Malik Woodworking AI assistant. Ask me anything about joinery methods, timber options, cutting optimizations, or cost estimates.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const chips = language === 'ar' ? [
    "حساب التكلفة: قدرلي تكلفة صنع مكتب دراسة بسيط للأطفال",
    "حساب كمية الخشب: شحال من لوح نحتاج باه نخدم خزانة بطول 2 متر؟",
    "تحسين المواد: كيفاش نستغل بقايا الخشب الصغير بلا ما نرميها؟",
    "تحسين مخطط التفصال: كيفاش نقطع 6 قطع 40×60 سم من لوحة MDF؟",
    "اقتراح تصاميم أثاث: اعطيني موديلات عصرية لطاولة صالون (قهوة) جزائرية",
    "تشخيص مشاكل الخشب: واش ندير باه نحبس تقوس الخشب الطبيعي في الشتاء؟",
    "توصيات التصليح: كيفاش نصلح شق عميق في حطب الزان بلا أثر؟",
    "نصائح السلامة: واش هي أهم احتياطات الأمان قبل استعمال المنشار الدائري؟",
    "توصيات الأدوات: واش هي أحسن لقمة لراوتر الخشب للتعشيق المخفي؟",
    "تقدير سعر البيع: كيفاش نحسب السعر المناسب لبيع سرير مزدوج؟",
    "حساب الأرباح الصافية: كيفاش نخرج الفائدة الصافية بعد حساب سلعة والخدامة؟"
  ] : language === 'fr' ? [
    "Estimation coût : Estimer le coût d'un bureau d'étude simple",
    "Volume bois : Combien de planches pour une armoire de 2m ?",
    "Optimisation matière : Comment réutiliser les chutes de bois ?",
    "Schéma de découpe : Comment couper 6 pièces de 40x60cm de MDF ?",
    "Designs meubles : Proposer des modèles de table basse moderne",
    "Détection problèmes : Comment éviter le gauchissement du bois ?",
    "Guide réparation : Réparer une fissure profonde dans du hêtre",
    "Conseils sécurité : Précautions de sécurité avec la scie circulaire",
    "Outils recommandés : Meilleures fraises de défonceuse pour assemblages",
    "Prix de vente : Estimer le prix de revente d'un lit double",
    "Marge bénéficiaire : Calculer le bénéfice net après charges"
  ] : [
    "Cost estimation: Estimate cost for a simple kid's desk",
    "Wood volume: How many boards needed for a 2m wardrobe?",
    "Material optimization: Creative ways to reuse offcut wood scraps",
    "Cutting map: How to cut 6 pieces 40x60cm out of a single MDF sheet",
    "Suggest furniture designs: Modern styles for coffee tables",
    "Detect wood problems: How to stop solid wood from warping",
    "Repair recommendations: Fixing a deep crack in Beech wood",
    "Safety advice: Key safety procedures for a table saw",
    "Tool recommendations: Best router bits for tight wood joinery",
    "Selling price estimation: Pricing model for a double bed frame",
    "Profit calculation: Calculate net profit margin after overheads"
  ];

  // ----------------------------------------------------
  // PLANNER WORKSPACE STATE
  // ----------------------------------------------------
  const [projectName, setProjectName] = useState('Luxurious Dining Table');
  const [itemType, setItemType] = useState<'table' | 'wardrobe' | 'door' | 'cabinet' | 'chair' | 'custom'>('table');
  const [dimensions, setDimensions] = useState({ width: 160, height: 75, depth: 90 });
  const [woodType, setWoodType] = useState('American Walnut');
  const [boardSize, setBoardSize] = useState({ width: 244, height: 122 }); // standard board sheet
  const [materialUnitCost, setMaterialUnitCost] = useState(8500); // in local currency (DA or $)
  const [laborRate, setLaborRate] = useState(1200); // labor cost per hour
  const [markup, setMarkup] = useState(35); // profit margin markup %
  
  const [parts, setParts] = useState<PartItem[]>([
    { id: '1', name: 'Table Top Panel', length: 160, width: 90, quantity: 1 },
    { id: '2', name: 'Table Legs', length: 73, width: 10, quantity: 4 },
    { id: '3', name: 'Long Apron Rails', length: 140, width: 12, quantity: 2 },
    { id: '4', name: 'Short End Apron Rails', length: 70, width: 12, quantity: 2 }
  ]);

  const [isPlannerLoading, setIsPlannerLoading] = useState(false);
  const [plannerResult, setPlannerResult] = useState<PlannerResult | null>(null);

  // Checklists (interactive features)
  const [checkedTools, setCheckedTools] = useState<{ [key: string]: boolean }>({});
  const [checkedSafety, setCheckedSafety] = useState<{ [key: string]: boolean }>({});
  const [checkedTimeline, setCheckedTimeline] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatLoading, activeTab]);

  // Handle template pre-population
  const handleTemplateChange = (type: 'table' | 'wardrobe' | 'door' | 'cabinet' | 'chair' | 'custom') => {
    setItemType(type);
    if (type === 'table') {
      setProjectName(language === 'ar' ? 'طاولة عشاء كلاسيكية' : language === 'fr' ? 'Table à manger classique' : 'Classic Dining Table');
      setDimensions({ width: 160, height: 75, depth: 90 });
      setWoodType(language === 'ar' ? 'خشب البلوط الصلب' : language === 'fr' ? 'Chêne Massif' : 'Solid Oak Wood');
      setParts([
        { id: '1', name: language === 'ar' ? 'سطح الطاولة الرئيسي' : language === 'fr' ? 'Plateau principal' : 'Table Top Panel', length: 160, width: 90, quantity: 1 },
        { id: '2', name: language === 'ar' ? 'أرجل الطاولة الصلبة' : language === 'fr' ? 'Pieds massifs' : 'Table Legs', length: 73, width: 10, quantity: 4 },
        { id: '3', name: language === 'ar' ? 'جسور الهيكل الطويلة' : language === 'fr' ? 'Traverses longues' : 'Long Apron Rails', length: 140, width: 12, quantity: 2 },
        { id: '4', name: language === 'ar' ? 'جسور الهيكل القصيرة' : language === 'fr' ? 'Traverses courtes' : 'Short End Apron Rails', length: 70, width: 12, quantity: 2 }
      ]);
    } else if (type === 'wardrobe') {
      setProjectName(language === 'ar' ? 'خزانة ملابس غرف النوم' : language === 'fr' ? 'Dressing de chambre' : 'Bedroom Closet Wardrobe');
      setDimensions({ width: 180, height: 220, depth: 60 });
      setWoodType('MDF Veneered Oak (18mm)');
      setParts([
        { id: '1', name: language === 'ar' ? 'جوانب الخزانة الخارجية' : language === 'fr' ? 'Montants latéraux' : 'Outer Side Panels', length: 220, width: 60, quantity: 2 },
        { id: '2', name: language === 'ar' ? 'قاعدة وسقف الخزانة' : language === 'fr' ? 'Socle et Chapeau' : 'Top & Bottom Panels', length: 180, width: 60, quantity: 2 },
        { id: '3', name: language === 'ar' ? 'الرفوف الداخلية المتعددة' : language === 'fr' ? 'Étagères internes' : 'Internal Shelves', length: 88, width: 55, quantity: 6 },
        { id: '4', name: language === 'ar' ? 'أبواب الخزانة المنزلقة' : language === 'fr' ? 'Portes coulissantes' : 'Sliding Doors', length: 212, width: 90, quantity: 2 },
        { id: '5', name: language === 'ar' ? 'خلفية الخزانة (معاكس)' : language === 'fr' ? 'Panneau de fond (CP)' : 'Backing Panels (Plywood)', length: 218, width: 178, quantity: 1 }
      ]);
    } else if (type === 'door') {
      setProjectName(language === 'ar' ? 'باب مدخل خشب صلب' : language === 'fr' ? 'Porte d\'entrée massive' : 'Solid Entryway Door');
      setDimensions({ width: 95, height: 210, depth: 5 });
      setWoodType('Beech Wood / حطب الزان');
      setParts([
        { id: '1', name: language === 'ar' ? 'القائم الأيسر للباب' : language === 'fr' ? 'Montant gauche' : 'Left Stile', length: 210, width: 15, quantity: 1 },
        { id: '2', name: language === 'ar' ? 'القائم الأيمن للباب' : language === 'fr' ? 'Montant droit' : 'Right Stile', length: 210, width: 15, quantity: 1 },
        { id: '3', name: language === 'ar' ? 'العارضة العلوية' : language === 'fr' ? 'Traverse haute' : 'Top Rail', length: 65, width: 15, quantity: 1 },
        { id: '4', name: language === 'ar' ? 'العارضة السفلية العريضة' : language === 'fr' ? 'Traverse basse large' : 'Bottom Rail', length: 65, width: 25, quantity: 1 },
        { id: '5', name: language === 'ar' ? 'حشوات الباب الداخلية العائمة' : language === 'fr' ? 'Panneaux de remplissage' : 'Floating Wood Panels', length: 85, width: 30, quantity: 2 }
      ]);
    } else if (type === 'cabinet') {
      setProjectName(language === 'ar' ? 'خزانة مطبخ معلقة' : language === 'fr' ? 'Meuble haut cuisine' : 'Upper Kitchen Cabinet');
      setDimensions({ width: 120, height: 80, depth: 35 });
      setWoodType('MDF Laminate White (18mm)');
      setParts([
        { id: '1', name: language === 'ar' ? 'الجوانب الجانبية' : language === 'fr' ? 'Côtés caisson' : 'Side Panels', length: 80, width: 35, quantity: 2 },
        { id: '2', name: language === 'ar' ? 'السقف والقاعدة السفلية' : language === 'fr' ? 'Fonds et dessus' : 'Top & Bottom Shelves', length: 116, width: 35, quantity: 2 },
        { id: '3', name: language === 'ar' ? 'الأبواب المفصلية' : language === 'fr' ? 'Façades portes' : 'Cabinet Hinged Doors', length: 78, width: 58, quantity: 2 },
        { id: '4', name: language === 'ar' ? 'الرف الداخلي' : language === 'fr' ? 'Tablette interne' : 'Internal Adjustable Shelf', length: 114, width: 32, quantity: 1 }
      ]);
    } else {
      setProjectName(language === 'ar' ? 'مشروع تفصال مخصص' : language === 'fr' ? 'Projet sur-mesure' : 'Bespoke Custom Project');
      setParts([
        { id: '1', name: 'Main Component A', length: 100, width: 50, quantity: 1 },
        { id: '2', name: 'Support Component B', length: 50, width: 20, quantity: 2 }
      ]);
    }
  };

  // ----------------------------------------------------
  // CHAT INTERACTION
  // ----------------------------------------------------
  const handleChatSend = async (textToSend: string) => {
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          language,
          history: messages.slice(-6) // include brief context history
        })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: data.reply || "Processed request.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        sender: 'assistant',
        text: language === 'ar'
          ? "سامحني خويا الصانع، صرا مشكل في الاتصال بسيرفر الورشة الذكية. تأكد من تشغيل الشبكة وجرب تاني."
          : "My apologies, I had trouble connecting with the master AI workshop server. Please check your environment variables and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ----------------------------------------------------
  // PLANNER INTERACTION
  // ----------------------------------------------------
  const handleAddPart = () => {
    const newId = (parts.length + 1).toString();
    setParts(prev => [...prev, {
      id: newId,
      name: language === 'ar' ? `قطعة جديدة #${newId}` : `New Part #${newId}`,
      length: 50,
      width: 30,
      quantity: 1
    }]);
  };

  const handleDeletePart = (id: string) => {
    if (parts.length <= 1) return;
    setParts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePart = (id: string, key: keyof PartItem, value: any) => {
    setParts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [key]: value };
      }
      return p;
    }));
  };

  const handleRunPlanner = async () => {
    setIsPlannerLoading(true);
    setPlannerResult(null);
    setCheckedTools({});
    setCheckedSafety({});
    setCheckedTimeline({});

    try {
      const response = await fetch('/api/gemini/carpenter-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          itemType,
          dimensions,
          woodType,
          boardSize,
          parts,
          materialUnitCost,
          laborRate,
          markup,
          language
        })
      });

      const data = await response.json();
      if (data.plan) {
        setPlannerResult(data.plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlannerLoading(false);
    }
  };

  // Print results
  const handlePrint = () => {
    window.print();
  };

  // Helper to parse multiline tools/safety lists
  const parseLines = (text: any): string[] => {
    if (!text) return [];
    if (Array.isArray(text)) {
      return text
        .map(line => String(line).replace(/^•\s*|^\d+\.\s*|^-/, '').trim())
        .filter(line => line.length > 0);
    }
    if (typeof text !== 'string') {
      text = String(text);
    }
    return text
      .split('\n')
      .map(line => line.replace(/^•\s*|^\d+\.\s*|^-/, '').trim())
      .filter(line => line.length > 0);
  };

  // Helper to safely get an array of lines from any input
  const safeGetLines = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.map(line => String(line).trim()).filter(line => line.length > 0);
    }
    if (typeof input !== 'string') {
      input = String(input);
    }
    return input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header with 120px floating AI Mascot */}
      <div className="bg-white border border-amber-500/15 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute top-[-30%] left-[-10%] w-60 h-60 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        {/* Floating 120px mascot with glow ring */}
        <div className="relative flex-shrink-0 animate-float z-10">
          <div className="absolute inset-[-3px] bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full blur-md opacity-60" />
          <div className="relative w-[110px] h-[110px] rounded-full p-0.5 bg-white border-2 border-amber-500 shadow-premium-orange">
            <img 
              src={malkMascot} 
              alt="Maâlem Malik Assistant" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-green-500 border-2 border-white rounded-full z-20 shadow-sm" />
        </div>

        {/* Text descriptions */}
        <div className="flex-1 text-center md:text-left space-y-1 z-10">
          <h2 className="text-xl font-black text-neutral-900 tracking-wide flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5.5 h-5.5 text-amber-500 animate-pulse" />
            <span>{language === 'ar' ? 'المساعد الذكي للمعلّم مالك' : language === 'fr' ? 'Assistant Intelligent de Menuiserie' : 'Malik Smart Carpenter Assistant'}</span>
          </h2>
          <p className="text-xs text-neutral-500 font-sans leading-relaxed">
            {language === 'ar' ? 'تفصال اللوح، تفادي الهدر، التكلفة، تخطيط الشانطي والفوترة الذكية' : language === 'fr' ? 'Optimisation du débit, calepinage, calcul des coûts, risques et devis automatique' : 'Cutting optimizer, material estimators, profit gauges, risk detectors & quotations'}
          </p>
          <div className="pt-1.5 flex flex-wrap justify-center md:justify-start gap-1.5 text-[9px] font-mono text-neutral-400">
            <span className="bg-amber-500/10 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-500/15">
              {language === 'ar' ? 'نموذج جيل الذكاء الاصطناعي نشط' : 'Generative AI Engine Active'}
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-neutral-150 border border-neutral-200 p-1 rounded-xl z-10">
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'planner'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'مخطط الورشة' : language === 'fr' ? 'Atelier & Débit' : 'Workshop Planner'}</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'محادثة المعلم مالك' : language === 'fr' ? 'Chat IA Malik' : 'AI Workshop Chat'}</span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------
          TAB 1: SMART WORKSHOP PLANNER
          ---------------------------------------------------- */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Form Inputs Pane */}
            <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                <Ruler className="w-4 h-4" />
                <span>{language === 'ar' ? 'مواصفات مشروع الشانطي' : language === 'fr' ? 'Spécifications du Projet' : 'Project Specifications'}</span>
              </h3>

              {/* Template Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-mono block">
                  {language === 'ar' ? 'اختر قالب جاهز لتسهيل العمل:' : language === 'fr' ? 'Sélectionner un modèle rapide :' : 'Select Quick Template:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-sans">
                  {['table', 'wardrobe', 'door', 'cabinet'].map((template) => (
                    <button
                      key={template}
                      onClick={() => handleTemplateChange(template as any)}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer capitalize ${
                        itemType === template
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-750'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                  <button
                    onClick={() => handleTemplateChange('custom')}
                    className={`col-span-2 py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer capitalize ${
                      itemType === 'custom'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-850 hover:border-neutral-750'
                    }`}
                  >
                    {language === 'ar' ? 'تفصال مخصص ✎' : language === 'fr' ? 'Bespoke ✎' : 'Bespoke / Custom ✎'}
                  </button>
                </div>
              </div>

              {/* Standard inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono block mb-1">
                    {language === 'ar' ? 'اسم المشروع:' : language === 'fr' ? 'Nom du projet :' : 'Project Name:'}
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-mono block mb-1">
                      {language === 'ar' ? 'نوع الخشب المستعمل:' : language === 'fr' ? 'Essence de bois :' : 'Wood / Substrate Type:'}
                    </label>
                    <input
                      type="text"
                      value={woodType}
                      onChange={(e) => setWoodType(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-mono block mb-1">
                      {language === 'ar' ? 'سعر اللوح الخام الواحد:' : language === 'fr' ? 'Prix unitaire panneau :' : 'Raw Board Cost:'}
                    </label>
                    <input
                      type="number"
                      value={materialUnitCost}
                      onChange={(e) => setMaterialUnitCost(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[9px] text-neutral-400 font-mono block mb-1">
                      {language === 'ar' ? 'العرض الإجمالي (سم):' : language === 'fr' ? 'Largeur Hors-Tout (cm) :' : 'Outer Width (cm):'}
                    </label>
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-neutral-400 font-mono block mb-1">
                      {language === 'ar' ? 'الارتفاع الإجمالي (سم):' : language === 'fr' ? 'Hauteur Hors-Tout (cm) :' : 'Outer Height (cm):'}
                    </label>
                    <input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-neutral-400 font-mono block mb-1">
                      {language === 'ar' ? 'العمق الإجمالي (سم):' : language === 'fr' ? 'Profondeur Hors-Tout (cm) :' : 'Outer Depth (cm):'}
                    </label>
                    <input
                      type="number"
                      value={dimensions.depth}
                      onChange={(e) => setDimensions({ ...dimensions, depth: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2">
                    <label className="text-[9px] text-neutral-400 font-mono block mb-1">
                      {language === 'ar' ? 'أبعاد اللوح الخام (طول×عرض سم):' : language === 'fr' ? 'Format panneau brut (cm) :' : 'Standard Board Dimensions (cm):'}
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder="Length"
                        value={boardSize.width}
                        onChange={(e) => setBoardSize({ ...boardSize, width: Number(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                      <span className="text-neutral-600 text-xs font-mono">×</span>
                      <input
                        type="number"
                        placeholder="Width"
                        value={boardSize.height}
                        onChange={(e) => setBoardSize({ ...boardSize, height: Number(e.target.value) })}
                        className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-2.5 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-neutral-400 font-mono block mb-1">
                      {language === 'ar' ? 'هامش الربح (%):' : language === 'fr' ? 'Marge bénéfice % :' : 'Markup Margin %:'}
                    </label>
                    <input
                      type="number"
                      value={markup}
                      onChange={(e) => setMarkup(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-mono block mb-1">
                      {language === 'ar' ? 'تكلفة يد العمل بالساعة:' : language === 'fr' ? 'Taux horaire main d\'œuvre :' : 'Hourly Labor Wage Rate:'}
                    </label>
                    <input
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Parts list header & table */}
              <div className="border-t border-neutral-800 pt-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-neutral-300 font-mono uppercase tracking-wide">
                    {language === 'ar' ? 'قائمة أجزاء التفصال (قطع اللوح):' : language === 'fr' ? 'Liste de débit (Pièces de découpe) :' : 'Cuttings Parts List:'}
                  </h4>
                  <button
                    onClick={handleAddPart}
                    className="flex items-center gap-1 py-1 px-2 bg-neutral-800 hover:bg-neutral-700 text-amber-500 rounded-lg text-[9px] font-mono cursor-pointer transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'ar' ? 'إضافة قطعة' : 'Add Part'}</span>
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 pr-1.5">
                  {parts.map((part) => (
                    <div
                      key={part.id}
                      className="bg-neutral-950 border border-neutral-850/60 p-2.5 rounded-xl flex items-center gap-2 text-[10px]"
                    >
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={part.name}
                          onChange={(e) => handleUpdatePart(part.id, 'name', e.target.value)}
                          placeholder="Part Label"
                          className="w-full bg-transparent border-b border-transparent focus:border-neutral-700 font-semibold text-white focus:outline-none"
                        />
                        <div className="flex gap-2 text-neutral-400 font-mono">
                          <div className="flex items-center gap-1">
                            <span>L:</span>
                            <input
                              type="number"
                              value={part.length}
                              onChange={(e) => handleUpdatePart(part.id, 'length', Number(e.target.value))}
                              className="w-10 bg-neutral-900 border border-neutral-800 rounded px-1 text-center font-bold text-white focus:outline-none"
                            />
                            <span>cm</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>W:</span>
                            <input
                              type="number"
                              value={part.width}
                              onChange={(e) => handleUpdatePart(part.id, 'width', Number(e.target.value))}
                              className="w-10 bg-neutral-900 border border-neutral-800 rounded px-1 text-center font-bold text-white focus:outline-none"
                            />
                            <span>cm</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Qty:</span>
                            <input
                              type="number"
                              value={part.quantity}
                              onChange={(e) => handleUpdatePart(part.id, 'quantity', Number(e.target.value))}
                              className="w-8 bg-neutral-900 border border-neutral-800 rounded px-1 text-center font-bold text-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePart(part.id)}
                        disabled={parts.length <= 1}
                        className="p-1.5 text-neutral-600 hover:text-red-400 transition-all cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Trigger Button */}
              <button
                onClick={handleRunPlanner}
                disabled={isPlannerLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-neutral-950 font-mono font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all cursor-pointer hover:shadow-amber-500/10 disabled:opacity-50"
              >
                {isPlannerLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'ar' ? 'المعلّم ملوك يجري حسابات تفصال الخشب...' : language === 'fr' ? 'Optimisation en cours par l\'IA...' : 'AI optimizing woodcutting layouts & cost quotes...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'ar' ? 'توليد المخطط التقني والفوترة الذكية ✨' : language === 'fr' ? 'Générer le Plan Technique & Devis IA ✨' : 'Generate Technical AI Blueprint ✨'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Display Blueprint Results Pane */}
            <div className="lg:col-span-7 space-y-6">
              
              {!plannerResult && !isPlannerLoading && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
                  <div className="relative inline-block">
                    <img 
                      src={malkMascot} 
                      alt="Maâlem Malik waiting" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-amber-500/40 shadow-lg mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 right-1 bg-amber-500 text-neutral-950 p-1 rounded-full z-10 border-2 border-neutral-900 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white font-sans">
                    {language === 'ar' ? 'المعلّم مالك يستنى في تفاصيل الشانطي نتاعك' : language === 'fr' ? 'Maâlem Malik attend les dimensions de votre projet' : 'Malik is ready to optimize your cutting list'}
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    {language === 'ar'
                      ? 'غير دخل القياسات والبياسات في الفورم اللي على اليسار، واضغط على الزر البرتقالي باه نحسبولك تفصال اللوح وحق السلعة وحق يدك بلا تعب!'
                      : language === 'fr'
                      ? 'Saisissez les dimensions et la liste de débit à gauche, puis cliquez sur le bouton orange pour que je calcule votre plan de coupe et votre devis de menuiserie.'
                      : 'Just enter your wood sheet size and cutting components on the left, then trigger the generator to calculate an automated quotation, cutting plan, and risk register.'}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={handleRunPlanner}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-amber-500/5 cursor-pointer"
                    >
                      {language === 'ar' ? 'تشغيل الحسابات التلقائية الافتراضية' : language === 'fr' ? 'Lancer les calculs par défaut' : 'Load Default Calculation Map'}
                    </button>
                  </div>
                </div>
              )}

              {isPlannerLoading && (
                <div className="bg-neutral-900 border border-neutral-850 rounded-2xl p-8 text-center space-y-5 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md animate-pulse" />
                    <img 
                      src={malkMascot} 
                      alt="Maâlem Malik planning" 
                      className="w-24 h-24 rounded-full object-cover border-3 border-amber-500 shadow-2xl relative z-10 mx-auto animate-bounce"
                      style={{ animationDuration: '2s' }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 right-1/2 translate-x-1/2 bg-amber-500 text-neutral-950 p-1.5 rounded-full z-20 shadow-md">
                      <Hammer className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h4 className="text-xs font-black font-mono text-amber-500 tracking-widest uppercase">
                      {language === 'ar' ? 'المعلّم مالك يجري حسابات تفصال الخشب...' : 'MALIK IS CALCULATING WOODCUTTING BLUEPRINTS...'}
                    </h4>
                    <p className="text-[11px] text-neutral-300 max-w-md mx-auto leading-relaxed">
                      {language === 'ar'
                        ? 'المعلّم مالك راه يرتّب البياسات بالتوازي مع اتجاه عروق الحطب، يحسب الحجم بالمتر المكعب، ويفصّل الفضلة لتقليل الهدر الكلي للّوح.'
                        : language === 'fr'
                        ? 'Malik est en train de calepiner vos pièces selon le fil du bois, d\'optimiser le placement sur les panneaux et de chiffrer le devis optimal.'
                        : 'Malik is nesting parts along the timber grain, packing sheets for high-yield cuts, and compiling your automated quote list.'}
                    </p>
                  </div>
                  <div className="w-48 h-1.5 bg-neutral-950 rounded-full mx-auto overflow-hidden relative z-10">
                    <div className="h-full bg-amber-500 rounded-full animate-pulse w-full" />
                  </div>
                </div>
              )}

              {plannerResult && !isPlannerLoading && (
                <div className="space-y-6 printable-area">
                  
                  {/* Top Quote Header */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-amber-500/10 text-amber-500 text-[8px] font-mono rounded-bl uppercase font-bold tracking-widest">
                      Blueprint Verified
                    </div>
                    <div>
                      <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest block font-bold">
                        {language === 'ar' ? 'تقرير التقييم التقني والمالي' : 'OFFICIAL WOODCRAFT BLUEPRINT REPORT'}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1 font-sans">{projectName}</h3>
                      <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                        {language === 'ar' ? 'تفصال مخصص من حطب:' : 'Crafted with premium:'} <strong className="text-white">{woodType}</strong>
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3 py-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-850 rounded-xl text-xs font-mono transition-all cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'طباعة وتصدير PDF' : 'Print Blueprint'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Visual Cut Board Board Optimizer */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                        <Ruler className="w-4 h-4" />
                        <span>{language === 'ar' ? 'مخطط التقطيع البصري للألواح والفضلة' : language === 'fr' ? 'Calepinage & Optimisation des Découpes' : 'Board Cutting Optimization Map'}</span>
                      </h4>
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">
                        {boardSize.width}×{boardSize.height} cm Sheet
                      </span>
                    </div>

                    {/* Interactive React Canvas/Mock Board Rendering */}
                    <div className="bg-neutral-950 border border-neutral-850/60 p-4 rounded-xl space-y-3">
                      <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                        {language === 'ar'
                          ? 'توزيع القطع المقترح أدناه يضمن لك تقليل الفضلة (الهدر) واستغلال مساحة اللوح بالكامل:'
                          : 'Visual mock layout of your boards based on standard yield nesting formulas. Orange sections represent parts, dark sections represent reusable scrap/wood carvings.'}
                      </p>

                      {/* Visual rendering of raw boards */}
                      <div className="space-y-4">
                        {Array.from({ length: Math.ceil(parts.length / 3) || 1 }).map((_, boardIdx) => (
                          <div key={boardIdx} className="space-y-1">
                            <div className="text-[9px] font-mono text-neutral-500 flex justify-between">
                              <span>Raw Sheet #{boardIdx + 1}</span>
                              <span className="text-green-400 font-bold">{language === 'ar' ? 'مستغلة بنسبة 86% - هدر منخفض' : '86% Area Yield - Low waste'}</span>
                            </div>
                            <div className="border border-neutral-800 bg-neutral-900 h-28 rounded-lg relative overflow-hidden flex p-1 gap-1">
                              
                              {/* Parts mapped dynamically into container */}
                              {parts.slice(boardIdx * 3, (boardIdx * 3) + 3).map((part, pIdx) => {
                                const colors = ['bg-amber-500/10 border-amber-500/40 text-amber-400', 'bg-blue-500/10 border-blue-500/40 text-blue-400', 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'];
                                return (
                                  <div
                                    key={part.id}
                                    style={{ flexGrow: part.length * part.width }}
                                    className={`border rounded p-1.5 flex flex-col justify-between transition-all hover:brightness-125 ${colors[pIdx % colors.length]}`}
                                  >
                                    <div className="truncate font-sans font-bold text-[9px]">{part.name}</div>
                                    <div className="font-mono text-[8px] flex justify-between items-end mt-1">
                                      <span>{part.length}×{part.width}cm</span>
                                      <span className="font-bold">Qty {part.quantity}</span>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Remaining Scrap Piece visualizer */}
                              <div className="flex-grow-0 w-20 border border-dashed border-red-500/20 bg-red-500/5 rounded p-1.5 flex flex-col justify-between">
                                <span className="text-[8px] font-mono text-red-400 font-bold uppercase">{language === 'ar' ? 'فضلة حطب' : 'Scrap / Restes'}</span>
                                <span className="text-[7px] text-neutral-500 font-mono">Offcut</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Text details from AI */}
                      <pre className="text-[9px] font-mono text-emerald-400 bg-neutral-900 border border-neutral-850 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {plannerResult.boardOptimization}
                      </pre>
                    </div>

                    <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="text-[10px] text-neutral-300 leading-relaxed font-sans">
                        <strong className="text-amber-500 font-mono block mb-1">
                          {language === 'ar' ? 'نصيحة المعلم لتخفيض الهدر:' : 'Master Craftsman Eco-Yield Tips:'}
                        </strong>
                        {plannerResult.wasteReductionTips}
                      </div>
                    </div>
                  </div>

                  {/* Financial & Profit analysis widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Financial details panel */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>{language === 'ar' ? 'تحليل التكلفة وهوامش الربح' : language === 'fr' ? 'Analyse Financière' : 'Financial Costing & Profit Analysis'}</span>
                      </h4>

                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850/60 divide-y divide-neutral-850 text-xs">
                        <div className="pb-2.5 flex justify-between items-center">
                          <span className="text-neutral-400">{language === 'ar' ? 'تكلفة الخشب والألواح:' : 'Wood Boards Materials:'}</span>
                          <span className="font-mono text-white font-bold">
                            {formatCurrency(materialUnitCost * Math.max(1, Math.ceil(((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 1.2) / ((boardSize.width * boardSize.height) / 10000))), language)}
                          </span>
                        </div>
                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-neutral-400">{language === 'ar' ? 'الخردوات والإكسسوارات:' : 'Assembly Hardware & Consumables:'}</span>
                          <span className="font-mono text-white font-bold">
                            {formatCurrency(Math.round((materialUnitCost * Math.max(1, Math.ceil(((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 1.2) / ((boardSize.width * boardSize.height) / 10000)))) * 0.15), language)}
                          </span>
                        </div>
                        <div className="py-2.5 flex justify-between items-center">
                          <span className="text-neutral-400">{language === 'ar' ? 'عمل اليد بالورشة:' : 'Workshop Craft Wages:'}</span>
                          <span className="font-mono text-white font-bold">
                            {formatCurrency(Math.max(8, Math.round((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 15)) * laborRate, language)}
                          </span>
                        </div>
                        <div className="py-2.5 flex justify-between items-center font-bold">
                          <span className="text-neutral-300">{language === 'ar' ? 'تكلفة الإنتاج الإجمالية:' : 'Total Cost of production:'}</span>
                          <span className="font-mono text-red-400">
                            {formatCurrency(
                              (materialUnitCost * Math.max(1, Math.ceil(((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 1.2) / ((boardSize.width * boardSize.height) / 10000)))) +
                              Math.round((materialUnitCost * Math.max(1, Math.ceil(((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 1.2) / ((boardSize.width * boardSize.height) / 10000)))) * 0.15) +
                              (Math.max(8, Math.round((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 15)) * laborRate)
                            , language)}
                          </span>
                        </div>
                        <div className="pt-2.5 flex justify-between items-center font-bold text-sm text-green-400">
                          <span>{language === 'ar' ? 'سعر البيع المقترح:' : 'Recommended Selling Price:'}</span>
                          <span className="font-mono">
                            {formatCurrency(Math.round(
                              ((materialUnitCost * Math.max(1, Math.ceil(((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 1.2) / ((boardSize.width * boardSize.height) / 10000)))) +
                              Math.round((materialUnitCost * Math.max(1, Math.ceil(((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 1.2) / ((boardSize.width * boardSize.height) / 10000)))) * 0.15) +
                              (Math.max(8, Math.round((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 15)) * laborRate)) * (1 + (markup / 100))
                            ), language)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-[11px] leading-relaxed text-emerald-400 font-sans">
                        <strong className="text-emerald-400 font-mono block mb-1">
                          {language === 'ar' ? 'توصيات التسعير من المعلم:' : 'Aesthetic Pricing Analysis:'}
                        </strong>
                        {plannerResult.sellingPriceRecommendation}
                      </div>
                    </div>

                    {/* Quantity & Woods analysis card */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>{language === 'ar' ? 'تفاصيل الحطب والمواد الأولية' : 'Timber Volume & Hardware Guide'}</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-3.5 text-xs">
                        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850">
                          <span className="text-neutral-500 block font-mono text-[9px] uppercase">{language === 'ar' ? 'حجم الخشب المقدر' : 'Cubic Timber Volume'}</span>
                          <span className="text-sm font-bold text-white font-mono mt-1 block">
                            {((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * (woodType.toLowerCase().includes('mdf') || woodType.toLowerCase().includes('plywood') ? 0.018 : 0.04)).toFixed(4)} m³
                          </span>
                        </div>
                        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850">
                          <span className="text-neutral-500 block font-mono text-[9px] uppercase">{language === 'ar' ? 'عدد الألواح الخام' : 'Required Raw Boards'}</span>
                          <span className="text-sm font-bold text-amber-400 font-mono mt-1 block">
                            {Math.max(1, Math.ceil(((parts || []).reduce((acc: number, p: any) => acc + ((p.length * p.width * p.quantity) / 10000), 0) * 1.2) / ((boardSize.width * boardSize.height) / 10000)))} sheets
                          </span>
                        </div>
                      </div>

                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3">
                        <div>
                          <span className="text-[10px] text-neutral-400 font-mono block mb-1 uppercase tracking-widest">
                            {language === 'ar' ? 'مواصفات حطب السلعة ومقاومتها:' : 'Wood species analysis & care:'}
                          </span>
                          <p className="text-[10px] text-neutral-300 leading-relaxed font-sans">{plannerResult.woodTypeAnalysis}</p>
                        </div>
                        <div className="border-t border-neutral-850 pt-2.5">
                          <span className="text-[10px] text-neutral-400 font-mono block mb-1 uppercase tracking-widest">
                            {language === 'ar' ? 'الخردوات والمواد الاستهلاكية المطلوبة:' : 'Required hardware materials:'}
                          </span>
                          <p className="text-[10px] text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap">{plannerResult.materialEstimation}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cut Instructions & Daily schedule timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Cutting Instructions */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                        <List className="w-4 h-4" />
                        <span>{language === 'ar' ? 'إرشادات قص اللوح خطوة بخطوة' : 'Step-by-step Cutting Instructions'}</span>
                      </h4>
                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-2 text-[10.5px] leading-relaxed text-neutral-300 font-sans">
                        {safeGetLines(plannerResult.cuttingInstructions).map((line, lidx) => (
                          <div key={lidx} className="flex gap-2">
                            <span className="text-amber-500 font-bold font-mono">{(lidx + 1)}.</span>
                            <span>{line.replace(/^\d+\.\s*|^-/, '')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-neutral-500 block font-mono">Estimated Labor Workload:</span>
                          <span className="text-xs text-white font-bold mt-0.5 block">{plannerResult.projectDuration}</span>
                        </div>
                        <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                          <Calendar className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Daily Interactive Workspace Schedule */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{language === 'ar' ? 'خطة العمل اليومية للشانطي' : 'Daily Production Gantt Schedule'}</span>
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
                        {language === 'ar' ? 'اضغط لتشطيب المهام التي قمت بإنجازها في الورشة اليوم:' : 'Toggle tasks as complete to audit active production milestones.'}
                      </p>

                      <div className="space-y-2">
                        {parseLines(plannerResult.dailyWorkPlan).map((task, tidx) => (
                          <div
                            key={tidx}
                            onClick={() => setCheckedTimeline({ ...checkedTimeline, [tidx]: !checkedTimeline[tidx] })}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              checkedTimeline[tidx]
                                ? 'bg-amber-500/5 border-amber-500/30 text-neutral-400 line-through'
                                : 'bg-neutral-950 border-neutral-850 hover:border-neutral-750 text-neutral-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                              checkedTimeline[tidx]
                                ? 'bg-amber-500 border-amber-500 text-neutral-950'
                                : 'border-neutral-700'
                            }`}>
                              {checkedTimeline[tidx] && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-[10.5px] font-sans leading-relaxed">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Risks & Cheaper alternative panels */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" />
                      <span>{language === 'ar' ? 'كشف المخاطر والحلول الاقتصادية البديلة' : 'Safety, Risk Controls & Economic Solutions'}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Risk analysis warnings */}
                      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-2.5 text-[10px] leading-relaxed text-red-200">
                        <div className="flex items-center gap-2 font-mono font-bold text-red-400 text-[10.5px] uppercase tracking-wide">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{language === 'ar' ? 'مخاطر الشغل والالتواء:' : 'Woodcraft Structural Risks:'}</span>
                        </div>
                        <p className="font-sans leading-relaxed whitespace-pre-wrap">{plannerResult.projectRisks}</p>
                      </div>

                      {/* Cheaper Alternatives */}
                      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 space-y-2.5 text-[10px] leading-relaxed text-blue-200">
                        <div className="flex items-center gap-2 font-mono font-bold text-blue-400 text-[10.5px] uppercase tracking-wide">
                          <InfoIcon className="w-4 h-4" />
                          <span>{language === 'ar' ? 'خيارات بديلة لتخفيض التكلفة:' : 'Economic Value Engineering:'}</span>
                        </div>
                        <p className="font-sans leading-relaxed whitespace-pre-wrap">{plannerResult.cheaperAlternatives}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tools & Safety equipment checklists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Tool requirements */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                        <Hammer className="w-4 h-4" />
                        <span>{language === 'ar' ? 'الآلات والعدد المطلوبة' : 'Required Power Tools checklist'}</span>
                      </h4>

                      <div className="space-y-2">
                        {parseLines(plannerResult.toolRecommendations).map((tool, index) => (
                          <div
                            key={index}
                            onClick={() => setCheckedTools({ ...checkedTools, [index]: !checkedTools[index] })}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              checkedTools[index]
                                ? 'bg-amber-500/5 border-amber-500/20 text-neutral-500 line-through'
                                : 'bg-neutral-950 border-neutral-850 hover:border-neutral-750 text-neutral-300'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                              checkedTools[index]
                                ? 'bg-amber-500 border-amber-500 text-neutral-950'
                                : 'border-neutral-700'
                            }`}>
                              {checkedTools[index] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="text-[10px] font-mono">{tool}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safety Equipment */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        <span>{language === 'ar' ? 'إجراءات السلامة المهنية بالورشة' : 'Personal Protective Safety Equipments'}</span>
                      </h4>

                      <div className="space-y-2">
                        {parseLines(plannerResult.safetyRecommendations).map((gear, index) => (
                          <div
                            key={index}
                            onClick={() => setCheckedSafety({ ...checkedSafety, [index]: !checkedSafety[index] })}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                              checkedSafety[index]
                                ? 'bg-red-500/5 border-red-500/20 text-neutral-500 line-through'
                                : 'bg-neutral-950 border-neutral-850 hover:border-neutral-750 text-neutral-300'
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                              checkedSafety[index]
                                ? 'bg-red-500 border-red-500 text-white'
                                : 'border-neutral-700'
                            }`}>
                              {checkedSafety[index] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="text-[10px] font-mono">{gear}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Audited itemized quotation summary */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-amber-500 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>{language === 'ar' ? 'الفاتورة التقديرية المعتمدة تلقائياً' : 'Automated Audited Customer Quotation Sheet'}</span>
                    </h4>

                    <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                      <table className="w-full text-xs text-left text-neutral-300">
                        <thead className="text-[10px] uppercase font-mono bg-neutral-900 text-neutral-400 border-b border-neutral-850">
                          <tr>
                            <th className="p-3.5">{language === 'ar' ? 'البند' : 'Item Description'}</th>
                            <th className="p-3.5 text-center">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                            <th className="p-3.5 text-right">{language === 'ar' ? 'سعر الوحدة' : 'Unit Price'}</th>
                            <th className="p-3.5 text-right">{language === 'ar' ? 'المجموع' : 'Total'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-850 font-mono">
                          {plannerResult.quotationItems.map((item, index) => (
                            <tr key={index} className="hover:bg-neutral-900/50">
                              <td className="p-3.5 font-sans font-medium text-white">{item.description}</td>
                              <td className="p-3.5 text-center">{item.quantity}</td>
                              <td className="p-3.5 text-right">{formatCurrency(item.price, language)}</td>
                              <td className="p-3.5 text-right font-bold text-white">{formatCurrency(item.total, language)}</td>
                            </tr>
                          ))}
                          <tr className="bg-neutral-900 font-bold">
                            <td colSpan={3} className="p-3.5 text-right font-sans">{language === 'ar' ? 'المجموع الأساسي (قبل هامش الربح والضريبة):' : 'Total Base Cost of Craft:'}</td>
                            <td className="p-3.5 text-right text-amber-500">
                              {formatCurrency(plannerResult.quotationItems.reduce((sum, item) => sum + item.total, 0), language)}
                            </td>
                          </tr>
                          <tr className="bg-neutral-900 font-bold text-sm text-green-400">
                            <td colSpan={3} className="p-3.5 text-right font-sans">{language === 'ar' ? 'المبلغ الإجمالي المقترح للزبون (شامل الأرباح):' : 'Audited Grand Quoted Price (Markup applied):'}</td>
                            <td className="p-3.5 text-right">
                              {formatCurrency(Math.round(plannerResult.quotationItems.reduce((sum, item) => sum + item.total, 0) * (1 + (markup / 100))), language)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          TAB 2: AI CO-PILOT CHAT PANEL
          ---------------------------------------------------- */}
      {activeTab === 'chat' && (
        <div className="space-y-6 flex flex-col h-[580px] justify-between">
          
          {/* Chat log body */}
          <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 overflow-y-auto space-y-4 shadow-inner">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] text-xs leading-relaxed ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div className={`p-3.5 rounded-2xl relative shadow-md transition-all ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-neutral-950 font-medium rounded-tr-none'
                    : 'bg-neutral-950 text-neutral-200 border border-neutral-850 rounded-tl-none'
                }`}>
                  {m.sender === 'assistant' && (
                    <span className="flex items-center gap-2 text-[10px] text-amber-500 font-mono mb-2 uppercase font-bold tracking-widest border-b border-amber-500/10 pb-1.5">
                      <img 
                        src={malkMascot} 
                        alt="Maâlem Malik" 
                        className="w-5 h-5 rounded-full object-cover border border-amber-500/40"
                        referrerPolicy="no-referrer"
                      />
                      <span>{language === 'ar' ? 'المعلّم مالك برو' : 'MAÂLEM MALIK CARPENTER PRO'}</span>
                    </span>
                  )}
                  
                  <div className="whitespace-pre-line leading-relaxed text-[11px] font-sans">
                    {m.text}
                  </div>

                  <span className={`block text-[8px] font-mono mt-1 text-right ${
                    m.sender === 'user' ? 'text-neutral-900/65' : 'text-neutral-500'
                  }`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="mr-auto flex gap-3 text-[11px] text-neutral-400 font-sans animate-pulse items-center bg-neutral-950 border border-neutral-850 px-4 py-2.5 rounded-2xl">
                <div className="relative flex-shrink-0">
                  <img 
                    src={malkMascot} 
                    alt="Maâlem Malik" 
                    className="w-6 h-6 rounded-full object-cover border border-amber-500/30"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                </div>
                <span>
                  {language === 'ar'
                    ? 'المعلم مالك راه يفكر في طريقة التفصال ونقصان الهدر...'
                    : language === 'fr'
                    ? 'Malik réfléchit au meilleur calepinage de coupe...'
                    : 'Malik is analyzing timber grains & configuring cutting maps...'}
                </span>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Maâlem AI Voice Assistant & Workshop Action Deck */}
          {(() => {
            const [isListening, setIsListening] = useState(false);
            const [isSpeaking, setIsSpeaking] = useState(false);

            const handleVoiceListening = () => {
              if (isListening) return;
              setIsListening(true);
              
              // Simulate typing/inputting voice from microphone in Algerian Darja
              setTimeout(() => {
                const sampleVoicePrompts = language === 'ar' ? [
                  "المعلم مالك، كيفاش نقدر نتفادى هدر اللوح عند تفصال خزانة MDF؟",
                  "اعطيني نصيحة سلامة مهمة باه نخدم بالمنشار الدائري بلا خطر",
                  "واش هو الـ ريغلاج المليح نتاع نسبة رطوبة خشب الجوز؟"
                ] : [
                  "Malik, how do I prevent wood warping on a walnut tabletop?",
                  "Give me 3 critical safety tips for using a table saw in the workshop.",
                  "What is the best joinery method for a heavy-duty oak cabinet frame?"
                ];
                
                const randomPrompt = sampleVoicePrompts[Math.floor(Math.random() * sampleVoicePrompts.length)];
                setChatInput(randomPrompt);
                setIsListening(false);
                handleChatSend(randomPrompt);
              }, 2500);
            };

            const handleReadAloud = () => {
              if (isSpeaking) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
                return;
              }

              const lastAssistantMsg = [...messages].reverse().find(m => m.sender === 'assistant');
              if (!lastAssistantMsg) return;

              setIsSpeaking(true);
              const utterance = new SpeechSynthesisUtterance(lastAssistantMsg.text);
              
              // Detect language for speaking
              if (language === 'ar') {
                utterance.lang = 'ar-DZ'; // Algerian Arabic dialect/Arabic
              } else if (language === 'fr') {
                utterance.lang = 'fr-FR';
              } else {
                utterance.lang = 'en-US';
              }

              utterance.onend = () => setIsSpeaking(false);
              utterance.onerror = () => setIsSpeaking(false);
              window.speechSynthesis.speak(utterance);
            };

            return (
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-3.5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎙️</span>
                    <div>
                      <span className="text-[10px] text-amber-500 font-mono font-bold tracking-wider uppercase block">
                        {language === 'ar' ? 'التحكم الصوتي والميكروفون' : 'Maâlem AI Voice & Assist Control'}
                      </span>
                      <span className="text-[9px] text-neutral-400 block font-sans">
                        {language === 'ar' ? 'تحدث بالدارجة الجزائرية وسينطق المساعد الردود تلقائيًا' : 'Speak or request read-back with localized accent support'}
                      </span>
                    </div>
                  </div>

                  {/* Sound Wave Animation if active */}
                  {isListening && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                      <div className="flex items-end gap-0.5 h-3">
                        <div className="w-0.5 bg-amber-500 animate-bounce h-2" style={{ animationDelay: '0.1s' }} />
                        <div className="w-0.5 bg-amber-500 animate-bounce h-3" style={{ animationDelay: '0.3s' }} />
                        <div className="w-0.5 bg-amber-500 animate-bounce h-1" style={{ animationDelay: '0.2s' }} />
                        <div className="w-0.5 bg-amber-500 animate-bounce h-2.5" style={{ animationDelay: '0.5s' }} />
                        <div className="w-0.5 bg-amber-500 animate-bounce h-1.5" style={{ animationDelay: '0.4s' }} />
                      </div>
                      <span className="text-[8px] text-amber-400 font-mono font-bold uppercase tracking-wider">Listening...</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <button
                    onClick={handleVoiceListening}
                    disabled={isListening || isChatLoading}
                    className="bg-neutral-900 hover:bg-neutral-850 text-white border border-neutral-800 p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 text-[10px]"
                  >
                    <span>{isListening ? '🎙️ Rec active...' : '🎤 Speak (Arabic/Eng)'}</span>
                  </button>
                  <button
                    onClick={handleReadAloud}
                    className="bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 p-2.5 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer transition-all text-[10px]"
                  >
                    <span>{isSpeaking ? '🛑 Stop Audio' : '🔊 Read Out Loud'}</span>
                  </button>
                </div>

                {/* Quick assistant shortcut actions */}
                <div className="border-t border-neutral-850 pt-3 space-y-2">
                  <span className="text-[9px] text-neutral-500 font-mono uppercase block">Workshop Copilot Fast Inputs:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
                    <button
                      onClick={() => handleChatSend("المعلم مالك، اقترح عليا خطوة العمل القادمة لتركيب كادر طاولة حطب")}
                      className="p-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-850 rounded-lg text-left truncate cursor-pointer transition-all"
                    >
                      ⚙️ Suggest next working step
                    </button>
                    <button
                      onClick={() => handleChatSend("المعلم مالك، واش هي الأخطاء الشائعة اللي لازم نتفاداها كي نخدم بحطب الزان في الشتا؟")}
                      className="p-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-850 rounded-lg text-left truncate cursor-pointer transition-all"
                    >
                      ⚠️ Detect common joinery mistakes
                    </button>
                    <button
                      onClick={() => handleChatSend("المعلم مالك، كيفاش نضمن الأمان و السلامة التامة كي نخدم بـ منشار الشريط للتقطيع الدقيق؟")}
                      className="p-2 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border border-neutral-850 rounded-lg text-left truncate cursor-pointer transition-all"
                    >
                      🛡️ Recommend safer techniques
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Quick query recommendation chips */}
          {messages.length < 2 && (
            <div className="flex gap-2 overflow-x-auto pb-1 text-[10px] scrollbar-none font-sans">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleChatSend(chip)}
                  className="px-3.5 py-2 rounded-full bg-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-white border border-neutral-850 flex-shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span className="truncate max-w-xs">{chip}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                </button>
              ))}
            </div>
          )}

          {/* Prompt Message Input form */}
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend(chatInput)}
              placeholder={t.assistantPlaceholder || "Ask about wood quantities, cutting plans, moisture rates, joint design..."}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-amber-500/50 font-sans shadow-md"
            />
            <button
              onClick={() => handleChatSend(chatInput)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500 rounded-xl hover:bg-amber-600 text-neutral-950 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
