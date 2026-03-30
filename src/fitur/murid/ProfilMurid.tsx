import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getStudents, updateStudent } from '../../data/store';
import { useStoreVersion } from '../../hooks/useStoreVersion';
import { Camera, Save } from 'lucide-react';
import ModalPotongFoto from '../bersama/ModalPotongFoto';
import { bacaFileSebagaiDataUrl } from '../../utils/gambar';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const storeVersion = useStoreVersion();
  const student = useMemo(() => getStudents().find(item => item.id === user?.id), [user, storeVersion]);
  const className = useMemo(() => {
    if (!student) return '-';
    return getClasses().find(item => item.id === student.classId)?.name || '-';
  }, [student, storeVersion]);

  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [address, setAddress] = useState(student?.address || '');
  const [parentName, setParentName] = useState(student?.parentName || '');
  const [avatarPreview, setAvatarPreview] = useState(student?.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [sumberFotoPotong, setSumberFotoPotong] = useState('');
  const [bukaPotongFoto, setBukaPotongFoto] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!student) return;
    setName(student.name || '');
    setEmail(student.email || '');
    setPhone(student.phone || '');
    setAddress(student.address || '');
    setParentName(student.parentName || '');
    setAvatarPreview(student.avatar || '');
  }, [student]);

  if (!student) {
    return <p className="text-sm text-gray-500">Profil siswa tidak ditemukan.</p>;
  }

  const handleUploadAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('File harus berupa gambar.');
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setMessage('Menyiapkan foto untuk dipotong...');
      const dataUrl = await bacaFileSebagaiDataUrl(file);
      setSumberFotoPotong(dataUrl);
      setBukaPotongFoto(true);
      setMessage('Silakan potong foto agar wajah terlihat jelas.');
    } catch {
      setMessage('Upload foto gagal. Coba file lain.');
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleSimpanFotoPotong = (avatar: string) => {
    setAvatarPreview(avatar);
    updateStudent({
      ...student,
      name: name.trim() || student.name,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      parentName: parentName.trim() || undefined,
      avatar,
    });
    refreshUser();
    setBukaPotongFoto(false);
    setSumberFotoPotong('');
    setMessage('Foto profil berhasil diperbarui.');
  };

  const handleSaveProfile = () => {
    updateStudent({
      ...student,
      name: name.trim() || student.name,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      parentName: parentName.trim() || undefined,
      avatar: avatarPreview || undefined,
    });
    refreshUser();
    setMessage('Profil berhasil diperbarui.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
        <p className="text-gray-500">Kelola identitas siswa dan foto profil dari satu halaman.</p>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 md:h-40 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500" />
        <div className="px-5 md:px-8 pb-6 -mt-14 md:-mt-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Foto profil"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-sm"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-emerald-700 text-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-sm">
                  {student.name.charAt(0)}
                </div>
              )}
              <div className="pb-1">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{student.name}</h2>
                <p className="text-sm text-gray-500">{className} - NIS {student.nis}</p>
              </div>
            </div>

            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer hover:bg-gray-50 bg-white">
              <Camera className="w-4 h-4" /> {isUploadingAvatar ? 'Sedang Upload...' : 'Upload Foto Profil'}
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

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Data Profil Saat Ini</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500 w-40">Nama Lengkap</td>
                  <td className="py-2 text-gray-800 font-medium">{student.name}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">NIS</td>
                  <td className="py-2 text-gray-800 font-medium">{student.nis}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Kelas</td>
                  <td className="py-2 text-gray-800 font-medium">{className}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Jenis Kelamin</td>
                  <td className="py-2 text-gray-800 font-medium">{student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Email</td>
                  <td className="py-2 text-gray-800 font-medium">{student.email || '-'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Nomor Telepon</td>
                  <td className="py-2 text-gray-800 font-medium">{student.phone || '-'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Nama Orang Tua/Wali</td>
                  <td className="py-2 text-gray-800 font-medium">{student.parentName || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">Alamat</td>
                  <td className="py-2 text-gray-800 font-medium">{student.address || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Pengaturan Profil</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="contoh@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <input
                value={phone}
                onChange={event => setPhone(event.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua/Wali</label>
              <input
                value={parentName}
                onChange={event => setParentName(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                rows={4}
                value={address}
                onChange={event => setAddress(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
            >
              <Save className="w-4 h-4" /> Simpan Perubahan
            </button>
            {message && <p className="text-sm text-emerald-600">{message}</p>}
          </div>
        </div>
      </div>

      <ModalPotongFoto
        open={bukaPotongFoto}
        sumberGambar={sumberFotoPotong}
        judul="Potong Foto Profil Siswa"
        warnaAksen="hijau"
        onBatal={() => {
          setBukaPotongFoto(false);
          setSumberFotoPotong('');
          setMessage('Pemotongan foto dibatalkan.');
        }}
        onSimpan={handleSimpanFotoPotong}
      />
    </div>
  );
}