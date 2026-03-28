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

            {/* Themed Header Block (Hidden for CLI) */}
            {theme !== 'material' && theme !== 'cli' && (
                <h2>
                    {theme === '90s' ? 'Space Explorer' :
                        theme === 'cyberpunk' ? 'ORBITAL_UPLINK // ISS_TELEMETRY' :
                            theme === 'fallout' ? 'HELIOS_LINK' :
                                theme === 'y2k' ? 'SYS_ORBITAL // SAT_TRACK' :
                                    'ORBITAL_TRACKING // ISS'}
                </h2>
            )}

            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '15px' }}>Orbital Feed</h2>}

            {/* Default Status Text */}
            {theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && theme !== 'cli' && theme !== '90s' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
            )}

            {issData ? (
                /* --- CLI / TUI TERMINAL LAYOUT --- */
                theme === 'cli' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                        <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
                            root@mainframe:~# sat-track --id 25544 --live
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px' }}>
                            <span style={{ color: '#888' }}>TARGET_OBJECT</span>
                            <span style={{ color: '#ffff55', fontWeight: 'bold' }}>[ ISS_ZARYA ]</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '12px' }}>
                            <span style={{ color: '#888' }}>COORDINATES</span>
                            <span style={{ color: '#00ff00' }}>
                                LAT: {parseFloat(issData.lat).toFixed(4)} // LON: {parseFloat(issData.lon).toFixed(4)}
                            </span>
                        </div>

                        {/* ASCII Map Boundary & CSS Filter Magic */}
                        <div style={{ border: '1px dashed #555', padding: '2px', background: '#000' }}>
                            <div style={{ color: '#888', fontSize: '12px', margin: '4px 0', textAlign: 'center', letterSpacing: '2px' }}>--- VISUAL_TELEMETRY_FEED ---</div>
                            <div style={{ height: '350px', position: 'relative', background: '#000' }}>
                                <iframe
                                    width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${issData.lon - 20},${issData.lat - 15},${issData.lon + 20},${issData.lat + 15}&layer=mapnik&marker=${issData.lat},${issData.lon}`}
                                    /* This specific filter combo turns OSM into a dark high-contrast tactical terminal map */
                                    style={{ display: 'block', minHeight: '100%', filter: 'invert(100%) grayscale(100%) sepia(100%) hue-rotate(130deg) brightness(1.2) contrast(1.5)' }}
                                ></iframe>
                            </div>
                        </div>
                    </div>
                ) : theme === '90s' ? (
                    /* --- 90s WINDOWS LAYOUT --- */
                    <div style={{ border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', padding: '4px', background: '#c0c0c0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#000080', color: '#fff', padding: '2px 5px', fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>
                            <span>Satellite View - Internet Explorer</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <button style={{ width: '16px', height: '14px', fontSize: '8px', padding: 0 }}>_</button>
                                <button style={{ width: '16px', height: '14px', fontSize: '8px', padding: 0 }}>□</button>
                                <button style={{ width: '16px', height: '14px', fontSize: '8px', padding: 0 }}>X</button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '5px', fontSize: '12px', color: '#000', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>Address:</span>
                            <span style={{ background: '#fff', border: '1px solid #808080', padding: '2px 5px', flex: 1, fontFamily: 'Arial, sans-serif' }}>http://orbit.track/iss</span>
                        </div>
                        <div style={{ height: '400px', border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080' }}>
                            <iframe
                                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${issData.lon - 20},${issData.lat - 15},${issData.lon + 20},${issData.lat + 15}&layer=mapnik&marker=${issData.lat},${issData.lon}`}
                                style={{ display: 'block', minHeight: '100%' }}
                            ></iframe>
                        </div>
                    </div>
                ) : theme === 'y2k' ? (
                    /* --- Y2K 2ADVANCED LAYOUT --- */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px' }}>
                            <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>TARGET: ISS_ZARYA</span>
                            <span style={{ fontSize: '9px', opacity: 0.7 }}>LAT: {issData.lat} // LON: {issData.lon}</span>
                        </div>

                        <div style={{ position: 'relative', height: '400px', border: '1px solid #2a4b66', background: '#000' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)', zIndex: 10 }}></div>
                            <iframe
                                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${issData.lon - 20},${issData.lat - 15},${issData.lon + 20},${issData.lat + 15}&layer=mapnik&marker=${issData.lat},${issData.lon}`}
                                style={{ display: 'block', minHeight: '100%', filter: 'grayscale(100%) sepia(100%) hue-rotate(180deg) brightness(0.8) contrast(1.2)' }}
                            ></iframe>
                        </div>
                    </div>
                ) : (
                    /* --- DEFAULT / CP / FO / MD LAYOUT --- */
                    <div className={theme === 'cyberpunk' ? 'cp-orbital-container' : theme === 'fallout' ? 'fo-orbital-container' : theme === 'material' ? 'md-orbital-card' : ''}>
                        {theme !== 'material' && theme !== '90s' && theme !== 'y2k' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontFamily: 'monospace' }}>
                                <span>&gt; LAT: {issData.lat}</span>
                                <span>&gt; LON: {issData.lon}</span>
                            </div>
                        )}
                        <div style={{ position: 'relative', height: theme === 'material' ? '300px' : '450px', overflow: 'hidden', borderRadius: theme === 'material' ? '16px' : '0' }}>
                            {theme === 'cyberpunk' && <div className="cp-scanline"></div>}
                            {theme === 'fallout' && <div className="fo-scanline"></div>}
                            <iframe
                                width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${issData.lon - 20},${issData.lat - 15},${issData.lon + 20},${issData.lat + 15}&layer=mapnik&marker=${issData.lat},${issData.lon}`}
                                className={theme === 'cyberpunk' ? 'cp-tactical-map' : theme === 'fallout' ? 'fo-tactical-map' : theme === 'material' ? 'md-tactical-map' : ''}
                                style={{ display: 'block', border: 'none', minHeight: '100%' }}
                            ></iframe>
                        </div>
                    </div>
                )
            ) : (
                <div style={{ opacity: 0.5 }}>
                    {theme === '90s' ? 'Resolving host...' : theme === 'material' ? 'Locating station...' : theme === 'cli' ? 'root@mainframe:~# sat-track\n> AWAITING SAT LOCK...' : '> AWAITING TELEMETRY...'}
                </div>
            )}
        </div>
    );
}