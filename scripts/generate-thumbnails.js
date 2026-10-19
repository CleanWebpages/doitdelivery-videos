/**
 * Playwright batch thumbnail generator.
 * Loads thumbnails/generator.html and screenshots each canvas at 1280x720.
 *
 * Usage:
 *   npm install playwright
 *   node scripts/generate-thumbnails.js
 *
 * Output: thumbnails/<video-id>.png  (42 files)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const GENERATOR_PATH = path.resolve(__dirname, '../thumbnails/generator.html');
const OUTPUT_DIR = path.resolve(__dirname, '../thumbnails');

const VIDEO_IDS = [
  'wt-lab-client', 'wt-lab-company', 'wt-pharmacy', 'wt-driver-app', 'wt-platform',
  'feat-order-standard', 'feat-order-stat', 'feat-stat-dispatch', 'feat-import-orders',
  'feat-label-templates', 'feat-dispatch-route', 'feat-will-call',
  'feat-tracking-dispatcher', 'feat-public-route-tracking', 'feat-public-order-tracking',
  'feat-route-builder-web', 'feat-route-builder-driver', 'feat-scheduled-routes',
  'feat-driving-mode', 'feat-completing-stop', 'feat-pickup-verify', 'feat-delivery-verify',
  'feat-barcode-scan', 'feat-driver-stats',
  'feat-driver-pay', 'feat-coverage-calendar', 'feat-coverage-gaps',
  'feat-alert-rules', 'feat-notif-channels', 'feat-notif-log',
  'feat-billing-dashboard', 'feat-invoice-mgmt', 'feat-billing-recon',
  'feat-route-profit', 'feat-internal-costs',
  'feat-route-audit', 'feat-gps-trail', 'feat-dwell-analysis',
  'feat-client-mgmt', 'feat-invite-client', 'feat-user-org-mgmt',
  // wt-platform is 42nd
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('file://' + GENERATOR_PATH);

  // Wait for fonts and initial render
  await page.waitForFunction(() => document.fonts.ready);
  await page.waitForTimeout(1500);

  let done = 0;

  for (const id of VIDEO_IDS) {
    const canvas = await page.$(`canvas`);

    // Find the canvas by its sibling label text
    const wrap = await page.evaluateHandle((vid) => {
      const labels = document.querySelectorAll('.thumb-label');
      for (const label of labels) {
        if (label.textContent.trim() === vid + '.png') {
          return label.parentElement.querySelector('canvas');
        }
      }
      return null;
    }, id);

    if (!wrap || wrap.jsonValue === null) {
      const val = await wrap.jsonValue();
      if (!val) {
        console.warn(`  SKIP ${id} — canvas not found`);
        continue;
      }
    }

    const outPath = path.join(OUTPUT_DIR, id + '.png');

    // Export canvas to PNG via page context
    const pngBase64 = await page.evaluate((vid) => {
      const labels = document.querySelectorAll('.thumb-label');
      for (const label of labels) {
        if (label.textContent.trim() === vid + '.png') {
          const canvas = label.parentElement.querySelector('canvas');
          if (canvas) return canvas.toDataURL('image/png').split(',')[1];
        }
      }
      return null;
    }, id);

    if (!pngBase64) {
      console.warn(`  SKIP ${id} — no canvas data`);
      continue;
    }

    fs.writeFileSync(outPath, Buffer.from(pngBase64, 'base64'));
    done++;
    process.stdout.write(`  [${done}/${VIDEO_IDS.length}] ${id}.png\n`);
  }

  await browser.close();
  console.log(`\nDone. ${done} thumbnails saved to ${OUTPUT_DIR}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
