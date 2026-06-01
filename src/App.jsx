import { useState, useCallback, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Polyline,
  LayerGroup,
  useMap,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  corridors as initialCorridors,
  stats,
  MAP_CENTER,
  MAP_ZOOM,
} from "./data/routeData";
import CorridorLayer from "./components/CorridorLayer";
import Legend from "./components/Legend";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import LandingPage from "./components/LandingPage";
import RouteSearch from "./components/RouteSearch";
import "./App.css";
import MovingBus from "./components/MovingBus";
import HelpModal from './components/HelpModal';
import TourismPage from './components/TourismPage';
import CulinaryPage from './components/CulinaryPage';
import { translations } from "./utils/translations";
import SavedStopsModal from "./components/SavedStopsModal";
import { kulinerData } from "./data/kulinerData";
import { tourismData } from "./data/tourismData";
import { supabase } from "./utils/supabaseClient";

// Fix default marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Helper Fungsi Jarak
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- ICONS ---
const selectedIcon = L.divIcon({
  className: "custom-selected-icon",
  html: `<div class="selected-marker-pulse"><div class="selected-marker-inner"></div></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -22],
});

const userLocationIcon = L.divIcon({
  className: "custom-user-icon",
  html: `<div style="width: 16px; height: 16px; background-color: #4285F4; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(66, 133, 244, 0.8); position: relative; z-index: 1000;"><div style="position: absolute; top: -12px; left: -12px; bottom: -12px; right: -12px; border: 2px solid rgba(66, 133, 244, 0.5); border-radius: 50%; animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -15]
});

