import { mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_OPTIONS } from '../types.js';
import { processCssLayers } from '../utils/layer-processor.js';

const TEST_DIR = join(process.cwd(), 'test-layer-processor');

describe('Layer Processor', () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe('processCssLayers', () => {
    it('should generate layer files with default options', async () => {
      const css = `
@layer reset {
  * { margin: 0; }
}

@layer theme {
  :root { --color: blue; }
}
`;
      const outputPath = join(TEST_DIR, 'output.css');

      await processCssLayers(css, outputPath, DEFAULT_OPTIONS);

      // Check if files were created
      const resetContent = await readFile(join(TEST_DIR, 'reset.css'), 'utf-8');
      const themeContent = await readFile(join(TEST_DIR, 'theme.css'), 'utf-8');

      expect(resetContent).toContain('@layer reset;');
      expect(resetContent).toContain('margin: 0');
      expect(themeContent).toContain('@layer theme;');
      expect(themeContent).toContain('--color: blue');
    });

    it('should include imports in reset layer when enabled', async () => {
      const originalCss = `
@import url("https://example.com/font.css");
@import "reset.css";

@layer reset {
  * { margin: 0; }
}
`;
      const processedCss = `
@layer reset {
  * { margin: 0; }
}
`;
      const outputPath = join(TEST_DIR, 'output.css');
      const options = { ...DEFAULT_OPTIONS, includeImportsInReset: true };

      await processCssLayers(processedCss, outputPath, options, originalCss);

      const resetContent = await readFile(join(TEST_DIR, 'reset.css'), 'utf-8');
      expect(resetContent).toContain('@import url("https://example.com/font.css")');
      expect(resetContent).toContain('@import "reset.css"');
      expect(resetContent).toContain('margin: 0');
    });

    it('should include @property in theme layer when enabled', async () => {
      const css = `
@property --test-var {
  syntax: "<color>";
  inherits: true;
  initial-value: blue;
}

@layer theme {
  :root { --color: var(--test-var); }
}
`;
      const outputPath = join(TEST_DIR, 'output.css');
      const options = { ...DEFAULT_OPTIONS, includePropertiesInTheme: true };

      await processCssLayers(css, outputPath, options);

      const themeContent = await readFile(join(TEST_DIR, 'theme.css'), 'utf-8');
      expect(themeContent).toContain('@property --test-var');
      expect(themeContent).toContain('syntax: "<color>"');
      expect(themeContent).toContain('--color: var(--test-var)');
    });

    it('should respect custom file naming', async () => {
      const css = `
@layer custom {
  .custom { color: red; }
}
`;
      const outputPath = join(TEST_DIR, 'output.css');
      const options = {
        ...DEFAULT_OPTIONS,
        layers: ['custom'],
        fileNaming: (layerName: string) => `prefix-${layerName}-suffix.css`,
      };

      await processCssLayers(css, outputPath, options);

      const customContent = await readFile(join(TEST_DIR, 'prefix-custom-suffix.css'), 'utf-8');
      expect(customContent).toContain('.custom');
      expect(customContent).toContain('color: red');
    });

    it('should use custom patterns for extraction', async () => {
      const css = `
@custom-layer special {
  .special { color: purple; }
}
`;
      const outputPath = join(TEST_DIR, 'output.css');
      const customPattern = /@custom-layer\s+special\s*\{([\s\S]*?)\}/gm;
      const options = {
        ...DEFAULT_OPTIONS,
        layers: ['special'],
        customPatterns: { special: customPattern },
      };

      await processCssLayers(css, outputPath, options);

      const specialContent = await readFile(join(TEST_DIR, 'special.css'), 'utf-8');
      expect(specialContent).toContain('@layer special;');
      expect(specialContent).toContain('color: purple');
    });

    it('should not generate files when generateLayerFiles is false', async () => {
      const css = `
@layer reset {
  * { margin: 0; }
}
`;
      const outputPath = join(TEST_DIR, 'output.css');
      const options = { ...DEFAULT_OPTIONS, generateLayerFiles: false };

      await processCssLayers(css, outputPath, options);

      // Should not create any layer files
      let filesExist = false;
      try {
        await readFile(join(TEST_DIR, 'reset.css'), 'utf-8');
        filesExist = true;
      } catch {
        // File doesn't exist, which is expected
      }
      expect(filesExist).toBe(false);
    });

    it('should handle empty layers gracefully', async () => {
      const css = `
@layer reset {
  * { margin: 0; }
}
`;
      const outputPath = join(TEST_DIR, 'output.css');
      const options = { ...DEFAULT_OPTIONS, layers: ['reset', 'nonexistent', 'theme'] };

      await processCssLayers(css, outputPath, options);

      // Should only create reset.css
      const resetContent = await readFile(join(TEST_DIR, 'reset.css'), 'utf-8');
      expect(resetContent).toContain('margin: 0');

      // Should not create files for non-existent layers
      let themeExists = false;
      try {
        await readFile(join(TEST_DIR, 'theme.css'), 'utf-8');
        themeExists = true;
      } catch {
        // File doesn't exist, which is expected
      }
      expect(themeExists).toBe(false);
    });

    it('should handle imports and properties being disabled', async () => {
      const originalCss = `
@import url("https://example.com/font.css");

@property --test-var {
  syntax: "<color>";
  inherits: true;
  initial-value: blue;
}

@layer reset {
  * { margin: 0; }
}

@layer theme {
  :root { --color: blue; }
}
`;
      const outputPath = join(TEST_DIR, 'output.css');
      const options = {
        ...DEFAULT_OPTIONS,
        includeImportsInReset: false,
        includePropertiesInTheme: false,
      };

      await processCssLayers(originalCss, outputPath, options, originalCss);

      const resetContent = await readFile(join(TEST_DIR, 'reset.css'), 'utf-8');
      const themeContent = await readFile(join(TEST_DIR, 'theme.css'), 'utf-8');

      expect(resetContent).not.toContain('@import');
      expect(themeContent).not.toContain('@property');
      expect(resetContent).toContain('margin: 0');
      expect(themeContent).toContain('--color: blue');
    });

    it('should handle empty CSS content', async () => {
      const css = '';
      const outputPath = join(TEST_DIR, 'output.css');
      const options = { ...DEFAULT_OPTIONS };

      await processCssLayers(css, outputPath, options);

      // Should not create any files since no content exists
      let filesCreated = false;
      try {
        await readFile(join(TEST_DIR, 'reset.css'), 'utf-8');
        filesCreated = true;
      } catch {
        // Expected - no files should be created
      }
      expect(filesCreated).toBe(false);
    });

    it('should handle CSS with only layer declarations', async () => {
      const css = `
@layer reset;
@layer theme;
@layer component;
`;
      const outputPath = join(TEST_DIR, 'output.css');
      const options = { ...DEFAULT_OPTIONS };

      await processCssLayers(css, outputPath, options);

      // Should not create any files since no actual layer content exists
      let filesCreated = false;
      try {
        await readFile(join(TEST_DIR, 'reset.css'), 'utf-8');
        filesCreated = true;
      } catch {
        // Expected - no files should be created
      }
      expect(filesCreated).toBe(false);
    });

    it('should handle very large CSS content', async () => {
      // Generate a large CSS content
      let largeCss = '@layer utilities {\n';
      for (let i = 0; i < 1000; i++) {
        largeCss += `.utility-${i} { property: value${i}; }\n`;
      }
      largeCss += '}';

      const outputPath = join(TEST_DIR, 'output.css');
      const options = { ...DEFAULT_OPTIONS };

      await processCssLayers(largeCss, outputPath, options);

      const utilitiesContent = await readFile(join(TEST_DIR, 'utilities.css'), 'utf-8');
      expect(utilitiesContent).toContain('utility-0');
      expect(utilitiesContent).toContain('utility-999');
    });
  });
});
