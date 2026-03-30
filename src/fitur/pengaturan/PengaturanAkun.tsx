import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStudents, getTeachers, saveStudents, saveTeachers } from '../../data/store';
import { useStoreVersion } from '../../hooks/useStoreVersion';

export default function PengaturanAkun() {
  const { user, refreshUser } = useAuth();
  const storeVersion = useStoreVersion();
  const MIN_PASSWORD_LENGTH = 8;

  const teacher = useMemo(() => getTeachers().find(item => item.id === user?.id), [user, storeVersion]);
  const student = useMemo(() => getStudents().find(item => item.id === user?.id), [user, storeVersion]);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validatePassword = () => {
    if (!password) {
      setError('Kata sandi tidak boleh kosong.');
      return false;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return false;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak sama.');
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (user?.role === 'teacher' && teacher) {
      setIdentifier(teacher.nip);
      setPassword(teacher.password);
      setConfirmPassword(teacher.password);
      return;
    }
    if (user?.role === 'student' && student) {
      setIdentifier(student.nis);
      setPassword(student.password);
      setConfirmPassword(student.password);
    }
  }, [user, teacher, student]);

  if (!user) return null;

  const handleSaveTeacher = () => {
    if (!teacher) return;
    const nextNip = identifier.trim();
    if (!nextNip) {
      setError('NIP tidak boleh kosong.');
      return;
    }
    if (!validatePassword()) {
      return;
    }

    const teachers = getTeachers();
    const usedByOtherTeacher = teachers.some(item => item.id !== teacher.id && item.nip === nextNip);
    if (usedByOtherTeacher) {
      setError('NIP sudah digunakan guru lain.');
      return;
    }

    const nextTeachers = teachers.map(item => (
      item.id === teacher.id
        ? { ...item, nip: nextNip, password }
        : item
    ));

    saveTeachers(nextTeachers);
    refreshUser();
    setError('');
    setMessage('Pengaturan akun guru berhasil diperbarui. Data admin ikut terbarui otomatis.');
  };

  const handleSaveStudent = () => {
    if (!student) return;
    const nextNis = identifier.trim();
    if (!nextNis) {
      setError('NIS tidak boleh kosong.');
      return;
    }
    if (!validatePassword()) {
      return;
    }

    const students = getStudents();
    const usedByOtherStudent = students.some(item => item.id !== student.id && item.nis === nextNis);
    if (usedByOtherStudent) {
      setError('NIS sudah digunakan siswa lain.');
      return;
    }

    const nextStudents = students.map(item => (
      item.id === student.id
        ? { ...item, nis: nextNis, password }
        : item
    ));

    saveStudents(nextStudents);
    refreshUser();
    setError('');
    setMessage('Pengaturan akun siswa berhasil diperbarui. Data admin ikut terbarui otomatis.');
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ubah {user.role === 'teacher' ? 'NIP' : 'NIS'} dan kata sandi akun Anda.
        </p>
      </div>

      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {user.role === 'teacher' ? 'NIP Baru' : 'NIS Baru'}
          </label>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi Baru</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setMessage('');
                setError('');
              }}
              className="w-full px-3 py-2 pr-11 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Minimal {MIN_PASSWORD_LENGTH} karakter.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Kata Sandi</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setMessage('');
                setError('');
              }}
              className="w-full px-3 py-2 pr-11 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
              aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Tampilkan konfirmasi kata sandi'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <button
          onClick={user.role === 'teacher' ? handleSaveTeacher : handleSaveStudent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Save className="w-4 h-4" /> Simpan Pengaturan
        </button>
      </section>
    </div>
  );
}
