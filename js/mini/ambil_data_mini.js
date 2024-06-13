import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs/promises';

// Function to fetch data from the website
async function fetchToramData(page) {
    const url = `https://toram-id.com/monster/type/mini_boss?page=${page}`;
    const response = await fetch(url);
    const text = await response.text();
    
    const $ = cheerio.load(text);
    const data = [];
    
    $('div.card dl div.mb-5').each((i, dl) => {
        const name = $(dl).find('a.text-primary').text().trim();
        const element = $(dl).find('b:contains("Unsur:")').next().text().trim();
        const hp = $(dl).find('b:contains("HP:")').next().text().trim();
        const xp = $(dl).find('b:contains("XP:")').next().text().trim();
        const leveling = $(dl).find('b:contains("Leveling:")').parent().contents().filter(function() {
            return this.nodeType === 3; // Filter only text nodes
        }).text().trim().replace(/\s+/g, ' s/d '); // Replace multiple spaces with ' s/d '
        const map = $(dl).find('b:contains("Peta:")').next('a').text().trim();
        
        // Check if the mini boss image exists
        const hasMiniBossImage = $(dl).find('img[src="/img/f_boss.png"]').length > 0;
        const hasBossImage = $(dl).find('img[src="/img/boss.png"]').length > 0;

        if (hasMiniBossImage || hasBossImage) {
            const drops = [];
            $(dl).find('b:contains("Drop:")').nextAll('a').each((j, a) => {
                const dropName = $(a).text().trim();
                drops.push({ name: dropName });
            });
            
            data.push({ name, element, hp, xp, leveling, map, drops });
        }
    });
    
    return data;
}

// Function to join the drop names into a single string
function joinDrops(drops) {
  return drops.map(drop => drop.name).join(', ');
}

// Function to extract level from the name and modify the object
function extractLevel(obj) {
  const match = obj.name.match(/Lv (\d+)/);
  if (match) {
    obj.lvl = match[1]; // Convert to string
    obj.name = obj.name.replace(` (Lv ${obj.lvl})`, '').trim();
  }
}

// Function to reorder properties
function reorderProperties(obj) {
  const { name, lvl, element, hp, xp, leveling, map, drops } = obj;
  return { name, lvl, element, hp, xp, leveling, map, drops };
}

// Function to get the total number of pages
async function getTotalPages() {
    const url = `https://toram-id.com/monster/type/mini_boss?page=1`;
    const response = await fetch(url);
    const text = await response.text();
    
    const $ = cheerio.load(text);
    const totalPages = $('ul.pagination li').eq(-2).text().trim(); // Get the second last page number
    return parseInt(totalPages, 10);
}

// Main function to fetch, process, and save data
async function processToramData() {
  try {
    // Get the total number of pages
    const totalPages = await getTotalPages();
    let allData = [];

    // Fetch data from all pages
    for (let page = 1; page <= totalPages; page++) {
        const data = await fetchToramData(page);
        allData = allData.concat(data);
    }

    // Join the drop names for each object
    const processedData = allData.map(obj => ({
      ...obj,
      drops: joinDrops(obj.drops)
    }));

    // Process each object to extract level and modify the name
    processedData.forEach(extractLevel);

    // Reorder properties for each object
    const reorderedData = processedData.map(reorderProperties);

    // Save the reordered data to data_mini.json
    await fs.writeFile('data_mini.json', JSON.stringify(reorderedData, null, 2));
    console.log('Data has been saved to data_mini.json');
  } catch (error) {
    console.error('Error processing data:', error);
  }
}

processToramData();