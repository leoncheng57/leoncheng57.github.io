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
      #illustration { display: block; width: 390px; height: 720px; animation: reveal 420ms cubic-bezier(.2,.7,.3,1); }
      #tap { position: absolute; width: 54px; height: 54px; transform: translate(-50%, -50%); }
      #tap .dot { position: absolute; inset: 13px; border-radius: 50%; background: #6d28d9; box-shadow: 0 0 0 3px rgb(255 255 255 / 92%); animation: press 1.4s cubic-bezier(.3,.6,.3,1) infinite; }
      #tap .ring, #tap .ring2 { position: absolute; inset: 0; border: 4px solid #6d28d9; border-radius: 50%; opacity: 0; animation: ripple 1.4s ease-out infinite; }
      #tap .ring2 { animation-delay: .18s; border-color: rgb(109 40 217 / 55%); }
      #caption { position: absolute; left: 30px; right: 30px; padding: 14px 16px; border: 2px solid rgb(255 255 255 / 90%); border-radius: 14px; background: rgb(17 17 17 / 92%); color: white; font-size: 18px; font-weight: 750; line-height: 1.25; text-align: center; box-shadow: 0 5px 18px rgb(0 0 0 / 25%); animation: captionIn 420ms cubic-bezier(.2,.7,.3,1); }
      #progress { position: absolute; top: 18px; right: 16px; display: flex; gap: 8px; padding: 8px 12px; border-radius: 999px; background: rgb(17 17 17 / 80%); }
      #progress span { width: 9px; height: 9px; border-radius: 50%; background: rgb(255 255 255 / 38%); transition: background 250ms ease, transform 250ms ease; }
      #progress span.active { background: #fbbf24; transform: scale(1.25); }
      @keyframes press { 0%, 24% { transform: scale(1); } 38%, 56% { transform: scale(.72); } 74%, 100% { transform: scale(1); } }
      @keyframes ripple { 0%, 30% { opacity: 0; transform: scale(.55); } 45% { opacity: 1; } 100% { opacity: 0; transform: scale(1.7); } }
      @keyframes captionIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes reveal { from { opacity: .2; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
    </style>
  </head>
  <body>
    <img id="illustration" alt="">
    <div id="tap"><span class="ring"></span><span class="ring2"></span><span class="dot"></span></div>
    <div id="caption"></div>
    <div id="progress"></div>
    <script>
      const steps = ${JSON.stringify(preparedSteps)};
      let index = 0;
      const illustration = document.querySelector('#illustration');
      const tap = document.querySelector('#tap');
      const caption = document.querySelector('#caption');
      const progress = document.querySelector('#progress');
      progress.innerHTML = steps.map(() => '<span></span>').join('');

      function restart(element) {
        element.style.animation = 'none';
        void element.offsetWidth;
        element.style.animation = '';
      }

      function showStep() {
        const step = steps[index];
        illustration.src = step.image;
        restart(illustration);
        tap.style.left = step.tap[0] + 'px';
        tap.style.top = step.tap[1] + 'px';
        tap.querySelectorAll('.dot, .ring, .ring2').forEach(restart);
        caption.textContent = step.caption;
        caption.style.top = step.tap[1] > 470 ? '126px' : 'auto';
        caption.style.bottom = step.tap[1] > 470 ? 'auto' : '78px';
        restart(caption);
        progress.querySelectorAll('span').forEach((dot, dotIndex) => {
          dot.classList.toggle('active', dotIndex === index);
        });
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
  // Let the reveal/caption entrance animations settle so the poster is crisp.
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(ASSET_DIR, `${platform}-animation-poster.png`) })
  await page.evaluate(() => window.startAnimation())
  await page.waitForTimeout(steps.length * STEP_DURATION_MS + 250)
  await context.close()

  const webmOutput = path.join(ASSET_DIR, `${platform}-animation.webm`)
  await video.saveAs(webmOutput)
  await writeFile(path.join(ASSET_DIR, `${platform}-animation.vtt`), createVtt(steps))

  const mp4Output = path.join(ASSET_DIR, `${platform}-animation.mp4`)
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
