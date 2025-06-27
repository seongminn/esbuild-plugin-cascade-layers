import { extractImports, extractLayerContent, extractProperties } from '../utils/css-parser.js';
import { describe, expect, it } from 'vitest';

describe('CSS Parser Utils', () => {
    describe('extractLayerContent', () => {
        it('should extract single layer content', () => {
            const css = `
@layer reset {
  * {
    margin: 0;
    padding: 0;
  }
}
`;
            const result = extractLayerContent(css, 'reset');
            expect(result).toContain('@layer reset;');
            expect(result).toContain('margin: 0');
            expect(result).toContain('padding: 0');
        });

        it('should extract multiple occurrences of the same layer', () => {
            const css = `
@layer theme {
  :root {
    --color: blue;
  }
}

@layer theme {
  body {
    color: var(--color);
  }
}
`;
            const result = extractLayerContent(css, 'theme');
            expect(result).toContain('--color: blue');
            expect(result).toContain('color: var(--color)');
        });

        it('should return empty string for non-existent layer', () => {
            const css = `
@layer reset {
  margin: 0;
}
`;
            const result = extractLayerContent(css, 'utilities');
            expect(result).toBe('');
        });

        it('should work with custom pattern', () => {
            const css = `
@custom-layer special {
  .special {
    color: red;
  }
}
`;
            const customPattern = /@custom-layer\s+special\s*\{([\s\S]*?)\}/gm;
            const result = extractLayerContent(css, 'special', customPattern);
            expect(result).toContain('color: red');
        });

        it('should handle nested braces correctly', () => {
            const css = `
@layer component {
  .button {
    background: blue;
  }
  
  @media (max-width: 768px) {
    .button {
      background: red;
    }
  }
}
`;
            const result = extractLayerContent(css, 'component');
            expect(result).toContain('background: blue');
            expect(result).toContain('@media (max-width: 768px)');
            expect(result).toContain('background: red');
        });
    });

    describe('extractImports', () => {
        it('should extract url() format imports', () => {
            const css = `
@import url("https://example.com/font.css");
@import url('https://example.com/reset.css');

.class {
  color: red;
}
`;
            const result = extractImports(css);
            expect(result).toContain('@import url("https://example.com/font.css")');
            expect(result).toContain("@import url('https://example.com/reset.css')");
        });

        it('should extract quoted imports', () => {
            const css = `
@import "https://example.com/style.css";
@import 'https://example.com/theme.css';

body {
  margin: 0;
}
`;
            const result = extractImports(css);
            expect(result).toContain('@import "https://example.com/style.css"');
            expect(result).toContain("@import 'https://example.com/theme.css'");
        });

        it('should handle multiple imports on separate lines', () => {
            const css = `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
@import "normalize.css";
@import url("./components.css");
`;
            const result = extractImports(css);
            const lines = result.split('\n').filter((line) => line.trim());
            expect(lines).toHaveLength(3);
            expect(result).toContain('fonts.googleapis.com');
            expect(result).toContain('normalize.css');
            expect(result).toContain('components.css');
        });

        it('should return empty string when no imports', () => {
            const css = `
.class {
  color: red;
}

@layer reset {
  margin: 0;
}
`;
            const result = extractImports(css);
            expect(result).toBe('');
        });
    });

    describe('extractProperties', () => {
        it('should extract @property rules', () => {
            const css = `
@property --main-color {
  syntax: "<color>";
  inherits: true;
  initial-value: blue;
}

@property --spacing {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}

.class {
  color: var(--main-color);
}
`;
            const result = extractProperties(css);
            expect(result).toContain('@property --main-color');
            expect(result).toContain('syntax: "<color>"');
            expect(result).toContain('initial-value: blue');
            expect(result).toContain('@property --spacing');
            expect(result).toContain('syntax: "<length>"');
            expect(result).toContain('initial-value: 0px');
        });

        it('should handle complex @property with multiple lines', () => {
            const css = `
@property --custom-gradient {
  syntax: "*";
  inherits: false;
  initial-value: linear-gradient(
    45deg,
    red 0%,
    blue 100%
  );
}
`;
            const result = extractProperties(css);
            expect(result).toContain('@property --custom-gradient');
            expect(result).toContain('linear-gradient');
            expect(result).toContain('45deg');
        });

        it('should return empty string when no @property rules', () => {
            const css = `
.class {
  color: red;
}

@layer reset {
  margin: 0;
}
`;
            const result = extractProperties(css);
            expect(result).toBe('');
        });
    });
});
