const fs = require('fs');

const tDataStr = fs.readFileSync('src/data/tourismData.js', 'utf8').replace('export const tourismData', 'const tourismData');
const kDataStr = fs.readFileSync('src/data/kulinerData.js', 'utf8').replace('export const kulinerData', 'const kulinerData');

let output = '';

output += `-- Tabel Pariwisata
CREATE TABLE IF NOT EXISTS tourism_spots (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  harga TEXT,
  halte_terdekat TEXT,
  koridor TEXT[],
  gambar TEXT[],
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

-- Tabel Kuliner
CREATE TABLE IF NOT EXISTS culinary_spots (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  deskripsi TEXT,
  harga TEXT,
  halte_terdekat TEXT,
  koridor TEXT[],
  gambar TEXT[],
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
);

`;

function escapeString(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

function escapeArray(arr) {
  if (!arr || !arr.length) return "'{}'";
  return "ARRAY[" + arr.map(escapeString).join(', ') + "]::TEXT[]";
}

eval(tDataStr + '\n' + 'tourismData.forEach(item => { output += `INSERT INTO tourism_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES (${escapeString(item.id)}, ${escapeString(item.nama)}, ${escapeString(item.deskripsi)}, ${escapeString(item.harga)}, ${escapeString(item.halteTerdekat)}, ${escapeArray(item.koridor)}, ${escapeArray(item.gambar)}, ${item.lat}, ${item.lng});\\n`; })');

output += '\n';

eval(kDataStr + '\n' + 'kulinerData.forEach(item => { output += `INSERT INTO culinary_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES (${escapeString(item.id)}, ${escapeString(item.nama)}, ${escapeString(item.deskripsi)}, ${escapeString(item.harga)}, ${escapeString(item.halteTerdekat)}, ${escapeArray(item.koridor)}, ${escapeArray(item.gambar)}, ${item.lat}, ${item.lng});\\n`; })');

fs.writeFileSync('migration.sql', output);
console.log('Done generating migration.sql');
