import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  target: 'node16',
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  external: ['esbuild'],
});
