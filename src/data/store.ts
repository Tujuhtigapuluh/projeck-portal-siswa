import {
  Student,
  Teacher,
  ClassRoom,
  AttendanceRecord,
  ClassRosterItem,
  ClassAnnouncement,
  OnlineAssignment,
  AssignmentSubmission,
  SuratIzin,
  TagihanSekolah,
  PengaturanTagihan,
  PengumumanAdmin,
} from '../types';
import { kompresDataUrlGambar } from '../utils/gambar';

const STORAGE_KEYS = {
  students: 'absensi_students',
  teachers: 'absensi_teachers',
  classes: 'absensi_classes',
  attendance: 'absensi_attendance',
  rosters: 'absensi_rosters',
  announcements: 'absensi_announcements',
  assignments: 'absensi_assignments',
  submissions: 'absensi_submissions',
  letters: 'absensi_letters',
  bills: 'absensi_bills',
  adminBillingSettings: 'absensi_admin_billing_settings',
  adminAnnouncements: 'absensi_admin_announcements',
  initialized: 'absensi_initialized',
};

const STORE_UPDATED_EVENT = 'absensi_store_updated';

const APPROX_LOCAL_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;

function readJsonFromStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function readArrayFromStorage<T>(key: string): T[] {
  const parsed = readJsonFromStorage<unknown>(key, []);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

export interface RingkasanPenyimpananBrowser {
  usedBytes: number;
  limitBytes: number;
  usedPercent: number;
  remainingBytes: number;
}

export interface RingkasanKompresFoto {
  totalDitemukan: number;
  totalBerhasil: number;
  totalGagal: number;
}

export interface HasilPulihkanCadangan {
  berhasil: boolean;
  pesan: string;
}

function notifyStoreUpdated() {
  window.dispatchEvent(new CustomEvent(STORE_UPDATED_EVENT));
}

export function getRingkasanPenyimpananBrowser(): RingkasanPenyimpananBrowser {
  let usedBytes = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i) || '';
    const value = localStorage.getItem(key) || '';
    // localStorage stores UTF-16 strings, so each character is around 2 bytes.
    usedBytes += (key.length + value.length) * 2;
  }

  const usedPercent = Math.min(
    100,
    Math.round((usedBytes / APPROX_LOCAL_STORAGE_LIMIT_BYTES) * 100),
  );

  return {
    usedBytes,
    limitBytes: APPROX_LOCAL_STORAGE_LIMIT_BYTES,
    usedPercent,
    remainingBytes: Math.max(0, APPROX_LOCAL_STORAGE_LIMIT_BYTES - usedBytes),
  };
}

// Default data
const defaultTeachers: Teacher[] = [
  { id: 't1', name: 'Budi Santoso, S.Pd', nip: '198501012010011001', subject: 'Matematika', password: 'guru123', classIds: ['c1', 'c2'] },
  { id: 't2', name: 'Siti Rahayu, S.Pd', nip: '198702152011012002', subject: 'Bahasa Indonesia', password: 'guru123', classIds: ['c3', 'c4'] },
  { id: 't3', name: 'Ahmad Fauzi, S.Pd', nip: '199003202012011003', subject: 'IPA', password: 'guru123', classIds: ['c5', 'c6'] },
];

const defaultClasses: ClassRoom[] = [
  { id: 'c1', name: 'X-A', grade: 'X', teacherId: 't1' },
  { id: 'c2', name: 'X-B', grade: 'X', teacherId: 't1' },
  { id: 'c3', name: 'XI-A', grade: 'XI', teacherId: 't2' },
  { id: 'c4', name: 'XI-B', grade: 'XI', teacherId: 't2' },
  { id: 'c5', name: 'XII-A', grade: 'XII', teacherId: 't3' },
  { id: 'c6', name: 'XII-B', grade: 'XII', teacherId: 't3' },
];

