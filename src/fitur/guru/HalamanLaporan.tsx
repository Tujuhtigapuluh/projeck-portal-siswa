import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTeachers, getClasses, getStudentsByClass, getAttendanceByDateRange } from '../../data/store';
import { FileText, Download, Filter } from 'lucide-react';

export default function ReportPage() {
  const { user } = useAuth();
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = today.toISOString().split('T')[0];

  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  const teacher = useMemo(() => getTeachers().find(t => t.id === user?.id), [user]);
  const classes = useMemo(() => getClasses().filter(c => teacher?.classIds.includes(c.id)), [teacher]);

  const reportData = useMemo(() => {
    if (!selectedClass) return [];
    const students = getStudentsByClass(selectedClass).sort((a, b) => a.name.localeCompare(b.name));
    const attendance = getAttendanceByDateRange(startDate, endDate, selectedClass);

    return students.map(student => {
      const studentAtt = attendance.filter(a => a.studentId === student.id);
      const hadir = studentAtt.filter(a => a.status === 'hadir').length;
      const izin = studentAtt.filter(a => a.status === 'izin').length;
      const sakit = studentAtt.filter(a => a.status === 'sakit').length;
      const alpha = studentAtt.filter(a => a.status === 'alpha').length;
      const total = hadir + izin + sakit + alpha;
      const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;

      const dailyStatus: Record<string, string> = {};
      studentAtt.forEach(a => { dailyStatus[a.date] = a.status; });

      return {
        ...student,
        hadir,
        izin,
        sakit,
        alpha,
        total,
        percentage,
        dailyStatus,
      };
    });
  }, [selectedClass, startDate, endDate]);

  const dates = useMemo(() => {
    if (!selectedClass) return [];
    const attendance = getAttendanceByDateRange(startDate, endDate, selectedClass);
    return [...new Set(attendance.map(a => a.date))].sort();
  }, [selectedClass, startDate, endDate]);

  const overallStats = useMemo(() => {
    const total = reportData.reduce((acc, s) => acc + s.total, 0);
    const hadir = reportData.reduce((acc, s) => acc + s.hadir, 0);
    const izin = reportData.reduce((acc, s) => acc + s.izin, 0);
    const sakit = reportData.reduce((acc, s) => acc + s.sakit, 0);
    const alpha = reportData.reduce((acc, s) => acc + s.alpha, 0);
    return { total, hadir, izin, sakit, alpha, percentage: total > 0 ? Math.round((hadir / total) * 100) : 0 };
  }, [reportData]);

  const statusColor = (status: string) => {
    switch (status) {
      case 'hadir': return 'bg-green-100 text-green-700';
      case 'izin': return 'bg-yellow-100 text-yellow-700';
      case 'sakit': return 'bg-orange-100 text-orange-700';
      case 'alpha': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-50 text-gray-400';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'hadir': return 'H';
      case 'izin': return 'I';
      case 'sakit': return 'S';
      case 'alpha': return 'A';
      default: return '-';
    }
  };

  const handleExportCSV = () => {
    if (reportData.length === 0) return;
    const className = classes.find(c => c.id === selectedClass)?.name || '';
    const headers = ['No', 'Nama', 'NIS', 'Hadir', 'Izin', 'Sakit', 'Alpha', 'Total', 'Persentase'];
    const rows = reportData.map((s, i) => [
      i + 1, s.name, s.nis, s.hadir, s.izin, s.sakit, s.alpha, s.total, `${s.percentage}%`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Absensi_${className}_${startDate}_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Absensi</h1>
		<p className="text-sm text-gray-500 mt-1">
        Rekap kehadiran siswa per kelas</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filter Laporan</span>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kelas</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-w-[150px]"
            >
              <option value="">Pilih Kelas</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          {reportData.length > 0 && (
            <button onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium ml-auto">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {!selectedClass ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">Pilih kelas untuk melihat laporan</p>
        </div>
      ) : (
        <>
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
              <p className="text-2xl font-bold text-blue-700">{overallStats.total}</p>
              <p className="text-xs text-blue-500">Total Record</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
              <p className="text-2xl font-bold text-green-700">{overallStats.hadir}</p>
              <p className="text-xs text-green-500">Hadir</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
              <p className="text-2xl font-bold text-yellow-700">{overallStats.izin}</p>
              <p className="text-xs text-yellow-500">Izin</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
              <p className="text-2xl font-bold text-orange-700">{overallStats.sakit}</p>
              <p className="text-xs text-orange-500">Sakit</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
              <p className="text-2xl font-bold text-red-700">{overallStats.alpha}</p>
              <p className="text-xs text-red-500">Alpha</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
              <p className="text-2xl font-bold text-indigo-700">{overallStats.percentage}%</p>
              <p className="text-xs text-indigo-500">Kehadiran</p>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">Rekap Kehadiran</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 w-10">No</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">Nama</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 w-20">NIS</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-green-600 w-10">H</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-yellow-600 w-10">I</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-orange-600 w-10">S</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-red-600 w-10">A</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 w-10">Jml</th>
                    <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 w-16">%</th>
                    {dates.map(d => (
                      <th key={d} className="text-center px-1 py-2 text-[10px] font-medium text-gray-500 w-8">
                        {new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((student, idx) => (
                    <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-800 whitespace-nowrap">{student.name}</td>
                      <td className="px-3 py-2 text-xs text-gray-500">{student.nis}</td>
                      <td className="text-center px-3 py-2 text-sm font-semibold text-green-600">{student.hadir}</td>
                      <td className="text-center px-3 py-2 text-sm font-semibold text-yellow-600">{student.izin}</td>
                      <td className="text-center px-3 py-2 text-sm font-semibold text-orange-600">{student.sakit}</td>
                      <td className="text-center px-3 py-2 text-sm font-semibold text-red-600">{student.alpha}</td>
                      <td className="text-center px-3 py-2 text-sm text-gray-600">{student.total}</td>
                      <td className="text-center px-3 py-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          student.percentage >= 80 ? 'bg-green-100 text-green-700' :
                          student.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.percentage}%
                        </span>
                      </td>
                      {dates.map(d => (
                        <td key={d} className="text-center px-1 py-2">
                          <span className={`text-[10px] font-bold w-6 h-6 inline-flex items-center justify-center rounded ${statusColor(student.dailyStatus[d] || '')}`}>
                            {statusLabel(student.dailyStatus[d] || '')}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
