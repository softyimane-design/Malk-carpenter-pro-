import React, { useState } from 'react';
import { Users, Check, Clock, X, Award, Star, DollarSign, Briefcase, Plus, UserPlus } from 'lucide-react';
import { Employee, Language } from '../types';
import { translations, formatCurrency } from '../utils';

interface EmployeesProps {
  language: Language;
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onUpdateAttendance: (empId: string, date: string, status: 'present' | 'absent' | 'late') => void;
}

export default function Employees({ language, employees, onAddEmployee, onUpdateAttendance }: EmployeesProps) {
  const t = translations[language];
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState(6000);
  const [workingHours, setWorkingHours] = useState(160);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      name,
      role,
      phone,
      salary,
      workingHours,
      attendance: {},
      tasks: [],
      performance: 5
    };

    onAddEmployee(newEmp);
    setShowAddModal(false);

    // reset
    setName('');
    setRole('');
    setPhone('');
    setSalary(6000);
    setWorkingHours(160);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t.employees}</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Artisan Joiners, Apprentices & Master Carpenters Ledger</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>{t.addEmployee}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Employees list */}
        <div className="lg:col-span-2 space-y-3 max-h-[550px] overflow-y-auto pr-1">
          {employees.map(emp => {
            const todayStatus = emp.attendance[todayStr];
            return (
              <div
                key={emp.id}
                onClick={() => setSelectedEmp(emp)}
                className={`p-4 rounded-xl border transition-all cursor-pointer bg-neutral-900 flex justify-between items-center ${
                  selectedEmp?.id === emp.id ? 'border-amber-500/40 bg-amber-500/5' : 'border-neutral-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 font-bold border border-amber-500/20">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{emp.name}</h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{emp.role} • {emp.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Attendance Controls */}
                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateAttendance(emp.id, todayStr, 'present');
                      }}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        todayStatus === 'present' ? 'bg-green-500 text-neutral-950' : 'text-neutral-500 hover:text-white'
                      }`}
                      title="Present"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateAttendance(emp.id, todayStr, 'late');
                      }}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        todayStatus === 'late' ? 'bg-yellow-500 text-neutral-950' : 'text-neutral-500 hover:text-white'
                      }`}
                      title="Late"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateAttendance(emp.id, todayStr, 'absent');
                      }}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        todayStatus === 'absent' ? 'bg-red-500 text-white' : 'text-neutral-500 hover:text-white'
                      }`}
                      title="Absent"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Employee profile details */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-5 h-fit text-xs">
          {selectedEmp ? (
            <>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-500/15 rounded-full flex items-center justify-center text-amber-500 text-xl font-bold border-2 border-amber-500/30">
                  {selectedEmp.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-base font-bold text-white mt-3">{selectedEmp.name}</h3>
                <p className="text-xs text-amber-500 font-mono mt-0.5">{selectedEmp.role}</p>
              </div>

              <div className="border-t border-neutral-800/60 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-neutral-500" /> Salary
                  </span>
                  <span className="font-mono text-white font-bold">{formatCurrency(selectedEmp.salary, language)} / {language === 'ar' ? 'شهر' : 'mo'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-neutral-500" /> Est. Working Hours
                  </span>
                  <span className="font-mono text-white font-bold">{selectedEmp.workingHours} hrs</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 flex items-center gap-1">
                    <Star className="w-4 h-4 text-neutral-500" /> Performance Reviews
                  </span>
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4.5 h-4.5 ${i < selectedEmp.performance ? 'fill-amber-500' : 'text-neutral-700'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Assigned craft tasks */}
                <div className="space-y-2 bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <span className="text-neutral-400 block font-mono">Assigned Tasks ({selectedEmp.tasks.length}):</span>
                  {selectedEmp.tasks.length === 0 ? (
                    <p className="text-[11px] text-neutral-500 italic">No tasks currently assigned.</p>
                  ) : (
                    <ul className="space-y-1.5 list-disc pl-4 text-neutral-300">
                      {selectedEmp.tasks.map((task, i) => (
                        <li key={i} className="text-[11px] leading-relaxed">{task}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-14">
              <Users className="w-8 h-8 text-neutral-600 mx-auto mb-2.5 animate-pulse" />
              <p className="text-xs text-neutral-400">Select any staff profile to record attendance logs, verify salary cards, or audit task outputs.</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <UserPlus className="w-5 h-5 text-amber-500" />
              <span>Hire New Artisan Staff</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachid El-Alami"
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Craft / Technical Role *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Master Carver, Apprentice Painter, Designer"
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6..."
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Salary ($/mo)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Target Hours / mo</label>
                  <input
                    type="number"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white font-mono"
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
                  Confirm employment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
