import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Hammer, MapPin, Tag } from 'lucide-react';
import { CalendarEvent, Language } from '../types';
import { translations } from '../utils';

interface CalendarViewProps {
  language: Language;
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
}

export default function CalendarView({ language, events, onAddEvent }: CalendarViewProps) {
  const t = translations[language];
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 5)); // July 5, 2026 (based on current time)
  const [selectedDay, setSelectedDay] = useState<number | null>(5); // Default to July 5th
  
  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'production' | 'meeting' | 'measurement' | 'painting' | 'delivery' | 'installation'>('production');
  const [eventTime, setEventTime] = useState('09:00');
  const [description, setDescription] = useState('');

  // Calendar parameters
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const getEventsForDay = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === formattedDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedDay === null) return;

    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

    const newEvent: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title,
      type,
      date: formattedDate,
      time: eventTime,
      description
    };

    onAddEvent(newEvent);
    setShowAddModal(false);

    // reset Form
    setTitle('');
    setType('production');
    setEventTime('09:00');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">{t.calendar}</h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">Commission Timelines & On-Site Installation bookings</p>
        </div>
        <button
          onClick={() => {
            if (selectedDay === null) {
              alert("Please click on a calendar date first before adding a task.");
              return;
            }
            setShowAddModal(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addEvent}</span>
        </button>
      </div>

      {/* Main Grid: Calendar left, Tasks list right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              {monthNames[month]} {year}
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-neutral-500 font-mono font-bold mb-3 uppercase tracking-widest">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Pad preceding empty slots */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-neutral-950/25 border border-transparent" />
            ))}

            {/* Days slots */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const hasEvents = getEventsForDay(d).length > 0;
              const isSelected = selectedDay === d;
              return (
                <div
                  key={`day-${d}`}
                  onClick={() => setSelectedDay(d)}
                  className={`h-16 rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-neutral-950 hover:bg-neutral-800/40 border-neutral-850'
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-amber-500 font-extrabold' : 'text-neutral-400'}`}>
                    {d}
                  </span>
                  
                  {hasEvents && (
                    <div className="flex gap-1 justify-center">
                      {getEventsForDay(d).slice(0, 3).map((ev, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            ev.type === 'delivery' ? 'bg-indigo-500' :
                            ev.type === 'measurement' ? 'bg-amber-500' :
                            ev.type === 'painting' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date's Tasks checklist */}
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl space-y-5 h-fit text-xs">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>Schedule Details</span>
            </h3>
            {selectedDay !== null && (
              <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                {monthNames[month]} {selectedDay}, {year}
              </p>
            )}
          </div>

          <div className="border-t border-neutral-800/60 pt-4 space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {selectedDay === null ? (
              <p className="text-neutral-500 italic text-center py-6">Select a date on the calendar grid to audit timelines.</p>
            ) : getEventsForDay(selectedDay).length === 0 ? (
              <p className="text-neutral-500 italic text-center py-6">No shop operations or site meetings booked for this day.</p>
            ) : (
              getEventsForDay(selectedDay).map(ev => (
                <div key={ev.id} className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white leading-snug">{ev.title}</h4>
                    <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                      ev.type === 'delivery' ? 'bg-indigo-500/10 text-indigo-400' :
                      ev.type === 'measurement' ? 'bg-amber-500/10 text-amber-400' :
                      ev.type === 'painting' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      {ev.type}
                    </span>
                  </div>
                  
                  {ev.time && (
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{ev.time}</span>
                    </div>
                  )}

                  {ev.description && (
                    <p className="text-[11px] text-neutral-400 italic leading-relaxed pt-1 border-t border-neutral-900">
                      {ev.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5 border-b border-neutral-800 pb-3">
              <Plus className="w-5 h-5 text-amber-500" />
              <span>Book Appointment ({monthNames[month]} {selectedDay})</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Appointment Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Elena Dupont - Wardrobe Measurement"
                  className="w-full bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Schedule Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono cursor-pointer"
                  >
                    <option value="production">Cutting & Cutting</option>
                    <option value="meeting">Client consultation</option>
                    <option value="measurement">Site measurement</option>
                    <option value="painting">Painting / Varnishing</option>
                    <option value="delivery">Logistics delivery</option>
                    <option value="installation">Installation</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 font-mono mb-1.5 block">Start Time</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 p-2 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-mono mb-1.5 block">Special instructions / Coordinates</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about specific tools, materials, levelings, or instructions..."
                  rows={3.5}
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
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
