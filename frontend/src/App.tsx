import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MonitorX } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Subjects from './pages/Subjects';
import Classes from './pages/Classes';
import Generator from './pages/Generator';
import TimetableView from './pages/TimetableView';
import Settings from './pages/Settings';
import Login from './pages/Login';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check initial auth state on boot
    const token = localStorage.getItem('adminToken');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      {/* Global Mobile Restriction Screen */}
      <div className="flex print:hidden flex-col items-center justify-center min-h-screen bg-[#0B1121] text-center p-8 z-[100] md:hidden">
        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/10 border border-indigo-500/30">
          <MonitorX className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 tracking-tight leading-tight">Larger Workspace<br/>Required</h2>
        <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-sm">
          Timetabler Pro relies on an interactive grid that requires significant screen real estate. Please access this platform from a <strong>Desktop</strong> or <strong>Laptop</strong> to continue.
        </p>
      </div>

      {/* Outer Shell: Hidden on mobile (md:hidden counterpart), visible on desktop (md:flex) */}
      <div className="hidden md:flex print:block justify-center items-center min-h-screen print:min-h-0 print:h-auto p-4 md:p-6 lg:p-8 print:p-0 bg-[#F1F5F9] print:bg-white font-sans antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        
        {/* The Main Application Interface - Floating SaaS Canvas */}
        <div className="w-full max-w-[1600px] h-[94vh] print:h-auto bg-white rounded-[2rem] print:rounded-none shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] print:shadow-none flex print:block overflow-hidden print:overflow-visible border border-slate-200/60 print:border-none relative ring-1 ring-slate-900/5 print:ring-0">
          
          {/* Deep Contrast Side Panel */}
          <Navigation />
          
          {/* Primary Viewport */}
          <main className="flex-1 overflow-y-auto print:overflow-visible bg-[#FAFAFA] print:bg-white p-8 lg:p-12 print:p-0 relative">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/generate" element={<Generator />} />
              <Route path="/timetable/:className" element={<TimetableView />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
