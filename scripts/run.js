import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';

process.env.LOCAL_ENV = 'true';

// Load environment variables early (only once)
const nodeEnv = process.env.NODE_ENV || 'development';
const envFilePath = path.resolve(process.cwd(), `.env.${nodeEnv}`);
const defaultEnvPath = path.resolve(process.cwd(), '.env');

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) return null;
  try {
    const content = readFileSync(filePath, 'utf8');
    const parsed = dotenv.parse(content);
    return Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

const parsedPreferred = parseEnvFile(envFilePath);
const parsedFallback = parsedPreferred ? null : parseEnvFile(defaultEnvPath);

const selectedPath = parsedPreferred
  ? envFilePath
  : parsedFallback
    ? defaultEnvPath
    : null;
const selectedParsed = parsedPreferred || parsedFallback;

if (selectedPath && selectedParsed) {
  const missingKeys = Object.keys(selectedParsed).filter(
    (k) => !(k in process.env)
  );
  if (missingKeys.length > 0) {
    for (const key of missingKeys) {
      process.env[key] = selectedParsed[key];
    }
  }
}

const runner = () => {
  process.on('unhandledRejection', (err) => {
    console.log('Error :::: ', err);
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const serviceName = process.env.SERVICE || 'rest';

  const servicePath = path.join(
    __dirname,
    '..',
    'src',
    'services',
    `${serviceName}/index.js`
  );
  console.log(`Current service: ${serviceName}`);
  import(servicePath)
    .then(() => {
      console.log(`Started at: ${new Date()}`);
    })
    .catch((err) => {
      console.error('❌ Failed to load service:', err);
      process.exit(1);
    });
};

runner();
