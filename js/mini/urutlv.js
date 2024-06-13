
import fs from 'fs';

// Baca data dari file JSON
fs.readFile('data_mini.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Parse data JSON
    let monsters = JSON.parse(data);

    // Fungsi untuk mengurutkan monsters berdasarkan lvl
    const sortMonstersByLevel = (monsters) => {
        return monsters.sort((a, b) => parseInt(a.lvl) - parseInt(b.lvl));
    };

    // Urutkan monsters
    const sortedMonsters = sortMonstersByLevel(monsters);

    // Simpan hasil urutan ke file JSON baru
    fs.writeFile('mini_urut.json', JSON.stringify(sortedMonsters, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('Sorted data has been saved to sortedMonsters.json');
    });
});
