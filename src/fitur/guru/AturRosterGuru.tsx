import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addClassRoster, deleteClassRoster, getClassRosters, getClasses, getTeachers } from '../../data/store';
import { Trash2, Plus } from 'lucide-react';
import { useStoreVersion } from '../../hooks/useStoreVersion';

const dayNames: Record<number, string> = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

const schoolDayOptions = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
];

export default function AturRosterGuru() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('09:00');
  const [room, setRoom] = useState('');

  const teacherClasses = useMemo(() => {
    const teacher = getTeachers().find(item => item.id === user?.id);
    return getClasses().filter(item => teacher?.classIds.includes(item.id));
  }, [user, storeVersion]);

  useEffect(() => {
    if (!selectedClassId && teacherClasses.length > 0) {
      setSelectedClassId(teacherClasses[0].id);
    }
  }, [teacherClasses, selectedClassId]);

  const classRosters = useMemo(
    () => (selectedClassId ? getClassRosters(selectedClassId) : []),
    [selectedClassId, storeVersion],
  );

  const handleAddRoster = () => {
    if (!selectedClassId || !subject.trim() || !startTime || !endTime || !user) return;
    addClassRoster({
      id: `r_${Date.now()}`,
      classId: selectedClassId,
      subject: subject.trim(),
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      room: room.trim() || undefined,
      teacherName: user.name,
      updatedBy: user.id,
      updatedAt: Date.now(),
    });
    setSubject('');
    setRoom('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Atur Roster</h1>
        <p className="text-gray-500">Kelola jadwal pelajaran per kelas dari Senin sampai Sabtu.</p>
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
            <h2 className="font-medium text-gray-700">Tambah Jadwal</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Mata pelajaran"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="Ruang (opsional)"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {schoolDayOptions.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleAddRoster}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" /> Tambah Roster
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="font-medium text-gray-700">Daftar Roster Kelas</h2>
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {classRosters.map(item => (
                <div key={item.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.subject}</p>
                    <p className="text-xs text-gray-500">
                      {dayNames[item.dayOfWeek] || 'Hari'} {item.startTime} - {item.endTime}
                      {item.room ? ` • ${item.room}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteClassRoster(item.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    title="Hapus roster"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {classRosters.length === 0 && (
                <p className="text-sm text-gray-400 py-2">Belum ada roster untuk kelas ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}