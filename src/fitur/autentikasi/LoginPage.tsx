import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { GraduationCap, BookOpen, Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react';
import PanelAdminModal from '../admin/PanelAdminModal';

const ADMIN_LOGIN = {
  teacher: { username: 'adm_guru', password: 'admin123' },
  student: { username: 'adm_siswa', password: 'admin123' },
} as const;

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [openAdminPanel, setOpenAdminPanel] = useState(false);
  const [adminScope, setAdminScope] = useState<'teacher' | 'student'>('teacher');

  const handleSelectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError('');
    setId('');
    setPassword('');
  };

  const handleBack = () => {
    setRole(null);
    setError('');
    setId('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!role) return;

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
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden p-4">
      {/* Background Image - Full Layar */}
      <img
        src="https://asset-2.tstatic.net/trends/foto/bank/images/SISWA-SMP-BAHAGIA.jpg"
        alt="Siswa SMP Bahagia"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-900/45" />

      {/* Tombol Back - Kiri Atas Layar */}
      {role !== null && (
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 z-20 p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors border border-white/30 backdrop-blur-sm"
          title="Kembali ke pilihan peran"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center mb-3 ${role === null ? 'h-48 w-48' : 'h-20 w-20'}`}>
            <img
              src="https://3.bp.blogspot.com/-ZjI34XOI__8/WuqXymwhbaI/AAAAAAAAAnk/dFmja9cDA4QIdkWahzFiKQwcPLBoM7GuwCLcBGAs/s1600/Logo%2BSMP%2B1%2Bmajenang.png"
              alt="Logo SMP 1 Majenang"
              className={`object-contain drop-shadow-2xl ${role === null ? 'h-44 w-44' : 'h-16 w-16'}`}
            />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-1">Portal Absensi</h1>
          <p className="text-white/90 text-sm drop-shadow-md">SMP 1 Majenang</p>
        </div>

        <div className="border-t border-blue-300/60 w-2/3 mx-auto mb-6" />

        {/* Container Tanpa Background Hitam */}
        <div className="rounded-2xl p-6">
          {role === null && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-5 md:flex-row md:gap-7">
                <button
                  onClick={() => handleSelectRole('teacher')}
                  className="flex items-center justify-center gap-2 px-4 py-3 w-40 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <BookOpen className="w-5 h-5" />
                  <span className="font-semibold text-sm text-center">Guru</span>
                </button>

                <button
                  onClick={() => handleSelectRole('student')}
                  className="flex items-center justify-center gap-2 px-4 py-3 w-40 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-semibold text-sm text-center">Siswa</span>
                </button>
              </div>
            </div>
          )}

          {role !== null && (
            <div className="mx-auto max-w-md animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white drop-shadow-md">
                  Masuk sebagai {role === 'teacher' ? 'Guru' : 'Siswa'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1 drop-shadow">
                    {role === 'teacher' ? 'NIP / Username' : 'NIS / Username'}
                  </label>
                  <input
                    type="text"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    placeholder={role === 'teacher' ? 'Masukkan NIP atau adm_guru' : 'Masukkan NIS atau adm_siswa'}
                    className="w-full px-4 py-2.5 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition text-gray-800 placeholder-gray-500"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-1 drop-shadow">Kata Sandi</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full px-4 py-2.5 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition pr-12 text-gray-800 placeholder-gray-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/80 text-white text-sm px-4 py-2.5 rounded-xl border border-red-400/50">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl border border-white/30 ${
                    role === 'teacher'
                      ? 'bg-blue-600/85 hover:bg-blue-700/90'
                      : 'bg-emerald-600/85 hover:bg-emerald-700/90'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  Masuk
                </button>
              </form>

              <div className="mt-4 p-3 bg-amber-500/20 rounded-xl border border-amber-400/30">
                <p className="text-xs font-semibold text-amber-100 mb-1">Demo Akun:</p>
                <div className="text-xs text-amber-50 space-y-0.5">
                  <p><strong>Guru:</strong> NIP: 198501012010011001 | Kata Sandi: guru123</p>
                  <p><strong>Siswa:</strong> NIS: 2024001 | Kata Sandi: siswa123</p>
                  <p><strong>Admin Guru:</strong> Pengguna: adm_guru | Kata Sandi: admin123</p>
                  <p><strong>Admin Siswa:</strong> Pengguna: adm_siswa | Kata Sandi: admin123</p>
                </div>
              </div>
            </div>
          )}
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