import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeachers, getClasses, getStudentsByClass, addStudent, updateStudent, deleteStudent } from '../../data/store';
import { Student } from '../../types';
import { Plus, Edit2, Trash2, X, Search, UserPlus } from 'lucide-react';

export default function StudentManagement() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formClass, setFormClass] = useState('');
  const [formPassword, setFormPassword] = useState('siswa123');

  const teacher = useMemo(() => getTeachers().find(t => t.id === user?.id), [user]);
  const classes = useMemo(() => getClasses().filter(c => teacher?.classIds.includes(c.id)), [teacher]);

  const students = useMemo(() => {
    if (!selectedClass) {
      const allStudents: Student[] = [];
      classes.forEach(c => {
        allStudents.push(...getStudentsByClass(c.id));
      });
      return allStudents.sort((a, b) => a.name.localeCompare(b.name));
    }
    return getStudentsByClass(selectedClass).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedClass, classes, refresh]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const lower = searchTerm.toLowerCase();
    return students.filter(s => s.name.toLowerCase().includes(lower) || s.nis.includes(searchTerm));
  }, [students, searchTerm]);

  const openAddModal = () => {
    setEditingStudent(null);
    setFormName('');
    setFormNis('');
    setFormGender('L');
    setFormClass(selectedClass || classes[0]?.id || '');
    setFormPassword('siswa123');
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormNis(student.nis);
    setFormGender(student.gender);
    setFormClass(student.classId);
    setFormPassword(student.password);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName || !formNis || !formClass) return;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        name: formName,
        nis: formNis,
        gender: formGender,
        classId: formClass,
        password: formPassword,
      });
    } else {
      addStudent({
        id: `s_${Date.now()}`,
        name: formName,
        nis: formNis,
        gender: formGender,
        classId: formClass,
        password: formPassword,
      });
    }
    setShowModal(false);
    setRefresh(r => r + 1);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    setDeleteConfirm(null);
    setRefresh(r => r + 1);
  };

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || classId;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola data siswa per kelas
        </p>
      </div>
      
      <button
        onClick={openAddModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg"
      >
        <UserPlus className="w-4 h-4" />
        Tambah Siswa
      </button>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau NIS..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Semua Kelas</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm">
          <span className="text-blue-600 font-semibold">{filteredStudents.length}</span>
          <span className="text-blue-500 ml-1">siswa</span>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm">
          <span className="text-blue-600 font-semibold">{filteredStudents.filter(s => s.gender === 'L').length}</span>
          <span className="text-blue-500 ml-1">laki-laki</span>
        </div>
        <div className="bg-pink-50 border border-pink-100 rounded-xl px-4 py-2 text-sm">
          <span className="text-pink-600 font-semibold">{filteredStudents.filter(s => s.gender === 'P').length}</span>
          <span className="text-pink-500 ml-1">perempuan</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 w-12">No</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Nama Siswa</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">NIS</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Kelas</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">JK</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => (
                <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={`Foto ${student.name}`}
                          className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${student.gender === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                          {(student.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{student.nis}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg">
                      {getClassName(student.classId)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${student.gender === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {student.gender === 'L' ? '♂ L' : '♀ P'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEditModal(student)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirm === student.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(student.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">
                            Ya
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-300">
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(student.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <div className="text-4xl mb-2">🔍</div>
                    Tidak ada siswa ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {editingStudent ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-green-600" />}
                {editingStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama siswa..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
                <input type="text" value={formNis} onChange={e => setFormNis(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nomor Induk Siswa..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select value={formGender} onChange={e => setFormGender(e.target.value as 'L' | 'P')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                  <select value={formClass} onChange={e => setFormClass(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Pilih Kelas</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="text" value={formPassword} onChange={e => setFormPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                Batal
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}