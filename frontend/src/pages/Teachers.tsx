import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Trash2, X } from 'lucide-react';

interface Teacher {
  _id: string;
  name: string;
  subjects: string[];
}

interface Subject {
  _id: string;
  name: string;
}

const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  
  const [name, setName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [currentSubjectSelect, setCurrentSubjectSelect] = useState('');

  const fetchData = async () => {
    const [tRes, sRes] = await Promise.all([
      api.get('/teachers'),
      api.get('/subjects')
    ]);
    setTeachers(tRes.data);
    setAllSubjects(sRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const addSubjectPill = () => {
    if (currentSubjectSelect && !selectedSubjects.includes(currentSubjectSelect)) {
      setSelectedSubjects([...selectedSubjects, currentSubjectSelect]);
      setCurrentSubjectSelect('');
    }
  };

  const removeSubjectPill = (sub: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      alert("Please assign at least one subject to this teacher.");
      return;
    }
    
    await api.post('/teachers', { name: name.trim(), subjects: selectedSubjects, maxPeriodsPerDay: 7 });
    setName('');
    setSelectedSubjects([]);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/teachers/${id}`);
    fetchData();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Manage Teachers</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Teacher</h3>
        
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. John Doe" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Subjects</label>
            <div className="flex gap-2">
              <select 
                value={currentSubjectSelect} 
                onChange={e => setCurrentSubjectSelect(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-white"
              >
                <option value="" disabled>Select a subject...</option>
                {allSubjects.map(s => (
                  <option key={s._id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <button type="button" onClick={addSubjectPill} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                Add Subject
              </button>
            </div>
            
            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                {selectedSubjects.map(sub => (
                  <div key={sub} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium text-sm">
                    {sub}
                    <button type="button" onClick={() => removeSubjectPill(sub)} className="hover:bg-indigo-200 rounded-full p-0.5 transition">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {selectedSubjects.length === 0 && (
              <p className="text-xs text-red-500 mt-2">* Teacher must have at least one subject assigned.</p>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium flex items-center transition">
              <Plus className="w-5 h-5 mr-1" /> Add Teacher
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Subjects</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(t => (
              <tr key={t._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{t.name}</td>
                <td className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    {t.subjects.map((s, i) => <span key={i} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-semibold">{s}</span>)}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(t._id)} className="text-red-500 hover:text-red-700 transition p-1.5 hover:bg-red-50 rounded-md">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {teachers.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">No teachers found. Please add a teacher above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teachers;