const defaultStudents: Student[] = [
  // Kelas X-A
  { id: 's1', name: 'Andi Pratama', nis: '2024001', classId: 'c1', gender: 'L', password: 'siswa123' },
  { id: 's2', name: 'Bella Safitri', nis: '2024002', classId: 'c1', gender: 'P', password: 'siswa123' },
  { id: 's3', name: 'Cahyo Wibowo', nis: '2024003', classId: 'c1', gender: 'L', password: 'siswa123' },
  { id: 's4', name: 'Dewi Anggraini', nis: '2024004', classId: 'c1', gender: 'P', password: 'siswa123' },
  { id: 's5', name: 'Eko Saputra', nis: '2024005', classId: 'c1', gender: 'L', password: 'siswa123' },
  { id: 's6', name: 'Fitri Handayani', nis: '2024006', classId: 'c1', gender: 'P', password: 'siswa123' },
  { id: 's7', name: 'Gunawan Setiadi', nis: '2024007', classId: 'c1', gender: 'L', password: 'siswa123' },
  { id: 's8', name: 'Hana Permata', nis: '2024008', classId: 'c1', gender: 'P', password: 'siswa123' },
  // Kelas X-B
  { id: 's9', name: 'Indra Kusuma', nis: '2024009', classId: 'c2', gender: 'L', password: 'siswa123' },
  { id: 's10', name: 'Jelita Maharani', nis: '2024010', classId: 'c2', gender: 'P', password: 'siswa123' },
  { id: 's11', name: 'Kevin Aditya', nis: '2024011', classId: 'c2', gender: 'L', password: 'siswa123' },
  { id: 's12', name: 'Lina Marlina', nis: '2024012', classId: 'c2', gender: 'P', password: 'siswa123' },
  { id: 's13', name: 'Muhammad Rizki', nis: '2024013', classId: 'c2', gender: 'L', password: 'siswa123' },
  { id: 's14', name: 'Nur Fadilah', nis: '2024014', classId: 'c2', gender: 'P', password: 'siswa123' },
  // Kelas XI-A
  { id: 's15', name: 'Oscar Permadi', nis: '2023001', classId: 'c3', gender: 'L', password: 'siswa123' },
  { id: 's16', name: 'Putri Ramadhani', nis: '2023002', classId: 'c3', gender: 'P', password: 'siswa123' },
  { id: 's17', name: 'Qory Sandrina', nis: '2023003', classId: 'c3', gender: 'P', password: 'siswa123' },
  { id: 's18', name: 'Rudi Hartono', nis: '2023004', classId: 'c3', gender: 'L', password: 'siswa123' },
  { id: 's19', name: 'Sari Dewi', nis: '2023005', classId: 'c3', gender: 'P', password: 'siswa123' },
  { id: 's20', name: 'Taufik Hidayat', nis: '2023006', classId: 'c3', gender: 'L', password: 'siswa123' },
  // Kelas XI-B
  { id: 's21', name: 'Umar Faruq', nis: '2023007', classId: 'c4', gender: 'L', password: 'siswa123' },
  { id: 's22', name: 'Vina Oktavia', nis: '2023008', classId: 'c4', gender: 'P', password: 'siswa123' },
  { id: 's23', name: 'Wahyu Nugroho', nis: '2023009', classId: 'c4', gender: 'L', password: 'siswa123' },
  { id: 's24', name: 'Xena Valentina', nis: '2023010', classId: 'c4', gender: 'P', password: 'siswa123' },
  // Kelas XII-A
  { id: 's25', name: 'Yoga Pratama', nis: '2022001', classId: 'c5', gender: 'L', password: 'siswa123' },
  { id: 's26', name: 'Zahra Amelia', nis: '2022002', classId: 'c5', gender: 'P', password: 'siswa123' },
  { id: 's27', name: 'Arif Budiman', nis: '2022003', classId: 'c5', gender: 'L', password: 'siswa123' },
  { id: 's28', name: 'Bunga Citra', nis: '2022004', classId: 'c5', gender: 'P', password: 'siswa123' },
  // Kelas XII-B
  { id: 's29', name: 'Candra Wijaya', nis: '2022005', classId: 'c6', gender: 'L', password: 'siswa123' },
  { id: 's30', name: 'Dian Pertiwi', nis: '2022006', classId: 'c6', gender: 'P', password: 'siswa123' },
  { id: 's31', name: 'Erwin Prasetyo', nis: '2022007', classId: 'c6', gender: 'L', password: 'siswa123' },
  { id: 's32', name: 'Farah Nabila', nis: '2022008', classId: 'c6', gender: 'P', password: 'siswa123' },
];

