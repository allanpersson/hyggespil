// Tegner Hyggespils brand-ikoner uden nogen afhængigheder (kun Node's egen zlib).
// Kør: node tools/make_icons.js
// Resultat: custom_components/hyggespil/brand/icon.png (256 px) og icon@2x.png (512 px)
// Husk: lav gerne et eget design og erstat filerne før ansøgning om optagelse i kataloget.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const OUT = path.join(__dirname, '..', 'custom_components', 'hyggespil', 'brand');

// ---------- PNG-forpagtning ----------
const CRC = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = (c >>> 0) } return t })();
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
function chunk(type, data) {
  const len = Buffer.alloc(4), t = Buffer.from(type, 'latin1'), crc = Buffer.alloc(4);
  len.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function png(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const stride = size * 4, raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) { raw[y * (stride + 1)] = 0; rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride) }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------- tegning ----------
const BG = [41, 25, 90], GLASS = [248, 246, 255], WINE = [204, 33, 96], DICE = [255, 183, 3];
function paint(size) {
  const px = Buffer.alloc(size * size * 4);
  const put = (x, y, c, a = 255) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4; px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = a;
  };
  const s = size, m = s / 8, rad = s / 6;
  const insideSquare = (x, y) => {                       // afrundet firkant som baggrund
    if (x < m || y < m || x > s - m || y > s - m) return false;
    const cx = Math.min(Math.max(x, m + rad), s - m - rad), cy = Math.min(Math.max(y, m + rad), s - m - rad);
    return (x - cx) ** 2 + (y - cy) ** 2 <= rad * rad || (x >= m + rad && x <= s - m - rad) || (y >= m + rad && y <= s - m - rad);
  };
  const inCircle = (x, y, cx, cy, r) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
  const cx = s / 2;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    if (!insideSquare(x, y)) continue;
    put(x, y, BG);
  }
  // glas: skål = halvcirkel, stilk, fod
  const bowlTop = s * 0.22, bowlR = s * 0.155, bowlCy = bowlTop + bowlR * 0.15;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const inBowl = y >= bowlTop && y <= bowlTop + bowlR * 1.35 && inCircle(x, y, cx, bowlTop, bowlR) && y >= bowlTop;
    const stem = Math.abs(x - cx) <= s * 0.017 && y > bowlTop + bowlR * 1.3 && y < s * 0.72;
    const foot = Math.abs(x - cx) <= s * 0.11 && y >= s * 0.72 && y <= s * 0.755;
    if (inBowl || stem || foot) put(x, y, GLASS);
    // vin i den nederste del af skålen
    if (inBowl && y > bowlTop + bowlR * 0.55) put(x, y, WINE);
  }
  // terning
  const d = s * 0.2, dx = s * 0.6, dy = s * 0.55, rr = s * 0.045;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    if (x < dx || y < dy || x > dx + d || y > dy + d) continue;
    const cornerX = x < dx + rr ? dx + rr : x > dx + d - rr ? dx + d - rr : x;
    const cornerY = y < dy + rr ? dy + rr : y > dy + d - rr ? dy + d - rr : y;
    if ((x < dx + rr || x > dx + d - rr) && (y < dy + rr || y > dy + d - rr) && (x - cornerX) ** 2 + (y - cornerY) ** 2 > rr * rr) continue;
    put(x, y, DICE);
    for (const [fx, fy] of [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]]) {
      if (inCircle(x, y, dx + d * fx, dy + d * fy, s * 0.021)) put(x, y, BG);
    }
  }
  return px;
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, px] of [['icon.png', 256], ['icon@2x.png', 512]]) {
  const file = path.join(OUT, name);
  fs.writeFileSync(file, png(px, paint(px)));
  console.log('skrev', path.relative(path.join(__dirname, '..'), file), px + ' px', fs.statSync(file).size + ' bytes');
}
console.log('Husk at udskifte pladsholder-ikonet med dit eget design før katalogansøgning.');
