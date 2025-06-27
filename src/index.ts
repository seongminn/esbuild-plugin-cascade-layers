import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import type { BuildResult, OutputFile, Plugin, PluginBuild } from 'esbuild';

import { type CssLayersPluginOptions, DEFAULT_OPTIONS } from './types.js';
import { processCssLayers } from './utils/layer-processor.js';

/**
 * esbuild plugin to split CSS cascade layers
 */
export function cssLayersPlugin(options: CssLayersPluginOptions = {}): Plugin {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalFiles = new Map<string, string>();

  return {
    name: 'css-layers',
    setup(build: PluginBuild) {
      // Read original CSS files before esbuild processes them
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        const contents = await readFile(args.path, 'utf-8');
        originalFiles.set(args.path, contents);
        return null; // Let esbuild handle the file normally
      });

      // Handle CSS files after processing
      build.onEnd(async (result: BuildResult) => {
        if (result.errors.length > 0) {
          return;
        }

        // Find CSS output files
        const cssFiles =
          result.outputFiles?.filter((file: OutputFile) => extname(file.path) === '.css') || [];

        // Process each CSS file
        for (const cssFile of cssFiles) {
          const cssContent = new TextDecoder().decode(cssFile.contents);

          // Try to find the original file content
          const originalFile = Array.from(originalFiles.entries()).find(([path]) => {
            const fileName = path.split('/').pop()?.replace('.css', '');
            return cssFile.path.includes(fileName || '');
          });
          const originalContent = originalFile?.[1];

          await processCssLayers(cssContent, cssFile.path, opts, originalContent);
        }
      });
    },
  };
}

// Re-export types and utilities for convenience
export type { CssLayersPluginOptions } from './types.js';
export { extractImports, extractLayerContent, extractProperties } from './utils/css-parser.js';
export { processCssLayers } from './utils/layer-processor.js';

// Default export for convenience
export default cssLayersPlugin;