const defaultRosters: ClassRosterItem[] = [
  { id: 'r1', classId: 'c1', subject: 'Matematika', dayOfWeek: 1, startTime: '07:30', endTime: '09:00', room: 'R-101', teacherName: 'Budi Santoso, S.Pd', updatedBy: 't1', updatedAt: Date.now() },
  { id: 'r2', classId: 'c1', subject: 'Bahasa Indonesia', dayOfWeek: 2, startTime: '08:00', endTime: '09:30', room: 'R-101', teacherName: 'Siti Rahayu, S.Pd', updatedBy: 't2', updatedAt: Date.now() },
  { id: 'r3', classId: 'c2', subject: 'Matematika', dayOfWeek: 1, startTime: '09:30', endTime: '11:00', room: 'R-102', teacherName: 'Budi Santoso, S.Pd', updatedBy: 't1', updatedAt: Date.now() },
  { id: 'r4', classId: 'c3', subject: 'Bahasa Indonesia', dayOfWeek: 3, startTime: '07:30', endTime: '09:00', room: 'R-201', teacherName: 'Siti Rahayu, S.Pd', updatedBy: 't2', updatedAt: Date.now() },
  { id: 'r5', classId: 'c4', subject: 'IPA', dayOfWeek: 4, startTime: '10:00', endTime: '11:30', room: 'Lab IPA', teacherName: 'Ahmad Fauzi, S.Pd', updatedBy: 't3', updatedAt: Date.now() },
  { id: 'r6', classId: 'c5', subject: 'IPA', dayOfWeek: 2, startTime: '09:30', endTime: '11:00', room: 'Lab IPA', teacherName: 'Ahmad Fauzi, S.Pd', updatedBy: 't3', updatedAt: Date.now() },
  { id: 'r7', classId: 'c6', subject: 'Matematika', dayOfWeek: 5, startTime: '07:30', endTime: '09:00', room: 'R-302', teacherName: 'Budi Santoso, S.Pd', updatedBy: 't1', updatedAt: Date.now() },
];

const defaultAnnouncements: ClassAnnouncement[] = [
  { id: 'a1', classId: 'c1', title: 'Ulangan Harian', message: 'Ulangan Matematika hari Jumat jam pertama.', createdBy: 't1', createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
  { id: 'a2', classId: 'c2', title: 'Tugas Bahasa Indonesia', message: 'Kumpulkan rangkuman cerpen maksimal Kamis.', createdBy: 't2', createdAt: Date.now() - 24 * 60 * 60 * 1000 },
  { id: 'a3', classId: 'c5', title: 'Praktikum IPA', message: 'Bawa jas lab untuk praktikum minggu ini.', createdBy: 't3', createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
];

const defaultAssignments: OnlineAssignment[] = [
  {
    id: 'task_1',
    classId: 'c1',
    title: 'Rangkuman Bab Persamaan Linear',
    description: 'Tulis rangkuman 1 halaman dan sertakan 5 contoh soal beserta jawaban.',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdBy: 't1',
    createdAt: Date.now() - 12 * 60 * 60 * 1000,
  },
  {
    id: 'task_2',
    classId: 'c3',
    title: 'Resensi Cerpen',
    description: 'Buat resensi cerpen minimal 300 kata, tulis langsung pada kolom jawaban.',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdBy: 't2',
    createdAt: Date.now() - 8 * 60 * 60 * 1000,
  },
];

function generateSampleAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const statuses: AttendanceRecord['status'][] = ['hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'hadir', 'izin', 'sakit', 'alpha'];
  const today = new Date();

  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];

    defaultStudents.forEach((student) => {
      const cls = defaultClasses.find(c => c.id === student.classId);
      if (!cls) return;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      records.push({
        id: `att_${student.id}_${dateStr}`,
        studentId: student.id,
        classId: student.classId,
        date: dateStr,
        status,
        markedBy: cls.teacherId,
        timestamp: date.getTime(),
      });
    });
  }

  return records;
}

