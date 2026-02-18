const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src', 'assets');
const distDir = path.join(__dirname, '..', 'dist', 'assets');

console.log('Copying icons to dist...');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

try {
    const files = fs.readdirSync(srcDir);
    files.forEach(file => {
        if (file.startsWith('icon') && (file.endsWith('.png') || file.endsWith('.svg'))) {
            const srcPath = path.join(srcDir, file);
            const distPath = path.join(distDir, file);
            fs.copyFileSync(srcPath, distPath);
            console.log(`✓ Copied ${file}`);
        }
    });
    console.log('Asset copy complete.');
} catch (err) {
    console.error('Error copying assets:', err);
    process.exit(1);
}
