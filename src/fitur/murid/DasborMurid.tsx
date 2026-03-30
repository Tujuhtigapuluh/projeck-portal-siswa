import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Calendar,
  User,
  BookOpen,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useStoreVersion } from '../../hooks/useStoreVersion';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Types
interface PreviewImageState {
  src: string;
  title: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState(() => new Date().getDay());
  const [previewImage, setPreviewImage] = useState<PreviewImageState | null>(null);

  // Auto update day at midnight
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

  // Data memoization
  const student = useMemo(() => 
    getStudents().find(s => s.id === user?.id), 
    [user, storeVersion]
  );

  const studentInitial = useMemo(() => 
    (student?.name || '?').charAt(0).toUpperCase(),
    [student]
  );

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

  // Statistics
  const stats = useMemo(() => {
    const hadir = allAttendance.filter(a => a.status === 'hadir').length;
    const izin = allAttendance.filter(a => a.status === 'izin').length;
    const sakit = allAttendance.filter(a => a.status === 'sakit').length;
    const alpha = allAttendance.filter(a => a.status === 'alpha').length;
    const total = hadir + izin + sakit + alpha;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { hadir, izin, sakit, alpha, total, percentage };
  }, [allAttendance]);

  // Today's roster
  const todayRosters = useMemo(() => 
    classRosters
      .filter(item => item.dayOfWeek === currentDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [classRosters, currentDayOfWeek]
  );

  const todayRosterRows = useMemo(() => {
    if (currentDayOfWeek === 0) return [];
    const minimumPeriods = 6;
    const totalRows = Math.max(minimumPeriods, todayRosters.length);
    return Array.from({ length: totalRows }, (_, index) => ({
      periodLabel: `${index + 1}`,
      roster: todayRosters[index],
    }));
  }, [todayRosters, currentDayOfWeek]);

  // Handlers
  const handleClosePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  const handleKeyDownPreview = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      setPreviewImage(null);
    }
  }, []);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500">Data siswa tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Card - Profil & Ringkasan */}
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold backdrop-blur-sm border border-white/30">
            {studentInitial}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-emerald-100 mt-1 flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 px-2 py-0.5 rounded text-sm">NIS: {student.nis}</span>
              <span>•</span>
              <span>Kelas {className}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <p className="text-3xl font-bold">{stats.percentage}%</p>
            <p className="text-sm text-emerald-100 mt-1">Kehadiran</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <p className="text-3xl font-bold text-green-300">{stats.hadir}</p>
            <p className="text-sm text-emerald-100 mt-1">Hadir</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-emerald-100 mt-1">Total Hari</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
            <p className="text-3xl font-bold text-red-300">{stats.alpha}</p>
            <p className="text-sm text-emerald-100 mt-1">Alpha</p>
          </div>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.hadir}</p>
            <p className="text-sm text-gray-500">Hadir</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.izin}</p>
            <p className="text-sm text-gray-500">Izin</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.sakit}</p>
            <p className="text-sm text-gray-500">Sakit</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.alpha}</p>
            <p className="text-sm text-gray-500">Alpha</p>
          </div>
        </div>
      </div>

      {/* Main Content - Roster Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 text-lg">Jadwal Pelajaran Hari Ini</h2>
                <p className="text-sm text-gray-500">
                  {dayNames[currentDayOfWeek]}, {new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              Auto-refresh pukul 00:00
            </span>
          </div>
        </div>

        <div className="p-5">
          {currentDayOfWeek === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Hari ini hari Minggu</p>
              <p className="text-sm text-gray-400 mt-1">Tidak ada jadwal pelajaran</p>
            </div>
          ) : todayRosters.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Belum ada jadwal untuk hari ini</p>
              <p className="text-sm text-gray-400 mt-1">Silakan hubungi admin untuk informasi lebih lanjut</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 rounded-tl-lg w-20">
                      JP
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                      Mata Pelajaran
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-40">
                      Waktu
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-32">
                      Ruang
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 rounded-tr-lg">
                      Guru Pengajar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {todayRosterRows.map((row, index) => (
                    <tr 
                      key={`${currentDayOfWeek}-${row.periodLabel}`}
                      className={!row.roster ? 'bg-gray-50/50' : 'hover:bg-gray-50/80 transition-colors'}
                    >
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                          row.roster 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {row.periodLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {row.roster ? (
                          <div>
                            <p className="font-semibold text-gray-800">{row.roster.subject}</p>
                            <p className="text-xs text-gray-500 mt-0.5">JP {row.periodLabel}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {row.roster ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{row.roster.startTime} - {row.roster.endTime}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {row.roster ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium">
                            {row.roster.room}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {row.roster ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                              {(row.roster.teacherName || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {row.roster.teacherName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout - Announcements & Teachers */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Class Announcements */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Pengumuman Kelas</h2>
                <p className="text-xs text-gray-500">{classAnnouncements.length} pengumuman</p>
              </div>
            </div>
          </div>
          
          <div className="p-5 max-h-[400px] overflow-y-auto">
            {classAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Belum ada pengumuman</p>
              </div>
            ) : (
              <div className="space-y-4">
                {classAnnouncements.map(item => (
                  <div 
                    key={item.id} 
                    className="border-l-4 border-blue-500 bg-blue-50/30 p-4 rounded-r-lg"
                  >
                    <h3 className="font-semibold text-gray-800 text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Announcements */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Pengumuman Admin Sekolah</h2>
                <p className="text-xs text-gray-500">Informasi resmi dari pihak sekolah</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {pengumumanAdmin.length === 0 ? (
              <div className="text-center py-8">
                <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Belum ada pengumuman admin</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pengumumanAdmin.map((item) => (
                  <article 
                    key={item.id} 
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                      {item.imageDataUrl && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md">
                          <ImageIcon className="w-3 h-3" />
                          Ada foto
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mt-3 leading-relaxed">{item.message}</p>
                    
                    {item.imageDataUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ 
                          src: item.imageDataUrl || '', 
                          title: item.title 
                        })}
                        className="mt-3 block w-full sm:w-auto overflow-hidden rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                      >
                        <img
                          src={item.imageDataUrl}
                          alt={item.imageName || item.title}
                          className="w-full sm:w-48 h-32 object-cover"
                        />
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Teachers List - Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">Daftar Guru Sekolah</h2>
              <p className="text-sm text-gray-500">Total {daftarGuru.length} guru pengajar</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 rounded-tl-lg w-16">
                    No
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-20">
                    Foto
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3">
                    Nama Guru
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 w-48">
                    Mata Pelajaran
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-3 rounded-tr-lg">
                    Kelas Ajar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {daftarGuru.map((guru, index) => (
                  <tr key={guru.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
                      {guru.avatar ? (
                        <img
                          src={guru.avatar}
                          alt={`Foto ${guru.name}`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                          {(guru.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800">{guru.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-sm font-medium">
                        {guru.subject}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {guru.kelasAjar}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {daftarGuru.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Belum ada data guru</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          role="button"
          tabIndex={0}
          onClick={handleClosePreview}
          onKeyDown={handleKeyDownPreview}
        >
          <button
            onClick={handleClosePreview}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white mt-4 text-lg font-medium">{previewImage.title}</p>
            <p className="text-gray-400 text-sm mt-1">Klik dimana saja untuk menutup</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Constants
const DEFAULT_AVATAR = '/default-avatar.png';