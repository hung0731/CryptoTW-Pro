
const fs = require('fs');
const path = require('path');

const files = [
    'src/lib/bot/ui/flex-generator.ts',
    'src/lib/flex-market-dashboard.ts',
    'src/lib/stocks.ts'
];

function processFile(filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${filePath}, not found.`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace $4 as const with " as const
    // We assume mostly double quotes were used because the regex matched \2 which was likely "
    // If original was ', we might be changing it to ", which is fine (valid JS/TS).

    // Pattern: literally "$4 as const"
    // We need to be careful. The previous script produced:
    // key: "value$4 as const
    // We want:
    // key: "value" as const

    content = content.replace(/\$4 as const/g, '" as const');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Repaired ${filePath}`);
}

files.forEach(processFile);
