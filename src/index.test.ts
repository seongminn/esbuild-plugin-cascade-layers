import { cssLayersPlugin } from "../src/index.js";
import { build } from "esbuild";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const TEST_DIR = join(process.cwd(), "test-output");

describe("cssLayersPlugin", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("should split CSS layers into separate files", async () => {
    const testCss = `
@import url("https://example.com/font.css");
@layer reset;
@layer theme;
@layer component;
@layer utilities;

@property --test-var {
  syntax: "<number>";
  inherits: true;
  initial-value: 1;
}

@layer reset {
  * {
    margin: 0;
    padding: 0;
  }
}

@layer theme {
  :root {
    --primary-color: blue;
  }
}

@layer component {
  .button {
    background: var(--primary-color);
  }
}

@layer utilities {
  .text-center {
    text-align: center;
  }
}
`;

    // Create test CSS file
    const inputFile = join(TEST_DIR, "input.css");
    await writeFile(inputFile, testCss);

    // Build with plugin
    const result = await build({
      entryPoints: [inputFile],
      outdir: TEST_DIR,
      bundle: false,
      write: false, // Don't write to disk, get outputFiles instead
      plugins: [
        cssLayersPlugin({
          outputDir: TEST_DIR,
        }),
      ],
    });

    // Write the main CSS file
    if (result.outputFiles) {
      for (const file of result.outputFiles) {
        await writeFile(file.path, file.contents);
      }
    }

    // Check if layer files were created
    const resetCss = await readFile(join(TEST_DIR, "reset.css"), "utf-8");
    const themeCss = await readFile(join(TEST_DIR, "theme.css"), "utf-8");
    const componentCss = await readFile(join(TEST_DIR, "component.css"), "utf-8");
    const utilitiesCss = await readFile(join(TEST_DIR, "utilities.css"), "utf-8");

    // Verify content
    expect(resetCss).toContain('@import url("https://example.com/font.css")');
    expect(resetCss).toContain("margin: 0");
    expect(themeCss).toContain("@property --test-var");
    expect(themeCss).toContain("--primary-color: blue");
    expect(componentCss).toContain(".button");
    expect(utilitiesCss).toContain(".text-center");
  });

  it("should respect custom options", async () => {
    const testCss = `
@layer custom {
  .custom-class {
    color: red;
  }
}
`;

    const inputFile = join(TEST_DIR, "input.css");
    await writeFile(inputFile, testCss);

    const result = await build({
      entryPoints: [inputFile],
      outdir: TEST_DIR,
      bundle: false,
      write: false, // Don't write to disk, get outputFiles instead
      plugins: [
        cssLayersPlugin({
          outputDir: TEST_DIR,
          layers: ["custom"],
          fileNaming: (layerName) => `custom-${layerName}.css`,
        }),
      ],
    });

    // Write the main CSS file
    if (result.outputFiles) {
      for (const file of result.outputFiles) {
        await writeFile(file.path, file.contents);
      }
    }

    const customCss = await readFile(join(TEST_DIR, "custom-custom.css"), "utf-8");
    expect(customCss).toContain(".custom-class");
  });

  it("should preserve original @import format", async () => {
    const testCss = `
@import "https://example.com/style1.css";
@import url("https://example.com/style2.css");
@import 'https://example.com/style3.css';

@layer reset {
  * {
    margin: 0;
  }
}
`;

    const inputFile = join(TEST_DIR, "input.css");
    await writeFile(inputFile, testCss);

    const result = await build({
      entryPoints: [inputFile],
      outdir: TEST_DIR,
      bundle: false,
      write: false,
      plugins: [
        cssLayersPlugin({
          outputDir: TEST_DIR,
        }),
      ],
    });

    // Write the main CSS file
    if (result.outputFiles) {
      for (const file of result.outputFiles) {
        await writeFile(file.path, file.contents);
      }
    }

    const resetCss = await readFile(join(TEST_DIR, "reset.css"), "utf-8");

    // Verify that original import formats are preserved
    expect(resetCss).toContain('@import "https://example.com/style1.css"');
    expect(resetCss).toContain('@import url("https://example.com/style2.css")');
    expect(resetCss).toContain("@import 'https://example.com/style3.css'");
    expect(resetCss).toContain("margin: 0");
  });
});
