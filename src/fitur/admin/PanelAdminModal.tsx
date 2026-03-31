import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { X, ShieldCheck, Save, UserPlus, Trash2 } from 'lucide-react';
import {
  addPengumumanAdmin,
  deleteClassAnnouncement,
  deleteClassRoster,
  deletePengumumanAdmin,
  getCadanganDataAplikasi,
  deleteOnlineAssignment,
  getAttendance,
  getPengaturanTagihan,
  getRingkasanPenyimpananBrowser,
  hapusSemuaFotoPengumumanAdmin,
  kompresUlangSemuaFotoTersimpan,
  pulihkanDataAplikasiDariCadangan,
  getPengumumanAdmin,
  getClassAnnouncements,
  getClassRosters,
  getOnlineAssignmentsByClass,
  getClasses,
  getStudents,
  getTeachers,
  saveAttendance,
  saveClasses,
  saveStudents,
  saveTeachers,
  terapkanTagihanTahunanUntukSemuaSiswa,
} from '../../data/store';
import { ClassRoom, PengumumanAdmin, Student, Teacher } from '../../types';
import { useStoreVersion } from '../../hooks/useStoreVersion';
import { kompresGambarFile } from '../../utils/gambar';

interface PanelAdminModalProps {
  open: boolean;
  onClose: () => void;
  scope: 'teacher' | 'student';
  preAuthorized?: boolean;
}

const ADMIN_CREDENTIAL = {
  teacher: { username: 'adm_guru', password: 'admin123' },
  student: { username: 'adm_siswa', password: 'admin123' },
} as const;

type TeacherEditMap = Record<string, { name: string; nip: string; password: string; subject: string; classIds: string[] }>;
type StudentEditMap = Record<string, { nis: string; password: string }>;
type ClassEditMap = Record<string, { name: string; grade: string }>;
type TeacherAdminTab = 'kelas' | 'tambah-guru' | 'akun-guru' | 'tagihan' | 'pengumuman-admin';

