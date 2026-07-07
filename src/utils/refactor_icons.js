const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '../screens');
const componentsDir = path.join(__dirname, '../components');

function processFile(filePath) {
    let originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    // 1. Refactor icons in JSX (e.g. <Ionicons color="#ffffff" ... />)
    // We match any Icon component or ActivityIndicator with color="#ffffff", color="#fff", color="white" (with single/double quotes or curly braces)
    const iconColorRegex = /(<(?:Ionicons|MaterialCommunityIcons|MaterialIcons|FontAwesome|Feather|Octicons|AntDesign|SimpleLineIcons|Entypo|ActivityIndicator)[^>]*?color=)(?:"#ffffff"|'#ffffff'|{"#ffffff"}|{'#ffffff'}|"#fff"|'#fff'|{"#fff"}|{'#fff'}|"white"|'white'|{"white"}|{'white'})/g;
    
    content = content.replace(iconColorRegex, (match, p1) => {
        // If it's a back/close/chevron/cancel/close-outline icon, we use backBtn (purple in light mode)
        if (match.toLowerCase().includes('back') || match.toLowerCase().includes('close') || match.toLowerCase().includes('chevron') || match.toLowerCase().includes('arrow')) {
            return p1 + '{CloudVoidTheme.colors.backBtn}';
        }
        // Otherwise use textPrimary (dark in light mode, white in dark mode)
        return p1 + '{CloudVoidTheme.colors.textPrimary}';
    });

    // 2. Refactor inline styles inside style arrays (e.g. { color: isInputValid ? '#ffffff' : ... })
    // We target '#ffffff', '#fff', 'white' inside brackets that are style overrides
    content = content.replace(/color:\s*is[a-zA-Z0-9_]*?\s*?\?\s*?'(#ffffff|#fff|white)'/g, (match) => {
        if (match.toLowerCase().includes('btn') || match.toLowerCase().includes('input')) {
            return match.replace(/'(#ffffff|#fff|white)'/i, "CloudVoidTheme.colors.btnText");
        }
        return match.replace(/'(#ffffff|#fff|white)'/i, "CloudVoidTheme.colors.textPrimary");
    });
    content = content.replace(/color:\s*is[a-zA-Z0-9_]*?\s*?\?\s*?"(#ffffff|#fff|white)"/g, (match) => {
        if (match.toLowerCase().includes('btn') || match.toLowerCase().includes('input')) {
            return match.replace(/"(#ffffff|#fff|white)"/i, "CloudVoidTheme.colors.btnText");
        }
        return match.replace(/"(#ffffff|#fff|white)"/i, "CloudVoidTheme.colors.textPrimary");
    });

    // Handle generic color: isInputValid ? ...
    content = content.replace(/\?\s*?'(#ffffff|#fff|white)'\s*:\s*([^}\n]+)/gi, (match, p1, p2) => {
        // Determine context: if it seems to be inside a button style
        return `? CloudVoidTheme.colors.btnText : ${p2}`;
    });
    content = content.replace(/\?\s*?"(#ffffff|#fff|white)"\s*:\s*([^}\n]+)/gi, (match, p1, p2) => {
        return `? CloudVoidTheme.colors.btnText : ${p2}`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Refactored inline styling/icons: ${path.basename(filePath)}`);
    }
}

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    });
}

processDirectory(screensDir);
processDirectory(componentsDir);

console.log("Inline style and icon refactoring complete!");
