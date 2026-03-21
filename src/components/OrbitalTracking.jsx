import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function OrbitalTracking() {
    const [issData, setIssData] = useState(null);
    const [status, setStatus] = useState("> Establishing orbital uplink...");
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchISS = () => {
            fetch('/api/iss')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setIssData(data);
                        setStatus("> Signal intercepted.");
                    }
                })
                .catch(() => setStatus("> ERR_ORBITAL_FEED_LOST"));
        };

        fetchISS();
        const interval = setInterval(fetchISS, 60000);
        return () => clearInterval(interval);
    }, []);

return (
        <div className={`dashboard-panel orbital-tracking ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`} style={{ gridColumn: '1 / -1' }}>
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'Space Explorer' : 
                     theme === 'cyberpunk' ? 'ORBITAL_UPLINK // ISS_TELEMETRY' : 
                     theme === 'fallout' ? 'HELIOS_ONE // HIGH_ALTITUDE_RELAY' :
                     'ORBITAL_TRACKING // VISUAL_INTERFACE'}
                </h2>
            )}
            
            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>Orbital Telemetry</h2>}

            {theme !== 'material' && theme !== 'fallout' && theme !== 'cyberpunk' && (
                <div style={{ opacity: theme === '90s' ? 1 : 0.7, marginBottom: '15px', fontStyle: theme === '90s' ? 'normal' : 'italic' }}>{status}</div>
            )}

            {issData ? (
                <div className={theme === 'cyberpunk' ? 'cp-orbital-layout' : theme === 'material' ? 'md-orbital-layout' : ''}>
                    
                    <div className={theme === 'cyberpunk' ? 'cp-telemetry-row' : theme === 'fallout' ? 'fo-telemetry-row' : theme === 'material' ? 'md-telemetry-row' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { lineHeight: '1.6', marginBottom: '20px' } : {}}>
                        {theme === 'cyberpunk' ? (
                            /* ... CP ... */
                            <><div className="cp-tel-block"><div className="cp-tel-label">LATITUDE_Y</div><div className="cp-tel-val">{issData.lat.toFixed(4)}°</div></div><div className="cp-tel-block"><div className="cp-tel-label">LONGITUDE_X</div><div className="cp-tel-val">{issData.lon.toFixed(4)}°</div></div><div className="cp-tel-block cp-tel-dist"><div className="cp-tel-label">DIST_TO_TARGET</div><div className="cp-tel-val">{Math.round(issData.distance)} <span>KM</span></div></div></>
                        ) : theme === 'fallout' ? (
                            /* ... FO ... */
                            <><div className="fo-tel-block">&gt; POS_Y: {issData.lat.toFixed(4)}</div><div className="fo-tel-block">&gt; POS_X: {issData.lon.toFixed(4)}</div><div className="fo-tel-block">&gt; RANGE: {Math.round(issData.distance)} KM</div></>
                        ) : theme === 'material' ? (
                            /* Material You Telemetry Chips */
                            <>
                                <div className="md-tel-pill"><span>LAT</span> <strong>{issData.lat.toFixed(4)}°</strong></div>
                                <div className="md-tel-pill"><span>LON</span> <strong>{issData.lon.toFixed(4)}°</strong></div>
                                <div className="md-tel-pill md-tel-accent"><span>DIST</span> <strong>{Math.round(issData.distance)} km</strong></div>
                            </>
                        ) : (
                            /* ... Default ... */
                            <><div>&gt; LATITUDE: {issData.lat.toFixed(4)}</div><div>&gt; LONGITUDE: {issData.lon.toFixed(4)}</div><div>&gt; DIST. FROM KREMENCHUK: {Math.round(issData.distance)} km</div></>
                        )}
                    </div>

                    {issData.lat && issData.lon && (
                        <div className={theme === 'cyberpunk' ? 'cp-map-wrapper' : theme === 'fallout' ? 'fo-map-wrapper' : theme === 'material' ? 'md-map-wrapper' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { marginTop: '10px', height: '400px', overflow: 'hidden' } : {}}>
                            {theme === 'cyberpunk' && (
                                <><div className="cp-crosshair-h"></div><div className="cp-crosshair-v"></div><div className="cp-target-box"></div><div className="cp-scanline-sweep"></div></>
                            )}
                            
                            <iframe 
                                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${issData.lon - 20},${issData.lat - 15},${issData.lon + 20},${issData.lat + 15}&layer=mapnik&marker=${issData.lat},${issData.lon}`} 
                                className={theme === 'cyberpunk' ? 'cp-tactical-map' : theme === 'fallout' ? 'fo-tactical-map' : theme === 'material' ? 'md-tactical-map' : ''}
                                style={{ display: 'block', border: theme === '90s' ? '2px solid #808080' : 'none', minHeight: '450px' }} 
                            ></iframe>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ opacity: 0.5 }}>{theme === 'material' ? 'Establishing satellite link...' : '> AWAITING SATELLITE HANDSHAKE...'}</div>
            )}
        </div>
    );
}