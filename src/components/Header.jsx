import { translations } from '../utils/translations';

function Header({ stats, onBack, lang = 'id', setLang, onLocate, savedCount = 0, onShowSaved }) {
    const t = translations[lang];
    
    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-logo">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="header-back-btn"
                            title={t.back}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
                            </svg>
                        </button>
                    )}
                    <img src="/mjt-logo.png" alt="MJT Logo" className="header-logo-img" />
                    <div className="header-title-group">
                        <h1>{lang === 'id' ? 'Peta Rute Metro Jabar Trans' : 'Metro Jabar Trans Route Map'}</h1>
                        <p className="header-subtitle">
                            {lang === 'id' ? 'Sistem Bus Rapid Transit — Bandung Raya, Jawa Barat' : 'Bus Rapid Transit System — Greater Bandung, West Java'}
                        </p>
                    </div>
                </div>

                <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                        className="header-saved-btn"
                        onClick={onShowSaved}
                        title={lang === 'id' ? 'Halte Disimpan' : 'Saved Stops'}
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#007b83',
                            height: '36px',
                            padding: '0 12px',
                            borderRadius: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s',
                            position: 'relative'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                        </svg>
                        <span className="saved-btn-text" style={{ fontSize: '13px', fontWeight: '700' }}>{lang === 'id' ? 'Disimpan' : 'Saved'}</span>
                        {savedCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                background: '#e74c3c',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: '900',
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid white'
                            }}>
                                {savedCount}
                            </span>
                        )}
                    </button>

                    <button 
                        className="header-locate-btn"
                        onClick={onLocate}
                        title={lang === 'id' ? 'Lihat Lokasi Saya' : 'View My Location'}
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#4285F4',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>

                    <button 
                        className="header-lang-btn" 
                        onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                        style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#334155',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.8rem'
                        }}
                    >
                        {lang.toUpperCase()}
                    </button>

                    <div className="header-stats">
                        <div className="header-badge">
                            <span>{stats?.totalCorridors || 6} {t.stats_corridors}</span>
                            <span className="header-divider">|</span>
                            <span>{stats?.totalStopPoints || 0} {t.stats_stops}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;