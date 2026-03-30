export function bacaFileSebagaiDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });
}

export function muatGambar(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gagal memuat gambar.'));
    image.src = source;
  });
}

export async function kompresGambarFile(
  file: File,
  maxSide = 1080,
  quality = 0.78,
  maxDataUrlLength = 1_200_000,
): Promise<string> {
  const source = await bacaFileSebagaiDataUrl(file);
  return kompresDataUrlGambar(source, maxSide, quality, maxDataUrlLength);
}

export async function kompresDataUrlGambar(
  source: string,
  maxSide = 1080,
  quality = 0.78,
  maxDataUrlLength = 1_200_000,
): Promise<string> {
  const image = await muatGambar(source);

  let sideLimit = maxSide;
  let outputQuality = quality;
  let result = '';

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const ratio = Math.min(1, sideLimit / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * ratio));
    const height = Math.max(1, Math.round(image.height * ratio));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas tidak tersedia.');
    }

    context.drawImage(image, 0, 0, width, height);
    result = canvas.toDataURL('image/jpeg', outputQuality);

    if (result.length <= maxDataUrlLength) {
      return result;
    }

    // Turunkan kualitas dan dimensi bertahap agar ukuran aman untuk localStorage.
    outputQuality = Math.max(0.5, outputQuality - 0.08);
    sideLimit = Math.max(640, Math.round(sideLimit * 0.86));
  }

  return result;
}
