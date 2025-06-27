/**
 * Extract layer content from CSS
 */
export function extractLayerContent(
  css: string,
  layerName: string,
  customPattern?: RegExp,
): string {
  if (customPattern) {
    const contents: string[] = [];

    // Create a new RegExp instance to avoid mutating the original
    const pattern = new RegExp(customPattern.source, customPattern.flags);
    let match = pattern.exec(css);

    while (match !== null) {
      contents.push(match[1].trim());
      match = pattern.exec(css);
    }

    if (contents.length === 0) {
      return '';
    }

    return `@layer ${layerName};\n@layer ${layerName} {\n${contents.join('\n')}\n}`;
  }

  // For default layer pattern, handle nested braces properly
  const pattern = new RegExp(`@layer\\s+${layerName}\\s*\\{`, 'g');
  const contents: string[] = [];
  let match = pattern.exec(css);

  while (match !== null) {
    const startIndex = match.index + match[0].length;
    let braceCount = 1;
    let endIndex = startIndex;

    // Find the matching closing brace
    for (let i = startIndex; i < css.length && braceCount > 0; i++) {
      if (css[i] === '{') {
        braceCount++;
      } else if (css[i] === '}') {
        braceCount--;
      }
      endIndex = i;
    }

    if (braceCount === 0) {
      const content = css.substring(startIndex, endIndex).trim();
      contents.push(content);
    }

    match = pattern.exec(css);
  }

  if (contents.length === 0) {
    return '';
  }

  return `@layer ${layerName};\n@layer ${layerName} {\n${contents.join('\n')}\n}`;
}

/**
 * Extract @import statements from CSS
 */
export function extractImports(css: string): string {
  const importMatches = css.match(/@import[^;]+;/g) || [];
  // Keep the original format as written by the user
  return importMatches.join('\n');
}

/**
 * Extract @property rules from CSS
 */
export function extractProperties(css: string): string {
  const propertyMatches = css.match(/@property[^}]+}/g) || [];
  return propertyMatches.join('');
}
