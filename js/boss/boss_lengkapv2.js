import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs/promises';

async function fetchToramData(page) {
    const url = `https://toram-id.com/monster/type/boss?page=${page}`;
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    const data = [];

    $('div.card dl div.mb-5').each((i, dl) => {
        const name = $(dl).find('a.text-primary').text().trim();
        const hasMiniBossImage = $(dl).find('img[src="/img/f_boss.png"]').length > 0;
        const hasBossImage = $(dl).find('img[src="/img/boss.png"]').length > 0;

        if (hasMiniBossImage || hasBossImage) {
            const element = $(dl).find('b:contains("Unsur:")').next().text().trim();
            const hp = $(dl).find('b:contains("HP:")').next().text().trim();
            const xp = $(dl).find('b:contains("XP:")').next().text().trim();
            const leveling = $(dl).find('b:contains("Leveling:")').parent().contents().filter(function() {
                return this.nodeType === 3;
            }).text().trim().replace(/\s+/g, ' s/d ');
            const map = $(dl).find('b:contains("Peta:")').next('a').text().trim();

            const drops = $(dl).find('b:contains("Drop:")').nextAll('a').map((j, a) => $(a).text().trim()).get();

            data.push({ name, element, hp, xp, leveling, map, drops });
        }
    });

    return data;
}

async function getTotalPages() {
    const url = `https://toram-id.com/monster/type/boss?page=1`;
    const response = await fetch(url);
    const text = await response.text();
    const $ = cheerio.load(text);
    return parseInt($('ul.pagination li').eq(-2).text().trim(), 10);
}

async function processToramData() {
    try {
        const totalPages = await getTotalPages();
        console.log(`Total pages: ${totalPages}`);
        let allData = [];

        for (let page = 1; page <= totalPages; page++) {
            const data = await fetchToramData(page);
            console.log(`Fetched data from page ${page}`);
            allData = [...allData, ...data];
        }

        const processedData = allData.map(obj => ({
            ...obj,
            drops: obj.drops.join(', ')
        }));

        processedData.forEach(obj => {
            obj.diff = '-';
            obj.lvl = '-';
            const diffMatch = obj.name.match(/\((Easy|Normal|Hard|Nightmare|Ultimate)\)/);
            if (diffMatch) {
                obj.diff = diffMatch[1];
                obj.name = obj.name.replace(` (${obj.diff})`, '').trim();
            }
            const levelMatch = obj.name.match(/Lv (\d+)/);
            if (levelMatch) {
                obj.lvl = levelMatch[1];
                obj.name = obj.name.replace(` (Lv ${obj.lvl})`, '').trim();
            }
        });

        const sortedData = processedData.sort((a, b) => parseInt(a.lvl) - parseInt(b.lvl));

        await fs.writeFile('sorted_toram_data.json', JSON.stringify(sortedData, null, 2));
        console.log('Sorted data has been saved to sorted_toram_data.json');
    } catch (error) {
        console.error('Error processing data:', error);
    }
}

processToramData();
