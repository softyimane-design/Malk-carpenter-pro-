import React, { useState } from 'react';
import { DollarSign, Plus, ArrowUpRight, Search, FileText, CheckCircle, Clock } from 'lucide-react';
import { Payment, Customer, Language } from '../types';
import { translations, formatCurrency, getActiveCurrency } from '../utils';

interface PaymentsProps {
  language: Language;
  payments: Payment[];
  customers: Customer[];
  onAddPayment: (p: Payment) => void;
}

export default function Payments({ language, payments, customers, onAddPayment }: PaymentsProps) {
  const t = translations[language];
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState(1000);
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'check' | 'installments'>('cash');
  const [reference, setReference] = useState('');

  const filteredPayments = payments.filter(p => {
    const cust = customers.find(c => c.id === p.customerId);
    if (!cust) return false;
    return cust.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.notes?.includes(searchQuery);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || amount <= 0) return;

    // Map input method to Payment's allowed methods
    const paymentMethod: 'cash' | 'transfer' | 'installments' | 'partial' = 
      method === 'bank_transfer' || method === 'check' ? 'transfer' : 'installments';

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      projectId: 'proj-1', // Link default project
      customerId,
      amount,
      method: paymentMethod,
      date: new Date().toISOString().split('T')[0],
      notes: reference || 'CASH-DEP'
    };

    onAddPayment(newPayment);
    setShowAddModal(false);

    // reset
    setCustomerId('');
    setAmount(1000);
    setMethod('cash');
    setReference('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t.payments}</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Installment records, Bank wires & Cash receipts ledger</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Record payment deposit</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4.5 h-4.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by client name or bank wire reference..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 text-sm text-white placeholder-neutral-500 pl-10 pr-4 py-2.5 rounded-xl focus:border-amber-500/50 transition-all"
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-950 border-b border-neutral-800/80 text-neutral-400 font-mono text-[10px] uppercase tracking-widest">
                <th className="p-4">Customer Client</th>
                <th className="p-4">Execution Date</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Reference ID</th>
                <th className="p-4 text-right">Sum Deposited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500 italic">No payments logged in the database.</td>
                </tr>
              ) : (
                filteredPayments.map(p => {
                  const cust = customers.find(c => c.id === p.customerId);
                  return (
                    <tr key={p.id} className="hover:bg-neutral-800/20 transition-all">
                      <td className="p-4 font-bold text-white">{cust ? cust.name : 'Unknown customer'}</td>
                      <td className="p-4 font-mono text-neutral-400">{p.date}</td>
                      <td className="p-4 uppercase font-mono">{p.method.replace('_', ' ')}</td>
                      <td className="p-4 font-mono text-neutral-500 text-[11px]">{p.notes || 'CASH-DEP'}</td>
                      <td className="p-4 text-right font-mono font-bold text-green-400 text-sm">
                        +{formatCurrency(p.amount, language)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <span>Log Client Payment installment</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Client name *</label>
                <select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Outstanding: {formatCurrency(c.outstandingBalance, language)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">
                    Payment Sum ({getActiveCurrency() === 'DZD' ? (language === 'ar' ? 'د.ج' : 'DA') : '$'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Payment Method</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono cursor-pointer"
                  >
                    <option value="cash">Cash / Espèces</option>
                    <option value="bank_transfer">Bank Transfer / Virement</option>
                    <option value="check">Check / Chèque</option>
                    <option value="installments">Installments / Traites</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Reference ID (Bank wire receipt or checks details)</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. wire-839210"
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white font-mono"
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
                  Record deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
