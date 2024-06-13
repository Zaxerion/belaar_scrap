import fs from 'fs';

// Load data
const rawData = fs.readFileSync('sorted_toram_data.json');
const data = JSON.parse(rawData);

// Function to sort data
const sortedData = [];

// Filter and sort data for each boss
const bosses = {};
data.forEach(item => {
  if (!bosses[item.name]) bosses[item.name] = [];
  bosses[item.name].push(item);
});

Object.keys(bosses).forEach(bossName => {
  const bossData = bosses[bossName];

  // Sort by level within each boss
  const sortedBossData = bossData.sort((a, b) => {
    return parseInt(a.lvl) - parseInt(b.lvl);
  });

  // Append sorted boss data to the result
  sortedData.push(...sortedBossData);
});

// Save sorted data
fs.writeFileSync('sortedData.json', JSON.stringify(sortedData, null, 2));
