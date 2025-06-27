# @soynoah/esbuild-plugin-cascade-layers

An esbuild plugin that splits CSS cascade layers into separate files for optimized loading and better code organization.

## Features

- 🎯 **Split CSS by Layers**: Automatically extract CSS cascade layers into separate files
- 🚀 **Performance**: Load only the CSS layers you need
- 🔧 **Configurable**: Customize layer extraction patterns and file naming
- 📦 **Zero Dependencies**: Lightweight plugin with no external dependencies
- 🎨 **TypeScript Support**: Fully typed for better developer experience

## Installation

```bash
npm install @soynoah/esbuild-plugin-cascade-layers
# or
yarn add @soynoah/esbuild-plugin-cascade-layers
# or
pnpm add @soynoah/esbuild-plugin-cascade-layers
```

## Quick Start

```typescript
import { build } from "esbuild";
import { cssLayersPlugin } from "@soynoah/esbuild-plugin-cascade-layers";

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outdir: "dist",
  plugins: [
    cssLayersPlugin({
      outputDir: "dist",
      layers: ["reset", "theme", "component", "utilities"],
    }),
  ],
});
```

## Input CSS

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

@layer reset;
@layer theme;
@layer component;
@layer utilities;

@property --my-property {
  syntax: "<number>";
  inherits: true;
  initial-value: 1;
}

@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

@layer theme {
  :root {
    --primary-color: #3b82f6;
    --text-color: #1f2937;
  }
}

@layer component {
  .button {
    background: var(--primary-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
  }
}

@layer utilities {
  .text-center {
    text-align: center;
  }
  .hidden {
    display: none;
  }
}
```

## Generated Output

The plugin will generate the following files:

### `styles.css` (complete CSS)

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
@layer reset;
@layer theme;
@layer component;
@layer utilities;
/* ... all layers combined ... */
```

### `reset.css`

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
@layer reset;
@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}
```

### `theme.css`

```css
@layer theme;
@layer theme {
  @property --my-property {
    syntax: "<number>";
    inherits: true;
    initial-value: 1;
  }

  :root {
    --primary-color: #3b82f6;
    --text-color: #1f2937;
  }
}
```

### `component.css`

```css
@layer component;
@layer component {
  .button {
    background: var(--primary-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
  }
}
```

### `utilities.css`

```css
@layer utilities;
@layer utilities {
  .text-center {
    text-align: center;
  }
  .hidden {
    display: none;
  }
}
```

## Usage in Your App

### Import All Layers (Traditional)

```typescript
import "./dist/styles.css";
```

### Import Specific Layers (Optimized)

```typescript
// Only load what you need
import "./dist/reset.css"; // CSS reset
import "./dist/theme.css"; // Theme variables
import "./dist/component.css"; // Component styles
// Skip utilities if not needed
```

## Configuration Options

```typescript
interface CssLayersPluginOptions {
  /**
   * Output directory for layer-specific CSS files
   * @default 'dist'
   */
  outputDir?: string;

  /**
   * CSS layers to extract (in order)
   * @default ['reset', 'theme', 'component', 'utilities']
   */
  layers?: string[];

  /**
   * Whether to include @import statements in reset layer
   * @default true
   */
  includeImportsInReset?: boolean;

  /**
   * Whether to include @property rules in theme layer
   * @default true
   */
  includePropertiesInTheme?: boolean;

  /**
   * Custom layer extraction patterns
   */
  customPatterns?: Record<string, RegExp>;

  /**
   * Whether to generate individual layer files
   * @default true
   */
  generateLayerFiles?: boolean;

  /**
   * Custom file naming pattern
   * @default (layerName) => `${layerName}.css`
   */
  fileNaming?: (layerName: string) => string;
}
```

## Advanced Configuration

### Custom Layer Names

```typescript
cssLayersPlugin({
  layers: ["foundation", "layout", "components", "overrides"],
  fileNaming: (layerName) => `app-${layerName}.css`,
});
```

### Custom Extraction Patterns

```typescript
cssLayersPlugin({
  customPatterns: {
    animations: /@layer animations\s*\{([\s\S]*?)\}/g,
  },
});
```

### Disable Layer File Generation

```typescript
cssLayersPlugin({
  generateLayerFiles: false, // Only process, don't generate separate files
});
```

## Use Cases

### 🎨 Design Systems

Split your design system into logical layers:

- `reset.css` - Normalize/reset styles
- `tokens.css` - Design tokens and CSS variables
- `components.css` - Component styles
- `utilities.css` - Utility classes

### ⚡ Performance Optimization

- Load critical CSS (reset + theme) immediately
- Lazy load component CSS as needed
- Skip unused utility CSS for smaller bundles

### 🏗️ Micro-frontends

- Share reset and theme layers across micro-frontends
- Load component-specific CSS only when needed
- Maintain consistent styling architecture

### 📱 Progressive Enhancement

- Start with basic reset + theme
- Progressively enhance with components
- Add utilities for advanced interactions

## Integration Examples

### With Vanilla Extract

```typescript
import { vanillaExtractPlugin } from "@vanilla-extract/esbuild-plugin";
import { cssLayersPlugin } from "@soynoah/esbuild-plugin-cascade-layers";

await build({
  plugins: [
    vanillaExtractPlugin(),
    cssLayersPlugin(), // Process after vanilla-extract
  ],
});
```

### With PostCSS

```typescript
import { cssLayersPlugin } from "@soynoah/esbuild-plugin-cascade-layers";

await build({
  plugins: [
    // Your PostCSS plugin here
    cssLayersPlugin(),
  ],
});
```

## Browser Support

CSS Cascade Layers are supported in:

- Chrome 99+
- Firefox 97+
- Safari 15.4+

For older browsers, consider using a CSS layer polyfill or stick to the combined CSS file.

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guide for details.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.
