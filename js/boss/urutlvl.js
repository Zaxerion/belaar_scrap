import fs from 'fs';

// Load data
const rawData = fs.readFileSync('datax.json');
const data = JSON.parse(rawData);

// Function to sort data
const sortedData = data.sort((a, b) => {
  // Sort by level
  const levelDiff = parseInt(a.lvl) - parseInt(b.lvl);
  if (levelDiff !== 0) return levelDiff;

  // Sort by difficulty
  const difficultyOrder = {
    'Easy': 1,
    'Normal': 2,
    'Hard': 3,
    'Nightmare': 4,
    'Ultimate': 5
  };
  return difficultyOrder[a.diff] - difficultyOrder[b.diff];
});

// Save sorted data
fs.writeFileSync('sortedData.json', JSON.stringify(sortedData, null, 2));
