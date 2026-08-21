import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    passWithNoTests: true,
    // Most suites here are full-App integration tests: they mount <App /> and
    // drive it through *ByRole queries. Those queries call getComputedStyle to
    // resolve visibility and accessible names, and because `css: true` makes
    // jsdom parse and cascade the real stylesheets, each newly-rendered element
    // costs a few milliseconds. A single interaction that re-renders a page can
    // therefore take a second or more, and Vitest's 5s default — calibrated for
    // unit tests — leaves no headroom on slower CI runners. Nothing hangs; the
    // slowest observed test is ~7s, so 20s is generous while still catching a
    // genuinely stuck test.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
})
