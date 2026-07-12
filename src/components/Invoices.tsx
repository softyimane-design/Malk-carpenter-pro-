import React, { useState, useRef, useEffect } from 'react';
import { FileText, Plus, Trash2, Printer, Share2, MessageSquare, Check, Eye, Palette } from 'lucide-react';
import { Invoice, Customer, Language } from '../types';
import { translations, formatCurrency } from '../utils';

interface InvoicesProps {
  language: Language;
  invoices: Invoice[];
  customers: Customer[];
  onAddInvoice: (inv: Invoice) => void;
}

interface InvoiceLine {
  description: string;
  quantity: number;
  rate: number;
}

export default function Invoices({ language, invoices, customers, onAddInvoice }: InvoicesProps) {
  const t = translations[language];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [type, setType] = useState<'invoice' | 'quotation' | 'receipt'>('invoice');
  const [lines, setLines] = useState<InvoiceLine[]>([{ description: 'Solid Walnut Table top', quantity: 1, rate: 1200 }]);
  const [taxRate, setTaxRate] = useState(20); // standard VAT

  // Canvas ref for client signatures
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Custom Line adding
  const handleAddLine = () => {
    setLines([...lines, { description: '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: keyof InvoiceLine, val: any) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: val };
    setLines(updated);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#d97706'; // Golden Brown color
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = 0;
    let y = 0;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;

    // Calculations
    const subtotal = lines.reduce((sum, line) => sum + (line.quantity * line.rate), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    // Get Signature data URL if signed
    let signatureUrl = '';
    if (canvasRef.current && hasSigned) {
      signatureUrl = canvasRef.current.toDataURL();
    }

    const newInvoice: Invoice = {
      id: `${type === 'invoice' ? 'INV' : type === 'quotation' ? 'QT' : 'REC'}-${Date.now()}`,
      number: `${type === 'invoice' ? 'INV' : type === 'quotation' ? 'QT' : 'REC'}-${Date.now()}`,
      type,
      projectId: 'proj-1',
      customerId,
      items: lines.map(l => ({ description: l.description, quantity: l.quantity, price: l.rate, total: l.quantity * l.rate })),
      subtotal,
      tax: taxRate,
      total,
      status: type === 'quotation' ? 'draft' : 'unpaid',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      signature: signatureUrl || undefined,
      createdAt: new Date().toISOString()
    };

    onAddInvoice(newInvoice);
    setShowCreateModal(false);

    // reset
    setLines([{ description: 'Solid Walnut Table top', quantity: 1, rate: 1200 }]);
    setCustomerId('');
    setTaxRate(20);
    setHasSigned(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const filteredInvoices = invoices
    .filter(inv => {
      const cust = customers.find(c => c.id === inv.customerId);
      const nameMatch = cust?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
      const idMatch = inv.id.toLowerCase().includes(searchQuery.toLowerCase());
      const statusMatch = statusFilter === 'all' || inv.status === statusFilter;
      return (nameMatch || idMatch) && statusMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.total - a.total;
      if (sortBy === 'amount-asc') return a.total - b.total;
      return 0;
    });

  // Procedural SVG QR Code Generator based on invoice data
  const renderQrCodeSvg = (text: string) => {
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
      <svg viewBox={`0 0 ${size} ${size}`} className="w-20 h-20 bg-white p-1 rounded-xl border border-neutral-300 shadow-sm">
        {cells.map((row, r) => 
          row.map((cell, c) => (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill={cell ? "#2E1E12" : "#FFFFFF"}
            />
          ))
        )}
      </svg>
    );
  };

  const handlePrintInvoice = () => {
    if (!selectedInvoice) return;
    const cust = customers.find(c => c.id === selectedInvoice.customerId);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const direction = language === 'ar' ? 'rtl' : 'ltr';
    const textAlignment = language === 'ar' ? 'right' : 'left';
    
    const invoiceTypeLabel = selectedInvoice.type === 'invoice' 
      ? (language === 'ar' ? 'فاتورة حساب' : 'Facture / Invoice')
      : selectedInvoice.type === 'quotation'
        ? (language === 'ar' ? 'عرض سعر / كوتاسيون' : 'Devis / Quotation')
        : (language === 'ar' ? 'وصل استلام' : 'Reçu / Receipt');

    const dateLabel = language === 'ar' ? 'تاريخ الإصدار' : 'Date Issued';
    const dueDateLabel = language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date';
    const clientLabel = language === 'ar' ? 'معلومات الزبون' : 'Client Profile';
    const workshopLabel = language === 'ar' ? 'ورشة المعلم مالك للنجارة الفنية والحديثة' : 'MAÂLEM MALIK ARTISAN CARPENTRY WORKSHOP';
    const descLabel = language === 'ar' ? 'البيان والخدمات' : 'Material & Service Description';
    const qtyLabel = language === 'ar' ? 'الكمية' : 'Qty';
    const rateLabel = language === 'ar' ? 'سعر الوحدة' : 'Unit Rate';
    const totalLabel = language === 'ar' ? 'المجموع' : 'Total sum';
    const subtotalLabel = language === 'ar' ? 'المجموع الفرعي' : 'Subtotal';
    const vatLabel = language === 'ar' ? 'ضريبة القيمة المضافة (TVA)' : 'VAT Tax rate';
    const totalDueLabel = language === 'ar' ? 'المبلغ الإجمالي المستحق' : 'Total Balance Due';
    const signatureLabel = language === 'ar' ? 'توقيع وموافقة الزبون' : 'Client Authorization Signature';
    const stampLabel = language === 'ar' ? 'ختم الورشة والاعتماد' : 'Workshop Stamp & Verification';

    const itemsHtml = selectedInvoice.items.map(it => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: ${textAlignment}; font-weight: bold;">${it.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(it.price, language)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatCurrency(it.quantity * it.price, language)}</td>
      </tr>
    `).join('');

    const signatureHtml = selectedInvoice.signature ? `
      <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #ddd; padding-top: 15px;">
        <div>
          <span style="font-size: 11px; color: #666; font-weight: bold; display: block; text-transform: uppercase;">${signatureLabel}</span>
          <p style="font-size: 10px; color: #888; margin: 3px 0 0 0;">Approved electronically via screen signaturepad</p>
        </div>
        <img src="${selectedInvoice.signature}" style="height: 50px; width: 150px; object-fit: contain; border: 1px solid #eee; padding: 4px; border-radius: 4px; background: #fff;" />
      </div>
    ` : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>${invoiceTypeLabel} - ${selectedInvoice.id}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #111; margin: 40px; direction: ${direction}; font-size: 12px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #d97706; padding-bottom: 20px; margin-bottom: 25px; }
            .brand { text-align: ${textAlignment}; }
            .brand-name { font-size: 18px; font-weight: bold; color: #d97706; margin: 0; }
            .brand-sub { font-size: 10px; color: #666; margin: 3px 0 0 0; }
            .meta-title { text-align: ${language === 'ar' ? 'left' : 'right'}; }
            .type-label { font-size: 16px; font-weight: bold; color: #d97706; text-transform: uppercase; margin: 0; }
            .id-label { font-size: 11px; color: #666; margin: 3px 0 0 0; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .client-card { background: #fafafa; padding: 12px; border-radius: 8px; border: 1px solid #eee; }
            .table-container { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            .table-container th { background: #f5f5f5; padding: 10px; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #ddd; color: #555; }
            .totals { width: 250px; margin-left: ${language === 'ar' ? '0' : 'auto'}; margin-right: ${language === 'ar' ? 'auto' : '0'}; text-align: right; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .totals-grand { font-size: 14px; font-weight: bold; color: #d97706; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 5px; }
            .footer-note { text-align: center; color: #888; font-size: 10px; margin-top: 50px; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <div class="brand">
              <p class="brand-name">${workshopLabel}</p>
              <p class="brand-sub">الجزائر - ورشة احترافية للنجارة وصناعة المطابخ العصرية • Guild Licensed</p>
            </div>
            <div class="meta-title">
              <p class="type-label">${invoiceTypeLabel}</p>
              <p class="id-label">${selectedInvoice.id}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="client-card">
              <strong style="display: block; font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">${clientLabel}</strong>
              <span style="font-size: 13px; font-weight: bold;">${cust ? cust.name : 'Unknown Client'}</span><br/>
              <span style="color: #555;">${cust ? cust.phone : ''}</span><br/>
              <span style="color: #666; font-size: 11px;">${cust ? cust.address : ''}</span>
            </div>
            <div style="text-align: ${language === 'ar' ? 'left' : 'right'};">
              <strong style="display: block; font-size: 10px; color: #666; margin-bottom: 5px; text-transform: uppercase;">METRICS & DATES:</strong>
              <span><strong>${dateLabel}:</strong> ${selectedInvoice.date}</span><br/>
              <span><strong>${dueDateLabel}:</strong> ${selectedInvoice.dueDate}</span><br/>
              <span><strong>Status:</strong> <span style="color: ${selectedInvoice.status === 'paid' ? 'green' : 'red'}; font-weight: bold;">${selectedInvoice.status.toUpperCase()}</span></span>
            </div>
          </div>

          <table class="table-container">
            <thead>
              <tr>
                <th style="text-align: ${textAlignment};">${descLabel}</th>
                <th style="text-align: center; width: 60px;">${qtyLabel}</th>
                <th style="text-align: right; width: 100px;">${rateLabel}</th>
                <th style="text-align: right; width: 120px;">${totalLabel}</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="width: 200px; text-align: center; border: 1px dashed #ccc; padding: 15px; border-radius: 6px; font-size: 10px; color: #777;">
              <strong>${stampLabel}</strong>
              <div style="height: 40px;"></div>
              <span>Maâlem Malik Carpentry Workshop</span>
            </div>
            
            <div class="totals">
              <div class="totals-row">
                <span>${subtotalLabel}:</span>
                <span>${formatCurrency(selectedInvoice.subtotal, language)}</span>
              </div>
              <div class="totals-row">
                <span>${vatLabel} (${selectedInvoice.tax}%):</span>
                <span>${formatCurrency(selectedInvoice.subtotal * selectedInvoice.tax / 100, language)}</span>
              </div>
              <div class="totals-row totals-grand">
                <span>${totalDueLabel}:</span>
                <span>${formatCurrency(selectedInvoice.total, language)}</span>
              </div>
            </div>
          </div>

          ${signatureHtml}

          <div class="footer-note">
            شكراً لتعاملكم مع ورشة المعلم مالك. ثقتكم هي غايتنا وصناعتنا الفنية تصنع الفارق.<br/>
            Thank you for choosing Maâlem Malik. Your satisfaction is our benchmark of craft excellence.
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
          <h2 className="text-xl font-bold text-white tracking-wide">{t.invoices}</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono font-sans">Professional Wood Craft Quotations & Invoicing</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>New Quote / Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invoice selection list with integrated premium Search & Filters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl space-y-3 shadow-md">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={language === 'ar' ? 'بحث في الفواتير...' : language === 'fr' ? 'Rechercher facture...' : 'Search invoices...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 p-2.5 pl-8 rounded-xl text-xs text-white"
              />
              <span className="absolute left-2.5 top-3.5 text-neutral-500">🔍</span>
            </div>

            {/* Filter & Sort controls */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label className="text-neutral-500 block mb-1 font-mono uppercase">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg text-white"
                >
                  <option value="all">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-500 block mb-1 font-mono uppercase">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg text-white"
                >
                  <option value="date-desc">Newest date</option>
                  <option value="date-asc">Oldest date</option>
                  <option value="amount-desc">Highest total</option>
                  <option value="amount-asc">Lowest total</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 text-xs">
                No matching invoices found
              </div>
            ) : (
              filteredInvoices.map(inv => {
                const cust = customers.find(c => c.id === inv.customerId);
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer bg-neutral-900 ${
                      selectedInvoice?.id === inv.id ? 'border-amber-500/40 bg-amber-500/5' : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-bold text-white uppercase tracking-wider">{inv.id}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                        inv.status === 'paid' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-neutral-300">{cust ? cust.name : 'Unknown'}</h3>
                    <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-neutral-500">
                      <span>Subtotal: {formatCurrency(inv.subtotal, language)}</span>
                      <span className="text-white font-bold">{formatCurrency(inv.total, language)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Invoice layout detail panel */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden text-xs">
          {selectedInvoice ? (
            <>
              {/* Invoice Brand header */}
              <div className="flex justify-between items-start border-b border-neutral-800 pb-5">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wider">MAÂLEM MALIK CARPENTER</h3>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Algiers, Algeria • Guild Licensed</p>
                </div>
                <div className="text-right">
                  <span className="text-amber-500 font-mono font-bold block uppercase text-sm">{selectedInvoice.type}</span>
                  <span className="text-[11px] text-neutral-500 font-mono block mt-1">{selectedInvoice.id}</span>
                </div>
              </div>

              {/* Bill to metadata */}
              <div className="grid grid-cols-2 gap-4 text-[11px] font-mono">
                <div>
                  <span className="text-neutral-500 block uppercase text-[9px] tracking-wider mb-1">CLIENT PROFILE:</span>
                  <span className="text-white font-bold block">
                    {customers.find(c => c.id === selectedInvoice.customerId)?.name || 'Unknown'}
                  </span>
                  <span className="text-neutral-400 block mt-0.5">
                    {customers.find(c => c.id === selectedInvoice.customerId)?.address || ''}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-neutral-500 block uppercase text-[9px] tracking-wider mb-1">METRICS:</span>
                  <span className="text-neutral-400 block">Date Issued: {selectedInvoice.date}</span>
                  <span className="text-neutral-400 block">Payment Due: {selectedInvoice.dueDate}</span>
                </div>
              </div>

              {/* Items details table */}
              <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-neutral-900 text-neutral-400 text-[10px] uppercase font-mono border-b border-neutral-800/60">
                      <th className="p-3">Material / Service desc</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Rate</th>
                      <th className="p-3 text-right">Total sum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300 font-mono">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-white font-sans font-bold">{it.description}</td>
                        <td className="p-3 text-center">{it.quantity}</td>
                        <td className="p-3 text-right">{formatCurrency(it.price, language)}</td>
                        <td className="p-3 text-right font-bold text-white">{formatCurrency(it.quantity * it.price, language)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sum totals */}
              <div className="w-72 ml-auto text-right space-y-2 font-mono border-t border-neutral-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal:</span>
                  <span className="text-neutral-300">{formatCurrency(selectedInvoice.subtotal, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">VAT Tax rate ({selectedInvoice.tax}%):</span>
                  <span className="text-neutral-300">{formatCurrency(selectedInvoice.subtotal * selectedInvoice.tax / 100, language)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm border-t border-neutral-800/60 pt-2">
                  <span>Balance Due:</span>
                  <span className="text-amber-500">{formatCurrency(selectedInvoice.total, language)}</span>
                </div>
              </div>

              {/* Dynamic QR Code & Signature Section */}
              <div className="border-t border-neutral-850 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-3 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  {renderQrCodeSvg(`${selectedInvoice.id} | Amount: ${selectedInvoice.total} | Issued: ${selectedInvoice.date}`)}
                  <div>
                    <span className="text-white font-bold font-sans text-xs block">{language === 'ar' ? 'رمز التحقق الرقمي QR' : 'Official Invoice QR'}</span>
                    <p className="text-[10px] text-neutral-400 mt-1">Scan to verify billing legitimacy & Algiers Wood Guild registration.</p>
                  </div>
                </div>

                {selectedInvoice.signature && (
                  <div className="flex flex-col items-end">
                    <span className="text-neutral-500 uppercase text-[9px] tracking-wider mb-1">CLIENT AUTHORIZATION SIGNATURE:</span>
                    <img
                      src={selectedInvoice.signature}
                      alt="Customer signature"
                      className="h-14 w-40 bg-neutral-950 p-1.5 rounded-lg border border-neutral-800 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Share layout */}
              <div className="flex justify-end gap-3.5 border-t border-neutral-800/60 pt-4 text-xs font-mono">
                <button
                  onClick={handlePrintInvoice}
                  className="bg-neutral-800 text-white font-bold py-2 px-3 rounded-xl hover:bg-neutral-700 transition-all cursor-pointer border border-neutral-700 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-amber-500" />
                  <span>Print PDF</span>
                </button>
                <button
                  onClick={() => alert("Shareable quote link successfully copied to device clipboard.")}
                  className="bg-neutral-800 text-white font-bold py-2 px-3 rounded-xl hover:bg-neutral-700 transition-all cursor-pointer border border-neutral-700 flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Copy Link</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <FileText className="w-10 h-10 text-neutral-600 mx-auto mb-3 animate-pulse" />
              <p className="text-neutral-400">Select any billing document to review itemizations, tax rates, and export customized WhatsApp quotations.</p>
            </div>
          )}
        </div>

      </div>

      {/* Create Quote/Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <FileText className="w-5 h-5 text-amber-500" />
              <span>Generate Wood Craft Quote / Invoice</span>
            </h3>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Document Class *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono"
                  >
                    <option value="invoice">Invoice / Facture</option>
                    <option value="quotation">Quotation / Devis</option>
                    <option value="receipt">Receipt / Reçu</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Tax VAT Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Target Customer *</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Invoice Lines */}
              <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <span className="text-neutral-300 font-mono font-bold">Billing Lines / Materials</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-amber-500 hover:underline font-mono text-[10px]"
                  >
                    + Add line item
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Line item description"
                        value={line.description}
                        onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                        className="flex-1 bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white"
                      />
                      <input
                        type="number"
                        required
                        min={1}
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                        className="w-12 bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white font-mono text-center"
                      />
                      <input
                        type="number"
                        required
                        placeholder="Rate"
                        value={line.rate}
                        onChange={(e) => handleLineChange(idx, 'rate', Number(e.target.value))}
                        className="w-20 bg-neutral-900 border border-neutral-800 p-2 rounded-lg text-white font-mono text-right"
                      />
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-red-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature canvas for authorizing invoice */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-neutral-400 font-mono block">Authorize Signature (Draw on pad below)</label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[10px] text-red-400 hover:underline font-mono"
                  >
                    Clear Signature
                  </button>
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={100}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-[100px] cursor-crosshair bg-neutral-950 touch-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800/60">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-neutral-800 hover:bg-neutral-800/60 text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
