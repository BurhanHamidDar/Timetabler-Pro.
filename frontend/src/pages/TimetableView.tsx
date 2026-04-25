import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { AlertCircle, X, Lock, Plus, Calendar as CalendarIcon, Clock, MoreHorizontal, FileDown } from 'lucide-react';

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

interface ScheduleCell {
  day: string;
  period: number;
  subject: string;
  teacher: string;
  locked: boolean;
}

interface Teacher {
  _id: string;
  name: string;
  subjects: string[];
}

interface Subject {
  _id: string;
  name: string;
}

interface SchoolSettings {
  schoolStartTime: string;
  periodDuration: number;
  lunchAfterPeriod: number;
  lunchDuration: number;
}

// Enterprise SaaS Color Palette (Subtle Pastels + Deep Neutrals)
const getSubjectStyles = (subject: string) => {
  const styles = [
    { base: 'bg-indigo-50 border-indigo-200 text-indigo-700', acc: 'bg-indigo-500' },
    { base: 'bg-emerald-50 border-emerald-200 text-emerald-700', acc: 'bg-emerald-500' },
    { base: 'bg-violet-50 border-violet-200 text-violet-700', acc: 'bg-violet-500' },
    { base: 'bg-rose-50 border-rose-200 text-rose-700', acc: 'bg-rose-500' },
    { base: 'bg-amber-50 border-amber-200 text-amber-700', acc: 'bg-amber-500' },
    { base: 'bg-cyan-50 border-cyan-200 text-cyan-700', acc: 'bg-cyan-500' },
  ];
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return styles[Math.abs(hash) % styles.length];
};

