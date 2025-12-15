const fs = require('fs');
const path = require('path');

// Read CSV
const csvPath = path.join(__dirname, '../INDEX_BTCUSD, 1D (1).csv');
const historyPath = path.join(__dirname, '../src/data/reviews-history.json');

const csvLines = fs.readFileSync(csvPath, 'utf-8').split('\n').slice(1);

function parseCSV() {
    return csvLines.filter(l => l.trim()).map(line => {
        const [ts, _, __, ___, close] = line.split(',');
        return {
            timestamp: parseInt(ts) * 1000,
            date: new Date(parseInt(ts) * 1000).toISOString().split('T')[0],
            price: parseFloat(close)
        };
    });
}

const allData = parseCSV();
console.log(`Loaded ${allData.length} price points from CSV`);

// Mt.Gox: 2014-01-23 to 2014-03-15 (buffer around Feb 7-28)
function getMtGoxData() {
    const start = new Date('2014-01-23').getTime();
    const end = new Date('2014-03-15').getTime();
    return allData.filter(d => d.timestamp >= start && d.timestamp <= end);
}

// The DAO: 2016-06-01 to 2016-08-05 (buffer around Jun 17 - Jul 20)
function getDAOData() {
    const start = new Date('2016-06-01').getTime();
    const end = new Date('2016-08-05').getTime();
    return allData.filter(d => d.timestamp >= start && d.timestamp <= end);
}

// ICO Mania: 2017-05-15 to 2018-01-30 (buffer around Jun 1 2017 - Jan 15 2018)
function getICOData() {
    const start = new Date('2017-05-15').getTime();
    const end = new Date('2018-01-30').getTime();
    return allData.filter(d => d.timestamp >= start && d.timestamp <= end);
}

// Load existing history
const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));

// Update with new data
const mtgoxData = getMtGoxData();
const daoData = getDAOData();
const icoData = getICOData();

console.log(`Mt.Gox 2014: ${mtgoxData.length} days`);
console.log(`DAO 2016: ${daoData.length} days`);
console.log(`ICO 2017: ${icoData.length} days`);

// Update history object
history['mtgox-collapse-2014'] = { price: mtgoxData };
history['the-dao-hack-2016'] = { price: daoData };
history['ico-mania-2017'] = { price: icoData };

// Write back
fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
console.log('Updated reviews-history.json successfully!');
