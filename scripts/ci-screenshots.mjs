#!/usr/bin/env node
/**
 * Capture screenshots of app pages for pull request review.
 *
 * Usage:
 *   npm run build
 *   node scripts/ci-screenshots.mjs /blog /workout-lab
 *
 * Serves the built `docs/` directory with `vite preview`, then captures one
 * PNG per provided page path into `screenshot-output/`. Output filenames are
 * derived from the path: `/` -> `home.png`, `/blog/foo` -> `blog--foo.png`.
 *
 * Used by .github/workflows/pr-screenshots.yml, where the page paths come
 * from a ```screenshots fenced block in the pull request description.
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { preview } from 'vite';

const OUTPUT_DIR = 'screenshot-output';
const VIEWPORT = { width: 1280, height: 800 };
const PORT = 4173;

function normalizePath(rawPath) {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    return null;
  }
  if (!trimmed.startsWith('/')) {
    throw new Error(`Page paths must start with "/": received "${trimmed}"`);
  }
  return trimmed;
}

function fileNameForPath(pagePath) {
  const stripped = pagePath.replace(/^\/+|\/+$/g, '');
  if (!stripped) {
    return 'home';
  }
  return stripped
    .split('/')
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]+/g, '-'))
    .join('--');
}

async function main() {
  const pagePaths = process.argv
    .slice(2)
    .map(normalizePath)
    .filter(Boolean);

  if (pagePaths.length === 0) {
    console.error('No page paths provided. Example: node scripts/ci-screenshots.mjs /blog /apps');
    process.exitCode = 1;
    return;
  }

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const server = await preview({
    preview: { port: PORT, strictPort: true },
  });
  const baseUrl = `http://localhost:${PORT}`;

  const browser = await chromium.launch();
  const captured = [];

  try {
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();

    for (const pagePath of pagePaths) {
      const fileName = `${fileNameForPath(pagePath)}.png`;
      const outputPath = path.join(OUTPUT_DIR, fileName);
      console.log(`Capturing ${pagePath} -> ${outputPath}`);
      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: outputPath, fullPage: true });
      captured.push({ path: pagePath, file: fileName });
    }
  } finally {
    await browser.close();
    await server.close();
  }

  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  await writeFile(manifestPath, `${JSON.stringify(captured, null, 2)}\n`);
  console.log(`Captured ${captured.length} screenshot(s); manifest at ${manifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
