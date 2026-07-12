import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Users, Hammer, Package, Wrench, PackageOpen, Calendar as CalendarIcon, 
  DollarSign, FileText, TrendingUp, Camera, Sparkles, Settings as SettingsIcon,
  Globe, LogOut, ChevronRight, Menu, X, ArrowLeft, Calculator, Cloud, CloudOff, RefreshCw
} from 'lucide-react';
import { 
  Language, Theme, Customer, Project, InventoryItem, Employee, Supplier, Payment, Invoice, CalendarEvent 
} from './types';
import { 
  translations, seedDatabaseIfEmpty, getLocalData, saveLocalData, getActiveCurrency, Currency 
} from './utils';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Import newly created modular components
import SecurityLock from './components/SecurityLock';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Projects from './components/Projects';
import Inventory from './components/Inventory';
import Employees from './components/Employees';
import Suppliers from './components/Suppliers';
import CalendarView from './components/CalendarView';
import Payments from './components/Payments';
import Invoices from './components/Invoices';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Assistant from './components/Assistant';
import RoomScanner from './components/RoomScanner';
import Calculators from './components/Calculators';

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [currency, setCurrency] = useState<Currency>(getActiveCurrency());

  // Cloud & Offline Sync States
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string>('');

  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrency(getActiveCurrency());
    };
    window.addEventListener('currency_changed', handleCurrencyChange);
    return () => {
      window.removeEventListener('currency_changed', handleCurrencyChange);
    };
  }, []);

  // Track network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Core App State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Initialize and load database from localStorage
  useEffect(() => {
    seedDatabaseIfEmpty();
    setCustomers(getLocalData<Customer[]>('malouk_customers', []));
    setProjects(getLocalData<Project[]>('malouk_projects', []));
    setInventory(getLocalData<InventoryItem[]>('malouk_inventory', []));
    setEmployees(getLocalData<Employee[]>('malouk_employees', []));
    setSuppliers(getLocalData<Supplier[]>('malouk_suppliers', []));
    setPayments(getLocalData<Payment[]>('malouk_payments', []));
    setInvoices(getLocalData<Invoice[]>('malouk_invoices', []));
    setEvents(getLocalData<CalendarEvent[]>('malouk_events', []));

    // Theme hook loading
    const savedTheme = localStorage.getItem('malouk_theme') as Theme || 'dark';
    setTheme(savedTheme);
    const savedLang = localStorage.getItem('malouk_language') as Language || 'en';
    setLanguage(savedLang);
  }, []);

  // Listen to Auth State Changes & load custom Firestore data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsUnlocked(true);
        setIsSyncing(true);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.customers) { setCustomers(data.customers); saveLocalData('malouk_customers', data.customers); }
            if (data.projects) { setProjects(data.projects); saveLocalData('malouk_projects', data.projects); }
            if (data.inventory) { setInventory(data.inventory); saveLocalData('malouk_inventory', data.inventory); }
            if (data.employees) { setEmployees(data.employees); saveLocalData('malouk_employees', data.employees); }
            if (data.suppliers) { setSuppliers(data.suppliers); saveLocalData('malouk_suppliers', data.suppliers); }
            if (data.payments) { setPayments(data.payments); saveLocalData('malouk_payments', data.payments); }
            if (data.invoices) { setInvoices(data.invoices); saveLocalData('malouk_invoices', data.invoices); }
            if (data.events) { setEvents(data.events); saveLocalData('malouk_events', data.events); }
          } else {
            // New user on cloud: seed firestore with local storage content
            await setDoc(docRef, {
              customers: getLocalData('malouk_customers', []),
              projects: getLocalData('malouk_projects', []),
              inventory: getLocalData('malouk_inventory', []),
              employees: getLocalData('malouk_employees', []),
              suppliers: getLocalData('malouk_suppliers', []),
              payments: getLocalData('malouk_payments', []),
              invoices: getLocalData('malouk_invoices', []),
              events: getLocalData('malouk_events', []),
              createdAt: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error("Error loading user cloud database:", err);
        } finally {
          setIsSyncing(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Debounced auto-sync of states to Firestore
  useEffect(() => {
    if (user && isOnline) {
      const delayDebounce = setTimeout(async () => {
        setIsSyncing(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            customers,
            projects,
            inventory,
            employees,
            suppliers,
            payments,
            invoices,
            events,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          setIsSyncing(false);
          setSyncError('');
        } catch (err: any) {
          console.error("Firestore sync failed:", err);
          setSyncError(err.message || "Failed to sync with cloud");
          setIsSyncing(false);
        }
      }, 1500); // 1.5 seconds debounce
      return () => clearTimeout(delayDebounce);
    }
  }, [customers, projects, inventory, employees, suppliers, payments, invoices, events, user, isOnline]);

  // Sync states back to local storage on changes
  const handleAddCustomer = (newCust: Customer) => {
    const updated = [newCust, ...customers];
    setCustomers(updated);
    saveLocalData('malouk_customers', updated);
  };

  const handleAddProject = (newProj: Project) => {
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveLocalData('malouk_projects', updated);

    // Also deduct initial expenses from inventory (simulate production start)
    const updatedInv = inventory.map(item => {
      if (item.category === 'wood' && item.stock > 1.5) {
        return { ...item, stock: Number((item.stock - 0.2).toFixed(2)) };
      }
      return item;
    });
    setInventory(updatedInv);
    saveLocalData('malouk_inventory', updatedInv);
  };

  const handleUpdateProjectStatus = (projId: string, status: any) => {
    const updated = projects.map(p => {
      if (p.id === projId) {
        return { ...p, status };
      }
      return p;
    });
    setProjects(updated);
    saveLocalData('malouk_projects', updated);
  };

  const handleUpdateProject = (updatedProj: Project) => {
    const updated = projects.map(p => p.id === updatedProj.id ? updatedProj : p);
    setProjects(updated);
    saveLocalData('malouk_projects', updated);
  };

  const handleAddStock = (itemId: string, qty: number) => {
    const updated = inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, stock: item.stock + qty };
      }
      return item;
    });
    setInventory(updated);
    saveLocalData('malouk_inventory', updated);
  };

  const handleAddNewItem = (newItem: InventoryItem) => {
    const updated = [newItem, ...inventory];
    setInventory(updated);
    saveLocalData('malouk_inventory', updated);
  };

  const handleAddEmployee = (newEmp: Employee) => {
    const updated = [newEmp, ...employees];
    setEmployees(updated);
    saveLocalData('malouk_employees', updated);
  };

  const handleUpdateAttendance = (empId: string, date: string, status: 'present' | 'absent' | 'late') => {
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          attendance: { ...emp.attendance, [date]: status }
        };
      }
      return emp;
    });
    setEmployees(updated);
    saveLocalData('malouk_employees', updated);
  };

  const handleAddSupplier = (newSup: Supplier) => {
    const updated = [newSup, ...suppliers];
    setSuppliers(updated);
    saveLocalData('malouk_suppliers', updated);
  };

  const handleAddPayment = (newPay: Payment) => {
    const updated = [newPay, ...payments];
    setPayments(updated);
    saveLocalData('malouk_payments', updated);

    // Adjust outstanding balance for the corresponding customer
    const updatedCust = customers.map(c => {
      if (c.id === newPay.customerId) {
        const out = Math.max(0, c.outstandingBalance - newPay.amount);
        return {
          ...c,
          outstandingBalance: out,
          totalPaid: c.totalPaid + newPay.amount
        };
      }
      return c;
    });
    setCustomers(updatedCust);
    saveLocalData('malouk_customers', updatedCust);
  };

  const handleAddInvoice = (newInv: Invoice) => {
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    saveLocalData('malouk_invoices', updated);

    // If invoice is unpaid, add to outstanding balances
    if (newInv.status === 'unpaid' || newInv.type === 'invoice') {
      const updatedCust = customers.map(c => {
        if (c.id === newInv.customerId) {
          return {
            ...c,
            outstandingBalance: c.outstandingBalance + newInv.total
          };
        }
        return c;
      });
      setCustomers(updatedCust);
      saveLocalData('malouk_customers', updatedCust);
    }
  };

  const handleAddEvent = (newEvent: CalendarEvent) => {
    const updated = [newEvent, ...events];
    setEvents(updated);
    saveLocalData('malouk_events', updated);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('malouk_language', lang);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('malouk_theme', newTheme);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsUnlocked(false);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const handleBackup = () => {
    const backupData = {
      customers,
      projects,
      inventory,
      employees,
      suppliers,
      payments,
      invoices,
      events,
      timestamp: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `malk_carpenter_pro_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestore = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.customers) { setCustomers(data.customers); saveLocalData('malouk_customers', data.customers); }
      if (data.projects) { setProjects(data.projects); saveLocalData('malouk_projects', data.projects); }
      if (data.inventory) { setInventory(data.inventory); saveLocalData('malouk_inventory', data.inventory); }
      if (data.employees) { setEmployees(data.employees); saveLocalData('malouk_employees', data.employees); }
      if (data.suppliers) { setSuppliers(data.suppliers); saveLocalData('malouk_suppliers', data.suppliers); }
      if (data.payments) { setPayments(data.payments); saveLocalData('malouk_payments', data.payments); }
      if (data.invoices) { setInvoices(data.invoices); saveLocalData('malouk_invoices', data.invoices); }
      if (data.events) { setEvents(data.events); saveLocalData('malouk_events', data.events); }
    } catch (e) {
      console.error("Restore failed:", e);
    }
  };

  const t = translations[language];

  // Locked gate simulation for security
  if (!isUnlocked) {
    return <SecurityLock language={language} onUnlocked={() => setIsUnlocked(true)} />;
  }

  const navItems = [
    { key: 'dashboard', label: t.dashboard, icon: LayoutGrid },
    { key: 'customers', label: t.customers, icon: Users },
    { key: 'projects', label: t.projects, icon: Hammer },
    { key: 'inventory', label: t.inventory, icon: Package },
    { key: 'employees', label: t.employees, icon: Wrench },
    { key: 'suppliers', label: t.suppliers, icon: PackageOpen },
    { key: 'calendar', label: t.calendar, icon: CalendarIcon },
    { key: 'payments', label: t.payments, icon: DollarSign },
    { key: 'invoices', label: t.invoices, icon: FileText },
    { key: 'reports', label: t.reports, icon: TrendingUp },
    { key: 'calculators', label: t.calculators, icon: Calculator },
    { key: 'scanner', label: t.scanner, icon: Camera },
    { key: 'assistant', label: t.assistant, icon: Sparkles },
    { key: 'settings', label: t.settings, icon: SettingsIcon }
  ];

  const bottomNavItems = [
    { key: 'dashboard', label: language === 'ar' ? 'الرئيسية' : language === 'fr' ? 'Accueil' : 'Home', icon: LayoutGrid },
    { key: 'projects', label: language === 'ar' ? 'المشاريع' : language === 'fr' ? 'Projets' : 'Projects', icon: Hammer },
    { key: 'customers', label: language === 'ar' ? 'الزبائن' : language === 'fr' ? 'Clients' : 'Customers', icon: Users },
    { key: 'assistant', label: language === 'ar' ? 'مساعد الذكاء' : language === 'fr' ? 'Malik AI' : 'AI Assistant', icon: Sparkles },
    { key: 'more', label: language === 'ar' ? 'المزيد' : language === 'fr' ? 'Plus' : 'More', icon: Menu }
  ];

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'} 
      className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-900'}`}
    >
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-neutral-900/95 border-b border-neutral-800/80 backdrop-blur-md px-4 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 lg:hidden"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-neutral-950 font-black tracking-wider text-base">
              M
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-wider font-sans uppercase">
                {t.appName}
              </h1>
              <p className="text-[9px] text-amber-500 font-mono tracking-widest uppercase">{t.tagline}</p>
            </div>
          </div>
        </div>

        {/* Header interactions */}
        <div className="flex items-center gap-3">
          {/* Cloud Sync Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-950/60 border border-neutral-800 text-[10px] font-mono">
            {isSyncing ? (
              <span className="flex items-center gap-1 text-amber-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span className="font-bold">SYNCING...</span>
              </span>
            ) : !isOnline ? (
              <span className="flex items-center gap-1 text-amber-600">
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-bold">OFFLINE</span>
              </span>
            ) : user ? (
              <span className="flex items-center gap-1 text-green-400">
                <Cloud className="w-3.5 h-3.5 text-green-400" />
                <span className="font-bold">CLOUD ACTIVE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-neutral-500">
                <CloudOff className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-bold">LOCAL-ONLY</span>
              </span>
            )}
          </div>

          {/* Quick Language Toggle */}
          <button
            onClick={() => handleLanguageChange(language === 'en' ? 'fr' : language === 'fr' ? 'ar' : 'en')}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-800/60 text-amber-500 transition-all text-xs font-mono font-bold border border-neutral-800 flex items-center gap-1 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase">{language}</span>
          </button>

          {/* Logout/Lock button */}
          <button
            onClick={() => setIsUnlocked(false)}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all text-xs border border-red-500/20 cursor-pointer"
            title="Lock terminal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-neutral-900 border-r border-neutral-800/80 min-h-[calc(100vh-65px)] p-4 space-y-1.5 flex-shrink-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/10'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-neutral-950' : 'text-amber-500/70'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-neutral-950" />}
              </button>
            );
          })}
        </aside>

        {/* Mobile Sidebar overlay Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <div 
              className="w-64 max-w-[80vw] bg-neutral-900 h-full p-4 space-y-1.5 flex flex-col justify-between"
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-wider">Workshop Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => {
                        setActiveTab(item.key);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-500/80" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-12 max-w-7xl mx-auto overflow-hidden">
          
          {/* Active component renderer */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              language={language} 
              customers={customers} 
              projects={projects} 
              inventory={inventory} 
              onNavigate={(tab) => setActiveTab(tab)} 
            />
          )}

          {activeTab === 'customers' && (
            <Customers 
              language={language} 
              customers={customers} 
              onAddCustomer={handleAddCustomer} 
            />
          )}

          {activeTab === 'projects' && (
            <Projects 
              language={language} 
              projects={projects} 
              customers={customers} 
              employees={employees} 
              onAddProject={handleAddProject} 
              onUpdateStatus={handleUpdateProjectStatus} 
              onUpdateProject={handleUpdateProject}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory 
              language={language} 
              inventory={inventory} 
              suppliers={suppliers} 
              onAddStock={handleAddStock} 
              onAddNewItem={handleAddNewItem} 
            />
          )}

          {activeTab === 'employees' && (
            <Employees 
              language={language} 
              employees={employees} 
              onAddEmployee={handleAddEmployee} 
              onUpdateAttendance={handleUpdateAttendance} 
            />
          )}

          {activeTab === 'suppliers' && (
            <Suppliers 
              language={language} 
              suppliers={suppliers} 
              onAddSupplier={handleAddSupplier} 
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              language={language} 
              events={events} 
              onAddEvent={handleAddEvent} 
            />
          )}

          {activeTab === 'payments' && (
            <Payments 
              language={language} 
              payments={payments} 
              customers={customers} 
              onAddPayment={handleAddPayment} 
            />
          )}

          {activeTab === 'invoices' && (
            <Invoices 
              language={language} 
              invoices={invoices} 
              customers={customers} 
              onAddInvoice={handleAddInvoice} 
            />
          )}

          {activeTab === 'reports' && (
            <Reports 
              language={language} 
              customers={customers} 
              projects={projects} 
            />
          )}

          {activeTab === 'calculators' && (
            <Calculators 
              language={language} 
            />
          )}

          {activeTab === 'scanner' && (
            <RoomScanner 
              language={language} 
            />
          )}

          {activeTab === 'assistant' && (
            <Assistant 
              language={language} 
            />
          )}

          {activeTab === 'settings' && (
            <Settings 
              language={language} 
              theme={theme} 
              onLanguageChange={handleLanguageChange} 
              onThemeChange={handleThemeChange} 
              user={user}
              onSignOut={handleSignOut}
              onBackup={handleBackup}
              onRestore={handleRestore}
            />
          )}

        </main>
      </div>

      {/* Professional Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/95 border-t border-neutral-800/80 backdrop-blur-md py-2 px-3 flex justify-around items-center lg:hidden">
        {bottomNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === 'more') {
                  setIsMobileMenuOpen(true);
                } else {
                  setActiveTab(item.key);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-90 duration-150 cursor-pointer ${
                isActive
                  ? 'text-amber-500 font-extrabold scale-105'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500 animate-pulse' : 'text-neutral-400'}`} />
              <span className="text-[9px] font-sans tracking-tight leading-none mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
