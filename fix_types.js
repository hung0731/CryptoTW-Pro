
const fs = require('fs');
const path = require('path');

const files = [
    'src/lib/bot/ui/flex-generator.ts',
    'src/lib/flex-market-dashboard.ts',
    'src/lib/stocks.ts'
];

const patterns = [
    { key: 'type', values: ['flex', 'bubble', 'carousel', 'box', 'text', 'image', 'icon', 'button', 'separator', 'uri', 'message', 'postback', 'location'] },
    { key: 'layout', values: ['vertical', 'horizontal', 'baseline'] },
    { key: 'align', values: ['start', 'end', 'center'] },
    { key: 'gravity', values: ['top', 'bottom', 'center'] },
    { key: 'weight', values: ['bold', 'regular'] },
    { key: 'size', values: ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl', '3xl', '4xl', '5xl', 'kilo', 'mega', 'giga', 'micro', 'nano', 'full'] },
    { key: 'style', values: ['primary', 'secondary', 'link'] },
    { key: 'wrap', values: ['true', 'false'] } // wrap is boolean, doesn't need as const usually, but check types
];

function processFile(filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${filePath}, not found.`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    patterns.forEach(({ key, values }) => {
        values.forEach(val => {
            // Regex to match: key: "value" OR key: 'value'
            // Capture group 1: key: 
            // Capture group 2: quote
            // Capture group 3: value
            // Capture group 4: quote
            // Negative lookahead for " as const"
            const regex = new RegExp(`(${key}\\s*:\\s*)(["'])(${val})\\2(?!\\s*as const)`, 'g');
            content = content.replace(regex, `$1$2$3$4 as const`);
        });
    });

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Processed ${filePath}`);
}

files.forEach(processFile);
