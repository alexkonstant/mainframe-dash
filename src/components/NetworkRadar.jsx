import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function NetworkRadar() {
    const [radar, setRadar] = useState(null);
    const [status, setStatus] = useState("> Pinging targets...");
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchRadar = () => {
            fetch('/api/radar')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setRadar(data.targets);
                        setStatus("> Topography mapped.");
                    }
                })
                .catch(() => setStatus("> ERR_NETWORK_UNREACHABLE"));
        };

        fetchRadar();
        const interval = setInterval(fetchRadar, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`dashboard-panel network-radar ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
            
            {/* Header Block */}
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'MS-DOS Prompt' : 
                     theme === 'cyberpunk' ? 'ICE_BREACH // NODE_MAPPING' : 
                     theme === 'fallout' ? 'ROBCO_NET // ROUTING_TABLE' :
                     theme === 'y2k' ? 'NET_RADAR // TARGET_SWEEP' :
                     'NETWORK_RADAR'}
                </h2>
            )}
            
            <div className={theme === '90s' ? 'radar-content' : ''}>
                
                {/* Status Text (Hidden for Y2K since it gets its own header) */}
                {theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && (
                    <div style={{ opacity: theme === '90s' ? 1 : 0.7, marginBottom: '15px', fontStyle: theme === '90s' ? 'normal' : 'italic' }}>
                        {theme === '90s' ? 'C:\\WINDOWS> ping -t local_network' : status}
                    </div>
                )}
                
                {radar ? (
                    <div className={theme === 'cyberpunk' ? 'cp-radar-grid' : theme === 'material' ? 'md-radar-grid' : ''} style={theme !== 'cyberpunk' && theme !== 'material' && theme !== 'y2k' ? { lineHeight: '1.6' } : {}}>
                        
                        {/* Theme-Specific Sub-Headers */}
                        {theme === 'fallout' && ( <div className="fo-radar-row fo-radar-head"><span>TARGET_ID</span><span>STATUS</span><span>LATENCY</span></div> )}
                        {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '15px' }}>Network Status</h2>}
                        
                        {theme === 'y2k' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px', marginBottom: '10px' }}>
                                <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>TARGET_PING_SWEEP</span>
                                <span style={{ fontSize: '9px', opacity: 0.7 }}>[ {radar.length} TARGETS ]</span>
                            </div>
                        )}

                        {/* Node Mapping Block */}
                        {radar.map((node, i) => (
                            theme === 'cyberpunk' ? (
                                <div key={i} className={`cp-node ${node.status === 'ONLINE' ? 'cp-node-online' : 'cp-node-offline'}`}>
                                    <div className="cp-node-id">NODE_{String(i).padStart(2, '0')}</div>
                                    <div className="cp-node-name">{node.name}</div>
                                    <div className="cp-node-status">{node.status === 'ONLINE' ? 'LINK_ESTABLISHED' : 'ICE_DETECTED'}</div>
                                </div>
                            ) : theme === 'fallout' ? (
                                <div key={i} className={`fo-radar-row ${node.status !== 'ONLINE' ? 'fo-warning-blink' : ''}`}>
                                    <span>{node.name.toUpperCase()}</span><span>{node.status === 'ONLINE' ? 'OK' : 'FAIL'}</span><span>{node.status === 'ONLINE' ? '<1MS' : 'T/O'}</span>
                                </div>
                            ) : theme === 'material' ? (
                                <div key={i} className={`md-radar-chip ${node.status === 'ONLINE' ? 'md-online' : 'md-offline'}`}>
                                    <div className="md-chip-icon">{node.status === 'ONLINE' ? '✓' : '✕'}</div>
                                    <div className="md-chip-text">{node.name}</div>
                                </div>
                            ) : theme === 'y2k' ? (
                                /* Y2K 2advanced Node Block */
                                <div key={i} style={{ 
                                    background: 'rgba(0, 0, 0, 0.4)', 
                                    border: '1px solid #2a4b66', 
                                    padding: '8px',
                                    marginBottom: '6px',
                                    position: 'relative'
                                }}>
                                    {/* Left Accent Line (Orange if Online, Red if Offline) */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: node.status === 'ONLINE' ? 'var(--accent)' : '#ff0055' }}></div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '8px' }}>
                                        <span style={{ fontSize: '10px', color: '#fff', letterSpacing: '1px', fontWeight: 'bold' }}>
                                            {node.name.toUpperCase()}
                                        </span>
                                        <span style={{ 
                                            fontSize: '9px', 
                                            color: node.status === 'ONLINE' ? 'var(--accent)' : '#ff0055', 
                                            background: node.status === 'ONLINE' ? 'transparent' : 'rgba(255,0,85,0.1)', 
                                            padding: '2px 6px', 
                                            border: `1px solid ${node.status === 'ONLINE' ? '#2a4b66' : '#ff0055'}` 
                                        }}>
                                            [ {node.status} ]
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div key={i} style={{ color: theme === '90s' ? '#c0c0c0' : (node.status === 'ONLINE' ? 'var(--text)' : '#ff0055') }}>
                                    {theme === '90s' ? `Reply from ${node.name}: bytes=32 time<1ms status=${node.status}` : `> [${node.status}] ${node.name}`}
                                </div>
                            )
                        ))}
                        {theme === '90s' && <div className="dos-cursor">_</div>}
                    </div>
                ) : (
                    <div style={{ opacity: 0.5 }}>
                        {theme === '90s' ? 'Request timed out.' : theme === 'material' ? 'Scanning devices...' : '> AWAITING PING RETURN...'}
                    </div>
                )}
            </div>
        </div>
    );
}