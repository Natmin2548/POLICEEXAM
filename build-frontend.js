const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Ensure dist directory exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}
fs.mkdirSync(distPath, { recursive: true });

// Copy static files/folders
console.log('Building frontend to dist folder...');
if (fs.existsSync(path.join(__dirname, 'index.html'))) {
  fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distPath, 'index.html'));
  console.log('Copied index.html');
}

const foldersToCopy = ['css', 'js', 'home'];
foldersToCopy.forEach(folder => {
  const src = path.join(__dirname, folder);
  const dest = path.join(distPath, folder);
  if (fs.existsSync(src)) {
    copyDirSync(src, dest);
    console.log(`Copied directory: ${folder}`);
  }
});

console.log('Frontend build completed successfully.');
