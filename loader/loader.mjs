import { pathToFileURL } from 'url';
import { resolve as resolvePath, extname, dirname } from 'path';
import { existsSync } from 'fs';

export async function resolve(specifier, context, nextResolve) {
  // If the specifier doesn't have an extension, try to resolve it
  if (
    !extname(specifier) &&
    !specifier.startsWith('node:') &&
    !specifier.startsWith('http') &&
    !specifier.startsWith('data:')
  ) {
    const parentDir = context.parentURL
      ? dirname(new URL(context.parentURL).pathname)
      : process.cwd();

    // Try to resolve as .js first
    const jsPath = resolvePath(parentDir, specifier + '.js');
    if (existsSync(jsPath)) {
      return {
        url: pathToFileURL(jsPath).href,
        shortCircuit: true,
      };
    }

    // Try to resolve as .mjs
    const mjsPath = resolvePath(parentDir, specifier + '.mjs');
    if (existsSync(mjsPath)) {
      return {
        url: pathToFileURL(mjsPath).href,
        shortCircuit: true,
      };
    }

    // Try to resolve as directory with index.js
    const dirPath = resolvePath(parentDir, specifier);
    const indexJsPath = resolvePath(dirPath, 'index.js');
    if (existsSync(indexJsPath)) {
      return {
        url: pathToFileURL(indexJsPath).href,
        shortCircuit: true,
      };
    }

    // Try to resolve as directory with index.mjs
    const indexMjsPath = resolvePath(dirPath, 'index.mjs');
    if (existsSync(indexMjsPath)) {
      return {
        url: pathToFileURL(indexMjsPath).href,
        shortCircuit: true,
      };
    }
  }

  // Delegate to the default resolver
  return nextResolve(specifier, context);
}
