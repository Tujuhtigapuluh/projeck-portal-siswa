import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getClasses, getTeachers, saveTeachers } from '../../data/store';
import { useStoreVersion } from '../../hooks/useStoreVersion';
import ModalPotongFoto from '../bersama/ModalPotongFoto';
import { bacaFileSebagaiDataUrl } from '../../utils/gambar';

export default function ProfilGuru() {
  const { user, refreshUser } = useAuth();
  const storeVersion = useStoreVersion();

  const teacher = useMemo(() => getTeachers().find(item => item.id === user?.id), [user, storeVersion]);
  const kelasAjar = useMemo(() => {
    if (!teacher) return '-';
    const classes = getClasses();
    const names = teacher.classIds
      .map(classId => classes.find(item => item.id === classId)?.name || '')
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : '-';
  }, [teacher, storeVersion]);

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [sumberFotoPotong, setSumberFotoPotong] = useState('');
  const [bukaPotongFoto, setBukaPotongFoto] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!teacher) return;
    setName(teacher.name);
    setSubject(teacher.subject || '');
    setEmail(teacher.email || '');
    setPhone(teacher.phone || '');
    setAddress(teacher.address || '');
    setAvatarPreview(teacher.avatar || '');
  }, [teacher]);

  if (!teacher) {
    return <p className="text-sm text-gray-500">Profil guru tidak ditemukan.</p>;
  }

  const updateTeacherData = (partial: Partial<typeof teacher>) => {
    const teachers = getTeachers();
    const nextTeachers = teachers.map(item => (
      item.id === teacher.id
        ? { ...item, ...partial }
        : item
    ));
    saveTeachers(nextTeachers);
    refreshUser();
  };

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
    updateTeacherData({ avatar });
    setBukaPotongFoto(false);
    setSumberFotoPotong('');
    setMessage('Foto profil guru berhasil diperbarui.');
  };

  const handleSaveProfile = () => {
    updateTeacherData({
      name: name.trim() || teacher.name,
      subject: subject.trim() || teacher.subject,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      avatar: avatarPreview || undefined,
    });
    setMessage('Profil guru berhasil diperbarui.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profil Guru</h1>
        <p className="text-gray-500">Kelola foto dan data diri guru.</p>
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-32 md:h-40 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />
        <div className="px-5 md:px-8 pb-6 -mt-14 md:-mt-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Foto profil guru"
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-sm"
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-blue-700 text-white flex items-center justify-center text-4xl font-bold border-4 border-white shadow-sm">
                  {(teacher.name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="pb-1">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{teacher.name}</h2>
                <p className="text-sm text-gray-500">NIP {teacher.nip} - {teacher.subject}</p>
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
                  <td className="py-2 text-gray-800 font-medium">{teacher.name}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">NIP</td>
                  <td className="py-2 text-gray-800 font-medium">{teacher.nip}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Mata Pelajaran</td>
                  <td className="py-2 text-gray-800 font-medium">{teacher.subject}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Kelas Ajar</td>
                  <td className="py-2 text-gray-800 font-medium">{kelasAjar}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Email</td>
                  <td className="py-2 text-gray-800 font-medium">{teacher.email || '-'}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500">Nomor Telepon</td>
                  <td className="py-2 text-gray-800 font-medium">{teacher.phone || '-'}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500">Alamat</td>
                  <td className="py-2 text-gray-800 font-medium">{teacher.address || '-'}</td>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
              <input
                value={subject}
                onChange={event => setSubject(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="contoh@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
              <input
                value={phone}
                onChange={event => setPhone(event.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                rows={4}
                value={address}
                onChange={event => setAddress(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <Save className="w-4 h-4" /> Simpan Perubahan
            </button>
            {message && <p className="text-sm text-blue-700">{message}</p>}
          </div>
        </div>
      </div>

      <ModalPotongFoto
        open={bukaPotongFoto}
        sumberGambar={sumberFotoPotong}
        judul="Potong Foto Profil Guru"
        warnaAksen="biru"
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
