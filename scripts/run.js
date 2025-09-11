import path from 'path';
import { fileURLToPath } from 'url';

process.env.LOCAL_ENV = 'true';

const runner = () => {
  process.on('unhandledRejection', (err) => {
    console.log('Error :::: ', err);
  });

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const serviceName = process.env.SERVICE || '';

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
