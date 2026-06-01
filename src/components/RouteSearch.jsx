import React, { useState, useMemo, useRef, useEffect } from "react";
import { findRoute, processRouteInstructions, extractPathGeometry } from "../utils/routing";
import { translations } from "../utils/translations";

// 👇 Tambahin initialOrigin dan initialDestination di sini
function RouteSearch({ corridors, onRouteFound, onRouteClear, lang = 'id', triggerRoute, initialOrigin, initialDestination }) {
    const t = translations[lang];
    const [originQuery, setOriginQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");
    const [originId, setOriginId] = useState("");
    const [destId, setDestId] = useState("");
    const [activeField, setActiveField] = useState(null); // 'origin' or 'dest'
    const [result, setResult] = useState(null);
    const [collapsed, setCollapsed] = useState(() => {
        return window.innerWidth <= 768; // Collapse by default on mobile/tablet
    });

    const containerRef = useRef(null);

    // Auto expand when triggered externally or when initial queries are present
    useEffect(() => {
        if (triggerRoute || initialOrigin || initialDestination) {
            setCollapsed(false);
        }
    }, [triggerRoute, initialOrigin, initialDestination]);

    // Extract all unique stops (Dipindah ke atas biar bisa dipake di dalem useEffect)
    const allStops = useMemo(() => {
        const stopsMap = new Map();
        corridors.forEach((c) => {
            c.stops.forEach((s) => {
                const uniqueId = `${s.name}-${s.lat}-${s.lng}`;
                if (!stopsMap.has(uniqueId)) {
                    stopsMap.set(uniqueId, { ...s, uniqueId });
                }
            });
        });
        return Array.from(stopsMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [corridors]);

    // =========================================================
    // 👇 EFEK BARU: Nangkep Data dari Landing Page / Kuliner
    // =========================================================
    useEffect(() => {
        if ((initialOrigin || initialDestination) && allStops.length > 0) {
            let originStop = null;
            let destStop = null;

            // 1. Cek kalau ada Halte Asal
            if (initialOrigin) {
                const originKataKunci = initialOrigin.toLowerCase().trim();
                originStop = allStops.find(s => 
                    (s.name && s.name.toLowerCase().includes(originKataKunci)) || 
                    (s.fullName && s.fullName.toLowerCase().includes(originKataKunci))
                );
                if (originStop) {
                    setOriginId(originStop.uniqueId);
                    setOriginQuery(originStop.name + (originStop.direction !== "N/A" ? ` (${lang === 'id' ? 'Halte' : 'Stop'} ${originStop.direction})` : ""));
                }
            }

            // 2. Cek kalau ada Halte Tujuan (Dari Halaman Kuliner)
            if (initialDestination) {
                const destKataKunci = initialDestination.toLowerCase().trim();
                destStop = allStops.find(s => 
                    (s.name && s.name.toLowerCase().includes(destKataKunci)) || 
                    (s.fullName && s.fullName.toLowerCase().includes(destKataKunci))
                );
                if (destStop) {
                    setDestId(destStop.uniqueId);
                    setDestQuery(destStop.name + (destStop.direction !== "N/A" ? ` (${lang === 'id' ? 'Halte' : 'Stop'} ${destStop.direction})` : ""));
                }
            }

            // 3. Kalau DUA-DUANYA lengkap, langsung cari rutenya otomatis
            if (originStop && destStop) {
                setTimeout(() => {
                    const routeResult = findRoute(corridors, originStop.uniqueId, destStop.uniqueId);
                    if (routeResult) {
                        const instructions = processRouteInstructions(routeResult);
                        const pathGeometry = extractPathGeometry(corridors, instructions);
                        setResult({ origin: originStop, destination: destStop, distance: routeResult.totalDistance, instructions });
                        if (onRouteFound) {
                            onRouteFound({ origin: originStop, destination: destStop, instructions, totalDistance: routeResult.totalDistance, pathGeometry });
                        }
                    }
                }, 100);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialOrigin, initialDestination, allStops, corridors]);
    // =========================================================

    // Effect to handle external trigger (like from Map Popup)
    useEffect(() => {
        if (triggerRoute && triggerRoute.origin && triggerRoute.destination) {
            const origin = triggerRoute.origin;
            const dest = triggerRoute.destination;
            
            setOriginId(origin.uniqueId);
            setOriginQuery(origin.name + (origin.direction !== "N/A" ? ` (${lang === 'id' ? 'Halte' : 'Stop'} ${origin.direction})` : ""));
            
            setDestId(dest.uniqueId);
            setDestQuery(dest.name + (dest.direction !== "N/A" ? ` (${lang === 'id' ? 'Halte' : 'Stop'} ${dest.direction})` : ""));
        }
    }, [triggerRoute, lang]);

    // Additional effect to auto-search when IDs are set via trigger
    useEffect(() => {
        if (triggerRoute && originId && destId && 
            originId === triggerRoute.origin.uniqueId && 
            destId === triggerRoute.destination.uniqueId) {
            
            const timer = setTimeout(() => {
                handleSearch();
            }, 100);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [originId, destId, triggerRoute]);

    // Filtered stops for origin
    const filteredOriginStops = useMemo(() => {
        if (!originQuery) return allStops;
        return allStops.filter(s => 
            s.name.toLowerCase().includes(originQuery.toLowerCase())
        );
    }, [allStops, originQuery]);

    // Filtered stops for destination
    const filteredDestStops = useMemo(() => {
        if (!destQuery) return allStops;
        return allStops.filter(s => 
            s.name.toLowerCase().includes(destQuery.toLowerCase())
        );
    }, [allStops, destQuery]);

    const handleSearch = () => {
        if (!originId || !destId) {
            alert(lang === 'id' ? "Silakan pilih halte asal dan tujuan terlebih dahulu." : "Please select origin and destination stops first.");
            return;
        }
        
        if (originId === destId) {
            alert(lang === 'id' ? "Halte asal dan tujuan tidak boleh sama." : "Origin and destination stops cannot be the same.");
            return;
        }

        const origin = allStops.find((s) => s.uniqueId === originId);
        const destination = allStops.find((s) => s.uniqueId === destId);

        if (origin && destination) {
            const routeResult = findRoute(corridors, originId, destId);
            if (routeResult) {
                const instructions = processRouteInstructions(routeResult);
                const pathGeometry = extractPathGeometry(corridors, instructions);
                setResult({ origin, destination, distance: routeResult.totalDistance, instructions });
                if (onRouteFound) {
                    onRouteFound({
                        origin,
                        destination,
                        instructions,
                        totalDistance: routeResult.totalDistance,
                        pathGeometry
                    });
                }
            } else {
                alert(lang === 'id' ? "Tidak dapat menemukan rute antara kedua halte tersebut." : "Could not find a route between those two stops.");
            }
        }
    };

    const handleClear = () => {
        setOriginId("");
        setDestId("");
        setOriginQuery("");
        setDestQuery("");
        setResult(null);
        if (onRouteClear) onRouteClear();
    };

    const handleSelectStop = (stop, field) => {
        if (field === 'origin') {
            setOriginId(stop.uniqueId);
            setOriginQuery(stop.name + (stop.direction !== "N/A" ? ` (${lang === 'id' ? 'Halte' : 'Stop'} ${stop.direction})` : ""));
        } else {
            setDestId(stop.uniqueId);
            setDestQuery(stop.name + (stop.direction !== "N/A" ? ` (${lang === 'id' ? 'Halte' : 'Stop'} ${stop.direction})` : ""));
        }
        setActiveField(null);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setActiveField(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`route-search-panel ${collapsed ? "collapsed" : ""}`} ref={containerRef}>
            <div className="rs-header" onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer' }}>
                <div className="rs-title-row">
                    <svg viewBox="0 0 24 24" className="rs-plane-icon">
                        <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                    <h2>{lang === 'id' ? 'Cari Rute' : 'Find Route'}</h2>
                    <button className="rs-toggle-btn" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '10px', padding: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
                        {collapsed ? "▶" : "▼"}
                    </button>
                    {result && (
                        <button className="rs-close-btn" onClick={(e) => { e.stopPropagation(); handleClear(); }}>
                            ✕
                        </button>
                    )}
                </div>
                {!collapsed && (
                    <p className="rs-subtitle">
                        {lang === 'id' ? 'Pilih halte asal dan tujuan untuk melihat rute tercepat' : 'Select origin and destination stops to see the fastest route'}
                    </p>
                )}
            </div>

            {!collapsed && (
                <>
                    <div className="rs-form">
                        <div className="rs-field">
                            <label>
                                <svg viewBox="0 0 24 24" className="rs-pin-icon green">
                                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                {lang === 'id' ? 'Halte Asal' : 'Origin Stop'}
                            </label>
                            <div className="rs-input-group">
                                <input
                                    type="text"
                                    className="rs-custom-input"
                                    placeholder={lang === 'id' ? 'Ketik halte asal...' : 'Type origin stop...'}
                                    value={originQuery}
                                    onChange={(e) => {
                                        setOriginQuery(e.target.value);
                                        setOriginId("");
                                        setActiveField('origin');
                                    }}
                                    onFocus={() => setActiveField('origin')}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {activeField === 'origin' && (
                                    <div className="rs-dropdown">
                                        {filteredOriginStops.length > 0 ? (
                                            filteredOriginStops.map((stop) => (
                                                <div 
                                                    key={`orig-${stop.uniqueId}`} 
                                                    className="rs-dropdown-item"
                                                    onClick={(e) => { e.stopPropagation(); handleSelectStop(stop, 'origin'); }}
                                                >
                                                    {stop.name} {stop.direction !== "N/A" ? `(${lang === 'id' ? 'Halte' : 'Stop'} ${stop.direction})` : ""}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rs-no-results">{lang === 'id' ? 'Halte tidak ditemukan' : 'Stop not found'}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rs-field">
                            <label>
                                <svg viewBox="0 0 24 24" className="rs-pin-icon red">
                                    <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                {lang === 'id' ? 'Halte Tujuan' : 'Destination Stop'}
                            </label>
                            <div className="rs-input-group">
                                <input
                                    type="text"
                                    className="rs-custom-input"
                                    placeholder={lang === 'id' ? 'Ketik halte tujuan...' : 'Type destination stop...'}
                                    value={destQuery}
                                    onChange={(e) => {
                                        setDestQuery(e.target.value);
                                        setDestId("");
                                        setActiveField('dest');
                                    }}
                                    onFocus={() => setActiveField('dest')}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {activeField === 'dest' && (
                                    <div className="rs-dropdown">
                                        {filteredDestStops.length > 0 ? (
                                            filteredDestStops.map((stop) => (
                                                <div 
                                                    key={`dest-${stop.uniqueId}`} 
                                                    className="rs-dropdown-item"
                                                    onClick={(e) => { e.stopPropagation(); handleSelectStop(stop, 'dest'); }}
                                                >
                                                    {stop.name} {stop.direction !== "N/A" ? `(${lang === 'id' ? 'Halte' : 'Stop'} ${stop.direction})` : ""}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="rs-no-results">{lang === 'id' ? 'Halte tidak ditemukan' : 'Stop not found'}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button className="rs-submit-btn" onClick={(e) => { e.stopPropagation(); handleSearch(); }}>
                            <svg viewBox="0 0 24 24" className="rs-btn-icon">
                                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                            {lang === 'id' ? 'Cari Rute' : 'Find Route'}
                        </button>
                    </div>

                    {result && (
                        <div className="rs-result-card" onClick={(e) => e.stopPropagation()}>
                            <div className="rs-result-row">
                                <div className="rs-result-icon">
                                    <svg viewBox="0 0 24 24" className="rs-pin-icon green">
                                        <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                </div>
                                <div className="rs-result-info">
                                    <span className="rs-result-label">{lang === 'id' ? 'Dari' : 'From'}</span>
                                    <span className="rs-result-value">{result.origin.name}</span>
                                </div>
                            </div>
                            <div className="rs-result-row">
                                <div className="rs-result-icon">
                                    <svg viewBox="0 0 24 24" className="rs-pin-icon red">
                                        <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                </div>
                                <div className="rs-result-info">
                                    <span className="rs-result-label">{lang === 'id' ? 'Ke' : 'To'}</span>
                                    <span className="rs-result-value">{result.destination.name}</span>
                                </div>
                            </div>

                            <div className="rs-instructions">
                                <div className="rs-inst-title">{lang === 'id' ? 'Langkah Perjalanan:' : 'Travel Steps:'}</div>
                                {result.instructions.map((inst, idx) => (
                                    <div key={idx} className={`rs-inst-step ${inst.type}`}>
                                        {inst.type === 'ride' ? (
                                            <>
                                                <div className="rs-step-icon bg-blue">🚌</div>
                                                <div className="rs-step-text">
                                                    {lang === 'id' ? (
                                                        <>Naik <strong>{inst.corridorName}</strong> dari {inst.fromStop.name} ke {inst.toStop.name} ({inst.distance.toFixed(1)} km)</>
                                                    ) : (
                                                        <>Ride <strong>{inst.corridorName}</strong> from {inst.fromStop.name} to {inst.toStop.name} ({inst.distance.toFixed(1)} km)</>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="rs-step-icon bg-yellow">🚶</div>
                                                <div className="rs-step-text">
                                                    {lang === 'id' ? (
                                                        <>Transit di <strong>{inst.stop.name}</strong></>
                                                    ) : (
                                                        <>Transfer at <strong>{inst.stop.name}</strong></>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="rs-result-dist">
                                <span className="rs-dist-label">{lang === 'id' ? 'Total Jarak Tempuh' : 'Total Travel Distance'}</span>
                                <span className="rs-dist-value">{result.distance.toFixed(2)} km</span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default RouteSearch;