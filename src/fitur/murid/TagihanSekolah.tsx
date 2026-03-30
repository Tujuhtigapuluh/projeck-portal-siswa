import { useMemo, useState } from 'react';
import { CreditCard, Landmark, Wallet, CircleDollarSign } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import {
  bayarTagihanSekolah,
  getTagihanSekolahBySiswa,
  getTahunTagihanSiswa,
} from '../../data/store';
import type { TagihanSekolah } from '../../types';
import { useStoreVersion } from '../../hooks/useStoreVersion';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const PAYMENT_METHODS: Array<{
  value: NonNullable<TagihanSekolah['paymentMethod']>;
  label: string;
}> = [
  { value: 'atm', label: 'ATM Transfer' },
  { value: 'mobile_banking', label: 'Mobile Banking' },
  { value: 'internet_banking', label: 'Internet Banking' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'tunai', label: 'Tunai di Tata Usaha' },
];

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTanggalWaktu(timestamp?: number) {
  if (!timestamp) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

function getPaymentMethodLabel(method?: TagihanSekolah['paymentMethod']) {
  if (!method) return '-';
  return PAYMENT_METHODS.find(item => item.value === method)?.label || method;
}

export default function TagihanSekolahPage() {
  const { user } = useAuth();
  const storeVersion = useStoreVersion();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<NonNullable<TagihanSekolah['paymentMethod']>>('atm');
  const [infoMessage, setInfoMessage] = useState<string>('');

  const availableYears = useMemo(() => {
    if (!user) return [];
    return getTahunTagihanSiswa(user.id);
  }, [user, storeVersion]);

  const activeYear = selectedYear ?? availableYears[0] ?? new Date().getFullYear();

  const bills = useMemo(() => {
    if (!user) return [];
    return getTagihanSekolahBySiswa(user.id, activeYear);
  }, [user, activeYear, storeVersion]);

  const ringkasan = useMemo(() => {
    const lunas = bills.filter(item => item.status === 'lunas');
    const belumLunas = bills.filter(item => item.status === 'belum_lunas');
    return {
      totalTagihan: bills.reduce((sum, item) => sum + item.amount, 0),
      totalLunas: lunas.reduce((sum, item) => sum + item.amount, 0),
      totalBelumLunas: belumLunas.reduce((sum, item) => sum + item.amount, 0),
      jumlahLunas: lunas.length,
      jumlahBelumLunas: belumLunas.length,
    };
  }, [bills]);

  const billToPay = bills.find(item => item.id === selectedBillId && item.status === 'belum_lunas') || null;

  const handleBayar = () => {
    if (!billToPay) return;
    bayarTagihanSekolah(billToPay.id, selectedMethod);
    setInfoMessage(`Pembayaran ${MONTH_NAMES[billToPay.month - 1]} ${billToPay.year} berhasil diproses.`);
    setSelectedBillId('');
  };

  const handleUnduhBuktiPdf = (bill: TagihanSekolah) => {
    const paymentLabel = getPaymentMethodLabel(bill.paymentMethod);
    const nomorTransaksi = `TRX-${bill.year}${String(bill.month).padStart(2, '0')}-${bill.studentId.toUpperCase()}`;
    const tanggalCetak = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(Date.now());

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 52;
    let cursorY = 66;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Bukti Pembayaran Uang Sekolah', marginX, cursorY);

    cursorY += 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text('Dokumen pembayaran resmi siswa', marginX, cursorY);

    cursorY += 16;
    doc.setDrawColor(203, 213, 225);
    doc.line(marginX, cursorY, 545, cursorY);

    cursorY += 28;
    doc.setTextColor(17, 24, 39);
    const detailRows: Array<[string, string]> = [
      ['Nomor Transaksi', nomorTransaksi],
      ['Tanggal Cetak', tanggalCetak],
      ['Nama Siswa', user?.name || '-'],
      ['ID Siswa', bill.studentId],
      ['Periode', `${MONTH_NAMES[bill.month - 1]} ${bill.year}`],
      ['Metode Pembayaran', paymentLabel],
      ['Waktu Pembayaran', formatTanggalWaktu(bill.paidAt)],
      ['Status', 'Lunas'],
    ];

    detailRows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${label}:`, marginX, cursorY);

      doc.setFont('helvetica', 'normal');
      const wrappedValue = doc.splitTextToSize(value, 350);
      doc.text(wrappedValue, marginX + 140, cursorY);
      cursorY += Math.max(18, wrappedValue.length * 14);
    });

    cursorY += 12;
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, cursorY, 493, 72);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Total Pembayaran', marginX + 14, cursorY + 24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(formatRupiah(bill.amount), marginX + 14, cursorY + 54);

    cursorY += 98;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Dokumen ini dibuat otomatis oleh sistem absensi dan administrasi sekolah.', marginX, cursorY);

    const namaBulan = MONTH_NAMES[bill.month - 1].toLowerCase();
    const namaFile = `bukti-pembayaran-${namaBulan}-${bill.year}.pdf`;
    doc.save(namaFile);
  };

  const handleUnduhDaftarTahunanPdf = () => {
    if (!user) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 48;
    let cursorY = 60;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Daftar Pembayaran Tahun ${activeYear}`, marginX, cursorY);

    cursorY += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Nama Siswa: ${user.name}`, marginX, cursorY);
    cursorY += 16;
    doc.text(`ID Siswa: ${user.id}`, marginX, cursorY);

    cursorY += 16;
    const tanggalCetak = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(Date.now());
    doc.text(`Tanggal Cetak: ${tanggalCetak}`, marginX, cursorY);

    cursorY += 18;
    doc.setDrawColor(203, 213, 225);
    doc.line(marginX, cursorY, 547, cursorY);

    cursorY += 22;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Bulan', marginX, cursorY);
    doc.text('Status', marginX + 120, cursorY);
    doc.text('Nominal', marginX + 210, cursorY);
    doc.text('Metode', marginX + 320, cursorY);
    doc.text('Waktu Bayar', marginX + 430, cursorY);

    cursorY += 10;
    doc.setLineWidth(0.6);
    doc.line(marginX, cursorY, 547, cursorY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    bills.forEach((bill) => {
      if (cursorY > 760) {
        doc.addPage();
        cursorY = 60;
      }

      cursorY += 18;
      doc.text(MONTH_NAMES[bill.month - 1], marginX, cursorY);
      doc.text(bill.status === 'lunas' ? 'Lunas' : 'Belum Lunas', marginX + 120, cursorY);
      doc.text(formatRupiah(bill.amount), marginX + 210, cursorY);
      doc.text(getPaymentMethodLabel(bill.paymentMethod), marginX + 320, cursorY);
      doc.text(formatTanggalWaktu(bill.paidAt), marginX + 430, cursorY);

      cursorY += 6;
      doc.setDrawColor(229, 231, 235);
      doc.line(marginX, cursorY, 547, cursorY);
    });

    cursorY += 24;
    doc.setFont('helvetica', 'bold');
    doc.text(`Ringkasan: ${ringkasan.jumlahLunas} bulan lunas, ${ringkasan.jumlahBelumLunas} bulan belum lunas`, marginX, cursorY);

    const namaFile = `daftar-pembayaran-${activeYear}-${user.id}.pdf`;
    doc.save(namaFile);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Tagihan Uang Sekolah</h1>
            <p className="text-sm text-gray-500 mt-1">Daftar tagihan bulanan per tahun dan status pembayarannya.</p>
          </div>
          <label className="text-sm text-gray-700 flex items-center gap-2">
            Tahun
            <select
              value={activeYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-xs text-gray-500">Total Tagihan</p>
            <p className="text-base font-semibold text-gray-800 mt-1">{formatRupiah(ringkasan.totalTagihan)}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-xs text-green-700">Sudah Dibayar</p>
            <p className="text-base font-semibold text-green-700 mt-1">{ringkasan.jumlahLunas} bulan</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs text-red-700">Belum Dibayar</p>
            <p className="text-base font-semibold text-red-700 mt-1">{ringkasan.jumlahBelumLunas} bulan</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-gray-800">Daftar Bulanan Tahun {activeYear}</h2>
          <button
            onClick={handleUnduhDaftarTahunanPdf}
            className="px-3 py-2 rounded-lg border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-50"
          >
            Unduh PDF Pembayaran Tahun {activeYear}
          </button>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500">Bulan</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500">Nominal</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500">Jatuh Tempo</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500">Status</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500">Metode Bayar</th>
                <th className="text-left px-3 py-2 border-b border-gray-200 text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(item => (
                <tr key={item.id}>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{MONTH_NAMES[item.month - 1]}</td>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{formatRupiah(item.amount)}</td>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{item.dueDate}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        item.status === 'lunas'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{getPaymentMethodLabel(item.paymentMethod)}</td>
                  <td className="px-3 py-2 border-b border-gray-100">
                    {item.status === 'belum_lunas' ? (
                      <button
                        onClick={() => {
                          setSelectedBillId(item.id);
                          setInfoMessage('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                      >
                        Bayar
                      </button>
                     ) : (
                       <button
                         onClick={() => handleUnduhBuktiPdf(item)}
                         className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-50"
                       >
                         Bukti Bulanan
                       </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800">Mode Pembayaran</h2>
        <p className="text-sm text-gray-500 mt-1">Pilih metode lalu proses pembayaran bulan yang dipilih.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.value}
              onClick={() => setSelectedMethod(method.value)}
              className={`rounded-lg border px-3 py-3 text-left ${
                selectedMethod === method.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 text-gray-700">
                {method.value === 'atm' && <Landmark className="w-4 h-4" />}
                {method.value === 'mobile_banking' && <CreditCard className="w-4 h-4" />}
                {method.value === 'internet_banking' && <CreditCard className="w-4 h-4" />}
                {method.value === 'ewallet' && <Wallet className="w-4 h-4" />}
                {method.value === 'tunai' && <CircleDollarSign className="w-4 h-4" />}
                <span className="text-sm font-medium">{method.label}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select
            value={selectedBillId}
            onChange={(event) => setSelectedBillId(event.target.value)}
            className="min-w-[280px] border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Pilih bulan yang ingin dibayar</option>
            {bills
              .filter(item => item.status === 'belum_lunas')
              .map(item => (
                <option key={item.id} value={item.id}>
                  {MONTH_NAMES[item.month - 1]} {item.year} - {formatRupiah(item.amount)}
                </option>
              ))}
          </select>
          <button
            onClick={handleBayar}
            disabled={!billToPay}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            Proses Pembayaran
          </button>
        </div>
        {billToPay && (
          <p className="text-xs text-gray-500 mt-2">
            Pembayaran untuk {MONTH_NAMES[billToPay.month - 1]} {billToPay.year} sebesar {formatRupiah(billToPay.amount)}.
          </p>
        )}
        {infoMessage && <p className="text-sm text-green-700 mt-3">{infoMessage}</p>}
      </div>
    </div>
  );
}