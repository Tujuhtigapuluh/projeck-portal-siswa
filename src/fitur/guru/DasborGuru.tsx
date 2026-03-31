import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAttendance,
  getClasses,
  getPengumumanAdminUntukGuru,
  getStudents,
  getTeachers,
} from '../../data/store';
import { AlertCircle, CheckCircle, Clock, TrendingUp, Users, XCircle } from 'lucide-react';
import { useStoreVersion } from '../../hooks/useStoreVersion';

export default function DasborGuru() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);

  const stats = useMemo(() => {
    const teacher = getTeachers().find(t => t.id === user?.id);
    const classes = getClasses().filter(c => teacher?.classIds.includes(c.id));
    const classIds = classes.map(c => c.id);
    const students = getStudents().filter(s => classIds.includes(s.classId));
    const allAttendance = getAttendance().filter(a => classIds.includes(a.classId));

    const today = new Date().toISOString().split('T')[0];
    const todayAtt = allAttendance.filter(a => a.date === today);

    const totalStudents = students.length;
    const todayHadir = todayAtt.filter(a => a.status === 'hadir').length;
    const todayIzin = todayAtt.filter(a => a.status === 'izin').length;
    const todaySakit = todayAtt.filter(a => a.status === 'sakit').length;
    const todayAlpha = todayAtt.filter(a => a.status === 'alpha').length;
    const todayBelum = totalStudents - todayAtt.length;

    const last7Days: { date: string; percentage: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayAtt = allAttendance.filter(a => a.date === ds);
      const dayHadir = dayAtt.filter(a => a.status === 'hadir').length;
      const pct = dayAtt.length > 0 ? Math.round((dayHadir / dayAtt.length) * 100) : 0;
      last7Days.push({
        date: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' }),
        percentage: pct,
      });
    }

    const classStats = classes.map(cls => {
      const clsStudents = students.filter(s => s.classId === cls.id);
      const clsToday = todayAtt.filter(a => a.classId === cls.id);
      const clsHadir = clsToday.filter(a => a.status === 'hadir').length;
      return {
        ...cls,
        totalStudents: clsStudents.length,
        todayPresent: clsHadir,
        todayRecorded: clsToday.length,
      };
    });

    return {
      totalStudents,
      todayHadir,
      todayIzin,
      todaySakit,
      todayAlpha,
      todayBelum,
      last7Days,
      classStats,
    };
  }, [user, storeVersion]);

  const maxBar = Math.max(...stats.last7Days.map(d => d.percentage), 1);
  const pengumumanAdmin = useMemo(() => {
    const teacher = getTeachers().find((item) => item.id === user?.id);
    if (!teacher) return [];
    return getPengumumanAdminUntukGuru(teacher.classIds).slice(0, 5);
  }, [user, storeVersion]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Guru</h1>
		<p className="text-sm text-gray-500 mt-1">
        Selamat datang, {user?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              <p className="text-xs text-gray-500">Total Siswa</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.todayHadir}</p>
              <p className="text-xs text-gray-500">Hadir</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.todayIzin}</p>
              <p className="text-xs text-gray-500">Izin</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.todaySakit}</p>
              <p className="text-xs text-gray-500">Sakit</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.todayAlpha}</p>
              <p className="text-xs text-gray-500">Alpha</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-500">{stats.todayBelum}</p>
              <p className="text-xs text-gray-500">Belum Absen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-800">Tren Kehadiran 7 Hari</h2>
          </div>
          <div className="flex items-end justify-between gap-2 h-40">
            {stats.last7Days.map(day => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{day.percentage}%</span>
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all"
                    style={{ height: `${maxBar > 0 ? (day.percentage / maxBar) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Ringkasan per Kelas</h2>
          <div className="space-y-3">
            {stats.classStats.map(cls => {
              const pct = cls.totalStudents > 0 ? Math.round((cls.todayPresent / cls.totalStudents) * 100) : 0;
              return (
                <div key={cls.id} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-semibold text-gray-700">{cls.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      {pct > 20 && <span className="text-xs text-white font-medium">{pct}%</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 w-24 text-right">
                    {cls.todayRecorded}/{cls.totalStudents} absen
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-900 font-medium">Pengaturan kelas sudah dipisah ke menu guru:</p>
        <p className="text-sm text-blue-700 mt-1">Gunakan menu Atur Roster, Atur Pengumuman, dan Atur Tugas Online di sidebar.</p>
      </div>

      <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-800">Pengumuman Admin Sekolah</h2>
        <p className="text-xs text-gray-500 mt-1">Pengumuman resmi dari admin sekolah untuk guru dan siswa.</p>
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