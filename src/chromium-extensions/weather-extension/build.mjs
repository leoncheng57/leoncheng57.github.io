import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

await build({
  absWorkingDir: fileURLToPath(new URL('.', import.meta.url)),
  entryPoints: ['ui/main.tsx'],
  outfile: 'popup.js',
  bundle: true,
  minify: true,
  jsx: 'automatic',
  target: ['chrome120'],
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'eof',
});
