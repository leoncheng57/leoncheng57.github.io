#!/usr/bin/env node
/** Generates original Sub-Wait iPhone/Android installation illustrations. */
import { execFileSync } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const outputDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'sub-wait',
  'install',
)

const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

function text(x, y, value, options = {}) {
  const { size = 16, weight = 500, fill = '#171717', anchor = 'start' } = options
  return `<text x="${x}" y="${y}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${escape(value)}</text>`
}

function logo(x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <rect width="64" height="64" rx="14" fill="#111"/>
    <circle cx="24" cy="27" r="13" fill="#6d28d9"/>
    ${text(24, 33, 'S', { size: 17, weight: 800, fill: '#fff', anchor: 'middle' })}
    <circle cx="44" cy="27" r="13" fill="#d9a514"/>
    ${text(44, 33, 'W', { size: 17, weight: 800, fill: '#111', anchor: 'middle' })}
    <rect x="12" y="46" width="26" height="6" rx="3" fill="#fff"/>
    <rect x="42" y="46" width="10" height="6" rx="3" fill="#fff" opacity=".4"/>
  </g>`
}

function callout(cx, cy, number) {
  return `<circle cx="${cx}" cy="${cy}" r="27" fill="#111" stroke="#ff6319" stroke-width="7"/>
    ${text(cx, cy + 7, number, { size: 21, weight: 800, fill: '#fff', anchor: 'middle' })}`
}

function phone(content, platform) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="720" viewBox="0 0 390 720">
    <rect width="390" height="720" fill="#e8e8e8"/>
    <rect x="17" y="10" width="356" height="700" rx="48" fill="#111"/>
    <rect x="25" y="18" width="340" height="684" rx="40" fill="#f7f7f7"/>
    ${platform === 'iphone' ? '<rect x="145" y="27" width="100" height="26" rx="13" fill="#111"/>' : '<circle cx="195" cy="34" r="6" fill="#111"/>'}
    ${text(48, 48, '9:41', { size: 14, weight: 700 })}
    ${content}
  </svg>`
}

function appPage() {
  return `${logo(154, 150, 1.28)}
    ${text(195, 262, 'Sub-Wait', { size: 31, weight: 800, anchor: 'middle' })}
    ${text(195, 292, 'Live NYC subway arrivals', { size: 15, fill: '#666', anchor: 'middle' })}
    <rect x="48" y="326" width="294" height="46" rx="23" fill="#fff" stroke="#bbb"/>
    ${text(72, 355, 'Search stations…', { size: 15, fill: '#777' })}
    ${text(48, 420, 'Nearby', { size: 19, weight: 800 })}
    <rect x="48" y="440" width="294" height="92" rx="12" fill="#fff" stroke="#bbb" stroke-dasharray="5 4"/>
    <rect x="78" y="471" width="132" height="36" rx="18" fill="#111"/>
    ${text(144, 494, 'Use my location', { size: 13, weight: 700, fill: '#fff', anchor: 'middle' })}`
}

