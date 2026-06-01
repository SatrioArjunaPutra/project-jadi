import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import './TourismPage.css';
import { translations } from '../utils/translations';
import { kulinerData } from '../data/kulinerData';
import { supabase } from '../utils/supabaseClient';

const CulinaryPage = ({ onBack, lang, onRouteSelect }) => {
  const t = translations[lang] || translations['id'];
  const [selectedItem, setSelectedItem] = useState(null); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 👇 STATE BARU BUAT DETEKSI ARAH ANIMASI 👇
  const [placeAnimDir, setPlaceAnimDir] = useState('up'); // 'up', 'next', atau 'prev'
  const [imgAnimDir, setImgAnimDir] = useState('next'); 
  const [kulinerList, setKulinerList] = useState(kulinerData);

  useEffect(() => {
    const fetchKuliner = async () => {
      try {
        const { data, error } = await supabase.from('culinary_spots').select('*');
        if (!error && data && data.length > 0) {
          setKulinerList(data.map(item => ({...item, halteTerdekat: item.halte_terdekat})));
        }
      } catch (err) {
        console.error("Supabase fetch error", err);
      }
    };
    fetchKuliner();
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    if (selectedItem) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [selectedItem]);

  // LOGIKA GESER FOTO (DALAM 1 TEMPAT MAKAN)
  const nextImage = (e) => {
    e.stopPropagation();
    if (!selectedItem || !selectedItem.gambarList) return;
    setImgAnimDir('next'); // Set animasi ke kiri
    setCurrentImageIndex((prev) => (prev === selectedItem.gambarList.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (!selectedItem || !selectedItem.gambarList) return;
    setImgAnimDir('prev'); // Set animasi ke kanan
    setCurrentImageIndex((prev) => (prev === 0 ? selectedItem.gambarList.length - 1 : prev - 1));
  };

  // LOGIKA GESER PINDAH TEMPAT MAKAN
  const nextPlace = (e) => {
    e.stopPropagation(); 
    setPlaceAnimDir('next'); // Set animasi kotak ke kiri
    setImgAnimDir('next'); // Reset arah gambar juga
    const currentIndex = kulinerList.findIndex(k => k.id === selectedItem.id);
    const nextIndex = currentIndex === kulinerList.length - 1 ? 0 : currentIndex + 1;
    const nextData = kulinerList[nextIndex];
    const images = nextData.gambar ? (Array.isArray(nextData.gambar) ? nextData.gambar : [nextData.gambar]) : ["https://via.placeholder.com/600x400?text=No+Image"];
    setSelectedItem({ ...nextData, gambarList: images });
    setCurrentImageIndex(0); 
  };

  const prevPlace = (e) => {
    e.stopPropagation();
    setPlaceAnimDir('prev'); // Set animasi kotak ke kanan
    setImgAnimDir('prev');
    const currentIndex = kulinerList.findIndex(k => k.id === selectedItem.id);
    const prevIndex = currentIndex === 0 ? kulinerList.length - 1 : currentIndex - 1;
    const prevData = kulinerList[prevIndex];
    const images = prevData.gambar ? (Array.isArray(prevData.gambar) ? prevData.gambar : [prevData.gambar]) : ["https://via.placeholder.com/600x400?text=No+Image"];
    setSelectedItem({ ...prevData, gambarList: images });
    setCurrentImageIndex(0);
  };

  const getSafeKoridor = (koridorData) => {
    if (!koridorData) return []; 
    if (Array.isArray(koridorData)) return koridorData; 
    return [koridorData]; 
  };

  return (
    <div className="tourism-container culinary-theme">
      <nav className="tourism-nav">
        <button className="tourism-back-btn" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          {t.back || "Kembali"}
        </button>
        <div className="tourism-logo">
          <img src="/mjt-logo.png" alt="MJT Logo" />
          <span>{t.culinary_nav_title || "Wisata Metro Jabar"}</span>
        </div>
      </nav>

      <header className="tourism-hero">
        <div className="tourism-hero-overlay"></div>
        <div className="tourism-hero-content">
          <div className="tourism-badge">MJT CULINARY</div>
          <h1>{lang === 'id' ? 'Jelajahi Rasa Jawa Barat' : 'Explore West Java Culinary'}</h1>
          <p>{lang === 'id' ? 'Nikmati perjalanan tak terlupakan ke destinasi kuliner ikonik dengan layanan eksklusif Metro Jabar Trans.' : 'Enjoy an unforgettable journey to iconic culinary destinations with exclusive Metro Jabar Trans services.'}</p>
        </div>
      </header>

      <section className="tourism-content" style={{ paddingTop: '50px' }}>
        <div className="tourism-section-header">
          <h2>{lang === 'id' ? 'Destinasi Kuliner Populer' : 'Popular Culinary Spots'}</h2>
          <div className="tourism-accent" style={{ background: '#0ea5e9', height: '3px', width: '60px', marginTop: '10px', marginBottom: '20px' }}></div>
        </div>

        <div className="tourism-grid">
          {kulinerList.map((item) => {
            const images = item.gambar ? (Array.isArray(item.gambar) ? item.gambar : [item.gambar]) : ["https://via.placeholder.com/600x400?text=No+Image"];

            return (
              <div 
                className="tourism-card" 
                key={item.id}
                onClick={() => {
                  setPlaceAnimDir('up'); // Kalau diklik dari grid, animasinya muncul dari bawah ke atas
                  setImgAnimDir('next');
                  setSelectedItem({ ...item, gambarList: images });
                  setCurrentImageIndex(0);
                }}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              >
                <div className="tourism-card-img" style={{ position: 'relative' }}>
                  <img src={images[0]} alt={item.nama || "Kuliner"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                    📸 Lihat Detail
                  </div>
                </div>

                <div className="tourism-card-body">
                  <div className="card-tag" style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>
                    KULINER
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1f2937' }}>{item.nama || "Tempat Kuliner"}</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.deskripsi || "Belum ada deskripsi untuk tempat ini."}
                  </p>
                  <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="card-price" style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>
                     {item.harga ? item.harga : "Harga belum tersedia"}
                    </span>
                    <button 
                      className="card-btn" 
                      onClick={(e) => {
  e.stopPropagation(); 
  onRouteSelect({ origin: "GPS", destination: item.halteTerdekat || "" });
}}
                      style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Cek Rute
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL POPUP JEPANG */}
      {selectedItem && (
        <div className="japan-modal-overlay" onClick={() => setSelectedItem(null)}>
          
          {/* TOMBOL GESER TEMPAT MAKAN */}
          <button className="modal-nav-btn prev" onClick={prevPlace}>‹</button>
          <button className="modal-nav-btn next" onClick={nextPlace}>›</button>

          {/* 👇 KEY & CLASS ANIMASI DIMASUKAN KE KOTAK MODAL 👇 */}
          <div 
            className={`japan-modal-content slide-${placeAnimDir}-anim`} 
            key={`modal-${selectedItem.id}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <button className="japan-modal-close" onClick={() => setSelectedItem(null)}>✕</button>
            
            <div className="japan-modal-hero">
              {/* 👇 KEY & CLASS ANIMASI DIMASUKAN KE FOTO 👇 */}
              <img 
                src={selectedItem.gambarList[currentImageIndex]} 
                alt={selectedItem.nama} 
                key={`img-${currentImageIndex}`}
                className={`slide-${imgAnimDir}-anim`} 
              />
              
              {selectedItem.gambarList.length > 1 && (
                <>
                  <button className="slider-btn prev" onClick={prevImage}>‹</button>
                  <button className="slider-btn next" onClick={nextImage}>›</button>
                  
                  <div className="slider-dots">
                    {selectedItem.gambarList.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`dot ${idx === currentImageIndex ? 'active' : ''}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setImgAnimDir(idx > currentImageIndex ? 'next' : 'prev');
                          setCurrentImageIndex(idx);
                        }}
                      ></span>
                    ))}
                  </div>
                </>
              )}

              <div className="japan-modal-hero-title">
                <h2>{selectedItem.nama}</h2>
              </div>
            </div>

            <div className="japan-modal-body">
              <div className="japan-access-section">
                <h4 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '15px' }}>- Akses Rute</h4>
                
                <div className="japan-badges">
                  {getSafeKoridor(selectedItem.koridor).map((koridor, idx) => (
                    <div className="japan-badge" key={idx}>
                      <div className="japan-badge-icon" style={{ background: idx % 2 === 0 ? '#84cc16' : '#f97316' }}>BUS</div>
                      <div className="japan-badge-text">
                        <strong>{koridor}</strong>
                        <span>Halte {selectedItem.halteTerdekat || "Terdekat"}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className="japan-btn-route" 
                  onClick={() => onRouteSelect({ origin: "GPS", destination: selectedItem.halteTerdekat })}
                >
                   📍 Cek Rute ke Lokasi Ini
                </button>
              </div>

              <div className="japan-desc-section">
                <p>{selectedItem.deskripsi || "Informasi lebih lanjut tentang tempat ini belum tersedia."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CulinaryPage;