const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src', 'public');
const destDir = path.join(root, 'dist', 'public');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// Ensure dist/public exists even if src/public is missing
fs.mkdirSync(destDir, { recursive: true });

copyRecursive(srcDir, destDir);

console.log(`[copy-public] Copied public assets to ${destDir}`);
