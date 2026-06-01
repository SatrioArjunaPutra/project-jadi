-- Tabel Pariwisata
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

INSERT INTO tourism_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('w1', 'Gedung Sate & Museum', 'Ikon bersejarah Jawa Barat dengan arsitektur khas perpaduan Eropa dan Nusantara. Dilengkapi dengan museum interaktif dan area taman yang asri.', 'Rp 5.000', 'Lapangan Gasibu B', ARRAY['Koridor 1', 'Koridor 2']::TEXT[], ARRAY['/Gedung-Sate-1.jpg', '/Museum-Gedung-Sate-Bandung-2-768x360.jpg']::TEXT[], -6.90240966923579, 107.6187255686285);
INSERT INTO tourism_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('w2', 'Jalan Braga (Braga City Walk)', 'Jalanan legendaris di Bandung yang mempertahankan tata letak dan bangunan bergaya Eropa klasik. Penuh dengan kafe, seni jalanan, dan spot foto estetik.', 'Gratis', 'Alun-Alun Bandung', ARRAY['Koridor 1', 'Koridor 3']::TEXT[], ARRAY['/braga 1.jpeg', '/braga 2.jpg']::TEXT[], -6.916903125892329, 107.60920341004521);
INSERT INTO tourism_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('w3', 'Alun-Alun Kota Bandung', 'Pusat rekreasi keluarga di jantung kota dengan hamparan rumput sintetis yang luas. Berada persis di sebelah Masjid Raya Bandung yang megah.', 'Gratis', 'Alun-Alun Bandung', ARRAY['Koridor 2']::TEXT[], ARRAY['/Alun-Alun-Bandung.jpg', '/18-halte-alun-alun-Fenta-Fijayanto.jpg']::TEXT[], -6.921520624446946, 107.607105211897);
INSERT INTO tourism_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('w4', 'Trans Studio Bandung', 'Taman hiburan indoor terbesar dengan puluhan wahana menantang adrenalin, pertunjukan kelas dunia, dan pusat perbelanjaan terintegrasi.', 'Mulai Rp 200.000', 'Bandung Creative Hub', ARRAY['Koridor 4']::TEXT[], ARRAY['/the-trans-studio-bandung.jpg', '/tsm.jpg']::TEXT[], -6.925371584157637, 107.63664613888129);

INSERT INTO culinary_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('k1', 'Grillnesia', 'Surganya pecinta daging bakar! Grillnesia menawarkan sensasi BBQ dengan saus marinasi khas Nusantara yang bikin nagih.', 'Rp 28.500 - 160.500', 'RS Kebon Jati', ARRAY['Koridor 1', 'Koridor 3']::TEXT[], ARRAY['/cf5a-Restaurant-Grillnesia-interior.jpg']::TEXT[], -6.915167977, 107.5971126);
INSERT INTO culinary_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('k2', 'Warung Nasi Ibu Imas', 'Warung Nasi Ibu Imas di Bandung, masakan Sunda legendaris sejak 1980-an. Karedok leunca, sambal dadak, ayam bakar, jukut goreng, dan aneka lauk rumahan', 'Rp 10.000 - 35.000', 'ITC Kebon Kelapa', ARRAY['Koridor 2']::TEXT[], ARRAY['/Warung-Nasi-Ibu-Imas-Bandung-1024x461.jpeg', '/OIP.jpeg']::TEXT[], -6.925670983, 107.6072609);
INSERT INTO culinary_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('k3', 'Iga Bakar Si Jangkung', 'Iga Bakar Si Jangkung Legend Bandung - Nikmati iga bakar legendaris dengan resep khas, harga terjangkau, dan porsi memuaskan', 'Rp 35.000 - 80.000', 'Simpang Pasirkaliki', ARRAY['Koridor 1']::TEXT[], ARRAY['/Iga-Bakar-Si-Jangkung.jpg', '/bd129230-17fd-481c-9cf7-d7b125ed0186_Go-Biz_20240903_164928.jpeg']::TEXT[], -6.894936124, 107.6021743);
INSERT INTO culinary_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('k4', 'Roti Gempol', 'Salah satu ciri khas Roti Gempol adalah penggunaan bahan sederhana tanpa pengawet, sehingga roti hanya bertahan sekitar 3–4 hari di suhu ruang. Justru di situlah letak kualitasnya: fresh, homemade, dan konsisten. Bahkan, kualitas ini membuat Roti Gempol dipercaya menjadi pemasok roti untuk berbagai hotel dan kafe di Bandung', 'Rp 18.000 - 80.000', 'Taman Radio B', ARRAY['Koridor 3']::TEXT[], ARRAY['/6794275e406f5-roti-gempol_bandung.jpg', '/Roti-Bakar-Gempol.png']::TEXT[], -6.902570972, 107.6157358);
INSERT INTO culinary_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('k5', 'Cuanki Serayu', 'Cuanki Serayu adalah jajanan khas Bandung yang berisi bakso, batagor, dan kuah kaldu tulang ikan.', 'Rp 12.500 - 25.000', 'Taman Pramuka', ARRAY['Koridor 3']::TEXT[], ARRAY['/cuanki-serayu-tampak-depan_reg.webp', '/Cuanki Serayu.jpeg']::TEXT[], -6.907970917, 107.6256278);
INSERT INTO culinary_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('k6', 'Kupat Tahu Gempol', 'Nikmati Kupat Tahu Gempol, ikon kuliner Bandung sejak 1965. Sajian kupat tahu otentik dengan bumbu kacang khas, lontong kari, dan otak-otak tenggiri.', 'Rp 18.000 - 20.000', 'Taman Radio B', ARRAY['Koridor 3']::TEXT[], ARRAY['/Kupat-Tahu-Gempol.jpeg', '/1663221262.jpg']::TEXT[], -6.902831521, 107.6154713);
INSERT INTO culinary_spots (id, nama, deskripsi, harga, halte_terdekat, koridor, gambar, lat, lng) VALUES ('k7', 'Ayam Sari Rasa', ' Kalau lagi jalan-jalan ke Bandung dan pengin cari kuliner Bandung yang lagi viral, nama Ayam Sari Rasa Bandung pasti muncul di linimasa. Tempat makan ini dikenal lewat video-video TikTok dan review food vlogger yang bikin banyak orang penasaran sama rasa pedas-gurihnya.', 'Rp 6.000 - 30.000', 'Bandung Indah Plaza', ARRAY['Koridor 3']::TEXT[], ARRAY['/ayam-sari-rasa-bandung.jpg', '/image-20-1536x1152.png']::TEXT[], -6.908327322, 107.6110081);
