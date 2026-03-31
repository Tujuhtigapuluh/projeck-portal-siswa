import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  addClassAnnouncement,
  deleteClassAnnouncement,
  getClassAnnouncements,
  getClasses,
  getTeachers,
} from '../../data/store';
import { Megaphone, Trash2 } from 'lucide-react';
import { useStoreVersion } from '../../hooks/useStoreVersion';

export default function AturPengumumanGuru() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const teacherClasses = useMemo(() => {
    const teacher = getTeachers().find(item => item.id === user?.id);
    return getClasses().filter(item => teacher?.classIds.includes(item.id));
  }, [user, storeVersion]);

  useEffect(() => {
    if (!selectedClassId && teacherClasses.length > 0) {
      setSelectedClassId(teacherClasses[0].id);
    }
  }, [teacherClasses, selectedClassId]);

  const classAnnouncements = useMemo(
    () => (selectedClassId ? getClassAnnouncements(selectedClassId) : []),
    [selectedClassId, storeVersion],
  );

  const handleAddAnnouncement = () => {
    if (!selectedClassId || !title.trim() || !message.trim() || !user) return;
    addClassAnnouncement({
      id: `a_${Date.now()}`,
      classId: selectedClassId,
      title: title.trim(),
      message: message.trim(),
      createdBy: user.id,
      createdAt: Date.now(),
    });
    setTitle('');
    setMessage('');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Atur Pengumuman</h1>
		<p className="text-sm text-gray-500 mt-1">
        Buat pengumuman kelas agar langsung terlihat oleh seluruh siswa kelas terkait.</p>
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
            <h2 className="font-medium text-gray-700">Tulis Pengumuman Baru</h2>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Judul pengumuman"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Isi pengumuman"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={handleAddAnnouncement}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <Megaphone className="w-4 h-4" /> Kirim Pengumuman
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="font-medium text-gray-700">Daftar Pengumuman Kelas</h2>
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {classAnnouncements.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteClassAnnouncement(item.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Hapus pengumuman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{item.message}</p>
                </div>
              ))}
              {classAnnouncements.length === 0 && (
                <p className="text-sm text-gray-400 py-2">Belum ada pengumuman untuk kelas ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}