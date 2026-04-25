import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Play, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const Generator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [classes, setClasses] = useState<{_id: string, name: string}[]>([]);

  useEffect(() => {
    api.get('/classes').then(res => setClasses(res.data)).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.post('/timetable/generate');
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Generate Timetables</h2>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mb-8">
        <div className="bg-indigo-50 text-indigo-600 p-4 rounded-full mb-6 relative">
          <Play fill="currentColor" className="w-12 h-12 ml-1" />
          {loading && <Loader className="absolute top-0 left-0 w-full h-full animate-spin text-indigo-400 opacity-50" />}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Automated Generator Engine</h3>
        <p className="text-gray-500 max-w-lg mb-8">
          The backtracking algorithm will assign all required subjects to available teachers, ensuring no double-booking and respecting daily hour limits.
        </p>
        
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className={`px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center ${
            loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1'
          }`}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin mr-2" />
              Crunching numbers...
            </>
          ) : 'Start Generation'}
        </button>

        {error && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg flex items-start border border-red-100 max-w-lg w-full text-left">
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Generation Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-8 p-4 bg-green-50 text-green-700 rounded-lg flex items-start border border-green-100 max-w-lg w-full text-left">
            <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm">Conflict-free timetables have been successfully generated for all classes.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">View Generated Timetables</h3>
        <div className="flex flex-wrap gap-4">
          {classes.map(c => (
            <Link key={c._id} to={`/timetable/${c.name}`} className="bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 text-gray-700 hover:text-indigo-700 px-6 py-3 rounded-lg font-medium transition">
              Class {c.name}
            </Link>
          ))}
          {classes.length === 0 && <p className="text-gray-500">No classes defined yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Generator;
