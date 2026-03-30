import { useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { initializeData } from './data/store';
import LoginPage from './fitur/autentikasi/LoginPage';
import Sidebar from './layout/Sidebar';
import DasborGuru from './fitur/guru/DasborGuru';
import HalamanAbsensi from './fitur/guru/HalamanAbsensi';
import HalamanLaporan from './fitur/guru/HalamanLaporan';
import ManajemenSiswa from './fitur/guru/ManajemenSiswa';
import AturRosterGuru from './fitur/guru/AturRosterGuru';
import AturPengumumanGuru from './fitur/guru/AturPengumumanGuru';
import AturTugasOnlineGuru from './fitur/guru/AturTugasOnlineGuru';
import ProfilGuru from './fitur/guru/ProfilGuru';
import KotakSuratGuru from './fitur/guru/KotakSuratGuru';
import DasborMurid from './fitur/murid/DasborMurid';
import RiwayatAbsensi from './fitur/murid/RiwayatAbsensi';
import RosterKelas from './fitur/murid/RosterKelas';
import KantongTugas from './fitur/murid/KantongTugas';
import ProfilMurid from './fitur/murid/ProfilMurid';
import KirimSuratMurid from './fitur/murid/KirimSuratMurid';
import TagihanSekolah from './fitur/murid/TagihanSekolah';
import PengaturanAkun from './fitur/pengaturan/PengaturanAkun';
import ErrorBoundary from './fitur/bersama/ErrorBoundary';

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [visitedPages, setVisitedPages] = useState<Record<string, boolean>>({ dashboard: true });

  // Reset to dashboard when user changes
  useEffect(() => {
    setActivePage('dashboard');
    setVisitedPages({ dashboard: true });
  }, [user?.id]);

  useEffect(() => {
    setVisitedPages(prev => ({ ...prev, [activePage]: true }));
  }, [activePage]);

  const teacherPages: Record<string, ComponentType> = {
    dashboard: DasborGuru,
    attendance: HalamanAbsensi,
    report: HalamanLaporan,
    students: ManajemenSiswa,
    'roster-settings': AturRosterGuru,
    'announcement-settings': AturPengumumanGuru,
    'assignment-settings': AturTugasOnlineGuru,
    'letters-teacher': KotakSuratGuru,
    profile: ProfilGuru,
    settings: PengaturanAkun,
  };

  const studentPages: Record<string, ComponentType> = {
    dashboard: DasborMurid,
    roster: RosterKelas,
    history: RiwayatAbsensi,
    tasks: KantongTugas,
    'letters-student': KirimSuratMurid,
    billing: TagihanSekolah,
    profile: ProfilMurid,
    settings: PengaturanAkun,
  };

  const pages = user?.role === 'teacher' ? teacherPages : studentPages;

  useEffect(() => {
    if (user && !pages[activePage]) {
      setActivePage('dashboard');
    }
  }, [activePage, user, pages]);

  if (!user) return <LoginPage />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        {Object.entries(pages).map(([pageId, PageComponent]) => {
          if (!visitedPages[pageId]) return null;
          return (
            <section key={pageId} className={activePage === pageId ? 'block' : 'hidden'}>
              <PageComponent />
            </section>
          );
        })}
      </main>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AuthProvider>
  );
}