function generateDefaultBills(): TagihanSekolah[] {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];
  const bills: TagihanSekolah[] = [];

  defaultStudents.forEach((student) => {
    years.forEach((year) => {
      for (let month = 1; month <= 12; month += 1) {
        const paid = year === currentYear && month < new Date().getMonth() + 1;
        bills.push({
          id: `bill_${student.id}_${year}_${month}`,
          studentId: student.id,
          year,
          month,
          amount: 250000,
          dueDate: `${year}-${String(month).padStart(2, '0')}-10`,
          status: paid ? 'lunas' : 'belum_lunas',
          paymentMethod: paid ? 'atm' : undefined,
          paidAt: paid ? new Date(year, month - 1, 5).getTime() : undefined,
        });
      }
    });
  });

  return bills;
}

function getDefaultPengaturanTagihan(): PengaturanTagihan {
  return {
    monthlyAmount: 250000,
    dueDay: 10,
    updatedAt: Date.now(),
    updatedBy: 'system',
  };
}

export function initializeData() {
  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (!initialized) {
    localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(defaultTeachers));
    localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(defaultClasses));
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(defaultStudents));
    localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(generateSampleAttendance()));
    localStorage.setItem(STORAGE_KEYS.rosters, JSON.stringify(defaultRosters));
    localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(defaultAnnouncements));
    localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(defaultAssignments));
    localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.letters, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(generateDefaultBills()));
    localStorage.setItem(STORAGE_KEYS.adminBillingSettings, JSON.stringify(getDefaultPengaturanTagihan()));
    localStorage.setItem(STORAGE_KEYS.adminAnnouncements, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.initialized, 'true');
  } else if (!localStorage.getItem(STORAGE_KEYS.bills)) {
    localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(generateDefaultBills()));
    if (!localStorage.getItem(STORAGE_KEYS.adminBillingSettings)) {
      localStorage.setItem(STORAGE_KEYS.adminBillingSettings, JSON.stringify(getDefaultPengaturanTagihan()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.adminAnnouncements)) {
      localStorage.setItem(STORAGE_KEYS.adminAnnouncements, JSON.stringify([]));
    }
  } else {
    if (!localStorage.getItem(STORAGE_KEYS.adminBillingSettings)) {
      localStorage.setItem(STORAGE_KEYS.adminBillingSettings, JSON.stringify(getDefaultPengaturanTagihan()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.adminAnnouncements)) {
      localStorage.setItem(STORAGE_KEYS.adminAnnouncements, JSON.stringify([]));
    }
  }
}

// CRUD Operations
export function getTeachers(): Teacher[] {
  return readArrayFromStorage<Teacher>(STORAGE_KEYS.teachers).map((item) => ({
    ...item,
    id: item.id || `t_${Date.now()}`,
    name: item.name || 'Guru',
    nip: item.nip || '',
    subject: item.subject || '-',
    password: item.password || '',
    classIds: Array.isArray(item.classIds) ? item.classIds.filter(Boolean) : [],
  }));
}

export function getStudents(): Student[] {
  return readArrayFromStorage<Student>(STORAGE_KEYS.students).map((item) => ({
    ...item,
    id: item.id || `s_${Date.now()}`,
    name: item.name || 'Siswa',
    nis: item.nis || '',
    classId: item.classId || '',
    gender: item.gender === 'P' ? 'P' : 'L',
    password: item.password || '',
  }));
}

export function getClasses(): ClassRoom[] {
  return readArrayFromStorage<ClassRoom>(STORAGE_KEYS.classes).map((item) => ({
    ...item,
    id: item.id || `c_${Date.now()}`,
    name: item.name || '-',
    grade: item.grade || '-',
    teacherId: item.teacherId || '',
  }));
}

export function getAttendance(): AttendanceRecord[] {
  return readArrayFromStorage<AttendanceRecord>(STORAGE_KEYS.attendance);
}

export function saveTeachers(teachers: Teacher[]) {
  localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(teachers));
  notifyStoreUpdated();
}

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
  notifyStoreUpdated();
}

export function saveClasses(classes: ClassRoom[]) {
  localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(classes));
  notifyStoreUpdated();
}

export function saveAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(records));
  notifyStoreUpdated();
}

export function addStudent(student: Student) {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
}

export function updateStudent(student: Student) {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === student.id);
  if (idx >= 0) students[idx] = student;
  saveStudents(students);
}

export function deleteStudent(id: string) {
  const students = getStudents().filter(s => s.id !== id);
  saveStudents(students);
  // Also remove attendance
  const attendance = getAttendance().filter(a => a.studentId !== id);
  saveAttendance(attendance);
}

