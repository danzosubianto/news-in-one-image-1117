// png.ts - a minimal, dependency-free PNG writer.
//
// The entry has to run in a sandbox with nothing but the Node standard
// library, so the one image the program ships is encoded by hand here:
// an 8-bit RGB framebuffer goes in, a standards-clean PNG comes out.
// Compression is node:zlib's deflate; the CRC32 below is the PNG
// polynomial (0xEDB88320) computed with a small lookup table.

import { deflateSync } from 'node:zlib';

// Build the CRC table once at module load: entry n is the CRC of the
// single byte n, which lets the update loop run one byte at a time.
const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// One PNG chunk: length, four-letter type, data, CRC over type+data.
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcInput = out.subarray(4, 8 + data.length);
  view.setUint32(8 + data.length, crc32(crcInput));
  return out;
}

function ihdr(width: number, height: number): Uint8Array {
  const data = new Uint8Array(13);
  const view = new DataView(data.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  data[8] = 8; // bit depth: 8 bits per channel
  data[9] = 2; // colour type 2: truecolour RGB
  data[10] = 0; // compression: deflate
  data[11] = 0; // filter: adaptive (we emit filter byte 0 per row)
  data[12] = 0; // interlace: none
  return data;
}

// Encode an RGB framebuffer (width*height*3 bytes, row-major) as PNG.
// Every scanline is prefixed with filter type 0 (None); the images this
// program draws are flat colour and type, which deflate crushes well.
export function encodePng(pixels: Uint8Array, width: number, height: number): Uint8Array {
  const stride = width * 3;
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    raw.set(pixels.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [
    signature,
    chunk('IHDR', ihdr(width, height)),
    chunk('IDAT', new Uint8Array(idat)),
    chunk('IEND', new Uint8Array(0)),
  ];
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const png = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    png.set(part, at);
    at += part.length;
  }
  return png;
}
