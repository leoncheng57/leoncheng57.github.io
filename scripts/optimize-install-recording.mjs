/**
 * Optimizes a raw phone screen recording into the web assets used by the
 * Sub-Wait installation guide.
 *
 * Usage:
 *   node scripts/optimize-install-recording.mjs \
 *     --platform=iphone \
 *     --input="/path/to/screen recording.MP4" \
 *     --poster-at=0.6 \
 *     --blur=270:1805:120:105:9.5:11.9
 *
 * Outputs into public/sub-wait/install/:
 *   <platform>-recording.mp4         (H.264, no audio, faststart)
 *   <platform>-recording.webm        (VP9, no audio)
 *   <platform>-recording-poster.png  (single frame)
 *
 * --blur redacts a source-pixel region between two timestamps and may be
 * repeated, e.g. to hide notification badges: --blur=x:y:w:h:from:to
 *
 * Captions are hand-written in <platform>-recording.vtt because cue timing
 * must match the human recording. When menus change in a future OS release,
 * re-record the flow on a device, re-run this script, and update the VTT
 * cues plus any version note in InstallRoute.
 */
import { execFile } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'

const execFileAsync = promisify(execFile)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ASSET_DIR = path.join(ROOT, 'public', 'sub-wait', 'install')
const OUTPUT_WIDTH = 480
const OUTPUT_FPS = 30

function parseArgs(argv) {
  const options = { blurs: [], posterAt: 0.5 }
  for (const argument of argv) {
    const [flag, value] = argument.split('=')
    if (flag === '--platform') options.platform = value
    else if (flag === '--input') options.input = value
    else if (flag === '--poster-at') options.posterAt = Number(value)
    else if (flag === '--blur') {
      const [x, y, w, h, from, to] = value.split(':').map(Number)
      options.blurs.push({ x, y, w, h, from, to })
    } else throw new Error(`Unknown argument: ${argument}`)
  }
  if (!options.platform || !options.input) {
    throw new Error('Both --platform and --input are required')
  }
  return options
}

function buildFilter(blurs) {
  if (blurs.length === 0) {
    return `scale=${OUTPUT_WIDTH}:-2:flags=lanczos,fps=${OUTPUT_FPS}`
  }

  const chains = []
  let current = '[0:v]'
  blurs.forEach((blur, index) => {
    const region = `region${index}`
    const blurred = `blurred${index}`
    const merged = `merged${index}`
    chains.push(
      `${current}split=2[base${index}][for${region}]`,
      `[for${region}]crop=${blur.w}:${blur.h}:${blur.x}:${blur.y},boxblur=20:2[${blurred}]`,
      `[base${index}][${blurred}]overlay=${blur.x}:${blur.y}:enable='between(t,${blur.from},${blur.to})'[${merged}]`,
    )
    current = `[${merged}]`
  })
  chains.push(
    `${current}scale=${OUTPUT_WIDTH}:-2:flags=lanczos,fps=${OUTPUT_FPS}[out]`,
  )
  return chains.join(';')
}

async function run(args) {
  await execFileAsync(ffmpegPath, args, { maxBuffer: 64 * 1024 * 1024 })
}

const { platform, input, posterAt, blurs } = parseArgs(process.argv.slice(2))
const filter = buildFilter(blurs)
const usesComplex = blurs.length > 0
const filterArgs = usesComplex
  ? ['-filter_complex', filter, '-map', '[out]']
  : ['-vf', filter]

const mp4Output = path.join(ASSET_DIR, `${platform}-recording.mp4`)
await run([
  '-y', '-i', input, ...filterArgs, '-an',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
  '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
  mp4Output,
])
console.log(`Generated ${path.relative(ROOT, mp4Output)}`)

const webmOutput = path.join(ASSET_DIR, `${platform}-recording.webm`)
await run([
  '-y', '-i', input, ...filterArgs, '-an',
  '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1',
  webmOutput,
])
console.log(`Generated ${path.relative(ROOT, webmOutput)}`)

const posterOutput = path.join(ASSET_DIR, `${platform}-recording-poster.png`)
await run([
  '-y', '-ss', String(posterAt), '-i', input,
  '-frames:v', '1', '-vf', `scale=${OUTPUT_WIDTH}:-2:flags=lanczos`,
  posterOutput,
])
console.log(`Generated ${path.relative(ROOT, posterOutput)}`)
