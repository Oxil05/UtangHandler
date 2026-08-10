import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

function createIcon(width, height, isMaskable = false) {
  const png = new PNG({ width, height });

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Gradient background (Deep midnight indigo to purple)
      const ratioY = y / height;
      const r = Math.floor(13 + ratioY * (99 - 13));
      const g = Math.floor(17 + ratioY * (102 - 17));
      const b = Math.floor(23 + ratioY * (241 - 23));

      // Check distance from center for wallet/app icon circle
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // Inner circle glow
        png.data[idx] = 99;     // Red
        png.data[idx + 1] = 102; // Green
        png.data[idx + 2] = 241; // Blue
        png.data[idx + 3] = 255; // Alpha
      } else {
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      }

      // Draw stylized 'U' emblem in center
      if (Math.abs(dx) < radius * 0.4 && dy > -radius * 0.3 && dy < radius * 0.4) {
        if (Math.abs(dx) > radius * 0.2 || dy > radius * 0.2) {
          png.data[idx] = 255;
          png.data[idx + 1] = 255;
          png.data[idx + 2] = 255;
          png.data[idx + 3] = 255;
        }
      }
    }
  }

  return PNG.sync.write(png);
}

function createScreenshot(width, height) {
  const png = new PNG({ width, height });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // Midnight mobile app UI mock background
      const isHeader = y < height * 0.12;
      const isCard = y > height * 0.15 && y < height * 0.4;

      if (isHeader) {
        png.data[idx] = 22;
        png.data[idx + 1] = 27;
        png.data[idx + 2] = 34;
        png.data[idx + 3] = 255;
      } else if (isCard) {
        png.data[idx] = 33;
        png.data[idx + 1] = 38;
        png.data[idx + 2] = 45;
        png.data[idx + 3] = 255;
      } else {
        png.data[idx] = 13;
        png.data[idx + 1] = 17;
        png.data[idx + 2] = 23;
        png.data[idx + 3] = 255;
      }
    }
  }

  return PNG.sync.write(png);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createIcon(192, 192));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createIcon(512, 512));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createIcon(180, 180));
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), createIcon(512, 512, true));

// Generate Screenshots for PWABuilder
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile-1.png'), createScreenshot(720, 1280));
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile-2.png'), createScreenshot(720, 1280));

console.log('✅ Generated all PWA icons & screenshots in public/');
