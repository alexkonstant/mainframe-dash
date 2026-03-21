import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function Weather() {
    const [weather, setWeather] = useState(null);
    const [status, setStatus] = useState("> Scanning atmosphere...");
    const { theme } = useContext(ThemeContext);

    const fetchWeather = () => {
        fetch('/api/weather')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setWeather(data);
                }
            })
            .catch(() => setStatus("> ERR_ATMOSPHERE_OFFLINE"));
    };

    useEffect(() => {
        fetchWeather();
        const interval = setInterval(fetchWeather, 1800000);
        return () => clearInterval(interval);
    }, []);

    const drawFalloutBar = (percent) => `[${'█'.repeat(Math.round(percent / 10)).padEnd(10, '-')} ]`;

    return (
        <div className={`dashboard-panel weather-module ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'Minesweeper' : 
                     theme === 'cyberpunk' ? 'ATMOS_SCAN // KREMENCHUK_SECTOR' : 
                     theme === 'fallout' ? 'ROBCO_ENV // LOCAL_CLIMATOLOGY' :
                     'METEO_DATA // KREMENCHUK'}
                </h2>
            )}
            
            {theme === '90s' ? (
                /* ... Keep existing 90s code ... */
                <div className="win95-minesweeper-body">
                    <div className="ms-scoreboard">
                        <div className="ms-digital">{weather ? String(Math.round(weather.temp)).padStart(3, '0') : '000'}</div>
                        <button className="ms-face" onClick={fetchWeather}>😎</button>
                        <div className="ms-digital">{weather ? String(weather.humidity).padStart(3, '0') : '000'}</div>
                    </div>
                    <div className="ms-stats-area">
                        {weather ? ( <><div>Wind: {weather.wind} km/h</div><div>Pressure: {weather.pressure}</div></> ) : ( <div>Loading...</div> )}
                    </div>
                </div>
            ) : theme === 'cyberpunk' ? (
                /* ... Keep existing Cyberpunk code ... */
                <div className="cp-atmos-container">
                    {weather ? (
                        <div className="cp-atmos-grid">
                            <div className="cp-atmos-block"><span className="cp-atmos-label">TEMP</span><span className="cp-atmos-val">{weather.temp}°C</span></div>
                            <div className="cp-atmos-block"><span className="cp-atmos-label">HUMIDITY</span><span className="cp-atmos-val">{weather.humidity}%</span></div>
                            <div className="cp-atmos-block"><span className="cp-atmos-label">WIND</span><span className="cp-atmos-val">{weather.wind}</span></div>
                        </div>
                    ) : ( <div style={{ opacity: 0.5 }}>&gt; SENSORS OFFLINE...</div> )}
                </div>
            ) : theme === 'fallout' ? (
                /* ... Keep existing Fallout code ... */
                <div className="fo-weather-container">
                    {weather ? (
                        <div className="fo-stats-container">
                            <div className="fo-stat-line"><span className="fo-label">EXT_TEMP:</span><span>{weather.temp} DEG_C</span></div>
                            <div className="fo-stat-line"><span className="fo-label">RAD_STORMS:</span><span>{drawFalloutBar(weather.precip_chance)}</span></div>
                        </div>
                    ) : ( <div style={{ opacity: 0.5 }}>&gt; RECALIBRATING...</div> )}
                </div>
            ) : theme === 'material' ? (
                /* Material You Weather Layout */
                <div className="md-weather-container">
                    {weather ? (
                        <>
                            <div className="md-weather-main">
                                <span className="md-weather-icon">{weather.precip_chance > 50 ? '🌧️' : weather.temp > 20 ? '☀️' : '☁️'}</span>
                                <div className="md-weather-text">
                                    <div className="md-temp">{weather.temp}°</div>
                                    <div className="md-feels-like">Feels like {weather.feels_like}°</div>
                                </div>
                            </div>
                            <div className="md-weather-details">
                                <div className="md-detail-pill">💧 {weather.humidity}%</div>
                                <div className="md-detail-pill">💨 {weather.wind} km/h</div>
                                <div className="md-detail-pill">☔ {weather.precip_chance}%</div>
                            </div>
                        </>
                    ) : (
                        <div style={{ opacity: 0.5, padding: '20px' }}>Syncing weather...</div>
                    )}
                </div>
            ) : (
                /* Fallback */
                <div>{weather ? `Temp: ${weather.temp}°C` : status}</div>
            )}
        </div>
    );
}