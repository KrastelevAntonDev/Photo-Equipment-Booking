const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src', 'public');
const destDir = path.join(root, 'dist', 'public');

// Директории с динамическим контентом (загруженные файлы) — НЕ перезаписываем
const skipDirs = ['uploads'];

function copyRecursive(src, dest, relativePath = '') {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    const currentRelative = path.join(relativePath, entry.name);
    
    if (entry.isDirectory()) {
      // Пропускаем uploads — сохраняем пользовательский контент
      if (skipDirs.includes(entry.name) && relativePath === '') {
        console.log(`[copy-public] Skipping ${currentRelative} (user-uploaded content)`);
        // Создаём директорию если её нет, но не копируем содержимое
        fs.mkdirSync(d, { recursive: true });
        continue;
      }
      copyRecursive(s, d, currentRelative);
    } else {
      // Копируем только если файл не существует или исходник новее
      let shouldCopy = true;
      if (fs.existsSync(d)) {
        const srcStat = fs.statSync(s);
        const destStat = fs.statSync(d);
        // Копируем только если исходник изменён позже
        shouldCopy = srcStat.mtime > destStat.mtime;
      }
      if (shouldCopy) {
        fs.copyFileSync(s, d);
      }
    }
  }
}

// Ensure dist/public exists even if src/public is missing
fs.mkdirSync(destDir, { recursive: true });

copyRecursive(srcDir, destDir);

console.log(`[copy-public] Copied public assets to ${destDir}`);
