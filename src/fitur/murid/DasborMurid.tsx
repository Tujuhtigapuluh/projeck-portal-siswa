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
  AlertCircle,
  CheckCircle,
  Clock,
  Megaphone,
  XCircle,
} from 'lucide-react';
import { useStoreVersion } from '../../hooks/useStoreVersion';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState(() => new Date().getDay());
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  useEffect(() => {
    let intervalId: number | undefined;
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timeout = window.setTimeout(() => {
      setCurrentDayOfWeek(new Date().getDay());
      intervalId = window.setInterval(() => {
        setCurrentDayOfWeek(new Date().getDay());
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      window.clearTimeout(timeout);
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
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
        .map(classId => classes.find(classItem => classItem.id === classId)?.name || '')
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

  const todayRosters = useMemo(
    () => classRosters
      .filter(item => item.dayOfWeek === currentDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [classRosters, currentDayOfWeek],
  );

  const todayRosterRows = useMemo(() => {
    if (currentDayOfWeek === 0) return [];
    const minimumPeriods = 6;
    const totalRows = Math.max(minimumPeriods, todayRosters.length);
    return Array.from({ length: totalRows }, (_, index) => ({
      periodLabel: `JP-${index + 1}`,
      roster: todayRosters[index],
    }));
  }, [todayRosters, currentDayOfWeek]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
            {student?.name.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold">{student?.name}</h1>
            <p className="text-emerald-100">NIS: {student?.nis} • Kelas {className}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.percentage}%</p>
            <p className="text-xs text-emerald-100">Kehadiran</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.hadir}</p>
            <p className="text-xs text-emerald-100">Total Hadir</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-emerald-100">Total Hari</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">{stats.hadir}</p>
            <p className="text-xs text-gray-500">Hadir</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-yellow-600">{stats.izin}</p>
            <p className="text-xs text-gray-500">Izin</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-orange-600">{stats.sakit}</p>
            <p className="text-xs text-gray-500">Sakit</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">{stats.alpha}</p>
            <p className="text-xs text-gray-500">Alpha</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="font-semibold text-gray-800">Roster Hari Ini</h2>
              <p className="text-xs text-gray-500 mt-1">
                Hari {dayNames[currentDayOfWeek]}. Jadwal akan berganti otomatis pukul 00:00.
              </p>
            </div>
          </div>
          <div className="max-h-[520px] overflow-y-auto pr-1">
            {currentDayOfWeek === 0 && (
              <p className="text-sm text-gray-400">Hari ini hari Minggu. Tidak ada jadwal pelajaran.</p>
            )}
            {currentDayOfWeek !== 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 w-24">JP</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200">Mata Pelajaran</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 w-44">Jam</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 w-36">Ruang</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 w-56">Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayRosterRows.map(row => (
                      <tr key={`${currentDayOfWeek}-${row.periodLabel}`}>
                        <td className="px-3 py-3 border-b border-gray-100 text-sm font-medium text-gray-700">
                          {row.periodLabel}
                        </td>
                        <td className="px-3 py-3 border-b border-gray-100 text-sm text-gray-700">
                          {row.roster?.subject || '-'}
                        </td>
                        <td className="px-3 py-3 border-b border-gray-100 text-sm text-gray-600">
                          {row.roster ? `${row.roster.startTime} - ${row.roster.endTime}` : '-'}
                        </td>
                        <td className="px-3 py-3 border-b border-gray-100 text-sm text-gray-600">
                          {row.roster?.room || '-'}
                        </td>
                        <td className="px-3 py-3 border-b border-gray-100 text-sm text-gray-600">
                          {row.roster?.teacherName || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {currentDayOfWeek !== 0 && todayRosters.length === 0 && (
              <p className="text-sm text-gray-400 mt-3">Belum ada roster untuk hari ini.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <h2 className="font-semibold text-gray-800">Pengumuman Kelas</h2>
          </div>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {classAnnouncements.map(item => (
              <div key={item.id} className="border-l-4 border-emerald-500 bg-emerald-50/40 px-3 py-2 rounded-r-lg">
                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
                <p className="text-sm text-gray-700 mt-1">{item.message}</p>
              </div>
            ))}
            {classAnnouncements.length === 0 && <p className="text-sm text-gray-400">Belum ada pengumuman.</p>}
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800">Pengumuman Admin Sekolah</h2>
        <p className="text-xs text-gray-500 mt-1">Informasi resmi sekolah dari admin. Dapat berupa teks dan foto.</p>
        <div className="space-y-3 mt-3">
          {pengumumanAdmin.map((item) => (
            <article key={item.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
              </div>
              <p className="text-sm text-gray-700 mt-1">{item.message}</p>
              {item.imageDataUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewImage({ src: item.imageDataUrl || '', title: item.title })}
                  className="mt-2 block w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50"
                >
                  <img
                    src={item.imageDataUrl}
                    alt={item.imageName || item.title}
                    className="w-full h-auto object-contain"
                  />
                </button>
              )}
            </article>
          ))}
          {pengumumanAdmin.length === 0 && <p className="text-sm text-gray-400">Belum ada pengumuman admin.</p>}
        </div>
      </section>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800">Daftar Guru Sekolah</h2>
        <p className="text-xs text-gray-500 mt-1">Daftar ini membantu siswa mengenal guru dan mata pelajaran yang diampu.</p>
        <div className="overflow-x-auto mt-3">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500 font-semibold w-16">No</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500 font-semibold w-24">Foto</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500 font-semibold">Nama Guru</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500 font-semibold">Mata Pelajaran</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500 font-semibold">Kelas Ajar</th>
              </tr>
            </thead>
            <tbody>
              {daftarGuru.map((guru, index) => (
                <tr key={guru.id}>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{index + 1}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    {guru.avatar ? (
                      <img
                        src={guru.avatar}
                        alt={`Foto ${guru.name}`}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                        {guru.name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-800 font-medium">{guru.name}</td>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{guru.subject}</td>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{guru.kelasAjar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 p-4"
          role="button"
          tabIndex={0}
          onClick={() => setPreviewImage(null)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
              setPreviewImage(null);
            }
          }}
        >
          <div className="h-full w-full flex items-center justify-center">
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="max-h-[92vh] max-w-[96vw] w-auto h-auto object-contain rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}