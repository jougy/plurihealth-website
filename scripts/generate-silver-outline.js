import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputPath = '/Users/jougy/.gemini/antigravity/brain/ba15b103-65e1-4f94-87b7-3f261182b7dc/.user_uploaded/media_1788250573320.jpg';
const outputDir = '/Users/jougy/Documents/therapy-flow/website/public/assets';

async function generateOutlinedSilverPattern() {
  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  
  // 1. Build a binary/soft mask of the symbols (1 = inside symbol, 0 = background)
  const mask = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      // When luma < 170, it is symbol. Background checkerboard is 200-255.
      if (luma < 175) {
        const factor = Math.max(0, Math.min(1, (175 - luma) / 85));
        mask[y * width + x] = factor;
      } else {
        mask[y * width + x] = 0;
      }
    }
  }

  // 2. Edge Extraction (Morphological gradient: max in 3x3 - min in 3x3, or Sobel)
  // This extracts ONLY the border/outline and completely removes the interior fill!
  const edges = new Float32Array(width * height);
  const radius = 1; // 1-2px delicate crisp outline

  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let minVal = 1.0;
      let maxVal = 0.0;

      // Scan small 3x3 window
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const val = mask[(y + dy) * width + (x + dx)];
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
      }

      // Edge intensity is the difference between max and min in the neighborhood
      // Only keep where there is a transition (boundary)
      const edge = maxVal - minVal;
      edges[y * width + x] = Math.max(0, Math.min(1, edge * 1.6));
    }
  }

  // 3. Render subtle silvery contour with color matching close to the background (#f8fafc / #e2e8f0)
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const edgeStrength = edges[y * width + x];

      if (edgeStrength > 0.02) {
        // Subtle directional metallic silver shimmer
        const angle = (x * 0.03 + y * 0.05);
        const sheen = Math.sin(angle) * 0.5 + 0.5;

        // Very delicate silvery tones close to background:
        // Base tone #94a3b8 (Silver Slate), Highlight #cbd5e1
        const r = Math.round(155 + sheen * 35); // 155 to 190
        const g = Math.round(165 + sheen * 35); // 165 to 200
        const b = Math.round(180 + sheen * 35); // 180 to 215

        rgbaBuffer[idx] = r;
        rgbaBuffer[idx + 1] = g;
        rgbaBuffer[idx + 2] = b;
        rgbaBuffer[idx + 3] = Math.round(edgeStrength * 255);
      } else {
        rgbaBuffer[idx] = 0;
        rgbaBuffer[idx + 1] = 0;
        rgbaBuffer[idx + 2] = 0;
        rgbaBuffer[idx + 3] = 0;
      }
    }
  }

  // Save PNG and WebP
  const pngPath = path.join(outputDir, 'medical-symbols-silver-outline.png');
  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);

  const webpPath = path.join(outputDir, 'medical-symbols-silver-outline.webp');
  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .webp({ quality: 95, lossless: true })
    .toFile(webpPath);

  console.log(`Generated outline pattern: \n- ${pngPath}\n- ${webpPath}`);
}

generateOutlinedSilverPattern().catch(console.error);
