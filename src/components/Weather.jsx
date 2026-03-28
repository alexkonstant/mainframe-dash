import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function Weather() {
    const [weather, setWeather] = useState(null);
    const [status, setStatus] = useState("> Scanning atmosphere...");
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchWeather = () => {
            fetch('/api/weather')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setWeather(data.weather || data);
                        setStatus("> Atmos-data acquired.");
                    }
                })
                .catch(() => setStatus("> ERR_METEO_OFFLINE"));
        };

        fetchWeather();
        // Refresh weather every 30 minutes
        const interval = setInterval(fetchWeather, 1800000);
        return () => clearInterval(interval);
    }, []);

    // --- BULLETPROOF DATA EXTRACTION ---
    // This entirely prevents "Cannot read properties of undefined" crashes
    const temp = weather?.temp ?? '--';
    const condition = weather?.condition || 'UNKNOWN';
    const humidity = weather?.humidity ?? '--';
    const wind = weather?.wind ?? '--';
    const precipChance = weather?.precip_chance ?? 0;

    const isLoaded = !!weather;
    const isRaining = precipChance > 50;
    const isCloudy = condition.toLowerCase().includes('cloud');

    // Safe Icon generator
    const getIcon = (rain, cloud, sun, wait) => {
        if (!isLoaded) return wait;
        if (isRaining) return rain;
        if (isCloudy) return cloud;
        return sun;
    };

    return (
        <div className={`dashboard-panel weather-module ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>

            {/* Themed Headers */}
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'Weather Properties' :
                        theme === 'cyberpunk' ? 'ATMOS_SCAN // METEO' :
                            theme === 'fallout' ? 'ROBCO_ENV // SENSOR' :
                                theme === 'y2k' ? 'METEO_LOG // RADAR' :
                                    theme === 'cli' ? 'METEO_STAT' :
                                        'LOCAL_ATMOSPHERE'}
                </h2>
            )}

            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>At-a-Glance</h2>}

            {/* Default Status Text */}
            {theme !== '90s' && theme !== 'material' && theme !== 'fallout' && theme !== 'y2k' && theme !== 'cli' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
            )}

            {/* --- CLI / TUI LAYOUT --- */}
            {theme === 'cli' ? (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
                        root@mainframe:~# weewx-cli --current
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#888' }}>TEMP_CORE</span>
                        <span style={{ color: '#fff', fontSize: '18px' }}>{temp !== '--' ? `${temp}°C` : '--'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px' }}>
                        <span style={{ color: '#888' }}>ATMOS_COND</span>
                        <span style={{ color: '#ffff55' }}>{condition.toUpperCase()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px' }}>
                        <span style={{ color: '#888' }}>HUMIDITY</span>
                        <span style={{ color: '#c0c0c0' }}>{humidity !== '--' ? `${humidity}%` : '--'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px' }}>
                        <span style={{ color: '#888' }}>WIND_VELOCITY</span>
                        <span style={{ color: '#c0c0c0' }}>{wind !== '--' ? `${wind} KM/H` : '--'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                        <span style={{ color: '#888' }}>PRECIP_PROB</span>
                        <span style={{ color: precipChance > 50 ? '#ff5555' : '#00ff00' }}>
                            {isLoaded ? `${precipChance}%` : '--'}
                            {isLoaded && precipChance > 50 ? ' [WARN]' : ' [ OK ]'}
                        </span>
                    </div>
                </div>
            ) : theme === '90s' ? (
                /* --- 90s WINDOWS PROPERTIES LAYOUT --- */
                <div style={{ padding: '4px', color: '#000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{
                            width: '48px', height: '48px', marginRight: '15px',
                            background: '#008080',
                            border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            boxShadow: 'inset 1px 1px #000, inset -1px -1px #dfdfdf'
                        }}>
                            <span style={{ fontSize: '24px', textShadow: '1px 1px 0 #000' }}>
                                {getIcon('🌧', '☁', '☀', '⌛')}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1', letterSpacing: '-1px' }}>
                                {temp}°C
                            </div>
                            <div style={{ fontSize: '12px', marginTop: '2px' }}>
                                {isLoaded ? condition : 'Updating...'}
                            </div>
                        </div>
                    </div>
                    <div style={{ background: '#fff', border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', padding: '10px', boxShadow: 'inset 1px 1px #000' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                            <span>Humidity:</span><span>{humidity}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                            <span>Wind Speed:</span><span>{wind} km/h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>Precipitation:</span><span>{precipChance}%</span>
                        </div>
                    </div>
                </div>
            ) : theme === 'y2k' ? (
                /* --- Y2K 2ADVANCED LAYOUT --- */
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '5px', marginBottom: '15px' }}>
                        <span style={{ color: 'var(--accent)' }}>STATUS:</span>
                        <span style={{ fontWeight: 'bold' }}>{isLoaded ? (precipChance > 50 ? 'WARNING: PRECIPITATION' : 'OPTIMAL') : 'SCANNING...'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ fontSize: '38px', color: '#ffffff', marginRight: '15px', textShadow: '0 0 10px rgba(123, 188, 213, 0.5)', lineHeight: 1 }}>
                            {temp}°
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="y2k-progress-bar" style={{ height: '6px', marginBottom: '4px', padding: '1px' }}>
                                <div className="y2k-progress-block active" style={{ width: isLoaded ? '75%' : '0%' }}></div>
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '2px' }}>THERMAL_INDEX</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '8px', border: '1px solid #2a4b66' }}>
                            <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px' }}>HUMIDITY</div>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{humidity}%</div>
                        </div>
                        <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '8px', border: '1px solid #2a4b66' }}>
                            <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px' }}>WIND_VELOCITY</div>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{wind} KM/H</div>
                        </div>
                        <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '8px', border: '1px solid #2a4b66', gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px' }}>PRECIPITATION_PROB</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{precipChance}%</span>
                                <span style={{ color: precipChance > 0 ? '#ff9900' : 'var(--text)', fontSize: '9px', background: precipChance > 0 ? 'rgba(255, 153, 0, 0.1)' : 'transparent', padding: '2px 6px', border: precipChance > 0 ? '1px solid #ff9900' : 'none' }}>
                                    {precipChance > 0 ? '[ ALERT ]' : '[ CLEAR ]'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : theme === 'cyberpunk' ? (
                /* --- CYBERPUNK LAYOUT --- */
                <div className="cp-weather-grid">
                    <div className="cp-weather-main">
                        <span className="cp-temp">{temp}°</span><span className="cp-cond">{isLoaded ? condition : 'SCANNING...'}</span>
                    </div>
                    <div className="cp-weather-details">
                        <div><span className="cp-label">HUMIDITY</span><span className="cp-val">{humidity}%</span></div>
                        <div><span className="cp-label">WIND</span><span className="cp-val">{wind}KPH</span></div>
                    </div>
                </div>
            ) : theme === 'fallout' ? (
                /* --- FALLOUT LAYOUT --- */
                <div className="fo-weather-block">
                    <div style={{ marginBottom: '10px' }}>&gt; EXTERIOR_TEMP: {temp}°C</div>
                    <div style={{ marginBottom: '10px' }}>&gt; ATMOS_COND: {condition.toUpperCase()}</div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div>RADS/HUMIDITY: {humidity}%</div>
                        <div>WIND_VELOCITY: {wind} KM/H</div>
                    </div>
                </div>
            ) : theme === 'material' ? (
                /* --- MATERIAL YOU LAYOUT --- */
                <div className="md-weather-card">
                    <div className="md-weather-main">
                        <div className="md-weather-icon">{getIcon('🌧️', '☁️', '☀️', '⏳')}</div>
                        <div className="md-weather-temp">{temp}°</div>
                    </div>
                    <div className="md-weather-desc">{isLoaded ? condition : 'Updating local weather...'}</div>
                    <div className="md-weather-pills">
                        <div className="md-pill">💧 {humidity}%</div>
                        <div className="md-pill">💨 {wind} km/h</div>
                    </div>
                </div>
            ) : (
                /* --- DEFAULT / TERMINAL LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div>&gt; TEMP: {temp}°C</div>
                    <div>&gt; COND: {condition}</div>
                    <div>&gt; HUMIDITY: {humidity}%</div>
                    <div>&gt; WIND: {wind} KPH</div>
                </div>
            )}
        </div>
    );
}