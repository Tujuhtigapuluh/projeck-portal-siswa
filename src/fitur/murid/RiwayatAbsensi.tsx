import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAttendanceByStudent } from '../../data/store';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStoreVersion } from '../../hooks/useStoreVersion';

export default function HistoryPage() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const allAttendance = useMemo(() => {
    if (!user) return [];
    return getAttendanceByStudent(user.id).sort((a, b) => b.date.localeCompare(a.date));
  }, [user, storeVersion]);

  const calendarData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const monthAttendance = allAttendance.filter(a => a.date.startsWith(selectedMonth));
    const attendanceMap: Record<string, (typeof monthAttendance)[number]> = {};
    monthAttendance.forEach(record => {
      attendanceMap[record.date] = record;
    });

    const weeks: { day: number; date: string; record?: (typeof monthAttendance)[number] }[][] = [];
    let currentWeek: { day: number; date: string; record?: (typeof monthAttendance)[number] }[] = [];

    for (let i = 0; i < startWeekday; i += 1) {
      currentWeek.push({ day: 0, date: '' });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      currentWeek.push({ day, date, record: attendanceMap[date] });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push({ day: 0, date: '' });
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return { weeks, monthAttendance };
  }, [allAttendance, selectedMonth]);

  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const selectedRecord = useMemo(() => {
    if (!selectedDate) return null;
    return allAttendance.find(item => item.date === selectedDate) || null;
  }, [allAttendance, selectedDate]);

  const navigateMonth = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const next = new Date(year, month - 1 + offset, 1);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    setSelectedDate(null);
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'hadir': return 'Masuk (Hadir)';
      case 'izin': return 'Izin';
      case 'sakit': return 'Sakit';
      case 'alpha': return 'Alpha';
      default: return '-';
    }
  };

  const statusClasses = (status?: string) => {
    switch (status) {
      case 'hadir': return 'bg-green-500 text-white';
      case 'izin': return 'bg-yellow-400 text-white';
      case 'sakit': return 'bg-orange-400 text-white';
      case 'alpha': return 'bg-red-500 text-white';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Riwayat Absensi</h1>
        <p className="text-gray-500">Klik tanggal pada kalender untuk melihat catatan absensi harian.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-2">Info Catatan Kehadiran</h2>
          {!selectedDate && (
            <p className="text-sm text-gray-500">Pilih tanggal pada kalender di sebelah kanan untuk melihat detail absensi.</p>
          )}
          {selectedDate && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 font-medium">
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {selectedRecord ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Status Kehadiran</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{statusLabel(selectedRecord.status)}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Waktu Dicatat</p>
                      <p className="text-sm font-semibold text-gray-800 mt-1">{new Date(selectedRecord.timestamp).toLocaleTimeString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Catatan Guru</p>
                    <p className="text-sm text-gray-700 mt-1">{selectedRecord.note || '-'}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada catatan absensi pada tanggal ini.</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h2 className="font-semibold text-gray-800 text-sm">Kalender</h2>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-gray-700 min-w-[120px] text-center">{monthLabel}</span>
              <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-[10px] font-semibold text-gray-400 py-1">{day}</div>
            ))}
          </div>

          <div className="space-y-1">
            {calendarData.weeks.map((week, weekIndex) => (
              <div key={`${selectedMonth}-w-${weekIndex}`} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => (
                  <button
                    key={`${day.date}-${dayIndex}`}
                    disabled={day.day === 0}
                    onClick={() => setSelectedDate(day.date)}
                    className={`aspect-square rounded-lg text-xs font-semibold transition ${
                      day.day === 0
                        ? 'bg-transparent'
                        : selectedDate === day.date
                          ? 'ring-2 ring-emerald-500 ring-offset-1'
                          : ''
                    } ${statusClasses(day.record?.status)}`}
                  >
                    {day.day > 0 ? day.day : ''}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 text-[10px] text-gray-500"><div className="w-2.5 h-2.5 rounded bg-green-500" /> Hadir</div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500"><div className="w-2.5 h-2.5 rounded bg-yellow-400" /> Izin</div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500"><div className="w-2.5 h-2.5 rounded bg-orange-400" /> Sakit</div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500"><div className="w-2.5 h-2.5 rounded bg-red-500" /> Alpha</div>
            <span className="text-[10px] text-gray-500 ml-auto">{calendarData.monthAttendance.length} catatan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
