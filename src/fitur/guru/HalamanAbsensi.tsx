import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeachers, getClasses, getStudentsByClass, getAttendanceByDate, addAttendanceRecords } from '../../data/store';
import { AttendanceRecord } from '../../types';
import { CheckCircle, XCircle, AlertCircle, Clock, Save, RotateCcw } from 'lucide-react';

type Status = AttendanceRecord['status'];

const statusConfig: Record<Status, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  hadir: { label: 'Hadir', color: 'text-green-700', bg: 'bg-green-100 border-green-300', icon: <CheckCircle className="w-4 h-4" /> },
  izin: { label: 'Izin', color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300', icon: <AlertCircle className="w-4 h-4" /> },
  sakit: { label: 'Sakit', color: 'text-orange-700', bg: 'bg-orange-100 border-orange-300', icon: <Clock className="w-4 h-4" /> },
  alpha: { label: 'Alpha', color: 'text-red-700', bg: 'bg-red-100 border-red-300', icon: <XCircle className="w-4 h-4" /> },
};

export default function AttendancePage() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Status>>({});
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [refresh, setRefresh] = useState(0);

  const teacher = useMemo(() => getTeachers().find(t => t.id === user?.id), [user]);
  const classes = useMemo(() => getClasses().filter(c => teacher?.classIds.includes(c.id)), [teacher]);

  const students = useMemo(() => {
    if (!selectedClass) return [];
    return getStudentsByClass(selectedClass).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedClass, refresh]);

  // Load existing attendance whenever class/date changes.
  useEffect(() => {
    if (!selectedClass || !selectedDate) return;
    const existing = getAttendanceByDate(selectedDate, selectedClass);
    const map: Record<string, Status> = {};
    const notes: Record<string, string> = {};
    existing.forEach(r => {
      map[r.studentId] = r.status;
      if (r.note) notes[r.studentId] = r.note;
    });
    setAttendanceMap(map);
    setNoteMap(notes);
    setSaved(false);
  }, [selectedClass, selectedDate, refresh]);

  const setStatus = useCallback((studentId: string, status: Status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
    setSaved(false);
  }, []);

  const setAllStatus = useCallback((status: Status) => {
    const map: Record<string, Status> = {};
    students.forEach(s => { map[s.id] = status; });
    setAttendanceMap(map);
    setSaved(false);
  }, [students]);

  const handleSave = () => {
    if (!user || !selectedClass) return;
    const records: AttendanceRecord[] = students
      .filter(s => attendanceMap[s.id])
      .map(s => ({
        id: `att_${s.id}_${selectedDate}`,
        studentId: s.id,
        classId: selectedClass,
        date: selectedDate,
        status: attendanceMap[s.id],
        note: noteMap[s.id] || undefined,
        markedBy: user.id,
        timestamp: Date.now(),
      }));

    addAttendanceRecords(records);
    setSaved(true);
    setRefresh(r => r + 1);
  };

  const totalMarked = Object.keys(attendanceMap).length;
  const totalStudents = students.length;
  const summary = {
    hadir: Object.values(attendanceMap).filter(s => s === 'hadir').length,
    izin: Object.values(attendanceMap).filter(s => s === 'izin').length,
    sakit: Object.values(attendanceMap).filter(s => s === 'sakit').length,
    alpha: Object.values(attendanceMap).filter(s => s === 'alpha').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Input Absensi</h1>
        <p className="text-gray-500">Catat kehadiran siswa per kelas</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
          >
            <option value="">Pilih Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {selectedClass && (
          <div className="flex gap-2 ml-auto">
            <button onClick={() => setAllStatus('hadir')} className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition font-medium">
              Semua Hadir
            </button>
            <button onClick={() => { setAttendanceMap({}); setNoteMap({}); setSaved(false); }} className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        )}
      </div>

      {!selectedClass ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-6xl mb-4">[ ]</div>
          <p className="text-gray-500 text-lg">Pilih kelas untuk mulai mengisi absensi</p>
        </div>
      ) : (
        <>
          {/* Summary Bar */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
            <span className="text-sm text-gray-600">
              <strong>{totalMarked}</strong> dari <strong>{totalStudents}</strong> siswa tercatat
            </span>
            <div className="flex gap-3 ml-auto">
              {(Object.entries(summary) as [Status, number][]).map(([status, count]) => (
                <span key={status} className={`text-sm font-medium px-3 py-1 rounded-full ${statusConfig[status].bg} ${statusConfig[status].color} border`}>
                  {statusConfig[status].label}: {count}
                </span>
              ))}
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 w-12">No</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Nama Siswa</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600 w-20">NIS</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={`Foto ${student.name}`}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${student.gender === 'L' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                              {(student.name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-400">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{student.nis}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {(Object.entries(statusConfig) as [Status, typeof statusConfig[Status]][]).map(([status, cfg]) => (
                            <button
                              key={status}
                              onClick={() => setStatus(student.id, status)}
                              className={`px-2 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1 ${
                                attendanceMap[student.id] === status
                                  ? `${cfg.bg} ${cfg.color} shadow-sm`
                                  : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              {cfg.icon}
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={noteMap[student.id] || ''}
                          onChange={e => {
                            setNoteMap(prev => ({ ...prev, [student.id]: e.target.value }));
                            setSaved(false);
                          }}
                          placeholder="Keterangan..."
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 outline-none"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={totalMarked === 0}
              className={`px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg transition-all ${
                saved
                  ? 'bg-green-500'
                  : totalMarked === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Tersimpan!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Absensi
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
