import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { CssLayersPluginOptions } from '../types';
import { extractImports, extractLayerContent, extractProperties } from './css-parser.js';

/**
 * Process CSS and split into layers
 */
export async function processCssLayers(
  css: string,
  outputPath: string,
  options: Required<CssLayersPluginOptions>,
  originalCss?: string,
): Promise<void> {
  const {
    layers,
    includeImportsInReset,
    includePropertiesInTheme,
    customPatterns,
    generateLayerFiles,
    fileNaming,
  } = options;

  if (!generateLayerFiles) {
    return;
  }

  // Extract imports and properties from original CSS (if available) to preserve format
  const imports = includeImportsInReset ? extractImports(originalCss || css) : '';
  const properties = includePropertiesInTheme ? extractProperties(css) : '';

  // Ensure output directory exists
  await mkdir(dirname(outputPath), { recursive: true });

  // Process each layer
  for (const layerName of layers) {
    const customPattern = customPatterns[layerName];
    const layerContent = extractLayerContent(css, layerName, customPattern);

    if (layerContent.trim()) {
      let finalContent = layerContent;

      // Add imports to reset layer
      if (layerName === 'reset' && imports) {
        finalContent = `${imports}\n${layerContent}`;
      }

      // Add properties to theme layer
      if (layerName === 'theme' && properties) {
        finalContent = layerContent.replace(
          `@layer ${layerName} {`,
          `@layer ${layerName} {\n${properties}`,
        );
      }

      const fileName = fileNaming(layerName);
      const filePath = join(dirname(outputPath), fileName);

      await writeFile(filePath, finalContent, 'utf-8');
    }
  }
}
