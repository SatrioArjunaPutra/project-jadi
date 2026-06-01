import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import './TourismPage.css';
import { translations } from '../utils/translations';
import { tourismData } from '../data/tourismData';
import { supabase } from '../utils/supabaseClient';

const TourismPage = ({ onBack, lang, onRouteSelect }) => {
  const t = translations[lang] || translations['id'];
  
  // State untuk Modal dan Animasi
  const [selectedItem, setSelectedItem] = useState(null); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [placeAnimDir, setPlaceAnimDir] = useState('up'); 
  const [imgAnimDir, setImgAnimDir] = useState('next'); 
  const [tourismList, setTourismList] = useState(tourismData);

  useEffect(() => {
    const fetchTourism = async () => {
      try {
        const { data, error } = await supabase.from('tourism_spots').select('*');
        if (!error && data && data.length > 0) {
          setTourismList(data.map(item => ({...item, halteTerdekat: item.halte_terdekat})));
        }
      } catch (err) {
        console.error("Supabase fetch error", err);
      }
    };
    fetchTourism();
  }, []);

  // Setup Lenis Scroll
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

  // Kunci scroll body pas modal kebuka
  useEffect(() => {
    if (selectedItem) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [selectedItem]);

  // LOGIKA GESER FOTO
  const nextImage = (e) => {
    e.stopPropagation();
    if (!selectedItem || !selectedItem.gambarList) return;
    setImgAnimDir('next');
    setCurrentImageIndex((prev) => (prev === selectedItem.gambarList.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (!selectedItem || !selectedItem.gambarList) return;
    setImgAnimDir('prev');
    setCurrentImageIndex((prev) => (prev === 0 ? selectedItem.gambarList.length - 1 : prev - 1));
  };

  // LOGIKA GESER PINDAH TEMPAT WISATA
  const nextPlace = (e) => {
    e.stopPropagation(); 
    setPlaceAnimDir('next');
    setImgAnimDir('next');
    const currentIndex = tourismList.findIndex(k => k.id === selectedItem.id);
    const nextIndex = currentIndex === tourismList.length - 1 ? 0 : currentIndex + 1;
    const nextData = tourismList[nextIndex];
    const images = nextData.gambar ? (Array.isArray(nextData.gambar) ? nextData.gambar : [nextData.gambar]) : ["https://via.placeholder.com/600x400?text=No+Image"];
    setSelectedItem({ ...nextData, gambarList: images });
    setCurrentImageIndex(0); 
  };

  const prevPlace = (e) => {
    e.stopPropagation();
    setPlaceAnimDir('prev');
    setImgAnimDir('prev');
    const currentIndex = tourismList.findIndex(k => k.id === selectedItem.id);
    const prevIndex = currentIndex === 0 ? tourismList.length - 1 : currentIndex - 1;
    const prevData = tourismList[prevIndex];
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
    <div className="tourism-container">
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
          <span>{t.tourism_nav_title || "Wisata Metro Jabar"}</span>
        </div>
      </nav>

      <header className="tourism-hero">
        <div className="tourism-hero-overlay"></div>
        <div className="tourism-hero-content">
          <div className="tourism-badge">MJT SIGHTSEEING</div>
          <h1>{t.tourism_hero_title || (lang === 'id' ? 'Jelajahi Pesona Jawa Barat' : 'Explore West Java')}</h1>
          <p>{t.tourism_hero_desc || (lang === 'id' ? 'Nikmati perjalanan tak terlupakan ke destinasi ikonik dengan layanan eksklusif Metro Jabar Trans.' : 'Enjoy an unforgettable journey to iconic destinations with exclusive Metro Jabar Trans services.')}</p>
        </div>
      </header>

      <section className="tourism-content" style={{ paddingTop: '50px' }}>
        <div className="tourism-section-header">
          <h2>{t.tourism_section_title || (lang === 'id' ? 'Destinasi Populer' : 'Popular Destinations')}</h2>
          <div className="tourism-accent" style={{ background: '#0ea5e9', height: '3px', width: '60px', marginTop: '10px', marginBottom: '20px' }}></div>
        </div>

        <div className="tourism-grid">
          {tourismList.map((item) => {
            const images = item.gambar ? (Array.isArray(item.gambar) ? item.gambar : [item.gambar]) : ["https://via.placeholder.com/600x400?text=No+Image"];

            return (
              <div 
                className="tourism-card" 
                key={item.id} 
                style={{ transition: 'transform 0.2s', cursor: 'pointer' }} 
                onClick={() => {
                  setPlaceAnimDir('up'); 
                  setImgAnimDir('next');
                  setSelectedItem({ ...item, gambarList: images });
                  setCurrentImageIndex(0);
                }}
              >
                <div className="tourism-card-img" style={{ position: 'relative' }}>
                  <img src={images[0]} alt={item.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                    📸 Lihat Detail
                  </div>
                </div>
                
                <div className="tourism-card-body">
                  <div className="card-tag" style={{ color: '#0ea5e9', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>
                    {t.tourism_card_tag || "PARIWISATA"}
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1f2937' }}>
                    {item.nama}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.deskripsi}
                  </p>
                  <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="card-price" style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{item.harga}</span>
                    <button 
                      className="card-btn" 
                      style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        if(onRouteSelect) onRouteSelect({ origin: "GPS", destination: item.halteTerdekat || "" });
                      }}
                    >
                      {t.tourism_check_route || "Cek Rute"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL POPUP (SAMA PERSIS KAYAK KULINER) */}
      {selectedItem && (
        <div className="japan-modal-overlay" onClick={() => setSelectedItem(null)}>
          
          <button className="modal-nav-btn prev" onClick={prevPlace}>‹</button>
          <button className="modal-nav-btn next" onClick={nextPlace}>›</button>

          <div 
            className={`japan-modal-content slide-${placeAnimDir}-anim`} 
            key={`modal-${selectedItem.id}`} 
            onClick={(e) => e.stopPropagation()}
          >
            <button className="japan-modal-close" onClick={() => setSelectedItem(null)}>✕</button>
            
            <div className="japan-modal-hero">
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

export default TourismPage;