import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Trash2 } from 'lucide-react';

interface ClassSubject {
  subject: string;
  periodsPerWeek: number;
}

interface ClassData {
  _id: string;
  name: string;
  subjects: ClassSubject[];
}

interface SubjectData {
  _id: string;
  name: string;
}

const Classes = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectData[]>([]);
  
  const [name, setName] = useState('');
  const [classSubjects, setClassSubjects] = useState<{subject: string, periods: number}[]>([]);

  const fetchData = async () => {
    const [cRes, sRes] = await Promise.all([
      api.get('/classes'),
      api.get('/subjects')
    ]);
    setClasses(cRes.data);
    setAllSubjects(sRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const addSubjectRow = () => {
    setClassSubjects([...classSubjects, { subject: '', periods: 1 }]);
  };

  const removeSubjectRow = (index: number) => {
    setClassSubjects(classSubjects.filter((_, i) => i !== index));
  };

  const updateSubjectRow = (index: number, field: 'subject' | 'periods', value: any) => {
    const updated = [...classSubjects];
    updated[index] = { ...updated[index], [field]: value };
    setClassSubjects(updated);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Filter out rows where no subject was selected
    const subjectsPayload = classSubjects
      .filter(s => s.subject.trim() !== '')
      .map(s => ({ subject: s.subject, periodsPerWeek: Number(s.periods) }));

    if (subjectsPayload.length === 0) {
      alert("Please add at least one valid subject requirement.");
      return;
    }

    await api.post('/classes', { name: name.trim(), subjects: subjectsPayload });
    setName('');
    setClassSubjects([]);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/classes/${id}`);
    fetchData();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Manage Classes</h2>
      
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Create New Class</h3>
        
        <form onSubmit={handleAdd} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. 10A" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-800">Subject Requirements</label>
              <button type="button" onClick={addSubjectRow} className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-md shadow-sm font-medium hover:bg-gray-50 transition text-indigo-600 flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Requirement
              </button>
            </div>
            
            <div className="space-y-3">
              {classSubjects.map((row, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <select
                    value={row.subject}
                    onChange={e => updateSubjectRow(i, 'subject', e.target.value)}
                    required
                    className="flex-1 border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="" disabled>Select Subject</option>
                    {allSubjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                  </select>
                  
                  <div className="w-32 relative">
                    <input 
                      type="number" 
                      min="1" max="15" 
                      value={row.periods} 
                      onChange={e => updateSubjectRow(i, 'periods', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm pointer-events-none">hrs</span>
                  </div>
                  
                  <button type="button" onClick={() => removeSubjectRow(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {classSubjects.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                  No subjects added. Click "Add Requirement" to assign subjects.
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-bold flex items-center shadow-lg transition">
               Create Class
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map(c => (
          <div key={c._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Class {c.name}</h3>
              <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded-md transition">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">Weekly Schedule Load</p>
              {c.subjects.map((sub, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                  <span className="font-semibold text-gray-700 flex items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></div>
                    {sub.subject}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-bold text-xs">{sub.periodsPerWeek} periods</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
            No classes found. Please set up a class structure above.
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;
