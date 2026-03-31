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
          "linear-gradient(rgba(15, 23, 42, 0.3), rgba(30, 58, 138, 0.3)), url('https://blog.klikindomaret.com/wp-content/uploads/2022/07/daughter-with-school-uniform-highfive-with-mother-during-online-class-home-scaled.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-2">
            <img 
              src="https://3.bp.blogspot.com/-ZjI34XOI__8/WuqXymwhbaI/AAAAAAAAAnk/dFmja9cDA4QIdkWahzFiKQwcPLBoM7GuwCLcBGAs/s1600/Logo%2BSMP%2B1%2Bmajenang.png" 
              alt="Logo SMP 1 Majenang"
              className="w-28 h-28 object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Portal Absensi</h1>
        </div>

        {/* Divider tipis */}
        <div className="border-t border-blue-300 opacity-50 w-2/3 mx-auto mb-4"></div>

        {/* Card - Tanpa background */}
        <div className="rounded-2xl p-6">
          {/* STEP 1: Pilihan Peran */}
          {role === null && (
            <div className="space-y-4">
              <div className="flex gap-3 justify-center">
  {/* Tombol Guru */}
  <button
    onClick={() => handleSelectRole('teacher')}
    className="flex items-center justify-center gap-2 px-4 py-2 w-40 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
  >
    <BookOpen className="w-5 h-5" />
    <span className="font-semibold text-sm text-center">Guru</span>
  </button>

  {/* Tombol Siswa */}
  <button
    onClick={() => handleSelectRole('student')}
    className="flex items-center justify-center gap-2 px-4 py-2 w-40 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
  >
    <GraduationCap className="w-5 h-5" />
    <span className="font-semibold text-sm text-center">Siswa</span>
  </button>
</div>
            </div>
          )}

          {/* STEP 2: Form Login */}
          {role !== null && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors border border-white/30"
                  title="Kembali ke pilihan peran"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-white drop-shadow-md">
                    Masuk sebagai {role === 'teacher' ? 'Guru' : 'Siswa'}
                  </h2>
                </div>
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
                    placeholder={role === 'teacher' ? 'Masukkan NIP' : 'Masukkan NIS'}
                    className="w-full px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition text-gray-800 placeholder-gray-500"
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
                      className="w-full px-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition pr-12 text-gray-800 placeholder-gray-500"
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
                  <div className="bg-red-500/80 backdrop-blur-sm text-white text-sm px-4 py-2.5 rounded-xl border border-red-400/50">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl border border-white/30 ${
                    role === 'teacher'
                      ? 'bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm'
                      : 'bg-emerald-600/80 hover:bg-emerald-700/90 backdrop-blur-sm'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  Masuk
                </button>
              </form>

              {/* Demo Info */}
              <div className="mt-4 p-3 bg-amber-500/20 backdrop-blur-sm rounded-xl border border-amber-400/30">
                <p className="text-xs font-semibold text-amber-200 mb-1">Demo Akun:</p>
                <div className="text-xs text-amber-100/90 space-y-0.5">
                  <p><strong>Guru:</strong> NIP: 198501012010011001 | Pass: guru123</p>
                  <p><strong>Siswa:</strong> NIS: 2024001 | Pass: siswa123</p>
                  <p><strong>Admin Guru:</strong> adm_guru | Pass: admin123</p>
                  <p><strong>Admin Siswa:</strong> adm_siswa | Pass: admin123</p>
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