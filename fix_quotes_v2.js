const fs = require('fs');
const path = require('path');

const targetFiles = [
    '/Users/hung/Desktop/CryptoTW Alpha/src/lib/flex-market-dashboard.ts'
];

targetFiles.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Fix pattern: 'value" as const  -> 'value' as const
        // also "value" as const -> 'value' as const (normalization)
        // match 'word" or "word"

        // Regex to capture: (quote)(value)(opposite_quote) \s* as \s* const
        // We want to normalize to single quote 'value' as const

        // Targeted fix for the specific corruption seen: 'kilo" as const
        content = content.replace(/'([^'\n\r]+)"\s*as\s*const/g, "'$1' as const");

        // Fix double quote issues if any: "kilo" as const -> 'kilo' as const
        content = content.replace(/"([^"\n\r]+)"\s*as\s*const/g, "'$1' as const");

        // Fix weird casing like 'text" as const -> 'text' as const
        content = content.replace(/'([a-zA-Z0-9_\-]+)"\s*as\s*const/g, "'$1' as const");

        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed quotes in ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
