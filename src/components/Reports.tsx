import React from 'react';
import { FileSpreadsheet, TrendingUp, DollarSign, Award, ArrowUpRight, Percent } from 'lucide-react';
import { Customer, Project, Language } from '../types';
import { translations, formatCurrency } from '../utils';

interface ReportsProps {
  language: Language;
  customers: Customer[];
  projects: Project[];
}

export default function Reports({ language, customers, projects }: ReportsProps) {
  const t = translations[language];

  // Calculations
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalPaid + c.outstandingBalance, 0);
  const totalExpenses = projects.reduce((sum, p) => sum + p.expenses, 0) + 12000;
  const grossProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  // Sourced top clients
  const topClients = [...customers]
    .sort((a, b) => b.totalPaid - a.totalPaid)
    .slice(0, 3);

  // SVG dimensions
  const width = 500;
  const height = 150;

  // Simulated quarterly performance data
  const quarters = [
    { name: 'Q1 2026', rev: 140000, exp: 45000 },
    { name: 'Q2 2026', rev: 195000, exp: 62000 },
    { name: 'Q3 2026', rev: 230000, exp: 75000 },
    { name: 'Q4 2026', rev: 310000, exp: 98000 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">{t.reports}</h2>
        <p className="text-xs text-neutral-400 mt-1 font-mono">Artisan Joinery Profit Sheets & Annual Tax audits</p>
      </div>

      {/* AI Export & Print Desk */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>📊</span>
              <span>AI Export Desk & Financial Auditor</span>
            </h3>
            <p className="text-[10px] text-neutral-400 font-mono">
              Slice quarterly margins, generate ready-to-print audits, and export active rosters to CSV Excel
            </p>
          </div>

          {/* Action triggers */}
          <div className="flex flex-wrap gap-2 text-xs">
            {/* CSV export helper */}
            <button
              onClick={() => {
                // Generate genuine raw CSV contents based on actual customer logs
                let csvContent = "data:text/csv;charset=utf-8,";
                csvContent += "Customer Name,Email,Phone,Total Paid (USD),Outstanding Debts (USD),Address\n";
                customers.forEach(c => {
                  csvContent += `"${c.name}","${c.email}","${c.phone}",${c.totalPaid},${c.outstandingBalance},"${c.address.replace(/"/g, '""')}"\n`;
                });
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `malik_carpenter_pro_audit_${new Date().toISOString().slice(0, 10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-750 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition-all text-[11px]"
            >
              <span>📥</span>
              <span>Export Excel (CSV)</span>
            </button>

            {/* Print audit report */}
            <button
              onClick={() => {
                window.print();
              }}
              className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-3.5 py-2 rounded-xl font-black flex items-center gap-1.5 cursor-pointer transition-all text-[11px]"
            >
              <span>🖨️</span>
              <span>Print Ledger (PDF)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Filter selector */}
        {(() => {
          const [selectedFilter, setSelectedFilter] = React.useState<'annual' | 'monthly' | 'weekly'>('annual');

          // Slices calculated values on screen
          const scale = selectedFilter === 'monthly' ? 0.08 : selectedFilter === 'weekly' ? 0.02 : 1.0;
          const filterTitle = selectedFilter === 'monthly' ? 'Current Month (Simulated)' : selectedFilter === 'weekly' ? 'Current Week (Simulated)' : 'Annual Master Ledger';

          return (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
                <span className="text-[10px] text-amber-500 font-mono font-bold tracking-wider uppercase">Active range: {filterTitle}</span>
                <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
                  <button
                    onClick={() => setSelectedFilter('annual')}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold font-mono transition-all ${
                      selectedFilter === 'annual' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    YEARLY
                  </button>
                  <button
                    onClick={() => setSelectedFilter('monthly')}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold font-mono transition-all ${
                      selectedFilter === 'monthly' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    MONTHLY
                  </button>
                  <button
                    onClick={() => setSelectedFilter('weekly')}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold font-mono transition-all ${
                      selectedFilter === 'weekly' ? 'bg-amber-500 text-neutral-950 font-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    WEEKLY
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-850">
                  <span className="text-[9px] text-neutral-500 block uppercase font-mono">Segment Revenue</span>
                  <span className="text-sm font-bold text-white font-mono">${Math.round(totalRevenue * scale).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-850">
                  <span className="text-[9px] text-neutral-500 block uppercase font-mono">Segment Overheads</span>
                  <span className="text-sm font-bold text-red-400 font-mono">${Math.round(totalExpenses * scale).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-850">
                  <span className="text-[9px] text-neutral-500 block uppercase font-mono">Segment Net Margins</span>
                  <span className="text-sm font-bold text-green-400 font-mono">${Math.round((totalRevenue - totalExpenses) * scale).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Gross Revenues</p>
          <p className="text-xl font-bold font-mono text-white mt-1.5">{formatCurrency(totalRevenue, language)}</p>
          <div className="absolute top-0 right-0 p-3 bg-amber-500/10 text-amber-500 rounded-bl-xl">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Operating Overheads</p>
          <p className="text-xl font-bold font-mono text-red-400 mt-1.5">{formatCurrency(totalExpenses, language)}</p>
          <div className="absolute top-0 right-0 p-3 bg-red-500/10 text-red-400 rounded-bl-xl">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Net Profit Margins</p>
          <p className="text-xl font-bold font-mono text-green-400 mt-1.5">{profitMargin.toFixed(1)}%</p>
          <div className="absolute top-0 right-0 p-3 bg-green-500/10 text-green-400 rounded-bl-xl">
            <Percent className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue trend left, leaderboard right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Quarterly stats */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white tracking-wider mb-5">Quarterly Telemetry breakdowns</h3>
          
          <div className="w-full h-36">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
              {/* Gridlines */}
              <line x1="20" y1="20" x2={width - 20} y2="20" stroke="#262626" strokeWidth="1" strokeDasharray="3" />
              <line x1="20" y1="65" x2={width - 20} y2="65" stroke="#262626" strokeWidth="1" strokeDasharray="3" />
              <line x1="20" y1="110" x2={width - 20} y2="110" stroke="#404040" strokeWidth="1" />

              {/* Render Bars */}
              {quarters.map((q, idx) => {
                const x = (idx * (width / quarters.length)) + 40;
                
                // Max scale is 350000
                const rHeight = (q.rev / 350000) * 80;
                const eHeight = (q.exp / 350000) * 80;

                return (
                  <g key={idx}>
                    {/* Revenue Bar (Gold) */}
                    <rect
                      x={x}
                      y={110 - rHeight}
                      width="16"
                      height={rHeight}
                      fill="#f59e0b"
                      rx="3"
                    />

                    {/* Expense Bar (Slate grey) */}
                    <rect
                      x={x + 20}
                      y={110 - eHeight}
                      width="16"
                      height={eHeight}
                      fill="#525252"
                      rx="3"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex justify-between px-10 text-[10px] text-neutral-500 font-mono mt-2">
            {quarters.map((q, idx) => (
              <span key={idx}>{q.name}</span>
            ))}
          </div>
        </div>

        {/* Top customers leaderboard */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5 pb-2 border-b border-neutral-800">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Valued Client rankings</span>
          </h3>

          <div className="space-y-3.5">
            {topClients.map((c, idx) => (
              <div key={c.id} className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-500 font-bold">#0{idx + 1}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{c.name}</h4>
                    <span className="text-[10px] text-neutral-500 font-mono">ID: {c.id}</span>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-green-400">+{formatCurrency(c.totalPaid, language)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Profit & loss ledger list */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-500" />
          <span>Workshop Profit & Loss audit sheet</span>
        </h3>

        <div className="divide-y divide-neutral-800 text-xs text-neutral-300">
          <div className="py-2.5 flex justify-between">
            <span className="text-neutral-400">Custom Furniture Gross sales:</span>
            <span className="font-mono font-bold text-white">{formatCurrency(totalRevenue, language)}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-neutral-400">Raw Wood Slabs sourcing expenditures:</span>
            <span className="font-mono text-red-400">-{formatCurrency(totalExpenses * 0.6, language)}</span>
          </div>
          <div className="py-2.5 flex justify-between">
            <span className="text-neutral-400">Technician Salary pay envelopes:</span>
            <span className="font-mono text-red-400">-{formatCurrency(totalExpenses * 0.4, language)}</span>
          </div>
          <div className="py-2.5 flex justify-between border-t border-neutral-800 pt-3 text-sm font-bold">
            <span className="text-neutral-300">Audited Gross margins:</span>
            <span className="font-mono text-green-400">{formatCurrency(grossProfit, language)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
