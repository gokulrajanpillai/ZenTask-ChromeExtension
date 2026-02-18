const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = 'dist';
const zipName = 'zen-task-extension.zip';

if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist. Run npm run build first.');
    process.exit(1);
}

try {
    // Requires 'zip' command line tool (standard on Mac/Linux)
    console.log(`Creating ${zipName} from ${distDir}...`);
    execSync(`zip -r ../${zipName} .`, { cwd: path.resolve(process.cwd(), distDir) });
    console.log(`Successfully created ${zipName}`);
} catch (error) {
    console.error('Failed to zip distribution:', error);
    process.exit(1);
}
