import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  addOnlineAssignment,
  deleteOnlineAssignment,
  getClasses,
  getOnlineAssignmentsByClass,
  getSubmissionsByAssignment,
  getTeachers,
} from '../../data/store';
import { Plus, Trash2 } from 'lucide-react';
import { useStoreVersion } from '../../hooks/useStoreVersion';

export default function AturTugasOnlineGuru() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  const teacherClasses = useMemo(() => {
    const teacher = getTeachers().find(item => item.id === user?.id);
    return getClasses().filter(item => teacher?.classIds.includes(item.id));
  }, [user, storeVersion]);

  useEffect(() => {
    if (!selectedClassId && teacherClasses.length > 0) {
      setSelectedClassId(teacherClasses[0].id);
    }
  }, [teacherClasses, selectedClassId]);

  const classAssignments = useMemo(
    () => (selectedClassId ? getOnlineAssignmentsByClass(selectedClassId) : []),
    [selectedClassId, storeVersion],
  );

  const handleAddAssignment = () => {
    if (!selectedClassId || !assignmentTitle.trim() || !assignmentDescription.trim() || !assignmentDueDate || !user) return;
    addOnlineAssignment({
      id: `task_${Date.now()}`,
      classId: selectedClassId,
      title: assignmentTitle.trim(),
      description: assignmentDescription.trim(),
      dueDate: assignmentDueDate,
      createdBy: user.id,
      createdAt: Date.now(),
    });
    setAssignmentTitle('');
    setAssignmentDescription('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Atur Tugas Online</h1>
        <p className="text-gray-500">Kelola tugas online dan pantau jumlah jawaban masuk dari siswa.</p>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Pilih Kelas</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {teacherClasses.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="font-medium text-gray-700">Tambah Tugas Baru</h2>
            <input
              value={assignmentTitle}
              onChange={e => setAssignmentTitle(e.target.value)}
              placeholder="Judul tugas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={assignmentDescription}
              onChange={e => setAssignmentDescription(e.target.value)}
              placeholder="Deskripsi tugas"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div>
              <label className="text-xs text-gray-500">Batas Pengumpulan</label>
              <input
                type="date"
                value={assignmentDueDate}
                onChange={e => setAssignmentDueDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddAssignment}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Tambah Tugas
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="font-medium text-gray-700">Daftar Tugas Kelas</h2>
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {classAssignments.map(item => {
                const submissionCount = getSubmissionsByAssignment(item.id).length;
                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Tenggat: {new Date(`${item.dueDate}T00:00:00`).toLocaleDateString('id-ID')} • {submissionCount} jawaban
                        </p>
                      </div>
                      <button
                        onClick={() => deleteOnlineAssignment(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        title="Hapus tugas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                  </div>
                );
              })}
              {classAssignments.length === 0 && (
                <p className="text-sm text-gray-400 py-2">Belum ada tugas online untuk kelas ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}