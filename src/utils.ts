import { Customer, Project, InventoryItem, Employee, Supplier, Payment, Invoice, CalendarEvent, Language } from './types';

// Translation Dictionary
export const translations = {
  en: {
    appName: "Malk Carpenter Pro",
    tagline: "Premium Workshop & AI Intelligence",
    dashboard: "Dashboard",
    customers: "Customers",
    projects: "Projects",
    inventory: "Inventory",
    employees: "Employees",
    suppliers: "Suppliers",
    calendar: "Calendar",
    payments: "Payments",
    reports: "Reports",
    invoices: "Invoices & Quotes",
    settings: "Settings",
    scanner: "AI Room Scanner",
    assistant: "AI Assistant",
    calculators: "Cost Calculators",
    
    // Stats
    revenue: "Revenue",
    expenses: "Expenses",
    profit: "Net Profit",
    activeProjects: "Active Projects",
    lowStockAlerts: "Low Stock Alerts",
    attendanceRate: "Attendance Rate",
    outstanding: "Outstanding Balance",
    totalPaid: "Total Paid",
    
    // Actions
    addCustomer: "New Customer",
    addProject: "New Project",
    addInventory: "Add Stock",
    addEmployee: "New Employee",
    addSupplier: "New Supplier",
    addPayment: "Record Payment",
    addInvoice: "New Invoice",
    addEvent: "Add Schedule",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search...",
    filter: "Filter",
    all: "All",
    status: "Status",
    actions: "Actions",
    
    // CRM
    customerProfile: "Customer Profile",
    gpsLocation: "GPS Coordinates",
    whatsappMsg: "Send WhatsApp",
    history: "History",
    notes: "Notes",
    
    // Project details
    client: "Client",
    type: "Type",
    dimensions: "Dimensions",
    materials: "Materials",
    workers: "Workers",
    timeline: "Timeline",
    deliveryDate: "Delivery Date",
    installationDate: "Installation Date",
    warranty: "Warranty (Years)",
    documents: "Documents",
    photos: "Photos & Media",
    voiceNotes: "Voice Notes",
    
    // Room Scanner
    startScan: "Start AI Room Scanner",
    capturePhoto: "Capture Space for AI Estimate",
    scanningHUD: "AI REAL-TIME SPATIAL HUD ACTIVE",
    scanningBtn: "Analyze Room layout...",
    estimatingMaterials: "Gemini AI calculating wood quantities & labor costs...",
    scanResults: "AI Space Report & Quote Summary",
    floorPlan: "Floor Plan Layout",
    woodQuantity: "Wood Quantity",
    mdfQuantity: "MDF Sheets",
    plywoodQuantity: "Plywood Sheets",
    paintQuantity: "Paint Quantity",
    accessories: "Hinges & Handles",
    screws: "Screws",
    laborHours: "Est. Labor Hours",
    productionTime: "Manufacturing Timeline",
    installationTime: "Installation Timeline",
    totalProjectCost: "AI Estimated Base Cost",
    suggestedSellingPrice: "Recommended Selling Price",
    shoppingList: "AI shopping list",
    warnings: "Alerts & Constraints",
    suggestions: "AI Furniture & Design Suggestions",
    projectSummary: "Project Executive Summary",
    
    // Invoices
    invoice: "Invoice",
    quotation: "Quotation",
    receipt: "Receipt",
    invoiceNo: "Invoice #",
    dueDate: "Due Date",
    qty: "Qty",
    price: "Price",
    subtotal: "Subtotal",
    tax: "VAT / Tax",
    signature: "Customer Signature",
    clear: "Clear",
    shareWhatsapp: "Share Invoice on WhatsApp",
    print: "Print & Export PDF",
    
    // Assistant
    askAssistant: "Ask Malk Woodworking Assistant...",
    assistantPlaceholder: "Ask about cutting plans, wood alternatives, moisture rates, joint design...",
    tipsTitle: "Woodworking Technical Tip of the Day",
    
    // Languages & Security
    language: "App Language",
    securityLock: "Security Access Lock",
    pinCode: "PIN Code Lock",
    fingerprint: "Fingerprint scanner",
    faceId: "Face ID recognition",
    offlineMode: "Offline Mode Active (Local sync)",
    cloudSync: "Cloud Sync Ready",
    automaticBackup: "Auto-backup configured"
  },
  fr: {
    appName: "Malk Carpenter Pro",
    tagline: "Atelier Premium & Intelligence IA",
    dashboard: "Tableau de Bord",
    customers: "Clients",
    projects: "Projets",
    inventory: "Inventaire",
    employees: "Employés",
    suppliers: "Fournisseurs",
    calendar: "Calendrier",
    payments: "Paiements",
    reports: "Rapports",
    invoices: "Factures & Devis",
    settings: "Paramètres",
    scanner: "Scanner de Pièce IA",
    assistant: "Assistant IA",
    calculators: "Calculateurs",
    
    // Stats
    revenue: "Revenus",
    expenses: "Dépenses",
    profit: "Bénéfice Net",
    activeProjects: "Projets Actifs",
    lowStockAlerts: "Alertes Stock Bas",
    attendanceRate: "Taux de Présence",
    outstanding: "Solde Restant",
    totalPaid: "Total Payé",
    
    // Actions
    addCustomer: "Nouveau Client",
    addProject: "Nouveau Projet",
    addInventory: "Ajouter du Stock",
    addEmployee: "Nouvel Employé",
    addSupplier: "Nouveau Fournisseur",
    addPayment: "Enregistrer Paiement",
    addInvoice: "Nouvelle Facture",
    addEvent: "Planifier tâche",
    edit: "Modifier",
    delete: "Supprimer",
    save: "Enregistrer",
    cancel: "Annuler",
    search: "Rechercher...",
    filter: "Filtrer",
    all: "Tous",
    status: "Statut",
    actions: "Actions",
    
    // CRM
    customerProfile: "Profil Client",
    gpsLocation: "Coordonnées GPS",
    whatsappMsg: "Envoyer WhatsApp",
    history: "Historique",
    notes: "Notes",
    
    // Project details
    client: "Client",
    type: "Type",
    dimensions: "Dimensions",
    materials: "Matériaux",
    workers: "Ouvriers",
    timeline: "Planning",
    deliveryDate: "Date de Livraison",
    installationDate: "Date d'Installation",
    warranty: "Garantie (Années)",
    documents: "Documents",
    photos: "Photos & Médias",
    voiceNotes: "Notes Vocales",
    
    // Room Scanner
    startScan: "Lancer le Scanner IA",
    capturePhoto: "Prendre une photo pour Devis IA",
    scanningHUD: "AFFICHAGE SPATIAL IA ACTIF",
    scanningBtn: "Analyser l'espace...",
    estimatingMaterials: "Calcul des matériaux et coûts par l'IA Gemini...",
    scanResults: "Rapport d'Espace & Devis IA",
    floorPlan: "Plan 2D de la Pièce",
    woodQuantity: "Quantité de Bois",
    mdfQuantity: "Plaques de MDF",
    plywoodQuantity: "Plaques de Contreplaqué",
    paintQuantity: "Quantité de Peinture",
    accessories: "Charnières & Poignées",
    screws: "Vis",
    laborHours: "Heures de main d'œuvre",
    productionTime: "Temps de Fabrication",
    installationTime: "Temps d'Installation",
    totalProjectCost: "Coût de Base Estimé",
    suggestedSellingPrice: "Prix de Vente Conseillé",
    shoppingList: "Liste d'achats IA",
    warnings: "Alertes & Contraintes",
    suggestions: "Suggestions de Design & Meubles IA",
    projectSummary: "Résumé Exécutif",
    
    // Invoices
    invoice: "Facture",
    quotation: "Devis",
    receipt: "Reçu",
    invoiceNo: "Facture N°",
    dueDate: "Date d'Échéance",
    qty: "Qté",
    price: "Prix",
    subtotal: "Sous-total",
    tax: "TVA",
    signature: "Signature Client",
    clear: "Effacer",
    shareWhatsapp: "Partager via WhatsApp",
    print: "Imprimer / PDF",
    
    // Assistant
    askAssistant: "Demander à l'Assistant Menuiserie...",
    assistantPlaceholder: "Posez vos questions sur les plans de coupe, essences de bois, humidité...",
    tipsTitle: "Astuce Technique du Jour",
    
    // Languages & Security
    language: "Langue de l'application",
    securityLock: "Verrouillage de Sécurité",
    pinCode: "Code PIN",
    fingerprint: "Scanner d'empreintes",
    faceId: "Reconnaissance Face ID",
    offlineMode: "Mode Hors-ligne Actif",
    cloudSync: "Prêt pour Synchronisation Cloud",
    automaticBackup: "Sauvegarde auto configurée"
  },
  ar: {
    appName: "مالك كاربنتر برو",
    tagline: "المعلم الأول في نجارة اللوح والذكاء الاصطناعي",
    dashboard: "لوحة التحكم (الرئيسية)",
    customers: "الكليونات (العملاء)",
    projects: "الشانطيات والمشاريع",
    inventory: "السلعة والمخزون",
    employees: "الخدامين والعمال",
    suppliers: "الفورنيسور (الموردين)",
    calendar: "اجندة الخدمة (التقويم)",
    payments: "الدراهم والخلاص",
    reports: "حسابات الورشة والتقارير",
    invoices: "الفواير والدوفي (الفواتير والعروض)",
    settings: "الريغلاج والإعدادات",
    scanner: "سكانير الغرفة بالذكاء الاصطناعي",
    assistant: "المعاون الذكي (الذكاء الاصطناعي)",
    calculators: "حساب التكاليف والنجارة",
    
    // Stats
    revenue: "المدخول (الإيرادات)",
    expenses: "المصاريف والخسائر",
    profit: "الفائدة الصافية (الربح)",
    activeProjects: "الشانطيات اللي يخدموا",
    lowStockAlerts: "السلعة اللي قريب تخلاص",
    attendanceRate: "نسبة حضور الخدامين",
    outstanding: "الكريدي اللي برا (الديون)",
    totalPaid: "شحال خلصونا (إجمالي المدفوع)",
    
    // Actions
    addCustomer: "كليون جديد",
    addProject: "شانطي جديد",
    addInventory: "دخل السلعة (إضافة مخزون)",
    addEmployee: "خدام جديد",
    addSupplier: "فورنيسور جديد",
    addPayment: "سجل الخلاص (دفعة جديدة)",
    addInvoice: "دير فيطورة / دوفي",
    addEvent: "سجل موعد الخدمة",
    edit: "بدل (تعديل)",
    delete: "فاصي (حذف)",
    save: "سجل (حفظ)",
    cancel: "أنولي (إلغاء)",
    search: "حوس... (بحث)",
    filter: "صفي (تصفية)",
    all: "كلش (الكل)",
    status: "الحالة تاع الخدمة",
    actions: "العفايس (الإجراءات)",
    
    // CRM
    customerProfile: "الملف تاع الكليون",
    gpsLocation: "البلاصة بـ GPS (الإحداثيات)",
    whatsappMsg: "بعت ميساج واتساب",
    history: "الأرشيف والسجل",
    notes: "ملاحظات وتدوينات",
    
    // Project details
    client: "الكليون",
    type: "النوع",
    dimensions: "العبار والقياسات",
    materials: "السلعة المستعملة (المواد)",
    workers: "الخدامين",
    timeline: "وقت الخدمة (الجدول)",
    deliveryDate: "نهار التسليم",
    installationDate: "نهار التركيب",
    warranty: "الضمان (بالأعوام)",
    documents: "الكواغط والوثائق",
    photos: "الصور والفيديوهات",
    voiceNotes: "الميساجات الصوتيّين (ملاحظات)",
    
    // Room Scanner
    startScan: "شغل السكانير الذكي",
    capturePhoto: "صور الشمبرة باش تحسب السعر",
    scanningHUD: "رادار الذكاء الاصطناعي خدام مباشرة",
    scanningBtn: "سكانر الشمبرة والحيوط...",
    estimatingMaterials: "جيميني يحسب في اللوح والمسامر وشحال تقام الخدمة...",
    scanResults: "تقرير الحسابات والدوفي تاع الذكاء الاصطناعي",
    floorPlan: "البلان 2D تاع الشمبرة",
    woodQuantity: "شحال يسحق لوح (متر مكعب)",
    mdfQuantity: "ألواح MDF",
    plywoodQuantity: "ألواح كونت البلاكي",
    paintQuantity: "شحال لترات صبيغة (دهان)",
    accessories: "المفصلات وقبضات اليد",
    screws: "المسامير والبراغي",
    laborHours: "شحال من ساعة خدمة",
    productionTime: "وقت التوجاد في ورشتنا",
    installationTime: "وقت التركيب عند الكليون",
    totalProjectCost: "شحال تقام السلعة والخدمة (التكلفة)",
    suggestedSellingPrice: "السعر المليح للبيع (المقترح)",
    shoppingList: "ليستة تاع قضيان السلعة",
    warnings: "رد بالك وتنبيهات أمان",
    suggestions: "أفكار ديزاين وأثاث هايلين",
    projectSummary: "الخلاصة الكافية تاع الشانطي",
    
    // Invoices
    invoice: "الفيطورة (فاتورة)",
    quotation: "دوفي (عرض السعر)",
    receipt: "بون الخلاص (وصل قبض)",
    invoiceNo: "فيطورة رقم",
    dueDate: "نهار الخلاص اللخر",
    qty: "الكمية",
    price: "السومة (السعر)",
    subtotal: "الحساب الفرعي",
    tax: "التامبر والضريبة",
    signature: "سنياتور تاع الكليون",
    clear: "فاصي التوقيع",
    shareWhatsapp: "بعت الفيطورة فـ الواتساب",
    print: "امبريمي واكسبورتي PDF",
    
    // Assistant
    askAssistant: "سقسي المعاون الذكي تاع النجارة...",
    assistantPlaceholder: "اسأل على كيفاش تقص اللوح، أنواع الحطب، رطوبة الشجرة...",
    tipsTitle: "تدبيرة اليوم في خدمة اللوح",
    
    // Languages & Security
    language: "لغة التطبيق",
    securityLock: "سيكوريتي وقفل الأمان",
    pinCode: "كود PIN السري",
    fingerprint: "سكانير البصمة",
    faceId: "سكانير الوجه (Face ID)",
    offlineMode: "الخدمة بلا أنترنت (محلي)",
    cloudSync: "النسخ السحابي واجد",
    automaticBackup: "الباكاب التلقائي ريغلي"
  }
};

