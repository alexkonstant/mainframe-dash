import { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function LocalDevices({ devices = [] }) {
    const [isScanning, setIsScanning] = useState(false);
    const { theme } = useContext(ThemeContext);

    // Since the actual data arrives passively from the master_sync payload,
    // this function just provides visual UI feedback when a user clicks "Scan".
    const triggerVisualScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 1500);
    };

    return (
        <div
            className={`dashboard-panel local-devices ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`}
            style={theme === '90s' ? { padding: 0, background: '#c0c0c0', border: '2px solid', borderColor: '#ffffff #000000 #000000 #ffffff' } : {}}
        >

            {/* Header Area (Hidden for 90s, CLI, and System 7) */}
            {theme !== '90s' && theme !== 'cli' && theme !== 'system7' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme === 'material' ? '20px' : '10px' }}>
                    <h2 style={{ flexGrow: 1, marginRight: '15px', marginBottom: theme === 'material' ? '0' : '' }}>
                        {theme === 'cyberpunk' ? 'NET_SCAN // LOCAL_NODES' :
                            theme === 'fallout' ? 'LOCAL_SUBNET // DETECTED' :
                                theme === 'material' ? 'Connected Devices' :
                                    theme === 'y2k' ? 'LAN_UPLINK // ACTIVE_NODES' :
                                        'LOCAL_DEVICES // LAN'}
                    </h2>

                    <button onClick={triggerVisualScan} disabled={isScanning}
                            className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                            style={theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: isScanning ? 'wait' : 'pointer', fontWeight: 'bold', padding: '5px 10px', height: 'fit-content', opacity: isScanning ? 0.5 : 1 }
                                : { opacity: isScanning ? 0.5 : 1 }}
                    >
                        {theme === 'material' ? 'Refresh' : '[ SCAN ]'}
                    </button>
                </div>
            )}

            {/* Default Status Indicators */}
            {theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && theme !== '90s' && theme !== 'cli' && theme !== 'system7' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>
                    {isScanning ? '> Sweeping local network...' : `> Tracking ${devices.length} active nodes.`}
                </div>
            )}

            {/* --- SYSTEM 7 LAYOUT --- */}
            {theme === 'system7' ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="s7-titlebar">
                        <span className="s7-title-text">Local Devices</span>
                    </div>
                    <div style={{ padding: '4px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontFamily: "'Chicago', sans-serif", fontSize: '12px', color: '#000' }}>Network Nodes</span>
                            <button 
                                onClick={triggerVisualScan} 
                                disabled={isScanning} 
                                style={{ 
                                    border: '1px solid #000', 
                                    borderRadius: '4px', 
                                    boxShadow: isScanning ? 'none' : '1px 1px 0px #000', 
                                    background: '#fff', 
                                    color: '#000', 
                                    padding: '2px 8px', 
                                    fontFamily: "'Geneva', sans-serif", 
                                    fontSize: '11px',
                                    cursor: isScanning ? 'wait' : 'pointer',
                                    transform: isScanning ? 'translate(1px, 1px)' : 'none'
                                }}
                                onMouseDown={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; }}
                                onMouseUp={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                            >
                                {isScanning ? 'Scanning...' : 'Scan Now'}
                            </button>
                        </div>
                        <div style={{ 
                            border: '1px solid #000', 
                            background: '#fff', 
                            padding: '2px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            maxHeight: '250px', 
                            overflowY: 'auto' 
                        }}>
                            {/* Header row for tabular data */}
                            <div style={{ display: 'flex', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '2px' }}>
                                <span style={{ fontFamily: "'Chicago', sans-serif", fontSize: '11px', color: '#000', width: '100px' }}>IP</span>
                                <span style={{ fontFamily: "'Chicago', sans-serif", fontSize: '11px', color: '#000', flex: 1 }}>Hostname</span>
                            </div>

                            {devices && devices.length > 0 ? devices.map((dev, i) => (
                                <div key={i} style={{ 
                                    borderBottom: i !== devices.length - 1 ? '1px dotted #000' : 'none', 
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ 
                                        fontFamily: "'Geneva', sans-serif", 
                                        fontSize: '11px', 
                                        color: '#000',
                                        width: '100px'
                                    }}>{dev.ip}</span>
                                    <span style={{ 
                                        fontFamily: "'Geneva', sans-serif", 
                                        fontSize: '11px', 
                                        color: '#000',
                                        flex: 1,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>{dev.name || 'Unknown'}</span>
                                </div>
                            )) : (
                                <div style={{ color: '#000', fontFamily: "'Geneva', sans-serif", fontSize: '11px', padding: '4px' }}>
                                    {isScanning ? 'Querying network...' : 'No devices found.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : theme === 'cli' ? (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>

                    {/* Terminal Prompt & Execute Button */}
                    <div style={{ color: 'var(--accent)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>root@mainframe:~# arp-scan --localnet</span>
                        <button onClick={triggerVisualScan} disabled={isScanning} style={{ color: '#ffff55', cursor: isScanning ? 'wait' : 'pointer', background: 'transparent', border: 'none', padding: 0, fontSize: '14px', fontWeight: 'bold' }}>
                            {isScanning ? '[ SWEEPING... ]' : '[ EXECUTE ]'}
                        </button>
                    </div>

                    {/* Table Headers */}
                    <div style={{ display: 'flex', borderBottom: '1px dashed #555', paddingBottom: '4px', marginBottom: '8px', color: '#888', fontSize: '12px' }}>
                        <span style={{ width: '110px' }}>IP_ADDRESS</span>
                        <span style={{ width: '140px' }}>MAC_ADDRESS</span>
                        <span style={{ flex: 1 }}>HOSTNAME</span>
                    </div>

                    {/* Node List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                        {devices && devices.length > 0 ? devices.map((dev, i) => (
                            <div key={i} style={{ display: 'flex', color: '#c0c0c0', fontSize: '13px', alignItems: 'center' }}>
                                <span style={{ width: '110px', color: '#00ff00' }}>{dev.ip}</span>
                                <span style={{ width: '140px', color: '#ffff55' }}>{dev.mac || 'UNKNOWN'}</span>
                                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {dev.name ? dev.name.toUpperCase() : 'UNKNOWN_HOST'}
                                </span>
                            </div>
                        )) : (
                            <div style={{ color: '#555', fontStyle: 'italic', marginTop: '5px' }}>
                                {isScanning ? 'EOF: Awaiting ARP replies...' : 'EOF: No local nodes detected.'}
                            </div>
                        )}
                    </div>

                    {/* Footer Summary */}
                    <div style={{ color: '#888', fontSize: '12px', marginTop: '12px', borderTop: '1px dashed #555', paddingTop: '6px' }}>
                        &gt; {devices.length} hosts responded to ARP requests
                    </div>
                </div>
            ) : theme === '90s' ? (
                /* --- 90s WINDOWS LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', padding: '2px' }}>

                    {/* Classic Navy Blue Title Bar */}
                    <div style={{ background: '#000080', color: '#ffffff', padding: '2px 4px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Network Neighborhood</span>
                    </div>

                    {/* Toolbar / Menu Area */}
                    <div style={{ padding: '4px 2px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #808080', marginBottom: '4px' }}>
                        <button onClick={triggerVisualScan} disabled={isScanning} style={{
                            padding: '2px 10px',
                            background: '#c0c0c0',
                            color: '#000',
                            borderTop: '1px solid #fff',
                            borderLeft: '1px solid #fff',
                            borderRight: '1px solid #000',
                            borderBottom: '1px solid #000',
                            boxShadow: 'inset -1px -1px #808080, inset 1px 1px #dfdfdf',
                            cursor: isScanning ? 'wait' : 'pointer',
                            fontWeight: 'normal',
                            opacity: isScanning ? 0.7 : 1,
                            fontSize: '11px',
                            fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                            {isScanning ? 'Scanning...' : 'Refresh'}
                        </button>
                        <span style={{ fontSize: '11px', color: '#000', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            {isScanning ? 'Searching for computers...' : `${devices.length} object(s)`}
                        </span>
                    </div>

                    {/* Sunken Content Area (Icon Grid) */}
                    <div style={{
                        background: '#ffffff',
                        border: '2px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        padding: '10px',
                        maxHeight: '280px',
                        overflowY: 'scroll',
                        boxShadow: 'inset 1px 1px #000',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '15px',
                        alignContent: 'flex-start'
                    }}>
                        {devices && devices.length > 0 ? devices.map((dev, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '70px' }}>
                                <img
                                    src="https://win98icons.alexmeub.com/icons/png/computer_explorer-4.png"
                                    alt="PC"
                                    style={{ width: '32px', height: '32px', marginBottom: '5px', imageRendering: 'pixelated' }}
                                />
                                <span style={{
                                    fontSize: '11px',
                                    color: '#000',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    textAlign: 'center',
                                    wordBreak: 'break-word',
                                    lineHeight: '1.2'
                                }}>
                                    {dev.name || dev.ip || 'Unknown'}
                                </span>
                            </div>
                        )) : (
                            <div style={{ color: '#000', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px' }}>
                                {isScanning ? 'Scanning network...' : 'No computers found.'}
                            </div>
                        )}
                    </div>
                </div>
            ) : theme === 'y2k' ? (
                /* --- Y2K 2ADVANCED LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>LAN_UPLINK</span>
                        <span style={{ fontSize: '9px', opacity: 0.7 }}>[ {devices.length} NODES ]</span>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                        {devices && devices.length > 0 ? devices.map((dev, i) => (
                            <div key={i} style={{
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid #2a4b66',
                                padding: '8px',
                                marginBottom: '8px',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--accent)' }}></div>

                                <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>MAC: {dev.mac || 'UNKNOWN'}</span>
                                    <span>ID_0{i + 1}</span>
                                </div>

                                <div style={{ color: '#fff', fontSize: '10px', lineHeight: '1.4', marginBottom: '4px', fontWeight: 'bold' }}>
                                    {dev.name || 'UNKNOWN_HOST'}
                                </div>

                                <div style={{ textAlign: 'right', fontSize: '9px', color: '#7bbcd5' }}>
                                    [ IP: {dev.ip} ]
                                </div>
                            </div>
                        )) : (
                            <div style={{ opacity: 0.5, fontSize: '9px' }}>&gt; AWAITING_NETWORK_SCAN...</div>
                        )}
                    </div>
                </div>
            ) : devices && devices.length > 0 ? (
                /* --- ORIGINAL RENDERING LOGIC (DEFAULT/CP/FO/MD) --- */
                <div className={theme === 'cyberpunk' ? 'cp-device-grid' : theme === 'fallout' ? 'fo-device-list' : theme === 'material' ? 'md-device-list' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { display: 'flex', flexDirection: 'column', gap: '10px' } : {}}>
                    {devices.map((dev, i) => (
                        <div key={i} className={theme === 'cyberpunk' ? 'cp-device-node' : theme === 'fallout' ? 'fo-device-item' : theme === 'material' ? 'md-device-card' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { border: '1px solid var(--accent)', padding: '10px' } : {}}>
                            {theme === 'cyberpunk' && <div className="cp-device-icon"></div>}
                            <div className="device-info" style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { display: 'flex', flexDirection: 'column', gap: '5px' } : {}}>
                                <div className="device-name" style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { fontWeight: 'bold', color: 'var(--accent)' } : {}}>{theme === 'fallout' ? `> ${dev.name.toUpperCase()}` : dev.name}</div>
                                <div className="device-ip" style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { fontSize: '0.9em' } : {}}>{theme === 'fallout' ? `  IP: ${dev.ip}` : dev.ip}</div>
                                <div className="device-mac" style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { fontSize: '0.8em', opacity: 0.6 } : {}}>{theme === 'fallout' ? `  MAC: ${dev.mac}` : dev.mac}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ opacity: 0.5 }}>{theme === 'material' ? 'Scanning devices...' : '> NO LOCAL DEVICES DETECTED'}</div>
            )}
        </div>
    );
}