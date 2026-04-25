import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Trash2 } from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
}

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState('');

  const fetchSubjects = async () => {
    const res = await api.get('/subjects');
    setSubjects(res.data);
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/subjects', { name: name.trim() });
    setName('');
    fetchSubjects();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/subjects/${id}`);
    fetchSubjects();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Manage Subjects</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Add New Subject</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Mathematics" className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium flex items-center transition">
            <Plus className="w-5 h-5 mr-1" /> Add
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {subjects.map(s => (
            <li key={s._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition">
              <span className="font-medium text-gray-800">{s.name}</span>
              <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:text-red-700 transition p-1 hover:bg-red-50 rounded-md">
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
          {subjects.length === 0 && (
            <li className="p-8 text-center text-gray-500">No subjects found. Add a subject above.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Subjects;