export function addAttendanceRecords(records: AttendanceRecord[]) {
  const existing = getAttendance();
  // Remove existing records for same student+date combo
  const newKeys = new Set(records.map(r => `${r.studentId}_${r.date}`));
  const filtered = existing.filter(e => !newKeys.has(`${e.studentId}_${e.date}`));
  filtered.push(...records);
  saveAttendance(filtered);
}

export function getStudentsByClass(classId: string): Student[] {
  return getStudents().filter(s => s.classId === classId);
}

export function getAttendanceByDate(date: string, classId?: string): AttendanceRecord[] {
  const records = getAttendance();
  return records.filter(r => r.date === date && (classId ? r.classId === classId : true));
}

export function getAttendanceByStudent(studentId: string): AttendanceRecord[] {
  return getAttendance().filter(r => r.studentId === studentId);
}

export function getAttendanceByDateRange(startDate: string, endDate: string, classId?: string): AttendanceRecord[] {
  return getAttendance().filter(r => {
    const dateMatch = r.date >= startDate && r.date <= endDate;
    const classMatch = classId ? r.classId === classId : true;
    return dateMatch && classMatch;
  });
}

export function getOnlineAssignmentsByClass(classId: string): OnlineAssignment[] {
  const assignments = readJsonFromStorage<OnlineAssignment[]>(STORAGE_KEYS.assignments, []);
  return assignments
    .filter(item => item.classId === classId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addOnlineAssignment(item: OnlineAssignment) {
  const assignments = readJsonFromStorage<OnlineAssignment[]>(STORAGE_KEYS.assignments, []);
  assignments.push(item);
  localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(assignments));
  notifyStoreUpdated();
}

export function deleteOnlineAssignment(id: string) {
  const assignments = readJsonFromStorage<OnlineAssignment[]>(STORAGE_KEYS.assignments, []);
  const nextAssignments = assignments.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(nextAssignments));

  const submissions = readJsonFromStorage<AssignmentSubmission[]>(STORAGE_KEYS.submissions, []);
  const nextSubmissions = submissions.filter(item => item.assignmentId !== id);
  localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(nextSubmissions));
  notifyStoreUpdated();
}

export function getSubmissionsByAssignment(assignmentId: string): AssignmentSubmission[] {
  const submissions = readJsonFromStorage<AssignmentSubmission[]>(STORAGE_KEYS.submissions, []);
  return submissions
    .filter(item => item.assignmentId === assignmentId)
    .sort((a, b) => b.submittedAt - a.submittedAt);
}

export function getSubmissionByAssignmentAndStudent(
  assignmentId: string,
  studentId: string,
): AssignmentSubmission | null {
  const submissions = readJsonFromStorage<AssignmentSubmission[]>(STORAGE_KEYS.submissions, []);
  return submissions.find(item => item.assignmentId === assignmentId && item.studentId === studentId) || null;
}

export function upsertAssignmentSubmission(item: AssignmentSubmission) {
  const submissions = readJsonFromStorage<AssignmentSubmission[]>(STORAGE_KEYS.submissions, []);
  const index = submissions.findIndex(
    submission => submission.assignmentId === item.assignmentId && submission.studentId === item.studentId,
  );
  if (index >= 0) {
    submissions[index] = item;
  } else {
    submissions.push(item);
  }
  localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
  notifyStoreUpdated();
}

export function getClassRosters(classId: string): ClassRosterItem[] {
  const rosters = readArrayFromStorage<ClassRosterItem>(STORAGE_KEYS.rosters);
  return rosters
    .filter(r => r.classId === classId)
    .sort((a, b) => (a.dayOfWeek - b.dayOfWeek) || a.startTime.localeCompare(b.startTime));
}

export function addClassRoster(item: ClassRosterItem) {
  const rosters = readJsonFromStorage<ClassRosterItem[]>(STORAGE_KEYS.rosters, []);
  rosters.push(item);
  localStorage.setItem(STORAGE_KEYS.rosters, JSON.stringify(rosters));
  notifyStoreUpdated();
}

export function deleteClassRoster(id: string) {
  const rosters = readJsonFromStorage<ClassRosterItem[]>(STORAGE_KEYS.rosters, []);
  const next = rosters.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.rosters, JSON.stringify(next));
  notifyStoreUpdated();
}

