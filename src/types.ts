export interface Student {
  id: string;
  name: string;
  nis: string; // Nomor Induk Siswa
  classId: string;
  gender: 'L' | 'P';
  password: string;
  avatar?: string;
  phone?: string;
  email?: string;
  address?: string;
  parentName?: string;
}

export interface Teacher {
  id: string;
  name: string;
  nip: string; // Nomor Induk Pegawai
  subject: string;
  password: string;
  classIds: string[];
  avatar?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  teacherId: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  note?: string;
  markedBy: string; // teacher id
  timestamp: number;
}

export interface ClassRosterItem {
  id: string;
  classId: string;
  subject: string;
  dayOfWeek: number; // 0=Min, 1=Sen, ..., 6=Sab
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  teacherName?: string;
  updatedBy: string;
  updatedAt: number;
}

export interface ClassAnnouncement {
  id: string;
  classId: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: number;
}

export interface OnlineAssignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  createdBy: string;
  createdAt: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  answerText: string;
  attachmentName?: string;
  attachmentDataUrl?: string;
  submittedAt: number;
}

export interface SuratIzin {
  id: string;
  studentId: string;
  classId: string;
  type: 'izin' | 'sakit' | 'dispensasi' | 'lainnya';
  status: 'menunggu' | 'disetujui' | 'ditolak';
  subject: string;
  message: string;
  letterDate: string; // YYYY-MM-DD
  attachmentName?: string;
  attachmentDataUrl?: string;
  createdAt: number;
}

export interface TagihanSekolah {
  id: string;
  studentId: string;
  year: number;
  month: number; // 1-12
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'lunas' | 'belum_lunas';
  paymentMethod?: 'atm' | 'mobile_banking' | 'internet_banking' | 'ewallet' | 'tunai';
  paidAt?: number;
}

export interface PengaturanTagihan {
  monthlyAmount: number;
  dueDay: number;
  updatedAt: number;
  updatedBy: string;
}

export interface PengumumanAdmin {
  id: string;
  title: string;
  message: string;
  targetScope?: 'all' | 'classes';
  targetClassIds?: string[];
  imageDataUrl?: string;
  imageName?: string;
  createdAt: number;
  createdBy: string;
}

export type UserRole = 'teacher' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}
