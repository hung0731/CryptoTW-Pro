const fs = require('fs');
const path = require('path');
const https = require('https');

// Token Mapping
const TOKENS = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'FTT': 'ftx-token',
    'LUNA': 'terra-luna', // Check if returns LUNC icon (yellow) or LUNA (orange). Usually ok.
    'UST': 'terrausd',
    'ETC': 'ethereum-classic',
    'UNI': 'uniswap',
    'COMP': 'compound-governance-token',
    'CEL': 'celsius-degree-token',
    'XRP': 'ripple',
    'BNB': 'binancecoin'
};

const COIN_IMG_URL = 'https://s2.coinmarketcap.com/static/img/coins/64x64/20510.png'; // Coinbase Wrapped Staked ETH?? No.
// Coinbase Logo:
const COINBASE_LOGO = 'https://avatars.githubusercontent.com/u/1885080?s=200&v=4';

async function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to load image, status code: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function main() {
    console.log('Fetching token list from CoinGecko...');
    const ids = Object.values(TOKENS).join(',');
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`;

    // Fetch data with a fake user agent just in case
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };

    https.get(apiUrl, options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', async () => {
            try {
                const coins = JSON.parse(data);

                // Process CG tokens
                for (const symbol of Object.keys(TOKENS)) {
                    const id = TOKENS[symbol];
                    const coin = coins.find(c => c.id === id);
                    if (coin && coin.image) {
                        console.log(`Downloading ${symbol} from ${coin.image}...`);
                        await downloadImage(coin.image, path.join(__dirname, '../public/tokens', `${symbol}.png`));
                    } else {
                        console.error(`Could not find data for ${symbol} (id: ${id})`);
                    }
                }

                // Process COIN manually
                console.log(`Downloading COIN from ${COINBASE_LOGO}...`);
                await downloadImage(COINBASE_LOGO, path.join(__dirname, '../public/tokens', 'COIN.png'));

                console.log('All downloads complete!');

            } catch (e) {
                console.error('Error parsing JSON:', e);
                console.log('Raw data:', data);
            }
        });
    }).on('error', (err) => {
        console.error('Error fetching API:', err);
    });
}

main();
