import fs from 'fs/promises';
import path from 'path';

const sourceDir = process.cwd();
const targetDir = process.argv[2] || '/tmp/dormhub-review-safe';

const SKIP_NAMES = new Set([
  '.git',
  '.vercel',
  'node_modules'
]);

async function resetTarget(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function copyDir(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  await fs.mkdir(dest, { recursive: true });
  for (const entry of entries) {
    if (SKIP_NAMES.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function sanitizeIndex(dir) {
  const file = path.join(dir, 'index.html');
  let html = await fs.readFile(file, 'utf8');
  html = html.replace(/https:\/\/(?:forms\.gle\/[^\"]+|docs\.google\.com\/forms\/[^\"]+)/g, '#review-safe-disabled');
  await fs.writeFile(file, html);
}

async function sanitizeAckConfig(dir) {
  const file = path.join(dir, 'ack-config.js');
  const safeConfig = `window.DORM_ACK_FORM_CONFIG = {
  formUrl: '',
  lookupCsvUrl: '',
  entries: {
    building: '',
    room: '',
    nameOriginal: '',
    nameNormalized: '',
    lang: '',
    googleEmail: '',
    ackState: ''
  }
};

window.DORM_GOOGLE_AUTH_CONFIG = {
  clientId: '',
  reviewSafeEmail: 'reviewer@dormhub.local'
};
`;
  await fs.writeFile(file, safeConfig);
}

await resetTarget(targetDir);
await copyDir(sourceDir, targetDir);
await sanitizeIndex(targetDir);
await sanitizeAckConfig(targetDir);

console.log(targetDir);
