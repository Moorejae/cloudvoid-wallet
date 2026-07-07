const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '../screens');
const componentsDir = path.join(__dirname, '../components');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if CloudVoidTheme is used in the file
    const usesTheme = content.includes('CloudVoidTheme');
    // Check if CloudVoidTheme is already imported
    const importsTheme = content.includes('import { CloudVoidTheme }') || content.includes('import {CloudVoidTheme}');

    if (usesTheme && !importsTheme) {
        // We need to inject the import.
        // Let's find the first import line, or just prepend it to the top.
        const importLine = `import { CloudVoidTheme } from '../theme/tokens';\n`;
        
        // Insert at the very top or after "import React" if present
        if (content.startsWith('import ')) {
            // Find the end of the first line
            const firstLineEnd = content.indexOf('\n') + 1;
            content = content.slice(0, firstLineEnd) + importLine + content.slice(firstLineEnd);
        } else {
            content = importLine + content;
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Added CloudVoidTheme import to: ${path.basename(filePath)}`);
    }
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            fixImportsInFile(fullPath);
        }
    });
}

processDirectory(screensDir);
processDirectory(componentsDir);

console.log("Imports verification and fixing complete!");
