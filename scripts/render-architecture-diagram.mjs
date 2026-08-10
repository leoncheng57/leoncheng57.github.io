#!/usr/bin/env node
/**
 * Renders the Sub-Wait architecture diagram from Mermaid source to a
 * checked-in SVG, so the site has no runtime Mermaid dependency.
 *
 * Re-run after editing scripts/architecture-diagram.mmd:
 *
 *   node scripts/render-architecture-diagram.mjs
 *
 * Uses @mermaid-js/mermaid-cli via npx (not a package.json dependency; it
 * pulls a headless browser, which we don't want in the install tree).
 */
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const source = path.join(here, 'architecture-diagram.mmd')
const output = path.join(
  here,
  '..',
  'public',
  'sub-wait',
  'architecture-diagram-v2.svg',
)

execFileSync(
  'npx',
  [
    '--yes',
    '@mermaid-js/mermaid-cli',
    '--input',
    source,
    '--output',
    output,
    '--backgroundColor',
    'white',
  ],
  { stdio: 'inherit' },
)
console.log(`Wrote ${output}`)
