
import { parseCurrencyAmount } from './src/lib/bot/utils/parsers';
import { createCurrencyCard } from './src/lib/bot/ui/flex-generator';

const input = "7000twd";
const parsed = parseCurrencyAmount(input);
console.log('Parsed:', parsed);

if (parsed) {
    const card = createCurrencyCard(parsed.amount, parsed.type, 31.59, 31.61, 31.70);
    // Inspect the "bigNumberText" in the card
    // Structure: card.contents.body.contents[0].contents[0].text
    try {
        // @ts-ignore
        const bigNum = card.contents.body.contents[0].contents[0].text;
        console.log('Big Number Text:', bigNum);

        // @ts-ignore
        const contextText = card.contents.body.contents[1].contents[2].text;
        console.log('Context Text:', contextText);

    } catch (e) {
        console.error('Error digging into card:', e);
    }
}
