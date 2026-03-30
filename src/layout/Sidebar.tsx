import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  Users,
  LogOut,
  Settings,
  GraduationCap,
  Calendar,
  Menu,
  X,
  Briefcase,
  Megaphone,
  BookOpen,
  Mail,
  WalletCards,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isTeacher = user?.role === 'teacher';

  const teacherMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Input Absensi', icon: ClipboardCheck },
    { id: 'roster-settings', label: 'Atur Roster', icon: BookOpen },
    { id: 'announcement-settings', label: 'Atur Pengumuman', icon: Megaphone },
    { id: 'assignment-settings', label: 'Atur Tugas Online', icon: Briefcase },
    { id: 'letters-teacher', label: 'Kotak Surat', icon: Mail },
    { id: 'report', label: 'Laporan', icon: BarChart3 },
    { id: 'students', label: 'Data Siswa', icon: Users },
  ];

  const studentMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'roster', label: 'Roster Kelas', icon: ClipboardCheck },
    { id: 'history', label: 'Riwayat Absensi', icon: Calendar },
    { id: 'tasks', label: 'Kantong Tugas', icon: Briefcase },
    { id: 'letters-student', label: 'Kirim Surat', icon: Mail },
    { id: 'billing', label: 'Tagihan Sekolah', icon: WalletCards },
  ];

  const menus = isTeacher ? teacherMenus : studentMenus;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isTeacher ? 'bg-blue-500' : 'bg-emerald-500'}`}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm">Sistem Absensi</h1>
            <p className="text-xs text-gray-400">SMA N 1 Nusantara</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-4 border-b border-white/10">
        <button
          onClick={() => {
            onNavigate('profile');
            setMobileOpen(false);
          }}
          className="w-full flex items-center gap-3 rounded-lg p-1 cursor-pointer hover:bg-white/5"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Foto profil"
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${isTeacher ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {user?.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className={`text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${isTeacher ? 'bg-blue-500/30 text-blue-300' : 'bg-emerald-500/30 text-emerald-300'}`}>
              {isTeacher ? 'Guru' : 'Siswa'}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Klik untuk lihat profil saya</p>
          </div>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {menus.map(menu => {
          const Icon = menu.icon;
          const isActive = activePage === menu.id;
          return (
            <button
              key={menu.id}
              onClick={() => { onNavigate(menu.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? isTeacher
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-5 h-5" />
              {menu.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => { onNavigate('settings'); setMobileOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-2 ${
            activePage === 'settings'
              ? isTeacher
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-gray-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
          Pengaturan
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-xl shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-gray-900 min-h-screen fixed left-0 top-0 bottom-0 z-30">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`md:hidden fixed left-0 top-0 bottom-0 w-64 bg-gray-900 z-40 flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
