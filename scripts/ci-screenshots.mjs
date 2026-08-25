#!/usr/bin/env node
/**
 * Capture screenshots of app pages for pull request review.
 *
 * Usage:
 *   npm run build
 *   node scripts/ci-screenshots.mjs "/blog -- Blog index" with-full:/blog/foo
 *
 * Serves the built `docs/` directory with `vite preview`, then captures one
 * PNG per provided page path into `screenshot-output/`. Output filenames are
 * derived from the path: `/` -> `home.png`, `/blog/foo` -> `blog--foo.png`.
 *
 * Each target uses the format `[with-full:]/path[ -- Title]`:
 * - Every target gets a 1280x800 viewport capture. A `with-full:` prefix
 *   additionally captures the entire scroll height of the page into a second
 *   file: `with-full:/blog/foo` -> `blog--foo.png` + `blog--foo--full.png`.
 * - An optional ` -- Title` labels the capture in the manifest so consumers
 *   (like the PR sticky comment) can explain what each screenshot shows.
 *
 * Targets may also be supplied as a JSON array of `{ arg, title }` objects
 * via the SCREENSHOT_TARGETS environment variable, which takes precedence
 * over CLI arguments and avoids shell-quoting issues with titles.
 *
 * Used by .github/workflows/pr-screenshots.yml, where the targets come from
 * a ```screenshots fenced block in the pull request description.
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';
import { preview } from 'vite';

const OUTPUT_DIR = 'screenshot-output';
const VIEWPORT = { width: 1280, height: 800 };
const PORT = 4173;

const WITH_FULL_PREFIX = 'with-full:';
const TITLE_SEPARATOR = ' -- ';

function normalizeTarget(rawTarget, explicitTitle = null) {
  const trimmed = rawTarget.trim();
  if (!trimmed) {
    return null;
  }
  const separatorIndex = trimmed.indexOf(TITLE_SEPARATOR);
  const rawPath = separatorIndex === -1 ? trimmed : trimmed.slice(0, separatorIndex);
  const inlineTitle = separatorIndex === -1 ? null : trimmed.slice(separatorIndex + TITLE_SEPARATOR.length).trim();
  const title = explicitTitle ?? (inlineTitle || null);

  const withFull = rawPath.startsWith(WITH_FULL_PREFIX);
  const pagePath = withFull ? rawPath.slice(WITH_FULL_PREFIX.length) : rawPath;
  if (!pagePath.startsWith('/') || /\s/.test(pagePath)) {
    throw new Error(
      `Invalid screenshot target "${trimmed}". Expected "[with-full:]/path[ -- Title]" with a path that starts with "/" and contains no whitespace.`,
    );
  }
  return { path: pagePath, withFull, title };
}

function targetsFromEnv(json) {
  let entries;
  try {
    entries = JSON.parse(json);
  } catch (error) {
    throw new Error(`SCREENSHOT_TARGETS is not valid JSON: ${error.message}`);
  }
  if (!Array.isArray(entries)) {
    throw new Error('SCREENSHOT_TARGETS must be a JSON array of { arg, title } objects.');
  }
  return entries
    .map((entry) => normalizeTarget(String(entry.arg ?? ''), entry.title ?? null))
    .filter(Boolean);
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
  const targets = process.env.SCREENSHOT_TARGETS
    ? targetsFromEnv(process.env.SCREENSHOT_TARGETS)
    : process.argv
        .slice(2)
        .map((arg) => normalizeTarget(arg))
        .filter(Boolean);

  if (targets.length === 0) {
    console.error('No page paths provided. Example: node scripts/ci-screenshots.mjs "/blog -- Blog index" with-full:/apps');
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

    for (const { path: pagePath, withFull, title } of targets) {
      const baseName = fileNameForPath(pagePath);
      const fileName = `${baseName}.png`;
      const outputPath = path.join(OUTPUT_DIR, fileName);
      console.log(`Capturing ${pagePath} -> ${outputPath}`);
      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: outputPath, fullPage: false });

      let fullFile = null;
      if (withFull) {
        fullFile = `${baseName}--full.png`;
        const fullOutputPath = path.join(OUTPUT_DIR, fullFile);
        console.log(`Capturing ${pagePath} (full page) -> ${fullOutputPath}`);
        await page.screenshot({ path: fullOutputPath, fullPage: true });
      }

      captured.push({ path: pagePath, file: fileName, fullFile, title });
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
