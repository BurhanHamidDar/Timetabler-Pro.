import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Save, Clock, CalendarDays, Coffee } from 'lucide-react';

const Settings = () => {
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState(45);
  const [lunchAfter, setLunchAfter] = useState(4);
  const [lunchDuration, setLunchDuration] = useState(30);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          setStartTime(res.data.schoolStartTime);
          setDuration(res.data.periodDuration);
          if (res.data.lunchAfterPeriod) setLunchAfter(res.data.lunchAfterPeriod);
          if (res.data.lunchDuration) setLunchDuration(res.data.lunchDuration);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await api.put('/settings', { 
        schoolStartTime: startTime, 
        periodDuration: duration,
        lunchAfterPeriod: lunchAfter,
        lunchDuration: lunchDuration
      });
      setMessage({ type: 'success', text: 'School hours & lunch schedule updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Global Settings</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4 flex items-center">
          <CalendarDays className="w-6 h-6 text-white mr-3" />
          <h3 className="text-xl font-bold text-white">School Hours Schedule</h3>
        </div>
        
        <form onSubmit={handleSave} className="p-6">
          <p className="text-gray-500 mb-6 text-sm">
            Configure the starting bell time and how long each period lasts. This will automatically calculate exact timestamps across all timetable grids globally.
          </p>

          {message && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start">
              <div className="bg-white p-2 rounded shadow-sm border border-gray-100 mr-4 mt-1">
                <Clock className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-800 mb-1">First Class Start Time</label>
                <p className="text-xs text-gray-500 mb-3">The exact hour and minute Period 1 begins.</p>
                <input 
                  type="time" 
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                  className="w-full sm:w-48 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start">
              <div className="bg-white p-2 rounded shadow-sm border border-gray-100 mr-4 mt-1">
                <Clock className="w-6 h-6 text-indigo-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-800 mb-1">Period Duration</label>
                <p className="text-xs text-gray-500 mb-3">How long does each class block last (in minutes)?</p>
                <div className="relative w-full sm:w-48">
                  <input 
                    type="number" 
                    min="15" max="180"
                    value={duration}
                    onChange={e => setDuration(Number(e.target.value))}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 pr-12 font-medium"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 font-medium pointer-events-none">mins</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-100 flex items-start">
              <div className="bg-white p-2 rounded shadow-sm border border-orange-100 mr-4 mt-1">
                <Coffee className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-800 mb-1">Universal Lunch Break</label>
                <p className="text-xs text-gray-500 mb-3">Which period does the lunch break follow, and how long does it last?</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium text-sm pointer-events-none">After Period</span>
                    <input 
                      type="number" 
                      min="1" max="6"
                      value={lunchAfter}
                      onChange={e => setLunchAfter(Number(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 pl-24 font-medium"
                    />
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-gray-500 font-medium text-sm pointer-events-none">Duration</span>
                    <input 
                      type="number" 
                      min="10" max="120"
                      value={lunchDuration}
                      onChange={e => setLunchDuration(Number(e.target.value))}
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-orange-500 pl-20 pr-12 font-medium"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 font-medium pointer-events-none">mins</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 border-t border-gray-100 pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-bold flex items-center shadow-lg transition disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" /> 
              {isSaving ? 'Saving parameters...' : 'Save Global Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
