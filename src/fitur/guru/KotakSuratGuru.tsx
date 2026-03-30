import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents, getSuratIzin, getTeachers, updateStatusSuratIzin } from '../../data/store';
import { useStoreVersion } from '../../hooks/useStoreVersion';
import { Calendar, ChevronLeft, ChevronRight, MailOpen } from 'lucide-react';

type LetterItem = ReturnType<typeof getSuratIzin>[number] & { studentName: string; studentNis: string; className: string };

export default function KotakSuratGuru() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [selectedLetterId, setSelectedLetterId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'semua' | LetterItem['status']>('semua');
  const [showCalendar, setShowCalendar] = useState(false);

  const teacher = useMemo(() => getTeachers().find(item => item.id === user?.id), [user, storeVersion]);

  const letters = useMemo(() => {
    if (!teacher) return [];
    const students = getStudents();
    const classes = getClasses();
    return getSuratIzin()
      .filter(item => teacher.classIds.includes(item.classId))
      .map(item => {
        const student = students.find(row => row.id === item.studentId);
        const className = classes.find(row => row.id === item.classId)?.name || '-';
        return {
          ...item,
          studentName: student?.name || 'Siswa tidak ditemukan',
          studentNis: student?.nis || '-',
          className,
        };
      });
  }, [teacher, storeVersion]);

  const filteredLetters = useMemo(() => {
    return letters.filter(item => {
      const dateMatch = selectedDate ? item.letterDate === selectedDate : true;
      const statusMatch = selectedStatus === 'semua' ? true : item.status === selectedStatus;
      return dateMatch && statusMatch;
    });
  }, [letters, selectedDate, selectedStatus]);

  const selectedLetter = useMemo(
    () => filteredLetters.find(item => item.id === selectedLetterId) || null,
    [filteredLetters, selectedLetterId],
  );

  const monthLabel = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  const calendarData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const monthLetters = letters.filter(item => item.letterDate.startsWith(selectedMonth));
    const countMap: Record<string, number> = {};
    monthLetters.forEach(item => {
      countMap[item.letterDate] = (countMap[item.letterDate] || 0) + 1;
    });

    const weeks: { day: number; date: string; count: number }[][] = [];
    let currentWeek: { day: number; date: string; count: number }[] = [];

    for (let i = 0; i < startWeekday; i += 1) {
      currentWeek.push({ day: 0, date: '', count: 0 });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      currentWeek.push({ day, date, count: countMap[date] || 0 });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push({ day: 0, date: '', count: 0 });
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return { weeks, monthLettersCount: monthLetters.length };
  }, [letters, selectedMonth]);

  const navigateMonth = (offset: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const next = new Date(year, month - 1 + offset, 1);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
    setSelectedDate(null);
  };

  const typeLabel: Record<LetterItem['type'], string> = {
    izin: 'Izin',
    sakit: 'Sakit',
    dispensasi: 'Dispensasi',
    lainnya: 'Lainnya',
  };

  const statusLabel: Record<LetterItem['status'], string> = {
    menunggu: 'Menunggu',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
  };

  const statusStyle: Record<LetterItem['status'], string> = {
    menunggu: 'bg-amber-100 text-amber-700',
    disetujui: 'bg-emerald-100 text-emerald-700',
    ditolak: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Kotak Surat Siswa</h1>
        <p className="text-gray-500">Lihat surat izin/sakit siswa sesuai kelas yang Anda ajar.</p>
      </div>

      <section className="relative bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-gray-700 mr-1">Filter Status:</p>
          <button
            onClick={() => {
              setSelectedStatus('semua');
              setSelectedLetterId('');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              selectedStatus === 'semua' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua
          </button>
          {(['menunggu', 'disetujui', 'ditolak'] as const).map(status => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setSelectedLetterId('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                selectedStatus === status
                  ? status === 'menunggu'
                    ? 'bg-amber-600 text-white'
                    : status === 'disetujui'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statusLabel[status]}
            </button>
          ))}

          <div className="ml-auto relative">
            <button
              onClick={() => setShowCalendar(current => !current)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              Kalender Surat
            </button>

            {showCalendar && (
              <div className="absolute right-0 mt-2 w-[310px] bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-800 text-sm">Kalender Surat</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs font-medium min-w-[120px] text-center">{monthLabel}</span>
                    <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                    <div key={day} className="text-center text-[10px] font-semibold text-gray-400 py-1">{day}</div>
                  ))}
                </div>

                <div className="space-y-1">
                  {calendarData.weeks.map((week, weekIndex) => (
                    <div key={`${selectedMonth}_${weekIndex}`} className="grid grid-cols-7 gap-1">
                      {week.map((day, dayIndex) => (
                        <button
                          key={`${day.date}_${dayIndex}`}
                          disabled={day.day === 0}
                          onClick={() => {
                            setSelectedDate(day.date || null);
                            setSelectedLetterId('');
                            setShowCalendar(false);
                          }}
                          className={`relative aspect-square rounded-md text-[11px] font-semibold ${
                            day.day === 0
                              ? 'bg-transparent'
                              : selectedDate === day.date
                                ? 'ring-2 ring-blue-500 ring-offset-1 bg-blue-50 text-blue-700'
                                : day.count > 0
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          {day.day > 0 ? day.day : ''}
                          {day.count > 0 && (
                            <span className="absolute right-1 top-1 text-[9px] font-bold">{day.count}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                  <span>Total surat bulan ini</span>
                  <strong>{calendarData.monthLettersCount}</strong>
                </div>
                {selectedDate && (
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedLetterId('');
                      setShowCalendar(false);
                    }}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    Hapus filter tanggal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {(selectedDate || selectedStatus !== 'semua') && (
          <p className="text-xs text-gray-500 mt-2">
            Filter aktif:
            {' '}
            {selectedDate ? `Tanggal ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString('id-ID')}` : 'Semua tanggal'}
            {' | '}
            Status {selectedStatus === 'semua' ? 'Semua' : statusLabel[selectedStatus]}
          </p>
        )}
      </section>

      <div className="grid xl:grid-cols-[320px_1fr] gap-6">
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h2 className="font-semibold text-gray-800">Daftar Surat</h2>
          <div className="mt-3 space-y-2 max-h-[680px] overflow-y-auto pr-1">
            {filteredLetters.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedLetterId(item.id)}
                className={`w-full text-left border rounded-lg p-3 transition ${
                  selectedLetterId === item.id ? 'border-blue-500 bg-blue-50/60' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <p className="text-sm font-semibold text-gray-800">{item.studentName}</p>
                <p className="text-xs text-gray-500 mt-1">{item.studentNis} | {item.className}</p>
                <p className="text-xs text-gray-500 mt-1">{typeLabel[item.type]} - {item.subject}</p>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[item.status]}`}>
                    {statusLabel[item.status]}
                  </span>
                </p>
              </button>
            ))}
            {filteredLetters.length === 0 && <p className="text-sm text-gray-500">Belum ada surat pada filter ini.</p>}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          {!selectedLetter && (
            <div className="h-full min-h-[280px] flex items-center justify-center text-center text-gray-500">
              <div>
                <MailOpen className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p>Klik nama siswa di daftar surat untuk melihat isi surat.</p>
              </div>
            </div>
          )}

          {selectedLetter && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-semibold text-gray-800">{selectedLetter.subject}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedLetter.studentName} ({selectedLetter.studentNis}) | {selectedLetter.className}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Jenis: {typeLabel[selectedLetter.type]} | Tanggal surat: {new Date(`${selectedLetter.letterDate}T00:00:00`).toLocaleDateString('id-ID')} | Dikirim: {new Date(selectedLetter.createdAt).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-line">{selectedLetter.message}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Lampiran: {selectedLetter.attachmentName || '-'}</p>
                {selectedLetter.attachmentDataUrl && (
                  <a
                    href={selectedLetter.attachmentDataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Buka lampiran
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Status Persetujuan Surat</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatusSuratIzin(selectedLetter.id, 'menunggu')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedLetter.status === 'menunggu'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    Set Menunggu
                  </button>
                  <button
                    onClick={() => updateStatusSuratIzin(selectedLetter.id, 'disetujui')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedLetter.status === 'disetujui'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Set Disetujui
                  </button>
                  <button
                    onClick={() => updateStatusSuratIzin(selectedLetter.id, 'ditolak')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedLetter.status === 'ditolak'
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    Set Ditolak
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}