export default function PanelAdminModal({ open, onClose, scope, preAuthorized = false }: PanelAdminModalProps) {
  const storeVersion = useStoreVersion();
  const [authorized, setAuthorized] = useState(preAuthorized);
  const [adminUser, setAdminUser] = useState<string>(scope === 'teacher' ? ADMIN_CREDENTIAL.teacher.username : ADMIN_CREDENTIAL.student.username);
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');
  const [notice, setNotice] = useState('');

  const [teacherEdits, setTeacherEdits] = useState<TeacherEditMap>({});
  const [studentEdits, setStudentEdits] = useState<StudentEditMap>({});
  const [classEdits, setClassEdits] = useState<ClassEditMap>({});
  const [searchStudent, setSearchStudent] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [activeTeacherTab, setActiveTeacherTab] = useState<TeacherAdminTab>('kelas');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherNip, setNewTeacherNip] = useState('');
  const [newTeacherPassword, setNewTeacherPassword] = useState('');
  const [newTeacherSubject, setNewTeacherSubject] = useState('');
  const [newTeacherClassIds, setNewTeacherClassIds] = useState<string[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});
  const [tahunTagihan, setTahunTagihan] = useState(new Date().getFullYear());
  const [nominalTagihan, setNominalTagihan] = useState(250000);
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState(10);
  const [judulPengumumanAdmin, setJudulPengumumanAdmin] = useState('');
  const [isiPengumumanAdmin, setIsiPengumumanAdmin] = useState('');
  const [targetPengumumanAdmin, setTargetPengumumanAdmin] = useState<'all' | 'classes'>('all');
  const [targetKelasPengumumanAdmin, setTargetKelasPengumumanAdmin] = useState<string[]>([]);
  const [fotoPengumumanDataUrl, setFotoPengumumanDataUrl] = useState<string | undefined>();
  const [fotoPengumumanNama, setFotoPengumumanNama] = useState<string>('');
  const [sedangKompresFoto, setSedangKompresFoto] = useState(false);
  const [sedangPulihkanCadangan, setSedangPulihkanCadangan] = useState(false);
  const inputCadanganRef = useRef<HTMLInputElement>(null);

  const teachers = useMemo(() => getTeachers(), [storeVersion, open]);
  const students = useMemo(() => getStudents(), [storeVersion, open]);
  const classes = useMemo(() => getClasses(), [storeVersion, open]);
  const studentCountByClass = useMemo(() => {
    const countMap = new Map<string, number>();
    students.forEach((item) => {
      countMap.set(item.classId, (countMap.get(item.classId) || 0) + 1);
    });
    return countMap;
  }, [students]);

  const teacherCountByClass = useMemo(() => {
    const countMap = new Map<string, number>();
    classes.forEach((item) => {
      if (!item.teacherId) {
        countMap.set(item.id, 0);
        return;
      }
      countMap.set(item.id, 1);
    });
    return countMap;
  }, [classes]);

  const pengumumanAdminList = useMemo(() => getPengumumanAdmin(), [storeVersion, open]);

  const filteredTeachers = useMemo(() => {
    const key = searchTeacher.trim().toLowerCase();
    if (!key) return teachers;
    return teachers.filter((item) => {
      const edit = teacherEdits[item.id];
      const classNames = (edit?.classIds || item.classIds)
        .map((classId) => classEdits[classId]?.name || classes.find((classItem) => classItem.id === classId)?.name || '')
        .join(' ')
        .toLowerCase();

      return (
        item.name.toLowerCase().includes(key)
        || item.nip.toLowerCase().includes(key)
        || item.subject.toLowerCase().includes(key)
        || classNames.includes(key)
      );
    });
  }, [teachers, searchTeacher, teacherEdits, classEdits, classes]);

  useEffect(() => {
    if (!open) {
      setAuthorized(false);
      setAdminPass('');
      setAuthError('');
      setNotice('');
      setMoveTargets({});
      setSearchTeacher('');
      setSelectedTeacherId('');
      setActiveTeacherTab('kelas');
      return;
    }

    setAuthorized(preAuthorized);
    setAdminUser(scope === 'teacher' ? ADMIN_CREDENTIAL.teacher.username : ADMIN_CREDENTIAL.student.username);

    const nextTeacherEdits: TeacherEditMap = {};
    teachers.forEach((teacher) => {
      nextTeacherEdits[teacher.id] = {
        name: teacher.name,
        nip: teacher.nip,
        password: teacher.password,
        subject: teacher.subject,
        classIds: [...teacher.classIds],
      };
    });
    setTeacherEdits(nextTeacherEdits);
    setSelectedTeacherId((prev) => (prev && nextTeacherEdits[prev] ? prev : teachers[0]?.id || ''));

    const nextStudentEdits: StudentEditMap = {};
    students.forEach((student) => {
      nextStudentEdits[student.id] = {
        nis: student.nis,
        password: student.password,
      };
    });
    setStudentEdits(nextStudentEdits);

    const nextClassEdits: ClassEditMap = {};
    classes.forEach((classItem) => {
      nextClassEdits[classItem.id] = {
        name: classItem.name,
        grade: classItem.grade,
      };
    });
    setClassEdits(nextClassEdits);

    const billingSettings = getPengaturanTagihan();
    setNominalTagihan(billingSettings.monthlyAmount);
    setTanggalJatuhTempo(billingSettings.dueDay);
    setTahunTagihan(new Date().getFullYear());
    setJudulPengumumanAdmin('');
    setIsiPengumumanAdmin('');
    setTargetPengumumanAdmin('all');
    setTargetKelasPengumumanAdmin([]);
    setFotoPengumumanDataUrl(undefined);
    setFotoPengumumanNama('');
  }, [open, teachers, students, classes, preAuthorized]);

  const setTeacherField = (teacherId: string, field: keyof TeacherEditMap[string], value: string | string[]) => {
    setTeacherEdits((prev) => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [field]: value,
      },
    }));
  };

  const toggleTeacherClass = (teacherId: string, classId: string) => {
    const current = teacherEdits[teacherId]?.classIds || [];
    const next = current.includes(classId) ? current.filter((id) => id !== classId) : [...current, classId];
    setTeacherField(teacherId, 'classIds', next);
  };

  const toggleNewTeacherClass = (classId: string) => {
    setNewTeacherClassIds((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]));
  };

  const setClassField = (classId: string, field: keyof ClassEditMap[string], value: string) => {
    setClassEdits((prev) => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [field]: value,
      },
    }));
  };

  const handleAdminLogin = () => {
    const expected = scope === 'teacher' ? ADMIN_CREDENTIAL.teacher : ADMIN_CREDENTIAL.student;
    if (adminUser.trim() === expected.username && adminPass === expected.password) {
      setAuthorized(true);
      setAuthError('');
      return;
    }
    setAuthError('Akun admin tidak valid.');
  };

  const applyExclusiveClassAssignment = (
    allTeachers: Teacher[],
    allClasses: ClassRoom[],
    targetTeacherId: string,
    selectedClassIds: string[],
  ) => {
    const selectedSet = new Set(selectedClassIds);

    const nextTeachers = allTeachers.map((item) => {
      if (item.id === targetTeacherId) {
        return { ...item, classIds: [...selectedSet] };
      }
      return { ...item, classIds: item.classIds.filter((classId) => !selectedSet.has(classId)) };
    });

    const nextClasses = allClasses.map((item) => {
      if (selectedSet.has(item.id)) {
        return { ...item, teacherId: targetTeacherId };
      }
      if (item.teacherId === targetTeacherId) {
        return { ...item, teacherId: '' };
      }
      return item;
    });

    return { nextTeachers, nextClasses };
  };

  const handleSaveTeacher = (teacherId: string) => {
    const edit = teacherEdits[teacherId];
    if (!edit) return;

    const nipUsed = teachers.find((item) => item.nip === edit.nip.trim() && item.id !== teacherId);
    if (nipUsed) {
      setNotice('NIP sudah digunakan guru lain.');
      return;
    }

    const targetTeacher = teachers.find((item) => item.id === teacherId);
    if (!targetTeacher) return;

    const patchedTeachers = teachers.map((item) => {
      if (item.id !== teacherId) return item;
      return {
        ...item,
        name: edit.name.trim(),
        nip: edit.nip.trim(),
        password: edit.password,
        subject: edit.subject.trim(),
      };
    });

    const { nextTeachers, nextClasses } = applyExclusiveClassAssignment(
      patchedTeachers,
      classes,
      teacherId,
      edit.classIds,
    );

    saveTeachers(nextTeachers);
    saveClasses(nextClasses);
    setNotice(`Akun guru ${targetTeacher.name} berhasil diperbarui.`);
  };

  const handleSaveClasses = () => {
    const classNames = new Set<string>();
    const nextClasses: ClassRoom[] = [];

    for (const item of classes) {
      const edit = classEdits[item.id];
      const name = (edit?.name || '').trim();
      const grade = (edit?.grade || '').trim();

      if (!name) {
        setNotice('Nama kelas tidak boleh kosong.');
        return;
      }
      if (!grade) {
        setNotice('Tingkat kelas tidak boleh kosong.');
        return;
      }

      const lowerName = name.toLowerCase();
      if (classNames.has(lowerName)) {
        setNotice('Ada nama kelas yang duplikat.');
        return;
      }
      classNames.add(lowerName);

      nextClasses.push({
        ...item,
        name,
        grade,
      });
    }

    saveClasses(nextClasses);
    setNotice('Daftar kelas berhasil diperbarui.');
  };

  const handleAddClass = () => {
    const name = newClassName.trim();
    const grade = newClassGrade.trim();
    if (!name || !grade) {
      setNotice('Isi nama kelas dan tingkat kelas terlebih dahulu.');
      return;
    }

    const duplicate = classes.some((item) => item.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setNotice('Nama kelas sudah ada. Gunakan nama kelas lain.');
      return;
    }

    const newClass: ClassRoom = {
      id: `c_${Date.now()}`,
      name,
      grade,
      teacherId: '',
    };

    saveClasses([...classes, newClass]);
    setNewClassName('');
    setNewClassGrade('');
    setNotice('Kelas baru berhasil ditambahkan.');
  };

  const handleDeleteClass = (classId: string) => {
    const classItem = classes.find((item) => item.id === classId);
    if (!classItem) return;

    const studentCount = studentCountByClass.get(classId) || 0;
    if (studentCount > 0) {
      setNotice(`Kelas ${classItem.name} tidak bisa dihapus karena masih memiliki ${studentCount} siswa.`);
      return;
    }

    const confirmed = window.confirm(`Hapus kelas ${classItem.name}? Data roster, pengumuman, tugas, dan absensi kelas ini juga akan dihapus.`);
    if (!confirmed) return;

    const nextClasses = classes.filter((item) => item.id !== classId);
    const nextTeachers = teachers.map((item) => ({
      ...item,
      classIds: item.classIds.filter((id) => id !== classId),
    }));

    const nextAttendance = getAttendance().filter((item) => item.classId !== classId);
    const rosters = getClassRosters(classId);
    const announcements = getClassAnnouncements(classId);
    const assignments = getOnlineAssignmentsByClass(classId);

    saveTeachers(nextTeachers);
    saveClasses(nextClasses);
    saveAttendance(nextAttendance);
    rosters.forEach((item) => deleteClassRoster(item.id));
    announcements.forEach((item) => deleteClassAnnouncement(item.id));
    assignments.forEach((item) => deleteOnlineAssignment(item.id));

    setClassEdits((prev) => {
      const next = { ...prev };
      delete next[classId];
      return next;
    });

    setTeacherEdits((prev) => {
      const next: TeacherEditMap = {};
      Object.entries(prev).forEach(([teacherId, value]) => {
        next[teacherId] = {
          ...value,
          classIds: value.classIds.filter((id) => id !== classId),
        };
      });
      return next;
    });

    setNewTeacherClassIds((prev) => prev.filter((id) => id !== classId));
    setNotice(`Kelas ${classItem.name} berhasil dihapus.`);
  };

  const handleMoveStudents = (sourceClassId: string) => {
    const sourceClass = classes.find((item) => item.id === sourceClassId);
    if (!sourceClass) return;

    const studentCount = studentCountByClass.get(sourceClassId) || 0;
    if (studentCount === 0) {
      setNotice(`Kelas ${sourceClass.name} tidak memiliki siswa yang perlu dipindahkan.`);
      return;
    }

    const targetClassId = moveTargets[sourceClassId];
    if (!targetClassId || targetClassId === sourceClassId) {
      setNotice('Pilih kelas tujuan pemindahan siswa terlebih dahulu.');
      return;
    }

    const targetClass = classes.find((item) => item.id === targetClassId);
    if (!targetClass) {
      setNotice('Kelas tujuan tidak ditemukan.');
      return;
    }

    const confirmed = window.confirm(
      `Pindahkan ${studentCount} siswa dari kelas ${sourceClass.name} ke ${targetClass.name}?`,
    );
    if (!confirmed) return;

    const nextStudents = students.map((item) => (
      item.classId === sourceClassId ? { ...item, classId: targetClassId } : item
    ));

    saveStudents(nextStudents);
    setMoveTargets((prev) => ({ ...prev, [sourceClassId]: '' }));
    setNotice(`Berhasil memindahkan ${studentCount} siswa dari ${sourceClass.name} ke ${targetClass.name}.`);
  };

  const handleAddTeacher = () => {
    if (!newTeacherName.trim() || !newTeacherNip.trim() || !newTeacherPassword.trim() || !newTeacherSubject.trim()) {
      setNotice('Lengkapi data guru baru terlebih dahulu.');
      return;
    }

    const nipUsed = teachers.some((item) => item.nip === newTeacherNip.trim());
    if (nipUsed) {
      setNotice('NIP sudah digunakan guru lain.');
      return;
    }

    const newTeacher: Teacher = {
      id: `t_${Date.now()}`,
      name: newTeacherName.trim(),
      nip: newTeacherNip.trim(),
      subject: newTeacherSubject.trim(),
      password: newTeacherPassword,
      classIds: [],
    };

    const withTeacher = [...teachers, newTeacher];
    const { nextTeachers, nextClasses } = applyExclusiveClassAssignment(
      withTeacher,
      classes,
      newTeacher.id,
      newTeacherClassIds,
    );

    saveTeachers(nextTeachers);
    saveClasses(nextClasses);
    setNewTeacherName('');
    setNewTeacherNip('');
    setNewTeacherPassword('');
    setNewTeacherSubject('');
    setNewTeacherClassIds([]);
    setNotice('Guru baru berhasil ditambahkan.');
  };

  const handleSaveStudent = (studentId: string) => {
    const edit = studentEdits[studentId];
    if (!edit) return;

    const nisUsed = students.find((item) => item.nis === edit.nis.trim() && item.id !== studentId);
    if (nisUsed) {
      setNotice('NIS sudah digunakan siswa lain.');
      return;
    }

    const nextStudents: Student[] = students.map((item) => {
      if (item.id !== studentId) return item;
      return {
        ...item,
        nis: edit.nis.trim(),
        password: edit.password,
      };
    });

    saveStudents(nextStudents);
    setNotice('Data akun siswa berhasil diperbarui.');
  };

  const handlePilihFotoPengumuman = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotice('File pengumuman harus berupa gambar.');
      event.target.value = '';
      return;
    }

    kompresGambarFile(file, 980, 0.74, 1_050_000)
      .then((dataUrl) => {
        if (dataUrl.length > 1_200_000) {
          setNotice('Ukuran foto terlalu besar untuk disimpan. Gunakan foto dengan resolusi lebih kecil.');
          return;
        }
        setFotoPengumumanDataUrl(dataUrl);
        setFotoPengumumanNama(file.name);
        setNotice('Foto pengumuman berhasil dipilih.');
      })
      .catch(() => {
        setNotice('Gagal memproses foto pengumuman. Coba file lain.');
      })
      .finally(() => {
        event.target.value = '';
      });
  };

  const handleSimpanPengumumanAdmin = () => {
    const title = judulPengumumanAdmin.trim();
    const message = isiPengumumanAdmin.trim();
    if (!title || !message) {
      setNotice('Judul dan isi pengumuman admin wajib diisi.');
      return;
    }

    if (targetPengumumanAdmin === 'classes' && targetKelasPengumumanAdmin.length === 0) {
      setNotice('Pilih minimal satu kelas tujuan pengumuman.');
      return;
    }

    const newAnnouncement: PengumumanAdmin = {
      id: `adm_ann_${Date.now()}`,
      title,
      message,
      targetScope: targetPengumumanAdmin,
      targetClassIds: targetPengumumanAdmin === 'classes' ? targetKelasPengumumanAdmin : [],
      imageDataUrl: fotoPengumumanDataUrl,
      imageName: fotoPengumumanNama || undefined,
      createdAt: Date.now(),
      createdBy: scope,
    };
    const saved = addPengumumanAdmin(newAnnouncement);
    if (!saved) {
      setNotice('Gagal menyimpan pengumuman. Penyimpanan browser penuh, silakan kompres foto atau hapus data lama.');
      return;
    }
    setJudulPengumumanAdmin('');
    setIsiPengumumanAdmin('');
    setTargetPengumumanAdmin('all');
    setTargetKelasPengumumanAdmin([]);
    setFotoPengumumanDataUrl(undefined);
    setFotoPengumumanNama('');
    setNotice('Pengumuman admin berhasil dipublikasikan.');
  };

  const toggleTargetKelasPengumuman = (classId: string) => {
    setTargetKelasPengumumanAdmin((prev) => (
      prev.includes(classId)
        ? prev.filter((item) => item !== classId)
        : [...prev, classId]
    ));
  };

  const handleTerapkanTagihanTahunan = () => {
    if (!Number.isFinite(tahunTagihan) || tahunTagihan < 2020 || tahunTagihan > 2100) {
      setNotice('Tahun tagihan tidak valid.');
      return;
    }
    if (!Number.isFinite(nominalTagihan) || nominalTagihan <= 0) {
      setNotice('Nominal tagihan harus lebih dari 0.');
      return;
    }

    const day = Math.max(1, Math.min(28, tanggalJatuhTempo));
    const confirmed = window.confirm(
      `Terapkan tagihan ${tahunTagihan} untuk semua siswa dengan nominal ${new Intl.NumberFormat('id-ID').format(nominalTagihan)} dan jatuh tempo tanggal ${day}?`,
    );
    if (!confirmed) return;

    terapkanTagihanTahunanUntukSemuaSiswa(tahunTagihan, nominalTagihan, day, scope);
    setNotice(`Pengaturan tagihan tahun ${tahunTagihan} berhasil diterapkan untuk semua siswa.`);
  };

  const handleUnduhCadanganData = () => {
    try {
      const payload = getCadanganDataAplikasi();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `cadangan-data-absensi-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setNotice('Cadangan data berhasil diunduh.');
    } catch {
      setNotice('Gagal mengunduh cadangan data. Coba lagi.');
    }
  };

  const handleHapusMassalFotoPengumuman = () => {
    const confirmed = window.confirm('Hapus semua foto pada pengumuman admin? Teks pengumuman tetap tersimpan.');
    if (!confirmed) return;

    const removedCount = hapusSemuaFotoPengumumanAdmin();
    setNotice(`Pembersihan selesai. ${removedCount} foto pengumuman dihapus.`);
  };

  const handleBukaPemulihanCadangan = () => {
    inputCadanganRef.current?.click();
  };

  const handlePilihFileCadangan = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      'Pemulihan cadangan akan menimpa data saat ini. Pastikan Anda sudah mengunduh cadangan terbaru. Lanjutkan?',
    );

    if (!confirmed) {
      event.target.value = '';
      return;
    }

    setSedangPulihkanCadangan(true);
    try {
      const content = await file.text();
      const result = pulihkanDataAplikasiDariCadangan(content);
      setNotice(result.pesan);
    } catch {
      setNotice('Gagal membaca file cadangan. Pastikan file dapat diakses.');
    } finally {
      setSedangPulihkanCadangan(false);
      event.target.value = '';
    }
  };

  const handleKompresUlangFoto = async () => {
    if (sedangKompresFoto) return;
    const confirmed = window.confirm('Kompres ulang semua foto tersimpan (avatar, lampiran gambar, foto pengumuman)?');
    if (!confirmed) return;

    setSedangKompresFoto(true);
    try {
      const summary = await kompresUlangSemuaFotoTersimpan();
      setNotice(
        `Kompres selesai. Ditemukan ${summary.totalDitemukan} foto, berhasil ${summary.totalBerhasil}, gagal ${summary.totalGagal}.`,
      );
    } catch {
      setNotice('Proses kompres gagal. Coba lagi beberapa saat.');
    } finally {
      setSedangKompresFoto(false);
    }
  };

  const filteredStudents = students.filter((item) => {
    if (!searchStudent.trim()) return true;
    const key = searchStudent.toLowerCase();
    const className = classes.find((cls) => cls.id === item.classId)?.name || '';
    return (
      item.name.toLowerCase().includes(key)
      || item.nis.toLowerCase().includes(key)
      || className.toLowerCase().includes(key)
    );
  });

  const selectedTeacher = teachers.find((item) => item.id === selectedTeacherId) || filteredTeachers[0] || null;
  const selectedTeacherEdit = selectedTeacher ? teacherEdits[selectedTeacher.id] : null;
  const ringkasanPenyimpanan = useMemo(() => getRingkasanPenyimpananBrowser(), [storeVersion, open]);

  const formatMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  const statusPenyimpanan = ringkasanPenyimpanan.usedPercent >= 90
    ? 'kritis'
    : ringkasanPenyimpanan.usedPercent >= 75
      ? 'peringatan'
      : 'aman';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/55 sm:p-3">
      <div className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-[96dvh] sm:rounded-2xl sm:border sm:border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
          <div>
             <h2 className="text-lg font-semibold text-gray-800">
               {scope === 'teacher' ? 'Admin Guru' : 'Admin Siswa'}
             </h2>
             <p className="text-xs text-gray-500">
                {scope === 'teacher'
                  ? 'Kelola akun guru, pembagian kelas ajar, dan data kelas.'
                  : 'Kelola akun siswa, NIS, dan kata sandi.'}
             </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-500 hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!authorized ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-md mx-auto border border-gray-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-blue-700">
                <ShieldCheck className="w-5 h-5" />
                <p className="font-medium">Verifikasi Admin</p>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nama Pengguna</label>
                <input
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Kata Sandi</label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {authError && <p className="text-sm text-red-600">{authError}</p>}
              <button
                onClick={handleAdminLogin}
                className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Masuk Sebagai Admin
              </button>
              <p className="text-xs text-gray-500">
                {scope === 'teacher'
                  ? 'Demo admin guru: adm_guru / admin123'
                  : 'Demo admin siswa: adm_siswa / admin123'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {notice && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{notice}</p>}
            <div className={`rounded-lg border px-3 py-2 ${
              statusPenyimpanan === 'kritis'
                ? 'border-red-200 bg-red-50'
                : statusPenyimpanan === 'peringatan'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <p className="font-medium text-gray-700">Kapasitas Penyimpanan Browser</p>
                <p className="text-gray-600">
                  {formatMb(ringkasanPenyimpanan.usedBytes)} / {formatMb(ringkasanPenyimpanan.limitBytes)}
                </p>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/80">
                <div
                  className={`h-full ${
                    statusPenyimpanan === 'kritis'
                      ? 'bg-red-500'
                      : statusPenyimpanan === 'peringatan'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                  }`}
                  style={{ width: `${ringkasanPenyimpanan.usedPercent}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-600">
                Terpakai {ringkasanPenyimpanan.usedPercent}%. Jika melebihi 90%, upload foto bisa gagal atau membuat halaman kosong saat login.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  ref={inputCadanganRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handlePilihFileCadangan}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleUnduhCadanganData}
                  className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Unduh Data Cadangan
                </button>
                <button
                  type="button"
                  onClick={handleBukaPemulihanCadangan}
                  disabled={sedangPulihkanCadangan}
                  className={`rounded-md border px-2.5 py-1.5 text-xs ${
                    sedangPulihkanCadangan
                      ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                      : 'border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {sedangPulihkanCadangan ? 'Sedang Memulihkan...' : 'Pulihkan dari Cadangan'}
                </button>
                {scope === 'teacher' && (
                  <>
                    <button
                      type="button"
                      onClick={handleHapusMassalFotoPengumuman}
                      className="rounded-md border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-amber-700 hover:bg-amber-50"
                    >
                      Hapus Foto Pengumuman Lama
                    </button>
                    <button
                      type="button"
                      onClick={handleKompresUlangFoto}
                      disabled={sedangKompresFoto}
                      className={`rounded-md border px-2.5 py-1.5 text-xs ${
                        sedangKompresFoto
                          ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                          : 'border-blue-300 bg-white text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {sedangKompresFoto ? 'Sedang Kompres...' : 'Kompres Ulang Semua Foto'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {scope === 'teacher' && (
              <section className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Total Guru</p>
                    <p className="text-2xl font-semibold text-gray-800">{teachers.length}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Total Kelas</p>
                    <p className="text-2xl font-semibold text-gray-800">{classes.length}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-xs text-gray-500">Kelas Sudah Terisi Guru</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {Array.from(teacherCountByClass.values()).filter((value) => value > 0).length}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 rounded-lg border border-gray-200 bg-white p-1 md:grid-cols-5">
                  <button
                    onClick={() => setActiveTeacherTab('kelas')}
                    className={`px-3 py-1.5 rounded-md text-sm ${activeTeacherTab === 'kelas' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Kelola Kelas
                  </button>
                  <button
                    onClick={() => setActiveTeacherTab('tambah-guru')}
                    className={`px-3 py-1.5 rounded-md text-sm ${activeTeacherTab === 'tambah-guru' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Tambah Guru
                  </button>
                  <button
                    onClick={() => setActiveTeacherTab('akun-guru')}
                    className={`px-3 py-1.5 rounded-md text-sm ${activeTeacherTab === 'akun-guru' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Pengaturan Akun Guru
                  </button>
                  <button
                    onClick={() => setActiveTeacherTab('tagihan')}
                    className={`px-3 py-1.5 rounded-md text-sm ${activeTeacherTab === 'tagihan' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Tagihan Sekolah
                  </button>
                  <button
                    onClick={() => setActiveTeacherTab('pengumuman-admin')}
                    className={`px-3 py-1.5 rounded-md text-sm ${activeTeacherTab === 'pengumuman-admin' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Pengumuman Admin
                  </button>
                </div>

                {activeTeacherTab === 'kelas' && (
                  <div className="min-h-[540px] space-y-3 rounded-xl border border-gray-200 p-4">
                    <h3 className="font-semibold text-gray-800">Kelola Daftar Kelas</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      <input
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Nama kelas baru (contoh: X-IPA-1)"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        value={newClassGrade}
                        onChange={(e) => setNewClassGrade(e.target.value)}
                        placeholder="Tingkat (contoh: X, XI, XII)"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <button onClick={handleAddClass} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm w-fit">
                      <UserPlus className="w-4 h-4" /> Tambah Kelas
                    </button>

                    <div className="border border-gray-200 rounded-lg overflow-x-auto">
                      <table className="w-full min-w-[620px]">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-600">
                            <th className="px-3 py-2">Kode Kelas</th>
                            <th className="px-3 py-2">Nama Kelas</th>
                            <th className="px-3 py-2">Tingkat</th>
                            <th className="px-3 py-2">Guru Penanggung Jawab</th>
                            <th className="px-3 py-2">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classes.map((classItem) => {
                            const edit = classEdits[classItem.id];
                            const teacherName = teachers.find((item) => item.id === classItem.teacherId)?.name || '-';
                            const studentCount = studentCountByClass.get(classItem.id) || 0;
                            const canDelete = studentCount === 0;
                            return (
                              <tr key={classItem.id} className="border-b border-gray-100 last:border-0">
                                <td className="px-3 py-2 text-sm text-gray-500">{classItem.id}</td>
                                <td className="px-3 py-2">
                                  <input
                                    value={edit?.name || ''}
                                    onChange={(e) => setClassField(classItem.id, 'name', e.target.value)}
                                    className="px-2 py-1.5 border border-gray-300 rounded-md text-sm w-full"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    value={edit?.grade || ''}
                                    onChange={(e) => setClassField(classItem.id, 'grade', e.target.value)}
                                    className="px-2 py-1.5 border border-gray-300 rounded-md text-sm w-28"
                                  />
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700">{teacherName}</td>
                                <td className="px-3 py-2">
                                  {canDelete ? (
                                    <button
                                      onClick={() => handleDeleteClass(classItem.id)}
                                      title="Hapus kelas"
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs border border-red-200 text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Hapus
                                    </button>
                                  ) : (
                                    <div className="flex flex-col gap-1.5 min-w-52">
                                      <p className="text-[11px] text-amber-700">Masih ada {studentCount} siswa</p>
                                      <div className="flex gap-1.5">
                                        <select
                                          value={moveTargets[classItem.id] || ''}
                                          onChange={(e) => setMoveTargets((prev) => ({ ...prev, [classItem.id]: e.target.value }))}
                                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-xs"
                                        >
                                          <option value="">Pilih kelas tujuan</option>
                                          {classes
                                            .filter((item) => item.id !== classItem.id)
                                            .map((item) => (
                                              <option key={item.id} value={item.id}>{classEdits[item.id]?.name || item.name}</option>
                                            ))}
                                        </select>
                                        <button
                                          onClick={() => handleMoveStudents(classItem.id)}
                                          disabled={classes.length <= 1}
                                          className={`px-2.5 py-1.5 rounded-md text-xs border ${
                                            classes.length <= 1
                                              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                              : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                                          }`}
                                        >
                                           Pindahkan Siswa
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <button onClick={handleSaveClasses} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm w-fit">
                      <Save className="w-4 h-4" /> Simpan Daftar Kelas
                    </button>
                  </div>
                )}

{activeTeacherTab === 'tambah-guru' && (
  <div className="min-h-screen space-y-4 rounded-xl border border-gray-200 p-6 bg-white">
    <div className="mx-auto grid w-full gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Form Tambah Guru */}
      <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/60 p-6">
        <h3 className="text-base font-semibold text-gray-800">Form Tambah Guru</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Nama Guru</label>
            <input
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">NIP</label>
            <input
              value={newTeacherNip}
              onChange={(e) => setNewTeacherNip(e.target.value)}
              placeholder="Masukkan NIP"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Kata Sandi</label>
            <input
              value={newTeacherPassword}
              onChange={(e) => setNewTeacherPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Mata Pelajaran</label>
            <input
              value={newTeacherSubject}
              onChange={(e) => setNewTeacherSubject(e.target.value)}
              placeholder="Contoh: Bahasa Indonesia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Pilih Kelas */}
      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm font-medium text-gray-700">Pilih Kelas yang Diajar</p>
        <div className="max-h-[60vh] space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-2">
          {classes.map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span>{classEdits[item.id]?.name || item.name}</span>
              <input
                type="checkbox"
                checked={newTeacherClassIds.includes(item.id)}
                onChange={() => toggleNewTeacherClass(item.id)}
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500">Dipilih: {newTeacherClassIds.length} kelas</p>
      </div>
    </div>

    {/* Tombol Tambah Guru */}
    <div className="mx-auto flex w-full justify-end">
      <button
        onClick={handleAddTeacher}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
      >
        <UserPlus className="w-4 h-4" /> Tambah Guru
      </button>
    </div>
  </div>
)}


                {activeTeacherTab === 'akun-guru' && (
                  <div className="grid min-h-[540px] gap-4 rounded-xl border border-gray-200 p-4 lg:grid-cols-[280px_1fr]">
                    <div className="space-y-3">
                      <input
                        value={searchTeacher}
                        onChange={(e) => setSearchTeacher(e.target.value)}
                        placeholder="Cari nama guru, NIP, mata pelajaran, atau kelas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <div className="max-h-[360px] overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredTeachers.map((teacher) => {
                          const isActive = selectedTeacher?.id === teacher.id;
                          const selectedCount = teacherEdits[teacher.id]?.classIds.length || teacher.classIds.length;
                          return (
                            <button
                              key={teacher.id}
                              onClick={() => setSelectedTeacherId(teacher.id)}
                              className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-0 ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            >
                              <p className="text-sm font-medium text-gray-800">{teacher.name}</p>
                              <p className="text-xs text-gray-500">{teacher.nip} - {teacher.subject}</p>
                              <p className="text-[11px] text-blue-700">{selectedCount} kelas aktif</p>
                            </button>
                          );
                        })}
                        {filteredTeachers.length === 0 && (
                          <p className="px-3 py-4 text-sm text-gray-500">Guru tidak ditemukan.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      {selectedTeacher && selectedTeacherEdit ? (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-800">Ubah Data Guru: {selectedTeacher.name}</h3>
                          <div className="grid md:grid-cols-2 gap-2">
                            <input value={selectedTeacherEdit.name} onChange={(e) => setTeacherField(selectedTeacher.id, 'name', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Nama guru" />
                            <input value={selectedTeacherEdit.subject} onChange={(e) => setTeacherField(selectedTeacher.id, 'subject', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Mata pelajaran" />
                            <input value={selectedTeacherEdit.nip} onChange={(e) => setTeacherField(selectedTeacher.id, 'nip', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="NIP" />
                            <input value={selectedTeacherEdit.password} onChange={(e) => setTeacherField(selectedTeacher.id, 'password', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Kata sandi" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Kelas ajar guru (eksklusif agar antar-guru tidak saling melihat data)</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {classes.map((item) => (
                                <label key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                                  <input
                                    type="checkbox"
                                    checked={selectedTeacherEdit.classIds.includes(item.id)}
                                    onChange={() => toggleTeacherClass(selectedTeacher.id, item.id)}
                                  />
                                  {classEdits[item.id]?.name || item.name}
                                </label>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => handleSaveTeacher(selectedTeacher.id)} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">
                            <Save className="w-4 h-4" /> Simpan Perubahan Guru
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Pilih guru terlebih dahulu untuk mengedit akun.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTeacherTab === 'tagihan' && (
                  <div className="min-h-[540px] space-y-4 rounded-xl border border-gray-200 p-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">Pengaturan Tagihan Uang Sekolah</h3>
                      <p className="text-xs text-gray-500 mt-1">Atur nominal bulanan dan tanggal jatuh tempo, lalu terapkan ke seluruh siswa per tahun.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <label className="text-sm text-gray-700">
                        Tahun
                        <input
                          type="number"
                          value={tahunTagihan}
                          onChange={(e) => setTahunTagihan(Number(e.target.value))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </label>
                      <label className="text-sm text-gray-700">
                        Nominal Bulanan (Rp)
                        <input
                          type="number"
                          min={1000}
                          step={1000}
                          value={nominalTagihan}
                          onChange={(e) => setNominalTagihan(Number(e.target.value))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </label>
                      <label className="text-sm text-gray-700">
                        Tanggal Jatuh Tempo
                        <input
                          type="number"
                          min={1}
                          max={28}
                          value={tanggalJatuhTempo}
                          onChange={(e) => setTanggalJatuhTempo(Number(e.target.value))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </label>
                    </div>
                    <button
                      onClick={handleTerapkanTagihanTahunan}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      <Save className="w-4 h-4" /> Terapkan Tagihan Tahunan
                    </button>
                  </div>
                )}

                {activeTeacherTab === 'pengumuman-admin' && (
                  <div className="min-h-[540px] space-y-4 rounded-xl border border-gray-200 p-4">
                    <div>
                      <h3 className="font-semibold text-gray-800">Pengumuman Admin Sekolah</h3>
                      <p className="text-xs text-gray-500 mt-1">Pengumuman dapat ditujukan ke semua kelas atau kelas tertentu. Dapat berisi teks dan foto.</p>
                    </div>

                    <div className="grid gap-3">
                      <input
                        value={judulPengumumanAdmin}
                        onChange={(e) => setJudulPengumumanAdmin(e.target.value)}
                        placeholder="Judul pengumuman"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <textarea
                        value={isiPengumumanAdmin}
                        onChange={(e) => setIsiPengumumanAdmin(e.target.value)}
                        placeholder="Isi pengumuman"
                        rows={4}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <label className="text-sm text-gray-700">
                        Tujuan Pengumuman
                        <select
                          value={targetPengumumanAdmin}
                          onChange={(e) => {
                            const nextValue = e.target.value as 'all' | 'classes';
                            setTargetPengumumanAdmin(nextValue);
                            if (nextValue === 'all') {
                              setTargetKelasPengumumanAdmin([]);
                            }
                          }}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="all">Semua Kelas (Global)</option>
                          <option value="classes">Kelas Tertentu</option>
                        </select>
                      </label>
                      {targetPengumumanAdmin === 'classes' && (
                        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <p className="text-xs font-medium text-gray-700 mb-2">Pilih kelas tujuan</p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {classes.map((item) => (
                              <label key={item.id} className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={targetKelasPengumumanAdmin.includes(item.id)}
                                  onChange={() => toggleTargetKelasPengumuman(item.id)}
                                />
                                <span>{item.name} ({item.grade})</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      <label className="text-sm text-gray-700">
                        Foto Pengumuman (opsional)
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePilihFotoPengumuman}
                          className="mt-1 block w-full text-sm text-gray-600"
                        />
                        <span className="mt-1 block text-xs text-gray-500">
                          Foto akan tampil di dasbor kelas tujuan pengumuman.
                        </span>
                      </label>
                      {fotoPengumumanDataUrl && (
                        <div className="border border-gray-200 rounded-lg p-2">
                          <img
                            src={fotoPengumumanDataUrl}
                            alt={fotoPengumumanNama || 'Preview foto pengumuman'}
                            className="w-full max-h-56 object-cover rounded-md"
                          />
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="text-xs text-gray-500 truncate">{fotoPengumumanNama || 'Foto terpilih'}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setFotoPengumumanDataUrl(undefined);
                                setFotoPengumumanNama('');
                              }}
                              className="px-2 py-1 rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Hapus Foto
                            </button>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleSimpanPengumumanAdmin}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm w-fit"
                      >
                        <Save className="w-4 h-4" /> Publikasikan Pengumuman
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Riwayat Pengumuman Admin</p>
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {pengumumanAdminList.map((item) => (
                          <article key={item.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-sm font-semibold text-gray-800">{item.title}</h4>
                              <button
                                onClick={() => deletePengumumanAdmin(item.id)}
                                className="px-2 py-1 rounded-md border border-red-200 text-red-700 text-xs hover:bg-red-50"
                              >
                                Hapus
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
                            <p className="text-xs text-blue-700 mt-1">
                              Tujuan: {item.targetScope === 'classes'
                                ? (item.targetClassIds || [])
                                  .map((classId) => classes.find((classItem) => classItem.id === classId)?.name || classId)
                                  .join(', ')
                                : 'Semua kelas'}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">{item.message}</p>
                            {item.imageDataUrl && (
                              <img
                                src={item.imageDataUrl}
                                alt={item.imageName || item.title}
                                className="mt-2 w-full h-auto object-contain rounded-md border border-gray-200 bg-gray-50"
                              />
                            )}
                          </article>
                        ))}
                        {pengumumanAdminList.length === 0 && (
                          <p className="text-sm text-gray-400">Belum ada pengumuman admin.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {scope === 'student' && (
              <section className="space-y-3">
                <h3 className="font-semibold text-gray-800">Pengaturan Akun Siswa (NIS dan Kata Sandi)</h3>
                <input
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Cari nama siswa, NIS, atau kelas"
                  className="w-full md:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <div className="border border-gray-200 rounded-xl overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs text-gray-600">
                        <th className="px-3 py-2">Nama</th>
                        <th className="px-3 py-2">Kelas</th>
                        <th className="px-3 py-2">NIS</th>
                        <th className="px-3 py-2">Kata Sandi</th>
                        <th className="px-3 py-2">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => {
                        const edit = studentEdits[student.id];
                        if (!edit) return null;
                        const className = classes.find((item) => item.id === student.classId)?.name || '-';
                        return (
                          <tr key={student.id} className="border-b border-gray-100 last:border-0">
                            <td className="px-3 py-2 text-sm text-gray-700">{student.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{className}</td>
                            <td className="px-3 py-2">
                              <input
                                value={edit.nis}
                                onChange={(e) => setStudentEdits((prev) => ({ ...prev, [student.id]: { ...prev[student.id], nis: e.target.value } }))}
                                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm w-36"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                value={edit.password}
                                onChange={(e) => setStudentEdits((prev) => ({ ...prev, [student.id]: { ...prev[student.id], password: e.target.value } }))}
                                className="px-2 py-1.5 border border-gray-300 rounded-md text-sm w-36"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <button onClick={() => handleSaveStudent(student.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs">
                                Simpan
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
