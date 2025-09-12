// loader/loader-register.js
import { register } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Register loader.mjs (same folder as this file)
register(resolve(__dirname, './loader.mjs'), pathToFileURL('./'));
