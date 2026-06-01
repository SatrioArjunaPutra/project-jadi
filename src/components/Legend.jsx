import { useState } from "react";
import { translations } from "../utils/translations";

function Legend({ corridors, visibility, onToggle, stats, lang = 'id' }) {
    const t = translations[lang];
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className={`legend-panel ${collapsed ? "collapsed" : ""}`}>
            <div className="legend-header" onClick={() => setCollapsed(!collapsed)}>
                <h3>
                    <span className="legend-icon">🗺️</span>
                    {lang === 'id' ? 'Koridor MJT' : 'MJT Corridors'}
                </h3>
                <button className="legend-toggle">{collapsed ? "▶" : "▼"}</button>
            </div>

            {!collapsed && (
                <div className="legend-body">
                    {/* Stats */}
                    {stats && (
                        <div className="legend-stats">
                            <div className="stat-item">
                                <span className="stat-value">{stats.totalCorridors}</span>
                                <span className="stat-label">{t.stats_corridors}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{stats.totalStopPoints}</span>
                                <span className="stat-label">{t.stats_stops}</span>
                            </div>
                        </div>
                    )}

                    {/* Corridors */}
                    {corridors.map((corridor) => (
                        <label
                            key={corridor.id}
                            className={`legend-item ${visibility[corridor.id] ? "active" : "inactive"}`}
                        >
                            <input
                                type="checkbox"
                                checked={visibility[corridor.id]}
                                onChange={() => onToggle(corridor.id)}
                            />
                            <span className="legend-color" style={{ background: corridor.color }} />
                            <div className="legend-info">
                                <span className="legend-name">{corridor.name}</span>
                                <span className="legend-route">{corridor.route}</span>
                                <span className="legend-hours">⏰ {corridor.operatingHours}</span>
                                <span className="legend-stop-count">
                                    📍 {corridor.totalStopPoints} {lang === 'id' ? 'titik halte' : 'bus stops'}
                                </span>
                            </div>
                        </label>
                    ))}

                    {/* Additional Categories */}
                    <div className="legend-poi" style={{ borderTop: '1px solid var(--glass-border)', marginTop: '8px', paddingTop: '8px' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', padding: '4px 16px', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                            {lang === 'id' ? 'Kategori Tambahan' : 'Additional Categories'}
                        </h4>
                        <label className={`legend-item ${visibility['tourism'] !== false ? "active" : "inactive"}`}>
                            <input
                                type="checkbox"
                                checked={visibility['tourism'] !== false}
                                onChange={() => onToggle('tourism')}
                            />
                            <span className="legend-color" style={{ background: '#9B59B6' }} />
                            <div className="legend-info">
                                <span className="legend-name">{lang === 'id' ? '📸 Wisata' : '📸 Tourism'}</span>
                                <span className="legend-route">{lang === 'id' ? 'Destinasi Pariwisata' : 'Tourist Destinations'}</span>
                            </div>
                        </label>
                        <label className={`legend-item ${visibility['culinary'] !== false ? "active" : "inactive"}`}>
                            <input
                                type="checkbox"
                                checked={visibility['culinary'] !== false}
                                onChange={() => onToggle('culinary')}
                            />
                            <span className="legend-color" style={{ background: '#F39C12' }} />
                            <div className="legend-info">
                                <span className="legend-name">{lang === 'id' ? '🍜 Kuliner' : '🍜 Culinary'}</span>
                                <span className="legend-route">{lang === 'id' ? 'Pusat Makanan Legendaris' : 'Legendary Food Centers'}</span>
                            </div>
                        </label>
                        <label className={`legend-item ${visibility['liveTracking'] !== false ? "active" : "inactive"}`}>
                            <input
                                type="checkbox"
                                checked={visibility['liveTracking'] !== false}
                                onChange={() => onToggle('liveTracking')}
                            />
                            <span className="legend-color" style={{ background: '#00A7D0' }} />
                            <div className="legend-info">
                                <span className="legend-name">{lang === 'id' ? '🚌 Live Tracking' : '🚌 Live Tracking'}</span>
                                <span className="legend-route">{lang === 'id' ? 'Posisi Bus Real-time' : 'Real-time Bus Positions'}</span>
                            </div>
                        </label>
                        <label className={`legend-item ${visibility['userLocation'] !== false ? "active" : "inactive"}`}>
                            <input
                                type="checkbox"
                                checked={visibility['userLocation'] !== false}
                                onChange={() => onToggle('userLocation')}
                            />
                            <span className="legend-color" style={{ background: '#4285F4' }} />
                            <div className="legend-info">
                                <span className="legend-name">{lang === 'id' ? '📍 Posisi Anda' : '📍 Your Location'}</span>
                                <span className="legend-route">{lang === 'id' ? 'Lokasi GPS Pengguna' : 'User GPS Location'}</span>
                            </div>
                        </label>
                    </div>

                    {/* Symbols */}
                    <div className="legend-symbols">
                        <h4>{lang === 'id' ? 'Simbol' : 'Symbols'}</h4>
                        <div className="symbol-row">
                            <div className="symbol-terminal" />
                            <span>{lang === 'id' ? 'Terminal' : 'Terminal'}</span>
                        </div>
                        <div className="symbol-row">
                            <div className="symbol-stop" />
                            <span>{lang === 'id' ? 'Halte' : 'Bus Stop'}</span>
                        </div>
                        <div className="symbol-row">
                            <div className="symbol-transit" />
                            <span>{lang === 'id' ? 'Titik Transit' : 'Transit Point'}</span>
                        </div>
                        <div className="symbol-row">
                            <span className="symbol-dir-a">A</span>
                            <span>{lang === 'id' ? 'Halte A (Arah Tujuan)' : 'Stop A (Outbound)'}</span>
                        </div>
                        <div className="symbol-row">
                            <span className="symbol-dir-b">B</span>
                            <span>{lang === 'id' ? 'Halte B (Arah Kembali)' : 'Stop B (Inbound)'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Legend;