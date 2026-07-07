const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, '../screens');
const componentsDir = path.join(__dirname, '../components');

function processFile(filePath) {
    let originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;

    // 1. General Hardcoded White Text
    content = content.replace(/color:\s*'(#ffffff|#fff|white)'/gi, "color: CloudVoidTheme.colors.whiteText");
    content = content.replace(/color:\s*"(#ffffff|#fff|white)"/gi, "color: CloudVoidTheme.colors.whiteText");

    // 2. Specific Header replacements inside style definitions
    const headerRegex = /((?:headerTitle|title|sheetTitle|sectionTitle|sectionHeader|cardTitle|Title|Heading|modalTitle)\s*:\s*\{[^}]*?)color:\s*(CloudVoidTheme\.colors\.textPrimary|CloudVoidTheme\.colors\.whiteText|'#ffffff'|'#fff'|'#000'|'#000000')/g;
    content = content.replace(headerRegex, "$1color: CloudVoidTheme.colors.textHeader");

    const subHeaderRegex = /((?:subHeading|subtitle|subTitle|subHeader|sheetDesc|description)\s*:\s*\{[^}]*?)color:\s*(CloudVoidTheme\.colors\.textSecondary|CloudVoidTheme\.colors\.whiteText|'#ffffff'|'#fff'|'#9ca3af'|'#4b5563')/g;
    content = content.replace(subHeaderRegex, "$1color: CloudVoidTheme.colors.textSubHeader");

    // 3. Button Text replacements
    const btnTextRegex = /((?:btnText|buttonText|saveBtnText|topupBtnText|issueCardText|actionText|confirmBtnText|proBadgeText)\s*:\s*\{[^}]*?)color:\s*[^,\n]+(,?)/g;
    content = content.replace(btnTextRegex, "$1color: CloudVoidTheme.colors.btnText$2");

    // 4. Button Backgrounds (purple buttons -> dynamic btnBg)
    content = content.replace(/backgroundColor:\s*'(#8b5cf6|#6d28d9|#7c3aed)'/gi, "backgroundColor: CloudVoidTheme.colors.btnBg");

    // 5. Back Button/Icon Color
    content = content.replace(/<Ionicons([^>]*name="chevron-back"[^>]*)color="[^"]*"/g, '<Ionicons$1color={CloudVoidTheme.colors.backBtn}');
    const backTextRegex = /((?:backText|backBtnText)\s*:\s*\{[^}]*?)color:\s*[^,\n]+(,?)/g;
    content = content.replace(backTextRegex, "$1color: CloudVoidTheme.colors.backBtn$2");

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.basename(filePath)}`);
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

console.log("Done refactoring styles!");
