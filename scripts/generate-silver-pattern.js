import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = '/Users/jougy/.gemini/antigravity/brain/ba15b103-65e1-4f94-87b7-3f261182b7dc/.user_uploaded/media_1788250573320.jpg';
const outputDir = '/Users/jougy/Documents/therapy-flow/website/public/assets';

async function generateAssets() {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      let alpha = 0;
      if (luma < 185) {
        // Linear to cubic ease for sharp crisp outlines
        const factor = Math.max(0, Math.min(1, (185 - luma) / 105));
        alpha = Math.pow(factor, 1.2);
      }

      const dstIdx = (y * width + x) * 4;

      if (alpha > 0.005) {
        // Enhanced Polished Silver Chrome Gradient
        const angle = (x * 0.04 + y * 0.06);
        const sheen = Math.sin(angle) * 0.5 + 0.5; // 0 to 1
        const specular = Math.pow(sheen, 4); // sharp chrome reflection

        // Silver Palette with rich highlights and chrome contrast:
        // Shadows: #64748b (Slate-Silver 500)
        // Midtones: #94a3b8, #cbd5e1 (Silver 300)
        // Highlights: #f1f5f9, #ffffff (Pure Silver Sheen)
        const silverR = Math.min(255, Math.round(110 + sheen * 90 + specular * 55));
        const silverG = Math.min(255, Math.round(120 + sheen * 92 + specular * 53));
        const silverB = Math.min(255, Math.round(135 + sheen * 95 + specular * 50));

        rgbaBuffer[dstIdx] = silverR;
        rgbaBuffer[dstIdx + 1] = silverG;
        rgbaBuffer[dstIdx + 2] = silverB;
        rgbaBuffer[dstIdx + 3] = Math.round(alpha * 255);
      } else {
        rgbaBuffer[dstIdx] = 0;
        rgbaBuffer[dstIdx + 1] = 0;
        rgbaBuffer[dstIdx + 2] = 0;
        rgbaBuffer[dstIdx + 3] = 0;
      }
    }
  }

  // 1. Full PNG
  const pngPath = path.join(outputDir, 'medical-symbols-silver.png');
  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);

  // 2. High-efficiency WebP
  const webpPath = path.join(outputDir, 'medical-symbols-silver.webp');
  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .webp({ quality: 95, lossless: true })
    .toFile(webpPath);

  console.log(`Generated polished chrome assets: \n- ${pngPath}\n- ${webpPath}`);
}

generateAssets().catch(console.error);
