import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { normalizeBasePath } from './vite.basePath.js';

function emitBasePathMetadata(basePath) {
  return {
    name: 'emit-base-path-metadata',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'base-path.txt',
        source: `${basePath}\n`
      });
    }
  };
}

export default defineConfig(() => {
  const basePath = normalizeBasePath(process.env.BASE_PATH);

  return {
    base: basePath,
    plugins: [svelte(), svelteTesting(), emitBasePathMetadata(basePath)],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.js'
    }
  };
});
