// React import removed
import { Link, useLocation } from 'react-router-dom';
import { Layers, Users, BookOpen, Presentation, Play, Settings, Frame } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const links = [
    { to: '/', label: 'Overview', icon: <Frame strokeWidth={2.5} className="w-5 h-5 mr-3" /> },
    { to: '/teachers', label: 'Faculty', icon: <Users strokeWidth={2.5} className="w-5 h-5 mr-3" /> },
    { to: '/subjects', label: 'Subjects', icon: <BookOpen strokeWidth={2.5} className="w-5 h-5 mr-3" /> },
    { to: '/classes', label: 'Cohorts', icon: <Layers strokeWidth={2.5} className="w-5 h-5 mr-3" /> },
    { to: '/generate', label: 'Automater', icon: <Play strokeWidth={2.5} className="w-5 h-5 mr-3" /> },
    { to: '/settings', label: 'Preferences', icon: <Settings strokeWidth={2.5} className="w-5 h-5 mr-3" /> },
  ];

  return (
    <nav className="w-72 bg-[#0B1121] flex flex-col h-full shrink-0 shadow-2xl print:hidden relative z-10 selection:bg-indigo-500/30">
      
      {/* SaaS Premium Branding */}
      <div className="p-8 pb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
          <Presentation className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
          Timetabler <span className="text-indigo-400 font-medium">Pro</span>
        </h1>
        <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-2">Dalat Setup</p>
      </div>

      {/* Main Nav Links Navigation Panel */}
      <div className="px-4 flex-1 overflow-y-auto hidden-scrollbar">
        <ul className="space-y-1.5">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center px-4 py-3.5 text-[14px] font-bold rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`transition-all duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {link.icon}
                  </span>
                  {link.label}
                  
                  {/* Subtle active state marker indicator line */}
                  {isActive && (
                    <div className="ml-auto w-1 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom Profile & Developer Credit */}
      <div className="p-4 mt-auto border-t border-slate-800/60 pb-6">
        <div className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition cursor-pointer group mb-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center group-hover:border-indigo-500 transition shadow-sm">
             <span className="text-slate-300 font-bold text-sm">A</span>
          </div>
          <div>
             <p className="text-sm font-bold text-slate-200">Administrator</p>
             <p className="text-[11px] text-slate-500 font-bold tracking-wide mt-0.5">System Manager</p>
          </div>
        </div>
        <div className="text-center pt-2">
           <p className="text-[9px] font-black text-slate-600/80 uppercase tracking-[0.2em]">Developed by Burhan Hamid</p>
        </div>
      </div>

    </nav>
  );
};

export default Navigation;
