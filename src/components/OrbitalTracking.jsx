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
            
            {/* Themed Header Block */}
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'Space Explorer' : 
                     theme === 'cyberpunk' ? 'ORBITAL_UPLINK // ISS_TELEMETRY' : 
                     theme === 'fallout' ? 'HELIOS_ONE // HIGH_ALTITUDE_RELAY' :
                     theme === 'y2k' ? 'SAT_TRACKER // ORBITAL_TELEMETRY' :
                     'ORBITAL_TRACKING // VISUAL_INTERFACE'}
                </h2>
            )}
            
            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>Orbital Telemetry</h2>}

            {/* Standard Status Text (Hidden for Y2K since it gets a custom header) */}
            {theme !== 'material' && theme !== 'fallout' && theme !== 'cyberpunk' && theme !== 'y2k' && (
                <div style={{ opacity: theme === '90s' ? 1 : 0.7, marginBottom: '15px', fontStyle: theme === '90s' ? 'normal' : 'italic' }}>{status}</div>
            )}

            {/* Y2K Status Override */}
            {theme === 'y2k' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>TARGET_LOCK: ISS</span>
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>[ {issData ? 'TRACKING_ACTIVE' : 'SEARCHING...'} ]</span>
                </div>
            )}

            {issData ? (
                <div className={theme === 'cyberpunk' ? 'cp-orbital-layout' : theme === 'material' ? 'md-orbital-layout' : ''}>
                    
                    {/* Telemetry Data Row */}
                    <div className={theme === 'cyberpunk' ? 'cp-telemetry-row' : theme === 'fallout' ? 'fo-telemetry-row' : theme === 'material' ? 'md-telemetry-row' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { lineHeight: '1.6', marginBottom: '20px' } : {}}>
                        {theme === 'cyberpunk' ? (
                            <><div className="cp-tel-block"><div className="cp-tel-label">LATITUDE_Y</div><div className="cp-tel-val">{issData.lat.toFixed(4)}°</div></div><div className="cp-tel-block"><div className="cp-tel-label">LONGITUDE_X</div><div className="cp-tel-val">{issData.lon.toFixed(4)}°</div></div><div className="cp-tel-block cp-tel-dist"><div className="cp-tel-label">DIST_TO_TARGET</div><div className="cp-tel-val">{Math.round(issData.distance)} <span>KM</span></div></div></>
                        ) : theme === 'fallout' ? (
                            <><div className="fo-tel-block">&gt; POS_Y: {issData.lat.toFixed(4)}</div><div className="fo-tel-block">&gt; POS_X: {issData.lon.toFixed(4)}</div><div className="fo-tel-block">&gt; RANGE: {Math.round(issData.distance)} KM</div></>
                        ) : theme === 'material' ? (
                            <>
                                <div className="md-tel-pill"><span>LAT</span> <strong>{issData.lat.toFixed(4)}°</strong></div>
                                <div className="md-tel-pill"><span>LON</span> <strong>{issData.lon.toFixed(4)}°</strong></div>
                                <div className="md-tel-pill md-tel-accent"><span>DIST</span> <strong>{Math.round(issData.distance)} km</strong></div>
                            </>
                        ) : theme === 'y2k' ? (
                            /* Y2K 3-Column Telemetry Block */
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                <div style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '10px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--accent)' }}></div>
                                    <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px', letterSpacing: '1px' }}>LATITUDE_Y</div>
                                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold', paddingLeft: '8px' }}>{issData.lat.toFixed(4)}&deg;</div>
                                </div>
                                <div style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '10px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--accent)' }}></div>
                                    <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px', letterSpacing: '1px' }}>LONGITUDE_X</div>
                                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold', paddingLeft: '8px' }}>{issData.lon.toFixed(4)}&deg;</div>
                                </div>
                                <div style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '10px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: '#7bbcd5' }}></div>
                                    <div style={{ fontSize: '9px', color: '#7bbcd5', marginBottom: '4px', letterSpacing: '1px' }}>DIST_TO_BASE</div>
                                    <div style={{ fontSize: '14px', color: '#7bbcd5', fontWeight: 'bold', paddingLeft: '8px' }}>{Math.round(issData.distance)} KM</div>
                                </div>
                            </div>
                        ) : (
                            <><div>&gt; LATITUDE: {issData.lat.toFixed(4)}</div><div>&gt; LONGITUDE: {issData.lon.toFixed(4)}</div><div>&gt; DIST. FROM KREMENCHUK: {Math.round(issData.distance)} km</div></>
                        )}
                    </div>

                    {/* Live Map Wrapper */}
                    {issData.lat && issData.lon && (
                        <div className={theme === 'cyberpunk' ? 'cp-map-wrapper' : theme === 'fallout' ? 'fo-map-wrapper' : theme === 'material' ? 'md-map-wrapper' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { marginTop: '10px', height: '400px', overflow: 'hidden', position: 'relative', border: theme === 'y2k' ? '1px solid #2a4b66' : 'none', padding: theme === 'y2k' ? '4px' : '0', background: theme === 'y2k' ? 'rgba(0,0,0,0.4)' : 'transparent' } : { position: 'relative' }}>
                            
                            {theme === 'cyberpunk' && (
                                <><div className="cp-crosshair-h"></div><div className="cp-crosshair-v"></div><div className="cp-target-box"></div><div className="cp-scanline-sweep"></div></>
                            )}
                            
                            {/* Y2K Scanlines Overlay */}
                            {theme === 'y2k' && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)', zIndex: 10 }}></div>
                            )}
                            
                            {/* The specific CSS filter below strips OpenStreetMap colors and shifts them into a Y2K Cyan Radar look */}
                            <iframe 
                                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${issData.lon - 20},${issData.lat - 15},${issData.lon + 20},${issData.lat + 15}&layer=mapnik&marker=${issData.lat},${issData.lon}`} 
                                className={theme === 'cyberpunk' ? 'cp-tactical-map' : theme === 'fallout' ? 'fo-tactical-map' : theme === 'material' ? 'md-tactical-map' : ''}
                                style={{ display: 'block', border: theme === '90s' ? '2px solid #808080' : 'none', minHeight: '450px', filter: theme === 'y2k' ? 'grayscale(100%) sepia(100%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' : 'none' }} 
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