
// Using require since we might run this with simple node or ts-node without full module support setup
// But given the project structure, let's try standard import first if catching issues
import { getHoyabitPrices } from '../src/lib/hoyabit';

async function test() {
    console.log('Testing Hoyabit API Wrapper...');
    const startTime = Date.now();

    try {
        const result = await getHoyabitPrices();
        const duration = Date.now() - startTime;

        console.log('----------------------------------------');
        console.log('Fetch Duration:', duration, 'ms');
        console.log('Timestamp:', new Date(result.timestamp).toLocaleString());
        console.log('Buy Price (USDT -> TWD):', result.buy);
        console.log('Sell Price (USDT -> TWD):', result.sell);
        console.log('----------------------------------------');

        if (result.buy && result.sell) {
            console.log('✅ Success: Retrieved both buy and sell prices');
        } else {
            console.error('❌ Failure: Missing price data', result);
            process.exit(1);
        }

    } catch (e) {
        console.error('❌ Error executing test:', e);
        process.exit(1);
    }
}

test().catch(console.error);
