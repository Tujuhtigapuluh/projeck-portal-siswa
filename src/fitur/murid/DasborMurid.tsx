import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getClassAnnouncements,
  getClassRosters,
  getClasses,
  getPengumumanAdminUntukKelas,
  getStudents,
  getTeachers,
  getAttendanceByStudent,
} from '../../data/store';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Calendar,
  User,
  BookOpen,
  Megaphone,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useStoreVersion } from '../../hooks/useStoreVersion';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [currentDay, setCurrentDay] = useState(() => new Date().getDay());
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timeout = window.setTimeout(() => {
      setCurrentDay(new Date().getDay());
      const interval = window.setInterval(() => {
        setCurrentDay(new Date().getDay());
      }, 24 * 60 * 60 * 1000);
      return () => window.clearInterval(interval);
    }, msUntilMidnight);

    return () => window.clearTimeout(timeout);
  }, []);

  const student = useMemo(() => getStudents().find(s => s.id === user?.id), [user, storeVersion]);
  const className = useMemo(() => {
    if (!student) return '';
    return getClasses().find(c => c.id === student.classId)?.name || '';
  }, [student, storeVersion]);

  const allAttendance = useMemo(() => {
    if (!user) return [];
    return getAttendanceByStudent(user.id).sort((a, b) => b.date.localeCompare(a.date));
  }, [user, storeVersion]);

  const classRosters = useMemo(() => {
    if (!student) return [];
    return getClassRosters(student.classId);
  }, [student, storeVersion]);

  const classAnnouncements = useMemo(() => {
    if (!student) return [];
    return getClassAnnouncements(student.classId);
  }, [student, storeVersion]);

  const daftarGuru = useMemo(() => {
    const classes = getClasses();
    return getTeachers().map(item => ({
      id: item.id,
      name: item.name,
      subject: item.subject,
      avatar: item.avatar,
      kelasAjar: item.classIds
        .map(id => classes.find(c => c.id === id)?.name || '')
        .filter(Boolean)
        .join(', ') || '-',
    }));
  }, [storeVersion]);

  const pengumumanAdmin = useMemo(() => {
    if (!student) return [];
    return getPengumumanAdminUntukKelas(student.classId).slice(0, 5);
  }, [student, storeVersion]);

  const stats = useMemo(() => {
    const hadir = allAttendance.filter(a => a.status === 'hadir').length;
    const izin = allAttendance.filter(a => a.status === 'izin').length;
    const sakit = allAttendance.filter(a => a.status === 'sakit').length;
    const alpha = allAttendance.filter(a => a.status === 'alpha').length;
    const total = hadir + izin + sakit + alpha;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { hadir, izin, sakit, alpha, total, percentage };
  }, [allAttendance]);

  const todayRosters = useMemo(() => 
    classRosters
      .filter(item => item.dayOfWeek === currentDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [classRosters, currentDay]
  );

  const rosterRows = useMemo(() => {
    if (currentDay === 0) return [];
    const minPeriods = 6;
    const total = Math.max(minPeriods, todayRosters.length);
    return Array.from({ length: total }, (_, i) => ({
      jp: i + 1,
      data: todayRosters[i],
    }));
  }, [todayRosters, currentDay]);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Data tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
            {(student.name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{student.name}</h1>
            <p className="text-emerald-100 text-sm mt-1">
              NIS: {student.nis} • Kelas {className}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.percentage}%</p>
            <p className="text-xs text-emerald-100">Kehadiran</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.hadir}</p>
            <p className="text-xs text-emerald-100">Hadir</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-emerald-100">Total</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.alpha}</p>
            <p className="text-xs text-emerald-100">Alpha</p>
          </div>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{stats.hadir}</p>
            <p className="text-xs text-gray-500">Hadir</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{stats.izin}</p>
            <p className="text-xs text-gray-500">Izin</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{stats.sakit}</p>
            <p className="text-xs text-gray-500">Sakit</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{stats.alpha}</p>
            <p className="text-xs text-gray-500">Alpha</p>
          </div>
        </div>
      </div>

      {/* jadwal - full width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-gray-800">Jadwal Hari Ini</h2>
              <p className="text-xs text-gray-500">{dayNames[currentDay]}</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {currentDay === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Hari Minggu libur
            </div>
          ) : rosterRows.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada jadwal
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
                    <th className="px-4 py-3 w-16">JP</th>
                    <th className="px-4 py-3">Mapel</th>
                    <th className="px-4 py-3 w-32">Jam</th>
                    <th className="px-4 py-3 w-24">Ruang</th>
                    <th className="px-4 py-3">Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {rosterRows.map(row => (
                    <tr key={row.jp} className={!row.data ? 'bg-gray-50/50' : ''}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex w-6 h-6 items-center justify-center rounded text-xs font-bold ${row.data ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-400'}`}>
                          {row.jp}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {row.data?.subject || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.data ? `${row.data.startTime} - ${row.data.endTime}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {row.data?.room || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.data?.teacherName || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* pengumuman kelas & admin */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Pengumuman Kelas</h2>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {classAnnouncements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Kosong</p>
            ) : (
              classAnnouncements.map(item => (
                <div key={item.id} className="border-l-4 border-blue-500 bg-blue-50/30 p-3 rounded-r">
                  <p className="font-medium text-sm text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-purple-600" />
            <h2 className="font-semibold text-gray-800">Pengumuman Admin</h2>
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {pengumumanAdmin.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Kosong</p>
            ) : (
              pengumumanAdmin.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm text-gray-800">{item.title}</p>
                    {item.imageDataUrl && (
                      <ImageIcon className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{item.message}</p>
                  {item.imageDataUrl && (
                    <button
                      onClick={() => setPreviewImage({ src: item.imageDataUrl!, title: item.title })}
                      className="mt-2 block"
                    >
                      <img 
                        src={item.imageDataUrl} 
                        alt="" 
                        className="w-32 h-20 object-cover rounded border border-gray-200"
                      />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* daftar guru */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <h2 className="font-semibold text-gray-800">Daftar Guru</h2>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-3 py-2 w-12">No</th>
                <th className="px-3 py-2 w-12">Foto</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2 w-40">Mapel</th>
                <th className="px-3 py-2">Kelas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daftarGuru.map((guru, i) => (
                <tr key={guru.id}>
                  <td className="px-3 py-3 text-gray-600">{i + 1}</td>
                  <td className="px-3 py-3">
                    {guru.avatar ? (
                      <img src={guru.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                        {guru.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-800">{guru.name}</td>
                  <td className="px-3 py-3 text-gray-600">{guru.subject}</td>
                  <td className="px-3 py-3 text-gray-600">{guru.kelasAjar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* image preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage.src}
            alt={previewImage.title}
            className="max-h-[90vh] max-w-full rounded"
          />
        </div>
      )}
    </div>
  );
}