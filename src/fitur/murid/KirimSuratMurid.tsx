import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addSuratIzin, getClasses, getStudents, getSuratIzinByStudent } from '../../data/store';
import { useStoreVersion } from '../../hooks/useStoreVersion';
import { Send, Upload } from 'lucide-react';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

export default function KirimSuratMurid() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [type, setType] = useState<'izin' | 'sakit' | 'dispensasi' | 'lainnya'>('izin');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const student = useMemo(() => getStudents().find(item => item.id === user?.id), [user, storeVersion]);

  const className = useMemo(() => {
    if (!student) return '-';
    return getClasses().find(item => item.id === student.classId)?.name || '-';
  }, [student, storeVersion]);

  const riwayatSurat = useMemo(() => {
    if (!user) return [];
    return getSuratIzinByStudent(user.id);
  }, [user, storeVersion]);

  const handleSubmit = async () => {
    if (!user || !student || !subject.trim() || !message.trim()) {
      setFeedback('Perihal dan isi surat wajib diisi.');
      return;
    }

    if (attachment && attachment.size > 2 * 1024 * 1024) {
      setFeedback('Ukuran file maksimal 2MB.');
      return;
    }

    setIsSaving(true);
    setFeedback('');
    try {
      const attachmentDataUrl = attachment ? await readFileAsDataUrl(attachment) : undefined;
      addSuratIzin({
        id: `ltr_${Date.now()}`,
        studentId: student.id,
        classId: student.classId,
        type,
        status: 'menunggu',
        subject: subject.trim(),
        message: message.trim(),
        letterDate,
        attachmentName: attachment?.name,
        attachmentDataUrl,
        createdAt: Date.now(),
      });
      setFeedback('Surat berhasil dikirim ke guru.');
      setSubject('');
      setMessage('');
      setAttachment(null);
    } catch {
      setFeedback('Terjadi kendala saat mengirim surat. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const typeLabel: Record<string, string> = {
    izin: 'Izin',
    sakit: 'Sakit',
    dispensasi: 'Dispensasi',
    lainnya: 'Lainnya',
  };

  const statusLabel = {
    menunggu: 'Menunggu',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
  } as const;

  const statusStyle = {
    menunggu: 'bg-amber-100 text-amber-700',
    disetujui: 'bg-emerald-100 text-emerald-700',
    ditolak: 'bg-red-100 text-red-700',
  } as const;

  return (
     <div className="space-y-5">
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Kirim Surat Izin</h1>
		<p className="text-sm text-gray-500 mt-1">
        Kirim surat izin, sakit, atau dispensasi langsung ke guru kelas.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Form Surat</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nama</label>
              <input value={student?.name || '-'} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">NIS</label>
              <input value={student?.nis || '-'} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Kelas</label>
              <input value={className} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tanggal Surat</label>
              <input
                type="date"
                value={letterDate}
                onChange={event => setLetterDate(event.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Jenis Surat</label>
              <select
                value={type}
                onChange={event => setType(event.target.value as 'izin' | 'sakit' | 'dispensasi' | 'lainnya')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="dispensasi">Dispensasi</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Perihal</label>
              <input
                value={subject}
                onChange={event => setSubject(event.target.value)}
                placeholder="Contoh: Izin tidak masuk"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Isi Surat</label>
            <textarea
              rows={7}
              value={message}
              onChange={event => setMessage(event.target.value)}
              placeholder="Jelaskan alasan izin/sakit dengan ringkas dan jelas."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Upload Surat (opsional)</label>
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50">
              <Upload className="w-4 h-4" /> Pilih File
              <input type="file" className="hidden" onChange={event => setAttachment(event.target.files?.[0] || null)} />
            </label>
            <p className="text-xs text-gray-500 mt-1">{attachment?.name || 'Belum ada file dipilih'}</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSaving ? 'Mengirim...' : 'Kirim Surat'}
          </button>

          {feedback && <p className={`text-sm ${feedback.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>}
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800">Riwayat Surat Saya</h2>
          <div className="mt-3 space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {riwayatSurat.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-gray-800">{index + 1}. {item.subject}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {typeLabel[item.type]} | Tanggal {new Date(`${item.letterDate}T00:00:00`).toLocaleDateString('id-ID')} | Dikirim {new Date(item.createdAt).toLocaleString('id-ID')}
                </p>
                <p className="mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[item.status]}`}>
                    Status: {statusLabel[item.status]}
                  </span>
                </p>
                <p className="text-sm text-gray-700 mt-2">{item.message}</p>
                <p className="text-xs text-gray-500 mt-1">Lampiran: {item.attachmentName || '-'}</p>
              </div>
            ))}
            {riwayatSurat.length === 0 && <p className="text-sm text-gray-500">Belum ada surat yang dikirim.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}