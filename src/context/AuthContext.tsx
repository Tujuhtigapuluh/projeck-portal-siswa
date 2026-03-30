import React, { createContext, useContext, useState, useCallback } from 'react';
import { AuthUser, UserRole } from '../types';
import { getTeachers, getStudents } from '../data/store';

interface AuthContextType {
  user: AuthUser | null;
  login: (id: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('absensi_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('absensi_auth');
      return null;
    }
  });

  const simpanSesi = (authUser: AuthUser) => {
    try {
      localStorage.setItem('absensi_auth', JSON.stringify(authUser));
    } catch {
      // Saat kuota localStorage penuh, sesi tetap berjalan di memory.
      // Ini mencegah aplikasi menjadi blank setelah login.
      console.warn('Gagal menyimpan sesi ke localStorage karena kuota penuh.');
    }
  };

  const login = useCallback((id: string, password: string, role: UserRole): boolean => {
    if (role === 'teacher') {
      const teachers = getTeachers();
      const teacher = teachers.find(t => t.nip === id && t.password === password);
      if (teacher) {
        const authUser: AuthUser = {
          id: teacher.id,
          name: teacher.name,
          role: 'teacher',
          avatar: teacher.avatar,
        };
        setUser(authUser);
        simpanSesi(authUser);
        return true;
      }
    } else {
      const students = getStudents();
      const student = students.find(s => s.nis === id && s.password === password);
      if (student) {
        const authUser: AuthUser = {
          id: student.id,
          name: student.name,
          role: 'student',
          avatar: student.avatar,
        };
        setUser(authUser);
        simpanSesi(authUser);
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('absensi_auth');
  }, []);

  const refreshUser = useCallback(() => {
    setUser(current => {
      if (!current) return current;
      if (current.role === 'teacher') {
        const teacher = getTeachers().find(item => item.id === current.id);
        if (!teacher) return current;
        const nextUser: AuthUser = { ...current, name: teacher.name, avatar: teacher.avatar };
        simpanSesi(nextUser);
        return nextUser;
      }
      const student = getStudents().find(item => item.id === current.id);
      if (!student) return current;
      const nextUser: AuthUser = { ...current, name: student.name, avatar: student.avatar };
      simpanSesi(nextUser);
      return nextUser;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
