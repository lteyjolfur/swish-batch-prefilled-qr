import sharp from "sharp";
import path from "path";
import TextToSVG from "text-to-svg";
// Helper to load Geist font as base64

const fontPath = path.join(process.cwd(), "public/fonts/Geist-SemiBold.ttf");

const textToSVG = TextToSVG.loadSync(fontPath);

export async function composeCard(
  qrBuffer: Buffer,
  label?: string,
): Promise<Buffer> {
  // Refined card layout constants
  const cardWidth = 520;
  const cardHeight = 600;
  const cardRadius = 26;
  const qrSize = 462; // +12px for stronger focus
  const topPadding = 10; // slightly less top padding
  const labelHeight = 68;
  const labelRadius = 18;
  const borderColor = "#ececec";
  const cardColor = "#fff"; // pure white

  // Fallback to label or empty string
  const text = label || "";

  // Calculate label bar position
  const bottomPadding = 24;
  const labelY = cardHeight - labelHeight - bottomPadding;

  const textSvg = textToSVG.getPath(text, {
    x: cardWidth / 2,
    y: labelY + labelHeight / 2,
    fontSize: 32,
    anchor: "center middle",
    attributes: {
      fill: "#ffffff",
    },
  });

  // SVG background with card, border, label bar (not full width), subtle shadow, outline, and visually centered text
  const svg = `
<svg width='${cardWidth}' height='${cardHeight}' viewBox='0 0 ${cardWidth} ${cardHeight}' xmlns='http://www.w3.org/2000/svg'>

  <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000" flood-opacity="0.07"/>
    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#a855f7" flood-opacity="0.10"/>
  </filter>


  <rect x='0' y='0' width='${cardWidth}' height='${cardHeight}'
    rx='${cardRadius}'
    fill='${cardColor}'
    stroke='${borderColor}'
    stroke-width='2'
    filter='url(#cardShadow)'
  />

  <rect x='40' y='${labelY}' width='${cardWidth - 80}' height='${labelHeight}'
    rx='${labelRadius}'
    fill='url(#g1)'
  />

  <defs>
    <linearGradient id='g1' x1='0' y1='0' x2='1' y2='0'>
      <stop offset='0%' stop-color='#a855f7'/>
      <stop offset='100%' stop-color='#ec4899'/>
    </linearGradient>
  </defs>

  ${textSvg}

</svg>
`;

  // Debug: output SVG string to console

  // console.log("[composeCard SVG]", svg);

  // Resize QR to 462x462
  const qrImg = await sharp(qrBuffer)
    .resize(qrSize, qrSize, { fit: "contain" })
    .toBuffer();

  // Compose card: background SVG, QR, label
  const card = await sharp(Buffer.from(svg))
    .composite([
      {
        input: qrImg,
        top: topPadding,
        left: Math.round((cardWidth - qrSize) / 2),
      },
    ])
    .png()
    .toBuffer();

  return card;
}
