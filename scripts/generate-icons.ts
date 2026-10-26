import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Function to generate a simple uncompressed PNG buffer using zlib
function createPng(width: number, height: number, renderPixel: (x: number, y: number) => [number, number, number, number]): Buffer {
  const bytesPerPixel = 4; // RGBA
  const scanlineLength = width * bytesPerPixel + 1; // +1 for filter byte
  const rawData = Buffer.alloc(scanlineLength * height);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // CRC32 implementation
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c;
  }

  function crc32(buf: Buffer): number {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function createChunk(type: string, data: Buffer): Buffer {
    const len = data.length;
    const chunk = Buffer.alloc(len + 12);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    const crc = crc32(chunk.subarray(4, len + 8));
    chunk.writeUInt32BE(crc, len + 8);
    return chunk;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression method
  ihdrData[11] = 0; // Filter method
  ihdrData[12] = 0; // Interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate Solar Clock Icon
function renderSolarIcon(size: number, isMaskable: boolean) {
  const center = size / 2;
  const radius = isMaskable ? size * 0.38 : size * 0.46;

  return (x: number, y: number): [number, number, number, number] => {
    const dx = x - center;
    const dy = y - center;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Deep space dark background
    if (dist > radius + 4) {
      if (isMaskable) {
        return [5, 7, 12, 255]; // Solid background for maskable
      }
      return [0, 0, 0, 0];
    }

    // Outer clock border / bezel
    if (dist >= radius - 3 && dist <= radius + 2) {
      return [217, 119, 6, 255]; // Amber border
    }

    // Inside the clock face: dark blue-black gradient
    const bgFactor = Math.min(1, dist / radius);
    let r = Math.round(5 + bgFactor * 12);
    let g = Math.round(7 + bgFactor * 18);
    let b = Math.round(16 + bgFactor * 40);

    // Celestial ring at 0.72 radius
    const ringDist = Math.abs(dist - radius * 0.72);
    if (ringDist <= 1.5) {
      return [56, 189, 248, 200]; // Cyan celestial ring
    }

    // Hour tick marks (12 ticks around celestial ring)
    const normalizedAngle = (angle + 2 * Math.PI) % (Math.PI / 6);
    if (ringDist <= 6 && (normalizedAngle < 0.05 || normalizedAngle > Math.PI / 6 - 0.05)) {
      return [251, 191, 36, 240];
    }

    // Sun Rays at 0.38 to 0.52 radius (8 rays)
    const rayDist = dist - radius * 0.35;
    if (rayDist > 0 && rayDist < radius * 0.22) {
      const rayAngle = (angle + 2 * Math.PI) % (Math.PI / 4);
      if (rayAngle < 0.12 || rayAngle > Math.PI / 4 - 0.12) {
        return [245, 158, 11, 230];
      }
    }

    // Sun Core at center (< 0.3 radius)
    const sunRadius = radius * 0.32;
    if (dist <= sunRadius) {
      const sunFactor = dist / sunRadius;
      // Bright golden sun
      return [
        255,
        Math.round(230 - sunFactor * 70),
        Math.round(120 - sunFactor * 100),
        255
      ];
    }

    return [r, g, b, 255];
  };
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');
const icon192 = createPng(192, 192, renderSolarIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPng(512, 512, renderSolarIcon(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const iconMaskable = createPng(512, 512, renderSolarIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

const appleTouchIcon = createPng(180, 180, renderSolarIcon(180, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);

// Create favicon.ico (can be 32x32 PNG inside standard ICO or simply 32x32 PNG)
const icon32 = createPng(32, 32, renderSolarIcon(32, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icon32);

// Create public/icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="128" fill="#05070c"/>
  <circle cx="256" cy="256" r="210" stroke="#f59e0b" stroke-width="4" opacity="0.6"/>
  <circle cx="256" cy="256" r="160" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 8" opacity="0.5"/>
  <!-- Horizon Line -->
  <line x1="46" y1="256" x2="466" y2="256" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.5"/>
  <!-- Sun Rays -->
  <g stroke="#f59e0b" stroke-width="3" opacity="0.7">
    <line x1="256" y1="130" x2="256" y2="105"/>
    <line x1="256" y1="382" x2="256" y2="407"/>
    <line x1="130" y1="256" x2="105" y2="256"/>
    <line x1="382" y1="256" x2="407" y2="256"/>
    <line x1="167" y1="167" x2="149" y2="149"/>
    <line x1="345" y1="345" x2="363" y2="363"/>
    <line x1="167" y1="345" x2="149" y2="363"/>
    <line x1="345" y1="167" x2="363" y2="149"/>
  </g>
  <!-- Solar Transit Curve Arc -->
  <path d="M 80 340 Q 256 120 432 340" fill="none" stroke="#22c55e" stroke-width="3" opacity="0.8"/>
  <!-- Glowing Sun Core -->
  <circle cx="256" cy="256" r="64" fill="url(#sun-grad)"/>
  <defs>
    <radialGradient id="sun-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="35%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </radialGradient>
  </defs>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);

console.log('Icons generated successfully.');
