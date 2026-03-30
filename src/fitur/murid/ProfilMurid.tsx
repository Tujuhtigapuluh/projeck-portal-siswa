import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents, updateStudent } from '../../data/store';
import { useStoreVersion } from '../../hooks/useStoreVersion';
import { Camera, Save, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import ModalPotongFoto from '../bersama/ModalPotongFoto';
import { bacaFileSebagaiDataUrl } from '../../utils/gambar';

// Types
interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  parentName: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  parentName?: string;
}

type MessageType = 'success' | 'error';

interface MessageState {
  text: string;
  type: MessageType;
}

// Constants
const DEFAULT_AVATAR = '/default-avatar.png';
const MESSAGE_DURATION = 3000;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const storeVersion = useStoreVersion();
  
  // Data
  const student = useMemo(() => 
    getStudents().find(item => item.id === user?.id), 
    [user, storeVersion]
  );
  
  const className = useMemo(() => {
    if (!student) return '-';
    return getClasses().find(item => item.id === student.classId)?.name || '-';
  }, [student, storeVersion]);

  // Form State
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    parentName: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  
  // Avatar State
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [sumberFotoPotong, setSumberFotoPotong] = useState('');
  const [bukaPotongFoto, setBukaPotongFoto] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (!student) return;
    
    setFormData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      address: student.address || '',
      parentName: student.parentName || '',
    });
    setAvatarPreview(student.avatar || '');
    setIsDirty(false);
  }, [student]);

  // Auto-dismiss message
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => setMessage(null), MESSAGE_DURATION);
    return () => clearTimeout(timer);
  }, [message]);

  // Warn before unload if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nama minimal 3 karakter';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 13) {
        newErrors.phone = 'Nomor whatsapp harus 10-13 digit';
      }
    }
    
    if (formData.address && formData.address.length > 500) {
      newErrors.address = 'Alamat maksimal 500 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handlers
  const handleInputChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleUploadAvatar = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'File harus berupa gambar (JPG, PNG, atau GIF)', type: 'error' });
      event.target.value = '';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Ukuran file maksimal 5MB', type: 'error' });
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setMessage({ text: 'Menyiapkan foto untuk dipotong...', type: 'success' });
      
      const dataUrl = await bacaFileSebagaiDataUrl(file);
      setSumberFotoPotong(dataUrl);
      setBukaPotongFoto(true);
      setMessage(null);
    } catch (error) {
      setMessage({ text: 'Upload foto gagal. Silakan coba file lain.', type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  }, []);

  const handleSimpanFotoPotong = useCallback((avatar: string) => {
    if (!student) return;
    
    setAvatarPreview(avatar);
    setIsDirty(true);
    
    updateStudent({
      ...student,
      ...formData,
      name: formData.name.trim() || student.name,
      avatar,
    });
    
    refreshUser();
    setBukaPotongFoto(false);
    setSumberFotoPotong('');
    setMessage({ text: 'Foto profil berhasil diperbarui', type: 'success' });
  }, [student, formData, refreshUser]);

  const handleSaveProfile = useCallback(async () => {
    if (!student) return;
    
    if (!validateForm()) {
      setMessage({ text: 'Mohon periksa kembali data yang dimasukkan', type: 'error' });
      return;
    }

    setIsSaving(true);
    
    try {
      // Simulate API delay untuk UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateStudent({
        ...student,
        name: formData.name.trim() || student.name,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        parentName: formData.parentName.trim() || undefined,
        avatar: avatarPreview || undefined,
      });
      
      refreshUser();
      setIsDirty(false);
      setMessage({ text: 'Profil berhasil diperbarui', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Gagal menyimpan profil. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [student, formData, avatarPreview, validateForm, refreshUser]);

  const handleBatalPotong = useCallback(() => {
    setBukaPotongFoto(false);
    setSumberFotoPotong('');
    setMessage({ text: 'Pemotongan foto dibatalkan', type: 'error' });
  }, []);

  const dismissMessage = useCallback(() => {
    setMessage(null);
  }, []);

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Profil siswa tidak ditemukan</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
          <p className="text-gray-500">Kelola identitas siswa dan foto profil dari satu halaman</p>
        </div>
        {isDirty && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            Ada perubahan belum disimpan
          </span>
        )}
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`rounded-xl p-4 flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <p className={`text-sm font-medium ${
              message.type === 'success' ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {message.text}
            </p>
          </div>
          <button 
            onClick={dismissMessage}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 md:h-40 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>
        
        <div className="px-5 md:px-8 pb-6 -mt-14 md:-mt-16 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative group">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Foto profil"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                    className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-emerald-700 text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                    {getInitials(student.name)}
                  </div>
                )}
                
                {/* Hover overlay untuk ganti foto */}
                <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAvatar}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>
              
              <div className="pb-1">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{student.name}</h2>
                <p className="text-sm text-gray-500">{className} • NIS {student.nis}</p>
              </div>
            </div>

            <label className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isUploadingAvatar 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 cursor-pointer shadow-sm'
            }`}>
              {isUploadingAvatar ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Ganti Foto
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadAvatar}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Data Table */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-emerald-500 rounded-full" />
            Data Profil Saat Ini
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  { label: 'Nama Lengkap', value: student.name },
                  { label: 'NIS', value: student.nis },
                  { label: 'Kelas', value: className },
                  { label: 'Jenis Kelamin', value: student.gender === 'L' ? 'Laki-laki' : 'Perempuan' },
                  { label: 'Email', value: student.email || <span className="text-gray-400 italic">Belum diisi</span> },
                  { label: 'Nomor whatsapp', value: student.phone || <span className="text-gray-400 italic">Belum diisi</span> },
                  { label: 'Nama Orang Tua/Wali', value: student.parentName || <span className="text-gray-400 italic">Belum diisi</span> },
                  { label: 'Alamat', value: student.address || <span className="text-gray-400 italic">Belum diisi</span> },
                ].map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 text-gray-500 w-44">{item.label}</td>
                    <td className="py-3 text-gray-800 font-medium">{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            Pengaturan Profil
          </h2>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="contoh@email.com"
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Whatsapp</label>
                <input
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all ${
                    errors.phone 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Parent Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Orang Tua/Wali</label>
              <input
                value={formData.parentName}
                onChange={e => handleInputChange('parentName', e.target.value)}
                placeholder="Masukkan nama orang tua atau wali"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
              <textarea
                rows={4}
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                placeholder="Masukkan alamat lengkap"
                maxLength={500}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none resize-none transition-all ${
                  errors.address 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                }`}
              />
              <div className="flex justify-between mt-1">
                {errors.address ? (
                  <p className="text-xs text-red-600">{errors.address}</p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-gray-400">
                  {formData.address.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={isSaving || !isDirty}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isSaving || !isDirty
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </button>
            
            {isDirty && (
              <button
                onClick={() => {
                  if (student) {
                    setFormData({
                      name: student.name || '',
                      email: student.email || '',
                      phone: student.phone || '',
                      address: student.address || '',
                      parentName: student.parentName || '',
                    });
                    setAvatarPreview(student.avatar || '');
                    setErrors({});
                    setIsDirty(false);
                  }
                }}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Batalkan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      <ModalPotongFoto
        open={bukaPotongFoto}
        sumberGambar={sumberFotoPotong}
        judul="Potong Foto Profil Siswa"
        warnaAksen="hijau"
        onBatal={handleBatalPotong}
        onSimpan={handleSimpanFotoPotong}
      />
    </div>
  );
}