const TimetableView = () => {
  const { className } = useParams();
  const [schedule, setSchedule] = useState<ScheduleCell[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [editingCell, setEditingCell] = useState<{ day: string, period: number } | null>(null);
  const [modalSubject, setModalSubject] = useState('');
  const [modalTeacher, setModalTeacher] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchIt = async () => {
      try {
        const [schRes, tRes, sRes, setRes] = await Promise.all([
          api.get(`/timetable/${className}`),
          api.get('/teachers'),
          api.get('/subjects'),
          api.get('/settings')
        ]);
        setSchedule(schRes.data.schedule || []);
        setTeachers(tRes.data);
        setSubjects(sRes.data);
        if (setRes.data) {
          setSettings(setRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIt();
  }, [className]);

  const getCell = (day: string, period: number) => schedule.find(s => s.day === day && s.period === period);

  const openModal = (day: string, period: number) => {
    const existing = getCell(day, period);
    setEditingCell({ day, period });
    setModalSubject(existing?.subject || '');
    setModalTeacher(existing?.teacher || '');
    setModalError(null);
  };

  const closeModal = () => {
    setEditingCell(null);
    setModalError(null);
  };

  const handleSaveCell = async () => {
    if (!editingCell) return;
    if ((modalSubject && !modalTeacher) || (!modalSubject && modalTeacher)) {
      setModalError("Subject and Teacher assignments must be paired together, or both cleared.");
      return;
    }
    setIsSaving(true);
    setModalError(null);
    try {
      const res = await api.put('/timetable/update-cell', {
        className, day: editingCell.day, period: editingCell.period,
        subject: modalSubject || null, teacher: modalTeacher || null
      });
      setSchedule(res.data.schedule);
      closeModal();
    } catch (err: any) {
      setModalError(err.response?.data?.error || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const getPeriodTiming = (pIndex: number) => {
    if (!settings || !settings.schoolStartTime) return '00:00';
    const [hours, minutes] = settings.schoolStartTime.split(':').map(Number);
    let startMinutes = (hours * 60) + minutes + ((pIndex - 1) * settings.periodDuration);
    if (settings.lunchAfterPeriod && pIndex > settings.lunchAfterPeriod) {
      startMinutes += (settings.lunchDuration || 30);
    }
    const endMinutes = startMinutes + settings.periodDuration;

    const formatTime = (totalMins: number) => {
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
    };
    return `${formatTime(startMinutes)} - ${formatTime(endMinutes)}`;
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
       <div className="animate-pulse flex flex-col items-center">
         <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="mt-4 text-slate-500 font-bold">Synchronizing Data Engine...</p>
       </div>
    </div>
  );

  const availableTeachers = modalSubject ? teachers.filter(t => t.subjects.includes(modalSubject)) : teachers;
  const showLunch = settings?.lunchAfterPeriod ? true : false;
  const columnsCount = 1 + PERIODS.length + (showLunch ? 1 : 0);

  return (
    <div className="mx-auto relative h-full flex flex-col font-sans">
      
      {/* Enterprise Page Header */}
      <div className="flex justify-between items-end mb-8 print-hide">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-widest border border-indigo-200">Live Editor</span>
            <span className="text-slate-400 text-sm font-bold flex items-center"><Clock className="w-4 h-4 mr-1"/> Fall Semester</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center">
             Class {className} 
             <span className="text-slate-300 mx-3 font-light">|</span> 
             <span className="text-slate-500 text-2xl font-bold">Master Schedule</span>
          </h2>
        </div>
        
        <div className="flex space-x-3">
          <button className="bg-white border text-sm border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:shadow hover:border-slate-300 transition flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-slate-400" /> Options
          </button>
          <button onClick={downloadPDF} className="bg-slate-900 text-white text-sm px-5 py-2.5 rounded-xl font-bold shadow-md shadow-slate-900/20 hover:bg-slate-800 transition flex items-center focus:ring-4 focus:ring-slate-900/10">
            <FileDown className="w-4 h-4 mr-2" /> Export PDF
          </button>
        </div>
      </div>

      {/* Main SaaS Grid Board */}
      <div className="flex-1 rounded-2xl print:rounded-none bg-white border border-slate-200/80 print:border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] print:shadow-none overflow-auto print:overflow-visible" ref={tableRef}>
        <div 
          className="grid pb-8 print:pb-0 w-full min-w-[1000px] print:min-w-0"
          style={{ gridTemplateColumns: `110px repeat(${columnsCount - 1}, minmax(0, 1fr))` }}
        >
          {/* Top Axis: Minimalist Period Indicators */}
          <div className="bg-slate-50/50 border-b border-r border-slate-100 p-4"></div>
          
          {PERIODS.map((p) => (
            <React.Fragment key={`header-${p}`}>
              <div className="bg-slate-50/50 border-b border-slate-100 py-4 flex flex-col items-center justify-center">
                <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Period {p}</span>
                {settings && <span className="text-[11px] font-bold text-slate-400 mt-1">{getPeriodTiming(p)}</span>}
              </div>
              {settings?.lunchAfterPeriod === p && (
                <div className="bg-slate-50/50 border-b border-slate-100 py-4 flex flex-col items-center justify-center">
                   <span className="text-[13px] font-black text-slate-300 tracking-wider">BREAK</span>
                </div>
              )}
            </React.Fragment>
          ))}
          
          {/* Grid Rows / Days */}
          {DAYS.map((day) => (
            <React.Fragment key={day}>
              {/* Day Name / Left Axis */}
              <div className="flex flex-col items-center justify-center py-6 px-2 text-center border-b border-r border-slate-100 bg-white">
                <span className="text-[15px] font-black text-slate-800">{day.substring(0,3)}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{day}</span>
              </div>
              
              {/* Period Cells */}
              {PERIODS.map(period => {
                const cell = getCell(day, period);
                
                return (
                  <React.Fragment key={`${day}-${period}`}>
                    <div 
                      onClick={() => openModal(day, period)}
                      className={`relative min-h-[110px] p-2 flex items-stretch border-b border-slate-100/80 border-r border-slate-100/50 cursor-pointer group`}
                    >
                      {cell ? (
                        <div className={`w-full bg-white rounded-xl p-3 border shadow-sm transition-all duration-300 group-hover:shadow-[0_8px_20px_rgb(0,0,0,0.08)] group-hover:-translate-y-1 relative overflow-hidden flex flex-col ${getSubjectStyles(cell.subject).base}`}>
                          
                          {/* Accent Color Left Ribbon */}
                          <div className={`absolute left-0 top-0 w-1 h-full ${getSubjectStyles(cell.subject).acc}`}></div>
                          
                          {cell.locked && <Lock className="absolute top-2.5 right-2.5 w-3 h-3 opacity-40" />}
                          
                          <span className="font-extrabold text-[13px] leading-tight mb-2 pr-4 text-slate-800 tracking-tight">
                            {cell.subject}
                          </span>
                          
                          <div className="flex flex-col mt-auto space-y-1.5">
                            <div className="flex items-center max-w-full overflow-hidden">
                              <div className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 opacity-60 bg-current"></div>
                              <span className="text-[10px] font-bold truncate opacity-80">{cell.teacher}</span>
                            </div>
                            <span className="text-[9px] font-black tracking-widest opacity-50 uppercase">Section A</span>
                          </div>

                        </div>
                      ) : (
                        <div className="absolute inset-0 m-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 group-hover:bg-slate-100/50 group-hover:border-slate-300 flex flex-col items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                            <Plus className="w-5 h-5 text-indigo-400 mb-1" />
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assign</span>
                        </div>
                      )}
                    </div>

                    {/* Subtle Lunch Divider Column Indicator */}
                    {settings?.lunchAfterPeriod === period && (
                      <div className="border-b border-r border-slate-100/50 bg-slate-50/30"></div>
                    )}
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Enterprise Command Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 print:hidden">
          {/* Modal Container */}
          <div className="bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] max-w-md w-full overflow-hidden border border-slate-100 transform transition-all scale-100 opacity-100 duration-200">
            
            <div className="px-8 py-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-800 text-xl tracking-tight leading-none">Modify Schedule</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">{editingCell.day} - Period {editingCell.period}</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm border border-slate-200 hover:border-slate-300 rounded-full p-2 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {modalError && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl flex items-start text-sm font-bold border border-rose-100">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="leading-tight">{modalError}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="flex items-center text-[11px] font-black tracking-widest text-slate-400 uppercase">
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Subject Target
                </label>
                <div className="relative">
                  <select 
                    value={modalSubject} onChange={e => { setModalSubject(e.target.value); setModalTeacher(''); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 appearance-none outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 text-slate-800 font-bold shadow-sm transition cursor-pointer"
                  >
                    <option value="">Unassigned (Clear Slot)</option>
                    {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                  <MoreHorizontal className="absolute right-4 top-[18px] w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-[11px] font-black tracking-widest text-slate-400 uppercase">
                   <Users className="w-3.5 h-3.5 mr-1.5" /> Allocated Faculty
                </label>
                <div className="relative">
                  <select 
                    value={modalTeacher} onChange={e => setModalTeacher(e.target.value)} disabled={!modalSubject}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 appearance-none outline-none font-bold shadow-sm transition ${!modalSubject ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400' : 'text-slate-800 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 cursor-pointer'}`}
                  >
                    <option value="">Select Instructor...</option>
                    {availableTeachers.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                  </select>
                  <MoreHorizontal className={`absolute right-4 top-[18px] w-5 h-5 pointer-events-none ${!modalSubject ? 'text-slate-300' : 'text-slate-400'}`} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-8 py-6 flex justify-between items-center border-t border-slate-100">
              <button onClick={() => { setModalSubject(''); setModalTeacher(''); }} className="text-slate-400 hover:text-rose-500 font-bold text-sm transition px-2">
                Clear Slot Entry
              </button>
              <button 
                onClick={handleSaveCell} disabled={isSaving} 
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black tracking-wide shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition disabled:opacity-50 active:scale-95"
              >
                {isSaving ? "Saving..." : "Commit Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableView;
