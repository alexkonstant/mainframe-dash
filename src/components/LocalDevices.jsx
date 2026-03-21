import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function LocalDevices() {
    const { theme } = useContext(ThemeContext);
    const [devices, setDevices] = useState([]);
    const [status, setStatus] = useState("> Initializing scanner...");
    const [isScanning, setIsScanning] = useState(false);

    const scanNetwork = () => {
        setIsScanning(true);
        setStatus("> Sweeping local subnet...");
        fetch('/api/network/scan')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setDevices(data.devices);
                    setStatus(`> ${data.devices.length} nodes detected.`);
                }
            })
            .catch(() => setStatus("> ERR_SCAN_FAILED"))
            .finally(() => setIsScanning(false));
    };

    // Auto-scan on load and every 5 minutes
    useEffect(() => {
        scanNetwork();
        const interval = setInterval(scanNetwork, 300000);
        return () => clearInterval(interval);
    }, []);

return (
        <div className={`dashboard-panel local-devices ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0 }}>
                    {theme === '90s' ? 'Network Neighborhood' : 
                     theme === 'cyberpunk' ? 'LOCAL_NET // NODE_SCANNER' : 
                     theme === 'fallout' ? 'ROBCO_NET // LOCAL_TOPOLOGY' :
                     theme === 'material' ? 'Connected Devices' :
                     'LOCAL_DEVICES'}
                </h2>
                <button 
                    onClick={scanNetwork} 
                    disabled={isScanning}
                    className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                    style={theme !== 'fallout' && theme !== 'material' ? { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: isScanning ? 'wait' : 'pointer', fontWeight: 'bold', padding: '5px 10px', opacity: isScanning ? 0.5 : 1 } : { opacity: isScanning ? 0.5 : 1 }}
                >
                    {isScanning ? (theme === 'material' ? 'Scanning...' : '[ SCANNING ]') : (theme === 'material' ? 'Rescan' : '[ RESCAN ]')}
                </button>
            </div>

            {theme !== 'material' && theme !== '90s' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
            )}

            {theme === '90s' && (
                <div className="win95-explorer-headers" style={{ marginBottom: '10px', display: 'flex' }}>
                    <div style={{ flex: 1.5 }}>Device Name</div>
                    <div style={{ flex: 1 }}>IP Address</div>
                    <div style={{ flex: 1 }}>MAC Address</div>
                </div>
            )}

            <div className={theme === 'cyberpunk' ? 'cp-device-list' : theme === 'material' ? 'md-device-list' : ''} style={theme !== 'cyberpunk' && theme !== 'material' && theme !== '90s' ? { lineHeight: '1.6' } : {}}>
                {devices.length > 0 ? (
                    devices.map((dev, i) => {
                        // Handle the missing hostname from Alpine's ARP table
                        const isUnknown = dev.name === '?';
                        const displayName = isUnknown ? (theme === 'cyberpunk' ? 'UNKNOWN_ENTITY' : theme === 'fallout' ? 'GHOST_NODE' : 'Unknown Device') : dev.name;

                        return theme === 'cyberpunk' ? (
                            <div key={i} className="cp-device-item">
                                <div className="cp-dev-info">
                                    <div className="cp-dev-name" style={{ color: isUnknown ? '#ff0055' : 'var(--text)' }}>{displayName}</div>
                                    <div className="cp-dev-ip">{dev.ip}</div>
                                </div>
                                <span className="cp-dev-mac">{dev.mac.toUpperCase()}</span>
                            </div>
                        ) : theme === 'fallout' ? (
                            <div key={i} className="fo-log-row" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>&gt; {displayName.toUpperCase()} <span style={{opacity: 0.6}}>[{dev.ip}]</span></span>
                                <span style={{ opacity: 0.5 }}>{dev.mac}</span>
                            </div>
                        ) : theme === 'material' ? (
                            <div key={i} className="md-device-card">
                                <div className="md-dev-icon">{isUnknown ? '👻' : '📱'}</div>
                                <div className="md-dev-info">
                                    <div className="md-dev-name">{displayName}</div>
                                    <div className="md-dev-ip">{dev.ip} <span style={{opacity: 0.5}}>• {dev.mac.toUpperCase()}</span></div>
                                </div>
                            </div>
                        ) : (
                            <div key={i} style={{ display: 'flex', borderBottom: theme === '90s' ? 'none' : '1px dashed var(--accent)', padding: '5px 0' }}>
                                <span style={{ flex: 1.5 }}>{theme === '90s' ? '' : '> '}{displayName}</span>
                                <span style={{ flex: 1 }}>{dev.ip}</span>
                                <span style={{ flex: 1, opacity: 0.7 }}>{dev.mac}</span>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ opacity: 0.5, padding: '10px' }}>{isScanning ? 'Querying subnet...' : 'No devices found.'}</div>
                )}
            </div>
        </div>
    );
}