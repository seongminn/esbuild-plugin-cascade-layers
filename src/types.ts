export interface CssLayersPluginOptions {
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

export const DEFAULT_OPTIONS: Required<CssLayersPluginOptions> = {
  outputDir: 'dist',
  layers: ['reset', 'theme', 'component', 'utilities'],
  includeImportsInReset: true,
  includePropertiesInTheme: true,
  customPatterns: {},
  generateLayerFiles: true,
  fileNaming: (layerName: string) => `${layerName}.css`,
};
