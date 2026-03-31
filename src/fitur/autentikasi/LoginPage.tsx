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
    <div
      className="relative min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.4), rgba(30, 58, 138, 0.4)), url('https://media.istockphoto.com/id/1500673669/pt/foto/kids-back-to-school-group-of-children.jpg?s=170667a&w=0&k=20&c=z2k56SPgdTSlIj12MrqNC0nuK9q_D5fuq_9b6J0SRnQ=')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl mb-4">
            <GraduationCap className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Portal Absensi</h1>
          <p className="text-blue-100 mt-1 drop-shadow-md">SMA Negeri 1 Nusantara</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">

          {/* STEP 1: Pilihan Peran */}
          {role === null && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
                Pilih Peran Anda
              </h2>

              <button
                onClick={() => handleSelectRole('teacher')}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Guru</p>
                  <p className="text-blue-100 text-sm">Masuk sebagai tenaga pengajar</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectRole('student')}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Siswa</p>
                  <p className="text-emerald-100 text-sm">Masuk sebagai peserta didik</p>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: Form Login */}
          {role !== null && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Header dengan tombol kembali */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Kembali ke pilihan peran"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Masuk sebagai {role === 'teacher' ? 'Guru' : 'Siswa'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {role === 'teacher' ? 'Masukkan NIP dan kata sandi' : 'Masukkan NIS dan kata sandi'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {role === 'teacher' ? 'NIP / Username' : 'NIS / Username'}
                  </label>
                  <input
                    type="text"
                    value={id}
                    onChange={e => setId(e.target.value)}
                    placeholder={role === 'teacher' ? 'Masukkan NIP' : 'Masukkan NIS'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                    autoFocus
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
                  Masuk
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