import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, BookOpen, Layers, CalendarDays, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ teachers: 0, subjects: 0, classes: 0, timetables: 0 });
  const [teacherLoad, setTeacherLoad] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teachersRes, subjectsRes, classesRes, timetablesRes] = await Promise.all([
          api.get('/teachers'),
          api.get('/subjects'),
          api.get('/classes'),
          api.get('/timetables'),
        ]);

        const timetables = timetablesRes.data || [];
        
        setStats({
          teachers: teachersRes.data.length,
          subjects: subjectsRes.data.length,
          classes: classesRes.data.length,
          timetables: timetables.length,
        });

        // ----------------------------------------------------
        // Teacher Load Computation Engine
        // ----------------------------------------------------
        const loadMap: Record<string, number> = {};
        
        // Pre-fill map with all teachers so even 0-load teachers appear on the graph
        teachersRes.data.forEach((t: any) => {
          loadMap[t.name] = 0;
        });

        // Sweep through all schedules across the entire active network
        timetables.forEach((table: any) => {
          if (table.schedule && Array.isArray(table.schedule)) {
            table.schedule.forEach((cell: any) => {
              if (cell.teacher && cell.teacher.trim() !== '') {
                if (loadMap[cell.teacher] !== undefined) {
                  loadMap[cell.teacher] += 1;
                } else {
                  // Fallback if a teacher exists in schedule but wasn't in main teacher root
                  loadMap[cell.teacher] = 1;
                }
              }
            });
          }
        });

        // Parse into Recharts format
        const chartedData = Object.keys(loadMap)
          .map(name => ({
            name: name,
            load: loadMap[name]
          }))
          .sort((a, b) => b.load - a.load); // Sort by highest load first

        setTeacherLoad(chartedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: 'Total Faculty', value: stats.teachers, icon: <Users />, color: 'text-indigo-500', bg: 'bg-indigo-50', link: '/teachers' },
    { title: 'Subjects', value: stats.subjects, icon: <BookOpen />, color: 'text-violet-500', bg: 'bg-violet-50', link: '/subjects' },
    { title: 'Cohorts', value: stats.classes, icon: <Layers />, color: 'text-emerald-500', bg: 'bg-emerald-50', link: '/classes' },
    { title: 'Published Maps', value: stats.timetables, icon: <CalendarDays />, color: 'text-rose-500', bg: 'bg-rose-50', link: '/generator' },
  ];

  if (loading) return (
    <div className="h-full flex items-center justify-center">
       <div className="animate-pulse flex flex-col items-center">
         <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
         <p className="mt-4 text-slate-500 font-bold">Aggregating Analytics...</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* SaaS Page Header */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
        <p className="text-slate-500 font-medium mt-1">High-level metrics and faculty distribution analytics.</p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <Link to={card.link} key={i} className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 ease-out z-0" style={{ backgroundColor: 'currentColor', color: 'inherit' }}></div>
            <div className="relative z-10 flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                {React.cloneElement(card.icon, { className: 'w-6 h-6', strokeWidth: 2.5 })}
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-slate-800 tracking-tight">{card.value}</h3>
              <p className="text-[13px] text-slate-400 font-bold tracking-widest uppercase mt-1">{card.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Primary Analytics Graph Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgb(0,0,0,0.02)] p-8 border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" strokeWidth={2.5} /> Faculty Load Distribution
            </h3>
            <p className="text-sm text-slate-400 font-medium mt-1">Total periods actively assigned per instructor across the entire network.</p>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold border border-indigo-100 uppercase tracking-widest">
            Live Feed
          </div>
        </div>

        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={teacherLoad}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }}
                dx={-10}
                allowDecimals={false}
              />
              <Tooltip 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#818cf8', fontWeight: 900 }}
              />
              <Area 
                type="monotone" 
                dataKey="load" 
                name="Total Periods"
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorLoad)" 
                activeDot={{ r: 6, fill: '#ffffff', stroke: '#6366f1', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
