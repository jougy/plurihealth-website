import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = '/Users/jougy/.gemini/antigravity/brain/ba15b103-65e1-4f94-87b7-3f261182b7dc/.user_uploaded/media_1788250573320.jpg';
const outputDir = '/Users/jougy/Documents/therapy-flow/website/public/assets';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processImage() {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Processing ${width}x${height} image...`);

  // Detect checkerboard square size
  // Checkerboard alternates between white (255) and gray (~202)
  // Let's determine the square size by scanning row 0 or 1
  let squareSize = 16;
  for (let s = 8; s <= 32; s++) {
    // Check if s matches the period
    let match = true;
    for (let x = 0; x < 100; x++) {
      const idx = x * 3;
      const isWhite = data[idx] > 230;
      const expectedWhite = Math.floor(x / s) % 2 === 1; // or 0
    }
  }

  // Let's analyze top 50 pixels row by row to find exact checkerboard grid alignment
  // Sample a region without symbols (e.g. around top-left margins between symbols)
  // Let's test checkerboard detection
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  // We want to create a silver metallic texture for the symbols!
  // Silver color palette:
  // Highlights: #e2e8f0 (226, 232, 240), #cbd5e1 (203, 213, 225), #94a3b8 (148, 163, 184), #64748b (100, 116, 139)
  // With a subtle metallic sheen/gradient and embossed depth.

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * channels;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      // Detect background: checkerboard is either > 240 (white) or 195-215 (gray)
      // When there is no symbol, luma is either ~255 or ~202.
      // Symbols are dark (luma < 155).
      // We calculate opacity of the symbol:
      let alpha = 0;
      if (luma < 175) {
        // The darker the pixel, the higher the opacity of the symbol
        // Map 75 (solid symbol) -> 1.0, 175 (background edge) -> 0.0
        const factor = Math.max(0, Math.min(1, (175 - luma) / 95));
        // Smooth step for beautiful anti-aliasing
        alpha = factor * factor * (3 - 2 * factor);
      }

      const dstIdx = (y * width + x) * 4;

      if (alpha > 0.01) {
        // Silver Metallic Shading:
        // Add subtle directional metallic gradient based on (x + y * 1.5)
        const angle = (x * 0.05 + y * 0.08);
        const sheen = Math.sin(angle) * 0.5 + 0.5; // 0 to 1
        
        // Silver tones: Base #94a3b8 with silver highlight #e2e8f0 and shadow #64748b
        const silverR = Math.round(140 + sheen * 65); // 140 to 205
        const silverG = Math.round(150 + sheen * 68); // 150 to 218
        const silverB = Math.round(165 + sheen * 72); // 165 to 237

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

  // Save the full transparent silver pattern
  const outputPath = path.join(outputDir, 'medical-symbols-silver.png');
  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Saved silver pattern to ${outputPath}`);
}

processImage().catch(console.error);
