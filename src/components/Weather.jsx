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

    return (
        <div className={`dashboard-panel weather-module ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>

            {/* Themed Headers */}
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'Weather Properties' :
                        theme === 'cyberpunk' ? 'ATMOS_SCAN // METEO' :
                            theme === 'fallout' ? 'ROBCO_ENV // SENSOR' :
                                theme === 'y2k' ? 'METEO_LOG // RADAR' :
                                    'LOCAL_ATMOSPHERE'}
                </h2>
            )}

            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>At-a-Glance</h2>}

            {/* Default Status Text */}
            {theme !== '90s' && theme !== 'material' && theme !== 'fallout' && theme !== 'y2k' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
            )}

            {/* --- 90s WINDOWS PROPERTIES LAYOUT --- */}
            {theme === '90s' ? (
                <div style={{ padding: '4px', color: '#000' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>

                        {/* Authentic 90s Pixel Icon Box */}
                        <div style={{
                            width: '48px', height: '48px', marginRight: '15px',
                            background: '#008080',
                            border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            boxShadow: 'inset 1px 1px #000, inset -1px -1px #dfdfdf'
                        }}>
                            <span style={{ fontSize: '24px', textShadow: '1px 1px 0 #000' }}>
                                {weather ? (weather.precip_chance > 50 ? '🌧' : weather.condition?.toLowerCase().includes('cloud') ? '☁' : '☀') : '⌛'}
                            </span>
                        </div>

                        <div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1', letterSpacing: '-1px' }}>
                                {weather ? weather.temp : '--'}°C
                            </div>
                            <div style={{ fontSize: '12px', marginTop: '2px' }}>
                                {weather ? weather.condition : 'Updating...'}
                            </div>
                        </div>
                    </div>

                    {/* Sunken Data List */}
                    <div style={{
                        background: '#fff',
                        border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080',
                        padding: '10px',
                        boxShadow: 'inset 1px 1px #000'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                            <span>Humidity:</span>
                            <span>{weather ? weather.humidity : '--'}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                            <span>Wind Speed:</span>
                            <span>{weather ? weather.wind : '--'} km/h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>Precipitation:</span>
                            <span>{weather ? weather.precip_chance : '--'}%</span>
                        </div>
                    </div>
                </div>
            ) : theme === 'y2k' ? (
                /* --- Y2K 2ADVANCED LAYOUT --- */
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '5px', marginBottom: '15px' }}>
                        <span style={{ color: 'var(--accent)' }}>STATUS:</span>
                        <span style={{ fontWeight: 'bold' }}>
                            {weather ? (weather.precip_chance > 50 ? 'WARNING: PRECIPITATION' : 'OPTIMAL') : 'SCANNING...'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                        <div style={{ fontSize: '38px', color: '#ffffff', marginRight: '15px', textShadow: '0 0 10px rgba(123, 188, 213, 0.5)', lineHeight: 1 }}>
                            {weather ? weather.temp : '--'}°
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="y2k-progress-bar" style={{ height: '6px', marginBottom: '4px', padding: '1px' }}>
                                <div className="y2k-progress-block active" style={{ width: weather ? '75%' : '0%' }}></div>
                            </div>
                            <div style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '2px' }}>THERMAL_INDEX</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '8px', border: '1px solid #2a4b66' }}>
                            <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px' }}>HUMIDITY</div>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{weather ? weather.humidity : '--'}%</div>
                        </div>
                        <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '8px', border: '1px solid #2a4b66' }}>
                            <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px' }}>WIND_VELOCITY</div>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{weather ? weather.wind : '--'} KM/H</div>
                        </div>
                        <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '8px', border: '1px solid #2a4b66', gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px' }}>PRECIPITATION_PROB</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#fff', fontWeight: 'bold' }}>{weather ? weather.precip_chance : '0'}%</span>
                                <span style={{ color: weather && weather.precip_chance > 0 ? '#ff9900' : 'var(--text)', fontSize: '9px', background: weather && weather.precip_chance > 0 ? 'rgba(255, 153, 0, 0.1)' : 'transparent', padding: '2px 6px', border: weather && weather.precip_chance > 0 ? '1px solid #ff9900' : 'none' }}>
                                    {weather && weather.precip_chance > 0 ? '[ ALERT ]' : '[ CLEAR ]'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : theme === 'cyberpunk' ? (
                /* --- CYBERPUNK LAYOUT --- */
                <div className="cp-weather-grid">
                    <div className="cp-weather-main">
                        <span className="cp-temp">{weather ? weather.temp : '--'}°</span>
                        <span className="cp-cond">{weather ? weather.condition : 'SCANNING...'}</span>
                    </div>
                    <div className="cp-weather-details">
                        <div><span className="cp-label">HUMIDITY</span><span className="cp-val">{weather ? weather.humidity : '--'}%</span></div>
                        <div><span className="cp-label">WIND</span><span className="cp-val">{weather ? weather.wind : '--'}KPH</span></div>
                    </div>
                </div>
            ) : theme === 'fallout' ? (
                /* --- FALLOUT LAYOUT --- */
                <div className="fo-weather-block">
                    <div style={{ marginBottom: '10px' }}>&gt; EXTERIOR_TEMP: {weather ? weather.temp : '--'}°C</div>
                    <div style={{ marginBottom: '10px' }}>&gt; ATMOS_COND: {weather ? weather.condition?.toUpperCase() : 'UNKNOWN'}</div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div>RADS/HUMIDITY: {weather ? weather.humidity : '--'}%</div>
                        <div>WIND_VELOCITY: {weather ? weather.wind : '--'} KM/H</div>
                    </div>
                </div>
            ) : theme === 'material' ? (
                /* --- MATERIAL YOU LAYOUT --- */
                <div className="md-weather-card">
                    <div className="md-weather-main">
                        <div className="md-weather-icon">{weather ? (weather.precip_chance > 50 ? '🌧️' : weather.condition?.toLowerCase().includes('cloud') ? '☁️' : '☀️') : '⏳'}</div>
                        <div className="md-weather-temp">{weather ? weather.temp : '--'}°</div>
                    </div>
                    <div className="md-weather-desc">{weather ? weather.condition : 'Updating local weather...'}</div>
                    <div className="md-weather-pills">
                        <div className="md-pill">💧 {weather ? weather.humidity : '--'}%</div>
                        <div className="md-pill">💨 {weather ? weather.wind : '--'} km/h</div>
                    </div>
                </div>
            ) : (
                /* --- DEFAULT / TERMINAL LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div>&gt; TEMP: {weather ? weather.temp : '--'}°C</div>
                    <div>&gt; COND: {weather ? weather.condition : 'UNKNOWN'}</div>
                    <div>&gt; HUMIDITY: {weather ? weather.humidity : '--'}%</div>
                    <div>&gt; WIND: {weather ? weather.wind : '--'} KPH</div>
                </div>
            )}
        </div>
    );
}