export function getClassAnnouncements(classId: string): ClassAnnouncement[] {
  const announcements = readArrayFromStorage<ClassAnnouncement>(STORAGE_KEYS.announcements);
  return announcements
    .filter(item => item.classId === classId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addClassAnnouncement(item: ClassAnnouncement) {
  const announcements = readJsonFromStorage<ClassAnnouncement[]>(STORAGE_KEYS.announcements, []);
  announcements.push(item);
  localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(announcements));
  notifyStoreUpdated();
}

export function deleteClassAnnouncement(id: string) {
  const announcements = readJsonFromStorage<ClassAnnouncement[]>(STORAGE_KEYS.announcements, []);
  const next = announcements.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(next));
  notifyStoreUpdated();
}

export function subscribeStore(listener: () => void) {
  window.addEventListener(STORE_UPDATED_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(STORE_UPDATED_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

export function getSuratIzin(): SuratIzin[] {
  const letters = readArrayFromStorage<SuratIzin>(STORAGE_KEYS.letters);
  // Backward compatibility for older data that did not store status yet.
  return letters
    .map(item => ({
      ...item,
      status: item.status || 'menunggu',
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getSuratIzinByStudent(studentId: string): SuratIzin[] {
  return getSuratIzin().filter(item => item.studentId === studentId);
}

export function addSuratIzin(item: SuratIzin) {
  const letters = getSuratIzin();
  letters.push(item);
  localStorage.setItem(STORAGE_KEYS.letters, JSON.stringify(letters));
  notifyStoreUpdated();
}

export function updateStatusSuratIzin(id: string, status: SuratIzin['status']) {
  const letters = getSuratIzin();
  const updated = letters.map(item => (item.id === id ? { ...item, status } : item));
  localStorage.setItem(STORAGE_KEYS.letters, JSON.stringify(updated));
  notifyStoreUpdated();
}

export function getTagihanSekolahBySiswa(studentId: string, year: number): TagihanSekolah[] {
  const bills = readArrayFromStorage<TagihanSekolah>(STORAGE_KEYS.bills);
  return bills
    .filter(item => item.studentId === studentId && item.year === year)
    .sort((a, b) => a.month - b.month);
}

export function getTahunTagihanSiswa(studentId: string): number[] {
  const bills = readArrayFromStorage<TagihanSekolah>(STORAGE_KEYS.bills);
  const years = new Set(
    bills
      .filter(item => item.studentId === studentId)
      .map(item => item.year),
  );
  return Array.from(years).sort((a, b) => b - a);
}

export function bayarTagihanSekolah(
  id: string,
  paymentMethod: TagihanSekolah['paymentMethod'],
) {
  const bills = readArrayFromStorage<TagihanSekolah>(STORAGE_KEYS.bills);
  const updated = bills.map(item => (
    item.id === id
      ? {
        ...item,
        status: 'lunas' as const,
        paymentMethod,
        paidAt: Date.now(),
      }
      : item
  ));
  localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(updated));
  notifyStoreUpdated();
}

export function getPengaturanTagihan(): PengaturanTagihan {
  return readJsonFromStorage<PengaturanTagihan>(
    STORAGE_KEYS.adminBillingSettings,
    getDefaultPengaturanTagihan(),
  );
}

export function setPengaturanTagihan(config: PengaturanTagihan) {
  localStorage.setItem(STORAGE_KEYS.adminBillingSettings, JSON.stringify(config));
  notifyStoreUpdated();
}

export function terapkanTagihanTahunanUntukSemuaSiswa(
  year: number,
  monthlyAmount: number,
  dueDay: number,
  updatedBy: string,
) {
  const students = getStudents();
  const bills = readJsonFromStorage<TagihanSekolah[]>(STORAGE_KEYS.bills, []);

  const dueDaySafe = Math.min(28, Math.max(1, dueDay));
  const nextBills: TagihanSekolah[] = [...bills];

  students.forEach((student) => {
    for (let month = 1; month <= 12; month += 1) {
      const billId = `bill_${student.id}_${year}_${month}`;
      const dueDate = `${year}-${String(month).padStart(2, '0')}-${String(dueDaySafe).padStart(2, '0')}`;
      const existingIndex = nextBills.findIndex(item => item.id === billId);

      if (existingIndex >= 0) {
        nextBills[existingIndex] = {
          ...nextBills[existingIndex],
          amount: monthlyAmount,
          dueDate,
        };
      } else {
        nextBills.push({
          id: billId,
          studentId: student.id,
          year,
          month,
          amount: monthlyAmount,
          dueDate,
          status: 'belum_lunas',
        });
      }
    }
  });

  localStorage.setItem(STORAGE_KEYS.bills, JSON.stringify(nextBills));
  localStorage.setItem(
    STORAGE_KEYS.adminBillingSettings,
    JSON.stringify({
      monthlyAmount,
      dueDay: dueDaySafe,
      updatedAt: Date.now(),
      updatedBy,
    } satisfies PengaturanTagihan),
  );
  notifyStoreUpdated();
}

export function getPengumumanAdmin(): PengumumanAdmin[] {
  const announcements = readArrayFromStorage<PengumumanAdmin>(STORAGE_KEYS.adminAnnouncements);
  return announcements
    .map((item) => ({
      ...item,
      id: item.id || `ann_${Date.now()}`,
      title: item.title || 'Pengumuman',
      message: item.message || '',
      targetScope: item.targetScope || 'all',
      targetClassIds: Array.isArray(item.targetClassIds) ? item.targetClassIds.filter(Boolean) : [],
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      createdBy: item.createdBy || 'admin',
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getPengumumanAdminUntukKelas(classId: string): PengumumanAdmin[] {
  return getPengumumanAdmin().filter((item) => {
    if (item.targetScope === 'classes') {
      return (item.targetClassIds || []).includes(classId);
    }
    return true;
  });
}

export function getPengumumanAdminUntukGuru(classIds: string[]): PengumumanAdmin[] {
  const classSet = new Set(classIds);
  return getPengumumanAdmin().filter((item) => {
    if (item.targetScope === 'classes') {
      return (item.targetClassIds || []).some((classId) => classSet.has(classId));
    }
    return true;
  });
}

export function addPengumumanAdmin(item: PengumumanAdmin): boolean {
  const announcements = getPengumumanAdmin();
  announcements.push(item);
  try {
    localStorage.setItem(STORAGE_KEYS.adminAnnouncements, JSON.stringify(announcements));
  } catch {
    return false;
  }
  notifyStoreUpdated();
  return true;
}

export function deletePengumumanAdmin(id: string) {
  const announcements = getPengumumanAdmin().filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.adminAnnouncements, JSON.stringify(announcements));
  notifyStoreUpdated();
}

export function getCadanganDataAplikasi() {
  const cadangan: Record<string, string | null> = {};
  Object.values(STORAGE_KEYS).forEach((key) => {
    cadangan[key] = localStorage.getItem(key);
  });

  return {
    app: 'Sistem Absensi Sekolah',
    exportedAt: new Date().toISOString(),
    version: 1,
    data: cadangan,
  };
}

export function pulihkanDataAplikasiDariCadangan(fileContent: string): HasilPulihkanCadangan {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileContent);
  } catch {
    return {
      berhasil: false,
      pesan: 'File cadangan tidak valid. Pastikan format JSON benar.',
    };
  }

  if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) {
    return {
      berhasil: false,
      pesan: 'Struktur file cadangan tidak dikenali.',
    };
  }

  const payload = (parsed as { data?: Record<string, string | null> }).data;
  if (!payload || typeof payload !== 'object') {
    return {
      berhasil: false,
      pesan: 'Data cadangan tidak ditemukan di dalam file.',
    };
  }

  const validKeys = new Set(Object.values(STORAGE_KEYS));
  let totalDipulihkan = 0;

  try {
    validKeys.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(payload, key)) {
        return;
      }

      const value = payload[key];
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
        totalDipulihkan += 1;
        return;
      }

      if (value === null) {
        localStorage.removeItem(key);
        totalDipulihkan += 1;
      }
    });
  } catch {
    return {
      berhasil: false,
      pesan: 'Gagal memulihkan data. Periksa kapasitas penyimpanan browser.',
    };
  }

  if (totalDipulihkan === 0) {
    return {
      berhasil: false,
      pesan: 'Tidak ada data yang bisa dipulihkan dari file ini.',
    };
  }

  if (!localStorage.getItem(STORAGE_KEYS.initialized)) {
    localStorage.setItem(STORAGE_KEYS.initialized, 'true');
  }

  notifyStoreUpdated();
  return {
    berhasil: true,
    pesan: `Pemulihan selesai. ${totalDipulihkan} bagian data berhasil dipulihkan.`,
  };
}

export function hapusSemuaFotoPengumumanAdmin(): number {
  const announcements = getPengumumanAdmin();
  let removedCount = 0;

  const nextAnnouncements = announcements.map((item) => {
    if (!item.imageDataUrl && !item.imageName) {
      return item;
    }
    removedCount += 1;
    return {
      ...item,
      imageDataUrl: undefined,
      imageName: undefined,
    };
  });

  localStorage.setItem(STORAGE_KEYS.adminAnnouncements, JSON.stringify(nextAnnouncements));
  notifyStoreUpdated();
  return removedCount;
}

function isImageDataUrl(value?: string): boolean {
  return Boolean(value && value.startsWith('data:image/'));
}

export async function kompresUlangSemuaFotoTersimpan(): Promise<RingkasanKompresFoto> {
  const summary: RingkasanKompresFoto = {
    totalDitemukan: 0,
    totalBerhasil: 0,
    totalGagal: 0,
  };

  const students = getStudents();
  const nextStudents: Student[] = [...students];
  for (let index = 0; index < students.length; index += 1) {
    const avatar = students[index].avatar;
    if (!isImageDataUrl(avatar)) continue;

    summary.totalDitemukan += 1;
    try {
      const compressed = await kompresDataUrlGambar(avatar as string, 720, 0.72, 680_000);
      nextStudents[index] = { ...students[index], avatar: compressed };
      summary.totalBerhasil += 1;
    } catch {
      summary.totalGagal += 1;
    }
  }
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(nextStudents));

  const teachers = getTeachers();
  const nextTeachers: Teacher[] = [...teachers];
  for (let index = 0; index < teachers.length; index += 1) {
    const avatar = teachers[index].avatar;
    if (!isImageDataUrl(avatar)) continue;

    summary.totalDitemukan += 1;
    try {
      const compressed = await kompresDataUrlGambar(avatar as string, 720, 0.72, 680_000);
      nextTeachers[index] = { ...teachers[index], avatar: compressed };
      summary.totalBerhasil += 1;
    } catch {
      summary.totalGagal += 1;
    }
  }
  localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(nextTeachers));

  const adminAnnouncements = getPengumumanAdmin();
  const nextAdminAnnouncements: PengumumanAdmin[] = [...adminAnnouncements];
  for (let index = 0; index < adminAnnouncements.length; index += 1) {
    const imageDataUrl = adminAnnouncements[index].imageDataUrl;
    if (!isImageDataUrl(imageDataUrl)) continue;

    summary.totalDitemukan += 1;
    try {
      const compressed = await kompresDataUrlGambar(imageDataUrl as string, 1280, 0.74, 1_000_000);
      nextAdminAnnouncements[index] = { ...adminAnnouncements[index], imageDataUrl: compressed };
      summary.totalBerhasil += 1;
    } catch {
      summary.totalGagal += 1;
    }
  }
  localStorage.setItem(STORAGE_KEYS.adminAnnouncements, JSON.stringify(nextAdminAnnouncements));

  const letters = getSuratIzin();
  const nextLetters: SuratIzin[] = [...letters];
  for (let index = 0; index < letters.length; index += 1) {
    const attachmentDataUrl = letters[index].attachmentDataUrl;
    if (!isImageDataUrl(attachmentDataUrl)) continue;

    summary.totalDitemukan += 1;
    try {
      const compressed = await kompresDataUrlGambar(attachmentDataUrl as string, 1080, 0.72, 820_000);
      nextLetters[index] = { ...letters[index], attachmentDataUrl: compressed };
      summary.totalBerhasil += 1;
    } catch {
      summary.totalGagal += 1;
    }
  }
  localStorage.setItem(STORAGE_KEYS.letters, JSON.stringify(nextLetters));

  notifyStoreUpdated();
  return summary;
}
