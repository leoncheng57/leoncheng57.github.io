/**
 * Optimizes raw screen recordings into the web assets used by guide chapters.
 *
 * Usage:
 *   node scripts/optimize-guide-recording.mjs desktop-tour --input="/path/to/recording.mov"
 *   node scripts/optimize-guide-recording.mjs mobile-tour  --input="/path/to/recording.mp4"
 *
 * Outputs into public/guides/custom-coding-agent-ide-with-openhands/:
 *   <name>.mp4         (H.264, no audio, faststart)
 *   <name>.webm        (VP9, no audio)
 *   <name>-poster.png  (single frame)
 *
 * The redactions below are NOT cosmetic. Both source recordings show a
 * project grid containing employer-internal repository names, and the phone
 * recording shows the tailnet hostname the phone connects through, in
 * Safari's URL bar and again in its keyboard accessory bar. The site is
 * public, so every one of those regions is blurred here rather than trusted
 * to stay off-screen.
 *
 * Blur boxes are source-pixel `{ x, y, w, h }` with an optional `from`/`to`
 * window in seconds; omit both to blur for the whole clip. They were derived
 * by running Vision OCR over every frame and reading back the bounding boxes,
 * so re-recording invalidates them: re-derive, then verify by OCRing the
 * encoded output and confirming it contains neither the internal names nor
 * `ts.net`.
 */
import { execFile } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'

const execFileAsync = promisify(execFile)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSET_DIR = path.join(
  ROOT,
  'public',
  'guides',
  'custom-coding-agent-ide-with-openhands'
)
const OUTPUT_FPS = 30

/**
 * Per-recording geometry. `width` is the encoded width; the height follows
 * the source aspect ratio.
 */
const RECORDINGS = {
  'desktop-tour': {
    width: 960,
    posterAt: 4,
    // The tail of the recording scrolls a documentation index whose
    // "Extraction plan" card, and the "Where it came from" section below it,
    // both name the internal platform this app was extracted from. That text
    // moves as the page scrolls, so the clip is cut before it appears rather
    // than chased with blur boxes.
    trimTo: 41,
    blurs: [
      // Project grid: 93 repository names, several of them internal.
      { x: 386, y: 332, w: 812, h: 202, from: 0, to: 9.5 },
    ],
  },
  'mobile-tour': {
    width: 420,
    posterAt: 10,
    // The phone recording opens on the hub, and the page scrolls while it is
    // there, so the project grid moves between three different positions —
    // more than a fixed blur box can follow. The clip therefore starts after
    // the hub, on the conversation, which is what the mobile section is about
    // anyway; the project picker is shown in the desktop recording instead.
    trimFrom: 22,
    blurs: [
      // Safari shows the tailnet hostname in its keyboard accessory bar while
      // the keyboard is up, and in the URL bar while it is down. Every window
      // and band below was derived by OCRing all 592 source frames and
      // clustering the hostname's bounding boxes, not by sampling — at 4 fps
      // the transitions below are invisible and the hostname leaks.
      // Accessory bar, y 1389-1463.
      { x: 136, y: 1375, w: 908, h: 108, from: 0, to: 7.6 },
      { x: 136, y: 1375, w: 908, h: 108, from: 13.05, to: 15.9 },
      // In flight between the two resting places, spanning y 1452-2199.
      { x: 136, y: 1425, w: 908, h: 800, from: 7.4, to: 7.85 },
      { x: 136, y: 1425, w: 908, h: 800, from: 12.8, to: 13.1 },
      { x: 136, y: 1425, w: 908, h: 800, from: 15.75, to: 16.15 },
      // URL bar, y 2151-2265. Unwindowed: the band only ever covers browser
      // chrome or the bottom keyboard rows, so there is nothing to protect.
      { x: 136, y: 2140, w: 908, h: 145 },
    ],
  },
}

/** `-ss` before `-i` rebases timestamps, so blur windows use the trimmed clock. */
function inputArgs(input, trimFrom) {
  return trimFrom === undefined ? ['-i', input] : ['-ss', String(trimFrom), '-i', input]
}

function trimArgs(trimTo) {
  return trimTo === undefined ? [] : ['-t', String(trimTo)]
}

function parseArgs(argv) {
  const [name, ...rest] = argv
  if (!name || !RECORDINGS[name]) {
    throw new Error(`First argument must be one of: ${Object.keys(RECORDINGS).join(', ')}`)
  }
  let input
  for (const argument of rest) {
    const [flag, value] = argument.split('=')
    if (flag === '--input') input = value
    else throw new Error(`Unknown argument: ${argument}`)
  }
  if (!input) throw new Error('--input is required')
  return { name, input, ...RECORDINGS[name] }
}

function buildFilter(blurs, width) {
  const scale = `scale=${width}:-2:flags=lanczos,fps=${OUTPUT_FPS}`
  if (blurs.length === 0) return scale

  const chains = []
  let current = '[0:v]'
  blurs.forEach((blur, index) => {
    const blurred = `blurred${index}`
    const merged = `merged${index}`
    const windowed =
      blur.from === undefined
        ? ''
        : `:enable='between(t,${blur.from},${blur.to})'`
    chains.push(
      `${current}split=2[base${index}][region${index}]`,
      `[region${index}]crop=${blur.w}:${blur.h}:${blur.x}:${blur.y},boxblur=20:2[${blurred}]`,
      `[base${index}][${blurred}]overlay=${blur.x}:${blur.y}${windowed}[${merged}]`
    )
    current = `[${merged}]`
  })
  chains.push(`${current}${scale}[out]`)
  return chains.join(';')
}

async function run(args) {
  await execFileAsync(ffmpegPath, args, { maxBuffer: 128 * 1024 * 1024 })
}

const { name, input, width, posterAt, blurs, trimTo, trimFrom } = parseArgs(process.argv.slice(2))
const filter = buildFilter(blurs, width)
const filterArgs =
  blurs.length > 0 ? ['-filter_complex', filter, '-map', '[out]'] : ['-vf', filter]

const mp4Output = path.join(ASSET_DIR, `${name}.mp4`)
await run([
  '-y', ...inputArgs(input, trimFrom), ...filterArgs, '-an', ...trimArgs(trimTo),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '30',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  mp4Output,
])
console.log(`Generated ${path.relative(ROOT, mp4Output)}`)

const webmOutput = path.join(ASSET_DIR, `${name}.webm`)
await run([
  '-y', ...inputArgs(input, trimFrom), ...filterArgs, '-an', ...trimArgs(trimTo),
  '-c:v', 'libvpx-vp9', '-crf', '40', '-b:v', '0', '-row-mt', '1',
  webmOutput,
])
console.log(`Generated ${path.relative(ROOT, webmOutput)}`)

// The poster is redacted too: it is a still of the same frames.
const posterFilter =
  blurs.length > 0 ? ['-filter_complex', filter, '-map', '[out]'] : ['-vf', filter]
const posterOutput = path.join(ASSET_DIR, `${name}-poster.png`)
await run([
  '-y', ...inputArgs(input, trimFrom), ...posterFilter,
  '-ss', String(posterAt), '-frames:v', '1',
  posterOutput,
])
console.log(`Generated ${path.relative(ROOT, posterOutput)}`)