// Automatic conversions between mm, cm, m
export function convertMeasurements(val: number, from: 'mm' | 'cm' | 'm', to: 'mm' | 'cm' | 'm'): number {
  if (from === to) return val;
  // Convert to mm first
  let inMm = val;
  if (from === 'cm') inMm = val * 10;
  else if (from === 'm') inMm = val * 1000;

  // Convert to destination
  if (to === 'mm') return inMm;
  if (to === 'cm') return inMm / 10;
  if (to === 'm') return inMm / 1000;
  return val;
}

export function calculateAreaAndVolume(
  width: number,
  height: number,
  depth: number,
  unit: 'mm' | 'cm' | 'm'
): { area: number; volume: number } {
  // convert all to meters
  const wM = convertMeasurements(width, unit, 'm');
  const hM = convertMeasurements(height, unit, 'm');
  const dM = convertMeasurements(depth, unit, 'm');
  
  return {
    area: Number((wM * hM).toFixed(3)),
    volume: Number((wM * hM * dM).toFixed(3))
  };
}

// Local Storage Helper Database Seeder
export function seedDatabaseIfEmpty() {
  const isSeeded = localStorage.getItem('malouk_db_seeded');
  if (isSeeded) return;

  // 1. Seed Customers
  const customers: Customer[] = [
    {
      id: 'cust-1',
      name: 'Youssef Al-Fassi',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      phone: '+212 661-234567',
      whatsapp: '212661234567',
      email: 'youssef@alfassi.ma',
      address: 'Villa 14, Anfa, Casablanca',
      gps: '33.5951, -7.6432',
      outstandingBalance: 12000,
      totalPaid: 45000,
      notes: 'Prefers high-end European Walnut. Demands exact 3D models before cutting. Reputable estate manager.',
      createdAt: '2026-02-15T10:00:00.000Z'
    },
    {
      id: 'cust-2',
      name: 'Elena Dupont',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      phone: '+33 6 1234 5678',
      whatsapp: '33612345678',
      email: 'elena.dupont@orange.fr',
      address: 'Rue de la Pompe 75016, Paris / Residence Al-Boustane, Marrakech',
      gps: '31.6295, -7.9811',
      outstandingBalance: 0,
      totalPaid: 78000,
      notes: 'Bespoke Scandinavian style kitchen. Prefers white-washed oak wood veneer and matte black metal hardware.',
      createdAt: '2026-03-01T14:30:00.000Z'
    },
    {
      id: 'cust-3',
      name: 'Tareq Mansoor',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      phone: '+971 50 987 6543',
      whatsapp: '971509876543',
      email: 'tareq@mansoorgroup.ae',
      address: 'Penthouse 45, Marina Heights, Dubai',
      gps: '25.0792, 55.1322',
      outstandingBalance: 35000,
      totalPaid: 120000,
      notes: 'Commercial fit-out for corporate headquarters. Needs 15 heavy-duty oak workstations and executive walnut tables.',
      createdAt: '2026-04-10T09:15:00.000Z'
    }
  ];

  // 2. Seed Suppliers
  const suppliers: Supplier[] = [
    {
      id: 'supp-1',
      name: 'Atlas Wood Co.',
      contact: 'Abdelkader',
      phone: '+212 522-987654',
      email: 'sales@atlaswood.ma',
      materials: ['American Walnut', 'White Oak', 'Red Oak', 'Beechwood']
    },
    {
      id: 'supp-2',
      name: 'DecoPan Panels',
      contact: 'Marie Laurent',
      phone: '+33 1 4567 8910',
      email: 'info@decopan.com',
      materials: ['MDF Standard', 'MDF Fire-Rated', 'Marine Plywood', 'Veneered Panels']
    },
    {
      id: 'supp-3',
      name: 'ProHardware International',
      contact: 'Zainab',
      phone: '+971 4 234 5678',
      email: 'hardware@prointl.ae',
      materials: ['Hinges Soft-Close', 'Premium Handles', 'Drawer Slides', 'Magnetic Locks', 'Specialty Screws']
    }
  ];

  // 3. Seed Inventory
  const inventory: InventoryItem[] = [
    { id: 'inv-1', name: 'American Walnut (Rough Sawn)', category: 'wood', stock: 12.5, minQuantity: 2.0, unit: 'm3', supplierId: 'supp-1', lastPrice: 4200 },
    { id: 'inv-2', name: 'Premium European White Oak', category: 'wood', stock: 18.2, minQuantity: 3.0, unit: 'm3', supplierId: 'supp-1', lastPrice: 3800 },
    { id: 'inv-3', name: 'MDF Core Sheet 18mm', category: 'mdf', stock: 120, minQuantity: 20, unit: 'sheets', supplierId: 'supp-2', lastPrice: 45 },
    { id: 'inv-4', name: 'Okoume Marine Plywood 15mm', category: 'plywood', stock: 65, minQuantity: 15, unit: 'sheets', supplierId: 'supp-2', lastPrice: 65 },
    { id: 'inv-5', name: 'Polyurethane Wood Varnish (Matte)', category: 'paint', stock: 80, minQuantity: 15, unit: 'liters', supplierId: 'supp-2', lastPrice: 18 },
    { id: 'inv-6', name: 'Blum Clip Top Soft-Close Hinges', category: 'hardware', stock: 450, minQuantity: 100, unit: 'pcs', supplierId: 'supp-3', lastPrice: 4.5 },
    { id: 'inv-7', name: 'Solid Brushed Brass Gold Handle (160mm)', category: 'hardware', stock: 180, minQuantity: 40, unit: 'pcs', supplierId: 'supp-3', lastPrice: 12 },
    { id: 'inv-8', name: 'T-Star Countersunk Screws 4x35mm', category: 'hardware', stock: 4500, minQuantity: 1000, unit: 'pcs', supplierId: 'supp-3', lastPrice: 0.05 }
  ];

  // 4. Seed Employees
  const employees: Employee[] = [
    {
      id: 'emp-1',
      name: 'Rachid El-Madi',
      role: 'Master Artisan Carpenter',
      phone: '+212 662-887766',
      salary: 8500,
      workingHours: 180,
      attendance: { '2026-07-01': 'present', '2026-07-02': 'present', '2026-07-03': 'present', '2026-07-04': 'present', '2026-07-05': 'present' },
      tasks: ['Anfa Dining Table - Fine jointing & finishing', 'Duplex Kitchen - Oak assembly'],
      performance: 5
    },
    {
      id: 'emp-2',
      name: 'Francois Moreau',
      role: 'Project CAD Designer & Joiner',
      phone: '+33 6 8877 6655',
      salary: 9500,
      workingHours: 172,
      attendance: { '2026-07-01': 'present', '2026-07-02': 'late', '2026-07-03': 'present', '2026-07-04': 'absent', '2026-07-05': 'present' },
      tasks: ['Kitchen Room Scan conversion', 'Custom Walk-In Wardrobe CAD drawings'],
      performance: 4
    },
    {
      id: 'emp-3',
      name: 'Bilal Mansouri',
      role: 'Apprentice Painter & Assembler',
      phone: '+212 663-112233',
      salary: 4500,
      workingHours: 185,
      attendance: { '2026-07-01': 'present', '2026-07-02': 'present', '2026-07-03': 'present', '2026-07-04': 'present', '2026-07-05': 'present' },
      tasks: ['Sanding Wardrobes', 'Varnishing Oak Panels'],
      performance: 4
    }
  ];

  // 5. Seed Projects
  const projects: Project[] = [
    {
      id: 'proj-1',
      name: 'Premium Walnut Dining Table',
      type: 'table',
      customerId: 'cust-1',
      status: 'painting',
      measurements: {
        width: 2400,
        height: 750,
        depth: 1000,
        unit: 'mm',
        area: 2.4,
        volume: 1.8
      },
      budget: 35000,
      expenses: 12500,
      profit: 22500,
      workers: ['emp-1'],
      notes: 'Single slab walnut top with classic butterfly joints. Hand-applied oil finish.',
      photos: ['https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=600'],
      photosBefore: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600'],
      photosAfter: ['https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&q=80&w=600'],
      videos: [],
      voiceNotes: [],
      deliveryDate: '2026-07-15',
      installationDate: '2026-07-15',
      warrantyYears: 10,
      documents: [{ name: 'Technical Drawing.pdf', url: '#' }],
      createdAt: '2026-06-01T08:00:00.000Z'
    },
    {
      id: 'proj-2',
      name: 'Bespoke Scandinavian Oak Kitchen',
      type: 'kitchen',
      customerId: 'cust-2',
      status: 'cutting',
      measurements: {
        width: 4500,
        height: 2400,
        depth: 600,
        unit: 'mm',
        area: 10.8,
        volume: 6.48
      },
      budget: 78000,
      expenses: 32000,
      profit: 46000,
      workers: ['emp-1', 'emp-2', 'emp-3'],
      notes: 'Completely integrated kitchen with oak veneers. Push-to-open blum mechanisms.',
      photos: ['https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=600'],
      photosBefore: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600'],
      photosAfter: ['https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=600'],
      videos: [],
      voiceNotes: [],
      deliveryDate: '2026-08-10',
      installationDate: '2026-08-12',
      warrantyYears: 5,
      documents: [{ name: 'Floor_Plan_Approved.pdf', url: '#' }, { name: 'Cutting_List.xlsx', url: '#' }],
      createdAt: '2026-06-15T11:00:00.000Z'
    }
  ];

  // 6. Seed Payments
  const payments: Payment[] = [
    { id: 'pay-1', projectId: 'proj-1', customerId: 'cust-1', amount: 23000, date: '2026-06-02', method: 'transfer', notes: 'First milestone deposit 65%' },
    { id: 'pay-2', projectId: 'proj-2', customerId: 'cust-2', amount: 78000, date: '2026-06-16', method: 'transfer', notes: 'Full advance payment' }
  ];

  // 7. Seed Invoices
  const invoices: Invoice[] = [
    {
      id: 'inv-rec-1',
      number: 'INV-2026-001',
      type: 'invoice',
      projectId: 'proj-1',
      customerId: 'cust-1',
      date: '2026-06-01',
      dueDate: '2026-07-01',
      items: [
        { description: 'Luxury American Walnut Table top Slab (2400x1000mm)', quantity: 1, price: 18000, total: 18000 },
        { description: 'Handcrafted steel base & butterfly joints', quantity: 1, price: 12000, total: 12000 },
        { description: 'Fine finishing & high protection varnish coatings', quantity: 1, price: 5000, total: 5000 }
      ],
      subtotal: 35000,
      tax: 0,
      total: 35000,
      status: 'paid',
      createdAt: '2026-06-01T08:30:00.000Z'
    },
    {
      id: 'inv-rec-2',
      number: 'QT-2026-002',
      type: 'quotation',
      projectId: 'proj-2',
      customerId: 'cust-2',
      date: '2026-06-15',
      dueDate: '2026-06-30',
      items: [
        { description: 'Bespoke Scandinavian Kitchen Cabinets fabrication', quantity: 1, price: 48000, total: 48000 },
        { description: 'Solid Oak veneers, high-gloss fronts & soft-close hinges', quantity: 1, price: 20000, total: 20000 },
        { description: 'On-site measurement, installation & transport', quantity: 1, price: 10000, total: 10000 }
      ],
      subtotal: 78000,
      tax: 0,
      total: 78000,
      status: 'paid',
      createdAt: '2026-06-15T11:30:00.000Z'
    }
  ];

  // 8. Seed Calendar Events
  const events: CalendarEvent[] = [
    { id: 'ev-1', title: 'Walnut Dining Table - Polishing Phase', type: 'painting', date: '2026-07-06', time: '09:00', projectId: 'proj-1', description: 'Apply 3rd coat of lacquer' },
    { id: 'ev-2', title: 'Elena Dupont - Kitchen Site Measurement', type: 'measurement', date: '2026-07-07', time: '14:00', projectId: 'proj-2', description: 'Final check of pipeline routing' },
    { id: 'ev-3', title: 'Atlas Wood Supplier Order delivery', type: 'production', date: '2026-07-08', time: '10:30', description: 'Oak delivery' },
    { id: 'ev-4', title: 'Walnut Dining Table - Delivery to Anfa', type: 'delivery', date: '2026-07-15', time: '11:00', projectId: 'proj-1', description: 'Assemble legs on-site' }
  ];

  localStorage.setItem('malouk_customers', JSON.stringify(customers));
  localStorage.setItem('malouk_suppliers', JSON.stringify(suppliers));
  localStorage.setItem('malouk_inventory', JSON.stringify(inventory));
  localStorage.setItem('malouk_employees', JSON.stringify(employees));
  localStorage.setItem('malouk_projects', JSON.stringify(projects));
  localStorage.setItem('malouk_payments', JSON.stringify(payments));
  localStorage.setItem('malouk_invoices', JSON.stringify(invoices));
  localStorage.setItem('malouk_events', JSON.stringify(events));
  localStorage.setItem('malouk_db_seeded', 'true');
}

export function getLocalData<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

export function saveLocalData<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export type Currency = 'DZD' | 'USD';

export function getActiveCurrency(): Currency {
  const saved = localStorage.getItem('malk_currency');
  if (saved === 'USD' || saved === 'DZD') return saved;
  // Default to DZD (local currency) if language is ar/fr, otherwise default to USD
  const lang = localStorage.getItem('malouk_language') || 'en';
  return (lang === 'ar' || lang === 'fr') ? 'DZD' : 'USD';
}

export function setActiveCurrency(currency: Currency): void {
  localStorage.setItem('malk_currency', currency);
  window.dispatchEvent(new Event('currency_changed'));
}

export function formatCurrency(amount: number, language: Language): string {
  const currency = getActiveCurrency();
  const rounded = Math.round(amount);
  if (currency === 'DZD') {
    if (language === 'ar') {
      return `${rounded.toLocaleString()} د.ج`;
    } else if (language === 'fr') {
      return `${rounded.toLocaleString()} DA`;
    } else {
      return `${rounded.toLocaleString()} DZD`;
    }
  } else {
    return `$${rounded.toLocaleString()}`;
  }
}
