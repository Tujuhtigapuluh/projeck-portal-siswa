import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { GraduationCap, BookOpen, Eye, EyeOff, LogIn } from 'lucide-react';
import PanelAdminModal from '../admin/PanelAdminModal';

const ADMIN_LOGIN = {
  teacher: { username: 'adm_guru', password: 'admin123' },
  student: { username: 'adm_siswa', password: 'admin123' },
} as const;

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>('teacher');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [openAdminPanel, setOpenAdminPanel] = useState(false);
  const [adminScope, setAdminScope] = useState<'teacher' | 'student'>('teacher');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (
      role === 'teacher'
      && id.trim() === ADMIN_LOGIN.teacher.username
      && password === ADMIN_LOGIN.teacher.password
    ) {
      setAdminScope('teacher');
      setOpenAdminPanel(true);
      setId('');
      setPassword('');
      return;
    }

    if (
      role === 'student'
      && id.trim() === ADMIN_LOGIN.student.username
      && password === ADMIN_LOGIN.student.password
    ) {
      setAdminScope('student');
      setOpenAdminPanel(true);
      setId('');
      setPassword('');
      return;
    }

    const success = login(id, password, role);
    if (!success) {
      setError('ID atau password salah. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <GraduationCap className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">Sistem Absensi</h1>
          <p className="text-blue-200 mt-1">SMA Negeri 1 Nusantara</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Role Selector */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setRole('teacher'); setId(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'teacher'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Guru
            </button>
            <button
              onClick={() => { setRole('student'); setId(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'student'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Siswa
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'teacher'
                  ? 'NIP (Nomor Induk Pegawai) atau User Admin Guru'
                  : 'NIS (Nomor Induk Siswa) atau User Admin Siswa'}
              </label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                  placeholder={role === 'teacher' ? 'Masukkan NIP atau adm_guru' : 'Masukkan NIS atau adm_siswa'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl ${
                role === 'teacher'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <LogIn className="w-5 h-5" />
              Masuk sebagai {role === 'teacher' ? 'Guru' : 'Siswa'}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs font-semibold text-amber-700 mb-2">Demo Akun:</p>
            <div className="text-xs text-amber-600 space-y-1">
              <p><strong>Guru:</strong> NIP: 198501012010011001 | Kata Sandi: guru123</p>
              <p><strong>Siswa:</strong> NIS: 2024001 | Kata Sandi: siswa123</p>
              <p><strong>Admin Guru:</strong> Pengguna: adm_guru | Kata Sandi: admin123</p>
              <p><strong>Admin Siswa:</strong> Pengguna: adm_siswa | Kata Sandi: admin123</p>
            </div>
          </div>
        </div>
      </div>

      <PanelAdminModal
        open={openAdminPanel}
        onClose={() => setOpenAdminPanel(false)}
        scope={adminScope}
        preAuthorized
      />
    </div>
  );
}