const images = {
  'iphone-1-share': phone(`
    <rect x="42" y="68" width="306" height="44" rx="14" fill="#e5e5e5"/>
    ${text(195, 96, 'leoncheng.dev/sub-wait', { size: 14, anchor: 'middle' })}
    ${appPage()}
    <rect x="38" y="615" width="314" height="70" rx="22" fill="#fff" stroke="#d0d0d0"/>
    <rect x="164" y="623" width="62" height="54" rx="17" fill="#eef4f8" stroke="#111" stroke-width="4"/>
    <path d="M195 658V635M195 635l-9 9M195 635l9 9" fill="none" stroke="#1769aa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="181" y="650" width="28" height="20" rx="4" fill="none" stroke="#1769aa" stroke-width="3"/>
    ${callout(329, 599, 1)}
  `, 'iphone'),

  'iphone-2-add': phone(`
    <rect x="25" y="70" width="340" height="632" fill="#d6d6d6" opacity=".55"/>
    <rect x="34" y="252" width="322" height="430" rx="28" fill="#fff"/>
    <rect x="170" y="264" width="50" height="5" rx="3" fill="#bbb"/>
    ${text(58, 306, 'Share', { size: 22, weight: 800 })}
    <rect x="50" y="332" width="290" height="62" rx="12" fill="#f1f1f1"/>
    ${text(72, 370, 'Copy', { size: 17 })}
    <rect x="50" y="406" width="290" height="72" rx="12" fill="#fff" stroke="#111" stroke-width="4"/>
    <rect x="67" y="423" width="34" height="34" rx="7" fill="#eee"/>
    <path d="M75 440h18M84 431v18" stroke="#111" stroke-width="2.5"/>
    ${text(116, 443, 'Add to Home Screen', { size: 16, weight: 700 })}
    ${text(116, 463, 'Create an app icon', { size: 12, fill: '#666' })}
    <rect x="50" y="490" width="290" height="62" rx="12" fill="#f1f1f1"/>
    ${text(72, 528, 'Add Bookmark', { size: 17 })}
    ${callout(326, 390, 2)}
  `, 'iphone'),

  'iphone-3-confirm': phone(`
    ${text(48, 95, 'Add to Home Screen', { size: 22, weight: 800 })}
    ${text(335, 95, 'Add', { size: 18, weight: 700, fill: '#1769aa', anchor: 'end' })}
    <line x1="40" y1="116" x2="350" y2="116" stroke="#ccc"/>
    ${logo(52, 146, 1.05)}
    ${text(137, 176, 'Sub-Wait', { size: 20, weight: 700 })}
    ${text(137, 201, 'leoncheng.dev', { size: 13, fill: '#666' })}
    <rect x="48" y="244" width="294" height="48" rx="10" fill="#eee"/>
    ${text(62, 274, 'Sub-Wait', { size: 16 })}
    ${text(48, 332, 'An icon will be added to your Home Screen.', { size: 14, fill: '#555' })}
    <rect x="286" y="64" width="66" height="48" rx="18" fill="none" stroke="#111" stroke-width="4"/>
    ${callout(326, 137, 3)}
  `, 'iphone'),

  'android-1-menu': phone(`
    <rect x="36" y="66" width="318" height="52" rx="26" fill="#e6e6e6"/>
    ${text(62, 98, 'leoncheng.dev/sub-wait', { size: 14 })}
    <circle cx="330" cy="83" r="3"/><circle cx="330" cy="92" r="3"/><circle cx="330" cy="101" r="3"/>
    ${appPage()}
    <circle cx="330" cy="92" r="28" fill="none" stroke="#111" stroke-width="4"/>
    ${callout(330, 143, 1)}
  `, 'android'),

  'android-2-install': phone(`
    <rect x="36" y="66" width="318" height="52" rx="26" fill="#e6e6e6"/>
    ${text(62, 98, 'leoncheng.dev/sub-wait', { size: 14 })}
    <rect x="82" y="118" width="264" height="446" rx="10" fill="#fff" stroke="#bbb"/>
    ${text(108, 158, 'New tab', { size: 16 })}
    ${text(108, 207, 'Bookmarks', { size: 16 })}
    ${text(108, 256, 'History', { size: 16 })}
    <rect x="94" y="280" width="240" height="64" rx="8" fill="#f3f3f3" stroke="#111" stroke-width="4"/>
    <path d="M113 302h22v22h-22zM118 297v10M130 297v10" fill="none" stroke="#111" stroke-width="2"/>
    ${text(151, 318, 'Install app', { size: 17, weight: 700 })}
    ${text(108, 382, 'Share…', { size: 16 })}
    ${text(108, 431, 'Find in page', { size: 16 })}
    ${callout(326, 356, 2)}
  `, 'android'),

  'android-3-confirm': phone(`
    <rect x="25" y="70" width="340" height="632" fill="#ddd"/>
    <rect x="42" y="260" width="306" height="304" rx="28" fill="#fff"/>
    ${logo(68, 292, .92)}
    ${text(146, 319, 'Install Sub-Wait?', { size: 21, weight: 800 })}
    ${text(146, 344, 'Live NYC subway arrivals', { size: 13, fill: '#666' })}
    ${text(68, 398, 'This app will be added to your', { size: 14, fill: '#555' })}
    ${text(68, 420, 'home screen.', { size: 14, fill: '#555' })}
    ${text(204, 515, 'Cancel', { size: 15, weight: 700, fill: '#555', anchor: 'middle' })}
    <rect x="246" y="480" width="82" height="48" rx="24" fill="#111"/>
    ${text(287, 510, 'Install', { size: 15, weight: 700, fill: '#fff', anchor: 'middle' })}
    ${callout(326, 458, 3)}
  `, 'android'),
}

await mkdir(outputDir, { recursive: true })
for (const [name, svg] of Object.entries(images)) {
  const svgPath = path.join(outputDir, `${name}.svg`)
  const pngPath = path.join(outputDir, `${name}.png`)
  await writeFile(svgPath, svg)
  execFileSync('rsvg-convert', ['-w', '390', '-h', '720', svgPath, '-o', pngPath])
  console.log(`Wrote ${pngPath}`)
}
