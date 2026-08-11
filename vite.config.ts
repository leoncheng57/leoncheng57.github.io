import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { stationManifestsPlugin } from './scripts/vite-plugin-station-manifests.mjs'

export default defineConfig({
  plugins: [react(), stationManifestsPlugin()],
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    manifest: true,
  },
  base: '/',
})
