import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { muatGambar } from '../../utils/gambar';

interface ModalPotongFotoProps {
  open: boolean;
  sumberGambar: string;
  judul: string;
  warnaAksen: 'biru' | 'hijau';
  onBatal: () => void;
  onSimpan: (avatar: string) => void;
}

const UKURAN_PREVIEW = 280;
const UKURAN_OUTPUT = 512;

export default function ModalPotongFoto({
  open,
  sumberGambar,
  judul,
  warnaAksen,
  onBatal,
  onSimpan,
}: ModalPotongFotoProps) {
  const [zoom, setZoom] = useState(1);
  const [geserX, setGeserX] = useState(0);
  const [geserY, setGeserY] = useState(0);
  const [pesan, setPesan] = useState('');
  const [gambar, setGambar] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!open || !sumberGambar) return;
    setZoom(1);
    setGeserX(0);
    setGeserY(0);
    setPesan('');

    muatGambar(sumberGambar)
      .then(setGambar)
      .catch(() => {
        setPesan('Gagal memuat foto. Silakan pilih ulang gambar.');
        setGambar(null);
      });
  }, [open, sumberGambar]);

  const perhitungan = useMemo(() => {
    if (!gambar) return null;

    const baseScale = Math.max(UKURAN_PREVIEW / gambar.width, UKURAN_PREVIEW / gambar.height);
    const width = gambar.width * baseScale * zoom;
    const height = gambar.height * baseScale * zoom;
    const left = (UKURAN_PREVIEW - width) / 2 + geserX;
    const top = (UKURAN_PREVIEW - height) / 2 + geserY;
    const maxGeserX = Math.max(0, (width - UKURAN_PREVIEW) / 2);
    const maxGeserY = Math.max(0, (height - UKURAN_PREVIEW) / 2);

    return {
      baseScale,
      width,
      height,
      left,
      top,
      maxGeserX,
      maxGeserY,
    };
  }, [gambar, zoom, geserX, geserY]);

  useEffect(() => {
    if (!perhitungan) return;
    setGeserX(current => Math.max(-perhitungan.maxGeserX, Math.min(perhitungan.maxGeserX, current)));
    setGeserY(current => Math.max(-perhitungan.maxGeserY, Math.min(perhitungan.maxGeserY, current)));
  }, [perhitungan?.maxGeserX, perhitungan?.maxGeserY]);

  if (!open) return null;

  const warnaTombol = warnaAksen === 'biru' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700';
  const warnaFokus = warnaAksen === 'biru' ? 'accent-blue-600' : 'accent-emerald-600';

  const handleSimpan = () => {
    if (!gambar || !perhitungan) {
      setPesan('Foto belum siap dipotong.');
      return;
    }

    const sxAwal = ((0 - perhitungan.left) / perhitungan.width) * gambar.width;
    const syAwal = ((0 - perhitungan.top) / perhitungan.height) * gambar.height;
    const swAwal = (UKURAN_PREVIEW / perhitungan.width) * gambar.width;
    const shAwal = (UKURAN_PREVIEW / perhitungan.height) * gambar.height;

    const sx = Math.max(0, Math.min(gambar.width - 1, sxAwal));
    const sy = Math.max(0, Math.min(gambar.height - 1, syAwal));
    const sw = Math.max(1, Math.min(gambar.width - sx, swAwal));
    const sh = Math.max(1, Math.min(gambar.height - sy, shAwal));

    const canvas = document.createElement('canvas');
    canvas.width = UKURAN_OUTPUT;
    canvas.height = UKURAN_OUTPUT;
    const context = canvas.getContext('2d');
    if (!context) {
      setPesan('Gagal memproses foto.');
      return;
    }

    context.drawImage(gambar, sx, sy, sw, sh, 0, 0, UKURAN_OUTPUT, UKURAN_OUTPUT);
    const avatar = canvas.toDataURL('image/jpeg', 0.86);
    onSimpan(avatar);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 md:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{judul}</h3>
          <button
            type="button"
            onClick={onBatal}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <div className="mx-auto relative rounded-xl overflow-hidden border border-gray-200" style={{ width: UKURAN_PREVIEW, height: UKURAN_PREVIEW }}>
            {perhitungan ? (
              <img
                src={sumberGambar}
                alt="Preview potong foto"
                className="absolute max-w-none select-none pointer-events-none"
                style={{
                  width: `${perhitungan.width}px`,
                  height: `${perhitungan.height}px`,
                  left: `${perhitungan.left}px`,
                  top: `${perhitungan.top}px`,
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center text-sm text-gray-500">
                Memuat foto...
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <label className="text-sm text-gray-700">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={event => setZoom(Number(event.target.value))}
                className={`mt-1 w-full ${warnaFokus}`}
              />
            </label>

            <label className="text-sm text-gray-700">
              Geser Horizontal
              <input
                type="range"
                min={-(perhitungan?.maxGeserX || 0)}
                max={perhitungan?.maxGeserX || 0}
                step={1}
                value={geserX}
                onChange={event => setGeserX(Number(event.target.value))}
                className={`mt-1 w-full ${warnaFokus}`}
                disabled={!perhitungan || perhitungan.maxGeserX < 1}
              />
            </label>

            <label className="text-sm text-gray-700">
              Geser Vertikal
              <input
                type="range"
                min={-(perhitungan?.maxGeserY || 0)}
                max={perhitungan?.maxGeserY || 0}
                step={1}
                value={geserY}
                onChange={event => setGeserY(Number(event.target.value))}
                className={`mt-1 w-full ${warnaFokus}`}
                disabled={!perhitungan || perhitungan.maxGeserY < 1}
              />
            </label>
          </div>

          {pesan && <p className="text-sm text-red-600">{pesan}</p>}

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onBatal}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSimpan}
              className={`px-4 py-2 rounded-lg text-white text-sm ${warnaTombol}`}
            >
              Simpan Foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
