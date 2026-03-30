import { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getClassRosters, getClasses, getStudents } from '../../data/store';
import { useStoreVersion } from '../../hooks/useStoreVersion';

const schoolDays = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
];

function getDefaultDay() {
  const today = new Date().getDay();
  return today >= 1 && today <= 6 ? today : 1;
}

export default function RosterPage() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [selectedDay, setSelectedDay] = useState(getDefaultDay);

  const student = useMemo(() => getStudents().find(s => s.id === user?.id), [user, storeVersion]);
  const classRoom = useMemo(() => {
    if (!student) return undefined;
    return getClasses().find(c => c.id === student.classId);
  }, [student, storeVersion]);

  const classRosters = useMemo(() => {
    if (!student) return [];
    return getClassRosters(student.classId).filter(item => item.dayOfWeek >= 1 && item.dayOfWeek <= 6);
  }, [student, storeVersion]);

  const selectedDayRosters = useMemo(
    () => classRosters
      .filter(item => item.dayOfWeek === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [classRosters, selectedDay],
  );

  const selectedDayTableRows = useMemo(() => {
    const minimumPeriods = 6;
    const totalRows = Math.max(minimumPeriods, selectedDayRosters.length);
    return Array.from({ length: totalRows }, (_, index) => ({
      periodLabel: `JP-${index + 1}`,
      roster: selectedDayRosters[index],
    }));
  }, [selectedDayRosters]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Roster Kelas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Jadwal pelajaran kelas {classRoom?.name || '-'} dari Senin sampai Sabtu. Akan otomatis terupdate ketika guru mengubah roster kelas.
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {schoolDays.map(day => (
            <button
              key={day.value}
              onClick={() => setSelectedDay(day.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDay === day.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-gray-800">
            Daftar Mata Pelajaran {schoolDays.find(day => day.value === selectedDay)?.label}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 w-24">JP</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200">Mata Pelajaran</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 w-44">Jam</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 w-40">Ruang</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-3 py-2 border-b border-gray-200 w-56">Guru</th>
              </tr>
            </thead>
            <tbody>
              {selectedDayTableRows.map(row => (
                <tr key={`${selectedDay}-${row.periodLabel}`}>
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
      </div>
    </div>
  );
}