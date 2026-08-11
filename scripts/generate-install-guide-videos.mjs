import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'
import { chromium } from 'playwright'

const execFileAsync = promisify(execFile)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSET_DIR = path.join(ROOT, 'public', 'sub-wait', 'install')
const WIDTH = 390
const HEIGHT = 720
const STEP_DURATION_MS = 4_000

const GUIDES = {
  iphone: [
    {
      image: 'iphone-1-share.svg',
      caption: '1. Tap Share in Safari',
      tap: [195, 650],
    },
    {
      image: 'iphone-2-add.svg',
      caption: '2. Choose Add to Home Screen',
      tap: [195, 442],
    },
    {
      image: 'iphone-3-confirm.svg',
      caption: '3. Confirm with Add',
      tap: [319, 88],
    },
  ],
  android: [
    {
      image: 'android-1-menu.svg',
      caption: '1. Open the Chrome menu',
      tap: [330, 92],
    },
    {
      image: 'android-2-install.svg',
      caption: '2. Choose Install app',
      tap: [214, 312],
    },
    {
      image: 'android-3-confirm.svg',
      caption: '3. Confirm installation',
      tap: [287, 504],
    },
  ],
}

function timestamp(milliseconds) {
  const seconds = Math.floor(milliseconds / 1_000)
  const remainder = milliseconds % 1_000
  return `00:00:${String(seconds).padStart(2, '0')}.${String(remainder).padStart(3, '0')}`
}

function createVtt(steps) {
  const cues = steps.map((step, index) => {
    const start = index * STEP_DURATION_MS
    return `${index + 1}\n${timestamp(start)} --> ${timestamp(start + STEP_DURATION_MS)}\n${step.caption}`
  })
  return `WEBVTT\n\n${cues.join('\n\n')}\n`
}

async function createAnimationHtml(steps) {
  const preparedSteps = await Promise.all(
    steps.map(async (step) => ({
      ...step,
      image: `data:image/svg+xml;base64,${(await readFile(path.join(ASSET_DIR, step.image))).toString('base64')}`,
    })),
  )

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; }
      html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: #e8e8e8; }
      body { position: relative; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      #illustration { display: block; width: 390px; height: 720px; animation: reveal 350ms ease-out; }
      #tap { position: absolute; width: 54px; height: 54px; border: 5px solid #6d28d9; border-radius: 50%; background: rgb(255 255 255 / 72%); box-shadow: 0 0 0 3px rgb(255 255 255 / 92%); transform: translate(-50%, -50%); animation: tap 1.1s ease-out infinite; }
      #tap::after { content: ""; position: absolute; inset: 13px; border-radius: 50%; background: #6d28d9; }
      #caption { position: absolute; left: 30px; right: 30px; padding: 14px 16px; border: 2px solid rgb(255 255 255 / 90%); border-radius: 14px; background: rgb(17 17 17 / 92%); color: white; font-size: 18px; font-weight: 750; line-height: 1.25; text-align: center; box-shadow: 0 5px 18px rgb(0 0 0 / 25%); }
      @keyframes tap { 0%, 18% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); } 32%, 62% { opacity: 1; transform: translate(-50%, -50%) scale(.78); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.25); } }
      @keyframes reveal { from { opacity: .25; transform: scale(1.015); } to { opacity: 1; transform: scale(1); } }
    </style>
  </head>
  <body>
    <img id="illustration" alt="">
    <div id="tap"></div>
    <div id="caption"></div>
    <script>
      const steps = ${JSON.stringify(preparedSteps)};
      let index = 0;
      const illustration = document.querySelector('#illustration');
      const tap = document.querySelector('#tap');
      const caption = document.querySelector('#caption');

      function showStep() {
        const step = steps[index];
        illustration.src = step.image;
        illustration.style.animation = 'none';
        void illustration.offsetWidth;
        illustration.style.animation = '';
        tap.style.left = step.tap[0] + 'px';
        tap.style.top = step.tap[1] + 'px';
        tap.style.animation = 'none';
        void tap.offsetWidth;
        tap.style.animation = '';
        caption.textContent = step.caption;
        caption.style.top = step.tap[1] > 470 ? '126px' : 'auto';
        caption.style.bottom = step.tap[1] > 470 ? 'auto' : '78px';
      }

      showStep();
      window.animationReady = document.fonts.ready.then(() => illustration.decode());
      window.startAnimation = () => setInterval(() => {
        index = (index + 1) % steps.length;
        showStep();
      }, ${STEP_DURATION_MS});
    </script>
  </body>
</html>`
}

async function generateGuide(browser, temporaryDirectory, platform, steps) {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    recordVideo: {
      dir: temporaryDirectory,
      size: { width: WIDTH, height: HEIGHT },
    },
  })
  const page = await context.newPage()
  const video = page.video()
  await page.setContent(await createAnimationHtml(steps), { waitUntil: 'load' })
  await page.evaluate(() => window.animationReady)
  await page.screenshot({ path: path.join(ASSET_DIR, `${platform}-walkthrough-poster.png`) })
  await page.evaluate(() => window.startAnimation())
  await page.waitForTimeout(steps.length * STEP_DURATION_MS + 250)
  await context.close()

  const webmOutput = path.join(ASSET_DIR, `${platform}-walkthrough.webm`)
  await video.saveAs(webmOutput)
  await writeFile(path.join(ASSET_DIR, `${platform}-walkthrough.vtt`), createVtt(steps))

  const mp4Output = path.join(ASSET_DIR, `${platform}-walkthrough.mp4`)
  await execFileAsync(ffmpegPath, [
    '-y',
    '-i', webmOutput,
    '-an',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '24',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    mp4Output,
  ])
  console.log(`Generated ${path.relative(ROOT, mp4Output)}`)
}

if (!ffmpegPath) {
  throw new Error('ffmpeg-static did not provide an executable for this platform')
}

const temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'sub-wait-install-videos-'))
const browser = await chromium.launch({ headless: true })

try {
  for (const [platform, steps] of Object.entries(GUIDES)) {
    await generateGuide(browser, temporaryDirectory, platform, steps)
  }
} finally {
  await browser.close()
  await rm(temporaryDirectory, { recursive: true, force: true })
}