const originIcon = L.divIcon({
  className: "custom-origin-icon",
  html: `
    <div style="width: 30px; height: 30px; background: #00A651; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,166,81,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
      A
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const destIcon = L.divIcon({
  className: "custom-dest-icon",
  html: `
    <div style="width: 30px; height: 30px; background: #e74c3c; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(231,76,60,0.4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
      B
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const culinaryIcon = L.divIcon({
  className: "custom-culinary-icon",
  html: `
    <div style="width: 30px; height: 30px; background: #F39C12; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(243,156,18,0.4); display: flex; align-items: center; justify-content: center; font-size: 16px;">
      🍜
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const tourismIcon = L.divIcon({
  className: "custom-tourism-icon",
  html: `
    <div style="width: 30px; height: 30px; background: #9B59B6; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(155,89,182,0.4); display: flex; align-items: center; justify-content: center; font-size: 16px;">
      📸
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

// Fly-to Anti Crash
function FlyToStop({ stop }) {
  const map = useMap();
  useEffect(() => {
    if (stop) {
      const lat = stop.lat || (Array.isArray(stop) ? stop[0] : null);
      const lng = stop.lng || (Array.isArray(stop) ? stop[1] : null);
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 17, { duration: 1.5 });
      }
    }
  }, [stop, map]);
  return null;
}

function UserLocationMarker({ position }) {
  return position ? (
    <Marker position={position} icon={userLocationIcon}>
      <Popup>Posisi Anda</Popup>
    </Marker>
  ) : null;
}


function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'map', 'tourism', 'culinary'
  const [lang, setLang] = useState("id");
  const t = translations[lang];
  
  // State untuk nampung data pencarian auto
  const [initialSearch, setInitialSearch] = useState({ origin: "", destination: "" });

  const [savedStops, setSavedStops] = useState(() => {
    try {
      const saved = localStorage.getItem("mjt_saved_stops");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse saved stops", e);
      return [];
    }
  });
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Supabase Data States
  const [tourismList, setTourismList] = useState(tourismData);
  const [kulinerList, setKulinerList] = useState(kulinerData);

  const [corridorsList, setCorridorsList] = useState(initialCorridors);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: tData, error: tErr } = await supabase.from('tourism_spots').select('*');
        if (!tErr && tData && tData.length > 0) {
          setTourismList(tData.map(item => ({...item, halteTerdekat: item.halte_terdekat})));
        }
        const { data: kData, error: kErr } = await supabase.from('culinary_spots').select('*');
        if (!kErr && kData && kData.length > 0) {
          setKulinerList(kData.map(item => ({...item, halteTerdekat: item.halte_terdekat})));
        }
        const { data: cData, error: cErr } = await supabase.from('corridors').select('*');
        if (!cErr && cData && cData.length > 0) {
          const mappedCorridors = cData.map(c => ({
            id: c.id,
            name: c.name,
            route: c.route,
            color: c.color,
            operatingHours: c.operating_hours,
            totalStopPoints: c.total_stop_points,
            path: c.path,
            stops: c.stops
          }));
          setCorridorsList(mappedCorridors);
          setVisibility(prev => {
            const newVis = { ...prev };
            mappedCorridors.forEach(c => {
              if (newVis[c.id] === undefined) newVis[c.id] = true;
            });
            return newVis;
          });
        }
      } catch (err) {
        console.error("Supabase fetch error", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("mjt_saved_stops", JSON.stringify(savedStops));
  }, [savedStops]);

  const handleSaveStop = (stop) => {
    const uniqueId = `${stop.name}-${stop.lat}-${stop.lng}`;
    const exists = savedStops.find(s => s.uniqueId === uniqueId);
    
    if (exists) {
      setSavedStops(savedStops.filter(s => s.uniqueId !== uniqueId));
    } else {
      setSavedStops([...savedStops, { 
        ...stop, 
        uniqueId, 
        savedAt: new Date().toISOString(),
        corridorId: stop.corridorId // If available
      }]);
    }
  };

  const handleRemoveSaved = (uniqueId) => {
    setSavedStops(savedStops.filter(s => s.uniqueId !== uniqueId));
  };

  const handleSelectSavedStop = (stop) => {
    setSelectedStop(stop);
  };

  const [userPos, setUserPos] = useState(null);
  const [visibility, setVisibility] = useState({
    ...initialCorridors.reduce((acc, c) => ({ ...acc, [c.id]: true }), {}),
    tourism: true,
    culinary: true,
    liveTracking: true,
    userLocation: true
  });
  const [selectedStop, setSelectedStop] = useState(null);
  const [searchedRoute, setSearchedRoute] = useState(null);
  const mapRef = useRef();

  useEffect(() => {
    if (currentView === 'map') {
      setSearchedRoute(null);
      setTriggerRoute(null);
      setSelectedStop(null);
    }
  }, [currentView]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.latitude && pos.coords.longitude) {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
        }
      },
      (err) => console.log(err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleLocateMe = () => {
    if (userPos && mapRef.current) {
      mapRef.current.flyTo(userPos, 16, { duration: 1.5 });
    }
  };

  const toggleCorridor = (id) => setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleSelectStop = useCallback((stop) => {
    setSelectedStop(stop);
    setTimeout(() => setSelectedStop(null), 10000);
  }, []);

  // LOGIKA ETA
  const calculateETA = (lat, lng) => {
    if (!lat || !lng || isNaN(lat)) return 5;
    const dist = getDistance(lat, lng, MAP_CENTER[0], MAP_CENTER[1]);
    const min = Math.round((dist / 20) * 60) + 2;
    return min > 0 ? min : 2;
  };

  // HANDLER ROUTE (Saringan Anti-NaN)
  const handleRouteFound = (route) => {
    if (!route || !route.pathGeometry) return;
    const cleanPath = route.pathGeometry.filter(c => {
      const lat = Array.isArray(c) ? c[0] : c?.lat;
      const lng = Array.isArray(c) ? c[1] : c?.lng;
      return lat != null && lng != null && !isNaN(lat) && !isNaN(lng);
    });
    setSearchedRoute({ ...route, pathGeometry: cleanPath });
    if (mapRef.current && cleanPath.length > 0) {
      const bounds = L.latLngBounds(cleanPath);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleRouteClear = () => setSearchedRoute(null);

  const handleRouteFromLocation = (destStop) => {
    if (!userPos) {
      alert(lang === 'id' ? "Lokasi Anda belum terdeteksi. Silakan aktifkan GPS." : "Your location is not detected. Please enable GPS.");
      return;
    }

    // Cari halte terdekat dari posisi user
    let nearestStop = null;
    let minDistance = Infinity;

    corridorsList.forEach(corridor => {
      corridor.stops.forEach(stop => {
        const dist = getDistance(userPos[0], userPos[1], stop.lat, stop.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestStop = { ...stop, uniqueId: `${stop.name}-${stop.lat}-${stop.lng}` };
        }
      });
    });

    if (nearestStop) {
      setTriggerRoute({
        origin: nearestStop,
        destination: { ...destStop, uniqueId: `${destStop.name}-${destStop.lat}-${destStop.lng}` },
        timestamp: Date.now() // Tambahkan timestamp agar state selalu berubah
      });
    }
  };

  const [triggerRoute, setTriggerRoute] = useState(null);
  const [isCleanView, setIsCleanView] = useState(false);
  const selectedMarkerRef = useRef();

  useEffect(() => {
    if (selectedStop && selectedMarkerRef.current) {
      selectedMarkerRef.current.openPopup();
    }
  }, [selectedStop]);

  // ==========================================
  // 👇 INI BAGIAN ROUTING HALAMAN LU YANG UDAH DIPERBAIKI 👇
  // ==========================================
  
  // PARIWISATA - SEKARANG UDAH BISA NANGKEP RUTE GPS!
  if (currentView === 'tourism') return (
    <TourismPage 
      onBack={() => setCurrentView('landing')} 
      lang={lang} 
      onRouteSelect={(searchData) => {
        if (searchData.origin === "GPS") {
          setCurrentView('map'); 
          const targetStop = corridorsList.flatMap(c => c.stops).find(s => {
            const searchName = (searchData.destination || "").toLowerCase().replace('halte ', '').trim();
            const stopName = (s.name || "").toLowerCase().replace('halte ', '').trim();
            const stopFullName = (s.fullName || "").toLowerCase().replace('halte ', '').trim();
            return stopName === searchName || stopFullName === searchName || stopName.includes(searchName) || searchName.includes(stopName);
          });

          if (targetStop) {
            setTimeout(() => {
              handleRouteFromLocation(targetStop); 
            }, 300); 
          } else {
            alert(lang === 'id' ? "Halte tujuan tidak ditemukan." : "Stop not found.");
          }
        } 
        else {
          setInitialSearch(searchData);
          setCurrentView('map');
        }
      }}
    />
  );
  
  if (currentView === 'culinary') return (
    <CulinaryPage 
      onBack={() => setCurrentView('landing')} 
      lang={lang} 
      // Nangkep halte dari tombol "Cek Rute"
      onRouteSelect={(searchData) => {
        // Kalo asalnya minta dari GPS otomatis
        if (searchData.origin === "GPS") {
          setCurrentView('map'); // Pindah ke peta dulu

          // Cari data detail halte tujuannya dari array corridors
          const targetStop = corridorsList.flatMap(c => c.stops).find(s => {
            // Ubah semua jadi huruf kecil dan hapus kata "halte " di depannya
            const searchName = (searchData.destination || "").toLowerCase().replace('halte ', '').trim();
            const stopName = (s.name || "").toLowerCase().replace('halte ', '').trim();
            const stopFullName = (s.fullName || "").toLowerCase().replace('halte ', '').trim();
            
            // Cocokin namanya sekarang
            return stopName === searchName || stopFullName === searchName || stopName.includes(searchName) || searchName.includes(stopName);
          });

          // Gambar rute otomatis dari GPS ke Halte
          if (targetStop) {
            setTimeout(() => {
              handleRouteFromLocation(targetStop); 
            }, 300); // Kasih jeda dikit biar petanya ke-render dulu
          } else {
            alert(lang === 'id' ? "Halte tujuan tidak ditemukan." : "Stop not found.");
          }
        } 
        // Kalo pencarian biasa (dari Landing Page dll)
        else {
          setInitialSearch(searchData);
          setCurrentView('map');
        }
      }}
    />
  );

  if (currentView === 'landing') return (
    <LandingPage 
      // Nangkep data dari Landing Page
      onEnter={(searchData) => {
        if (searchData && (searchData.origin || searchData.destination)) {
          setInitialSearch(searchData);
        }
        setCurrentView('map');
      }} 
      onShowTourism={() => setCurrentView('tourism')}
      onShowCulinary={() => setCurrentView('culinary')}
      lang={lang} 
      setLang={setLang} 
    />
  );
  // ==========================================

  return (
    <div className={`app-container ${isCleanView ? 'clean-view' : ''}`}>
      {!isCleanView && (
        <Header 
          stats={stats} 
          onBack={() => setCurrentView('landing')} 
          lang={lang} 
          setLang={setLang} 
          onLocate={handleLocateMe}
          savedCount={savedStops.length}
          onShowSaved={() => setShowSavedModal(true)}
        />
      )}

      {/* Floating Clean View Toggle */}
      <button 
        className="clean-view-toggle"
        onClick={() => setIsCleanView(!isCleanView)}
        title={isCleanView ? (lang === 'id' ? "Tampilkan Fitur" : "Show Features") : (lang === 'id' ? "Mode Bersih" : "Clean View")}
      >
        {isCleanView ? "👁️" : "✨"}
      </button>

      <div className="map-wrapper">
        <MapContainer 
          ref={mapRef} 
          center={MAP_CENTER} 
          zoom={MAP_ZOOM} 
          maxZoom={30} 
          className="map-container"
          zoomControl={false}
      
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={30}
            maxNativeZoom={20}
          />
          
          {/* 👇 TAMBAHIN KODINGAN INI BUAT NAMPILIN TITIK WISATA 👇 */}
          {visibility['tourism'] !== false && tourismList.map((wisata) => (
            <Marker key={wisata.id} position={[wisata.lat, wisata.lng]} icon={tourismIcon}>
               <div style={{ display: 'none' }}></div> {/* Keep Leaflet happy if needed, but standard popup works */}
               <Popup className="gm-popup">
                  <div className="gm-popup-content" style={{ padding: '5px' }}>
                     <div className="gm-title" style={{ fontSize: '14px', marginBottom: '5px', color: '#9B59B6' }}>
                        {wisata.nama}
                     </div>
                     <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                        {wisata.deskripsi}
                     </div>
                     <div style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px', borderRadius: '4px' }}>
                        📍 Halte Terdekat: <strong>{wisata.halteTerdekat}</strong>
                     </div>
                  </div>
               </Popup>
            </Marker>
          ))}


          {/* 👇 Menampilkan Titik Kuliner di Peta 👇 */}
          {visibility['culinary'] !== false && kulinerList.map((kuliner) => (
            <Marker key={kuliner.id} position={[kuliner.lat, kuliner.lng]} icon={culinaryIcon}>
               <Popup className="gm-popup">
                  <div className="gm-popup-content" style={{ padding: '5px' }}>
                     <div className="gm-title" style={{ fontSize: '14px', marginBottom: '5px', color: '#F39C12' }}>
                        {kuliner.nama}
                     </div>
                     <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
                        {kuliner.deskripsi}
                     </div>
                     <div style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px', borderRadius: '4px' }}>
                        📍 Halte Terdekat: <strong>{kuliner.halteTerdekat}</strong>
                     </div>
                  </div>
               </Popup>
            </Marker>
          ))}
          
          <ZoomControl position="bottomleft" />
          {visibility['userLocation'] !== false && <UserLocationMarker position={userPos} />}
          <FlyToStop stop={selectedStop} />
          {corridorsList.map((c) => (
            <CorridorLayer 
              key={c.id} 
              corridor={c} 
              visible={visibility[c.id]} 
              onRouteRequest={handleRouteFromLocation}
              onSaveStop={handleSaveStop}
              savedStops={savedStops}
            />
          ))}
          {visibility['liveTracking'] !== false && corridorsList.map((c) => visibility[c.id] && c.path && (
            <MovingBus 
              key={`bus-${c.id}`} 
              path={c.path} 
              color={c.color} 
              busNumber={`MJT-K${c.id}`} 
              stops={c.stops}
            />
          ))}

          {selectedStop && (
            (() => {
              const lat = selectedStop.lat ?? (Array.isArray(selectedStop) ? selectedStop[0] : null);
              const lng = selectedStop.lng ?? (Array.isArray(selectedStop) ? selectedStop[1] : null);

              if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return null;

              const saved = savedStops.some(s => s.uniqueId === (selectedStop.uniqueId || `${selectedStop.name}-${lat}-${lng}`));

              return (
                <LayerGroup>
                  <Marker position={[lat, lng]} icon={selectedIcon} ref={selectedMarkerRef}>
                    <Popup className="gm-popup">
                      <div className="gm-popup-content">
                        <div className="gm-action-row">
                          <button className="gm-action-btn gm-btn-route" onClick={() => handleRouteFromLocation(selectedStop)}>
                            <div className="gm-btn-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </div>
                            <div className="gm-btn-text">Rute</div>
                          </button>
                          <button className={`gm-action-btn gm-btn-save ${saved ? 'active' : ''}`} onClick={() => handleSaveStop(selectedStop)}>
                            <div className="gm-btn-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <div className="gm-btn-text">{saved ? 'Tersimpan' : 'Simpan'}</div>
                          </button>
                          <button className="gm-action-btn gm-btn-nearby">
                            <div className="gm-btn-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </div>
                            <div className="gm-btn-text">Di Sekitar</div>
                          </button>
                          <button 
                            className="gm-action-btn gm-btn-share" 
                            onClick={() => {
                              const text = `Cek Halte ${selectedStop.name} di Metro Jabar Trans!\nLokasi: https://www.google.com/maps?q=${lat},${lng}`;
                              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                          >
                            <div className="gm-btn-icon">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                            </div>
                            <div className="gm-btn-text">Bagikan</div>
                          </button>
                        </div>

                        <div className="gm-details">
                          <div className="gm-info-item">
                            <div className="gm-info-icon">
                              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                            </div>
                            <div className="gm-info-text gm-title">{selectedStop.name}</div>
                          </div>
                          
                          <div className="gm-info-item">
                            <div className="gm-info-icon">
                              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z" /></svg>
                            </div>
                            <div className="gm-info-text" style={{ fontWeight: '600', color: '#007b83' }}>
                              {selectedStop.corridorName || "Metro Jabar Trans"}
                            </div>
                          </div>

                          <div className="gm-info-item" style={{ marginTop: '-10px' }}>
                            <div className="gm-info-icon" style={{ opacity: 0 }}>
                              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z" /></svg>
                            </div>
                            <div className="gm-info-text" style={{ fontSize: '12px', color: '#64748b' }}>
                              {selectedStop.corridorRoute || "Rute Perjalanan"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </LayerGroup>
              );
            })()
          )}

          {searchedRoute && (
            <>
              <Polyline 
                positions={searchedRoute.pathGeometry} 
                color={searchedRoute.color || "#000000"} 
                weight={6}
                opacity={0.8}
              />
              
              {/* Origin Marker */}
              {searchedRoute.origin && (
                <Marker 
                  position={[searchedRoute.origin.lat, searchedRoute.origin.lng]} 
                  icon={originIcon}
                  zIndexOffset={1000}
                >
                  <Tooltip permanent direction="top" offset={[0, -10]} className="route-endpoint-tooltip origin">
                    {lang === 'id' ? 'Halte Asal' : 'Origin Stop'}
                  </Tooltip>
                </Marker>
              )}

              {/* Destination Marker */}
              {searchedRoute.destination && (
                <Marker 
                  position={[searchedRoute.destination.lat, searchedRoute.destination.lng]} 
                  icon={destIcon}
                  zIndexOffset={1000}
                >
                  <Tooltip permanent direction="top" offset={[0, -10]} className="route-endpoint-tooltip destination">
                    {lang === 'id' ? 'Halte Tujuan' : 'Destination Stop'}
                  </Tooltip>
                </Marker>
              )}
            </>
          )}
          

        </MapContainer>
        
        {/* Floating Locate Button (Google Maps style) */}
        <button 
          className="floating-locate-btn"
          onClick={handleLocateMe}
          title={lang === 'id' ? "Lokasi Saya" : "My Location"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="3"></circle>
            <line x1="12" y1="2" x2="12" y2="4"></line>
            <line x1="12" y1="20" x2="12" y2="22"></line>
            <line x1="2" y1="12" x2="4" y2="12"></line>
            <line x1="20" y1="12" x2="22" y2="12"></line>
          </svg>
        </button>

        {!isCleanView && (
          <>
            <SearchBar corridors={corridorsList} onSelectStop={handleSelectStop} lang={lang} />
            
            {/* 👇 DATA INITIAL SEARCH DIKIRIM KE SINI 👇 */}
            <RouteSearch 
              corridors={corridorsList} 
              onRouteFound={handleRouteFound} 
              onRouteClear={handleRouteClear}
              triggerRoute={triggerRoute}
              initialOrigin={initialSearch.origin} 
              initialDestination={initialSearch.destination}
              lang={lang}
            />
            
            <Legend corridors={corridorsList} visibility={visibility} onToggle={toggleCorridor} stats={stats} lang={lang} />
          </>
        )}
      </div>

      <SavedStopsModal 
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        savedStops={savedStops}
        onRemove={handleRemoveSaved}
        onSelect={handleSelectSavedStop}
        lang={lang}
      />
    </div>
  );
}

export default App;