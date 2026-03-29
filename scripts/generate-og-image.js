// OG 이미지 생성 스크립트 - sharp의 SVG→PNG 변환 기능 활용
const sharp = require("sharp");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 630;

// slate-800 그라데이션 SVG - sharp의 librsvg로 렌더링
const svg = `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#e879f9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#818cf8;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />

  <!-- Decorative circle top-right -->
  <circle cx="1050" cy="80" r="200" fill="#334155" opacity="0.4" />
  <!-- Decorative circle bottom-left -->
  <circle cx="150" cy="550" r="150" fill="#334155" opacity="0.3" />

  <!-- Accent line -->
  <rect x="80" y="260" width="120" height="6" rx="3" fill="url(#accent)" />

  <!-- Main title -->
  <text
    x="80"
    y="320"
    font-family="Arial, Helvetica, sans-serif"
    font-size="72"
    font-weight="bold"
    fill="#ffffff"
    letter-spacing="-1"
  >K-Beauty Buyers Guide</text>

  <!-- Subtitle -->
  <text
    x="80"
    y="400"
    font-family="Arial, Helvetica, sans-serif"
    font-size="36"
    fill="#cbd5e1"
    letter-spacing="0"
  >Find Your Perfect Korean Beauty Clinic</text>

  <!-- Tag line -->
  <text
    x="80"
    y="460"
    font-family="Arial, Helvetica, sans-serif"
    font-size="24"
    fill="#94a3b8"
  >Trusted reviews &#183; Expert recommendations &#183; K-Beauty treatments</text>

  <!-- Bottom domain badge -->
  <rect x="80" y="520" width="360" height="44" rx="22" fill="#334155" />
  <text
    x="260"
    y="549"
    font-family="Arial, Helvetica, sans-serif"
    font-size="20"
    fill="#e2e8f0"
    text-anchor="middle"
  >kbeautybuyersguide.com</text>
</svg>`;

async function main() {
  const outputPath = path.join(__dirname, "../public/og-image.png");
  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`OG image generated: ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
