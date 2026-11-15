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
const BG = [41, 25, 90], KORT = [250, 248, 255], HJERTE = [220, 38, 72], DICE = [255, 183, 3];
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
  const cx = s / 2, cy = s * 0.52;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    if (!insideSquare(x, y)) continue;
    put(x, y, BG);
  }

  /* spillekort, let drejet: hvidt kort med et rødt hjerte og hjørneprikker */
  const vinkel = -0.22, cos = Math.cos(vinkel), sin = Math.sin(vinkel);
  const cw = s * 0.46, ch = s * 0.66, cr = s * 0.05;
  const hjerteR = s * 0.085;
  const hjerte = (u, v) => {
    const top = v < 0;
    if (top) {
      const dx = Math.abs(u);
      return (dx - hjerteR * 0.52) ** 2 + (v + hjerteR * 0.34) ** 2 <= hjerteR * hjerteR * 0.92;
    }
    return Math.abs(u) <= hjerteR * (1 - (v / (hjerteR * 1.45))) * 1.02 && v <= hjerteR * 1.45;
  };
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    if (!insideSquare(x, y)) continue;
    const dx = x - cx, dy = y - cy;
    const u = dx * cos - dy * sin, v = dx * sin + dy * cos;
    if (Math.abs(u) > cw / 2 || Math.abs(v) > ch / 2) continue;
    const qx = Math.abs(u) - (cw / 2 - cr), qy = Math.abs(v) - (ch / 2 - cr);
    const udenfor = qx > 0 && qy > 0 && qx * qx + qy * qy > cr * cr;
    if (udenfor) continue;
    put(x, y, KORT);
    if (hjerte(u, v)) put(x, y, HJERTE);
    /* små hjørnehjerter */
    for (const [su, sv] of [[-1, -1], [1, 1]]) {
      const pu = u - su * (cw / 2 - s * 0.075), pv = v - sv * (ch / 2 - s * 0.085);
      if ((pu * pu + pv * pv) <= (s * 0.026) ** 2) put(x, y, HJERTE);
    }
  }
  /* lille terning nederst til højre, så både kort og terning er med */
  const d = s * 0.17, dx0 = s * 0.66, dy0 = s * 0.64, rr = s * 0.038;
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    if (x < dx0 || y < dy0 || x > dx0 + d || y > dy0 + d) continue;
    const cornerX = x < dx0 + rr ? dx0 + rr : x > dx0 + d - rr ? dx0 + d - rr : x;
    const cornerY = y < dy0 + rr ? dy0 + rr : y > dy0 + d - rr ? dy0 + d - rr : y;
    if ((x < dx0 + rr || x > dx0 + d - rr) && (y < dy0 + rr || y > dy0 + d - rr) && (x - cornerX) ** 2 + (y - cornerY) ** 2 > rr * rr) continue;
    put(x, y, DICE);
    for (const [fx, fy] of [[0.5, 0.25], [0.25, 0.5], [0.75, 0.5], [0.5, 0.75]]) {
      if (inCircle(x, y, dx0 + d * fx, dy0 + d * fy, s * 0.017)) put(x, y, BG);
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
