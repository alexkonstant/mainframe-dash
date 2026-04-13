import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function BluetoothManager() {
  const { theme } = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState('IDLE');
  const [connectedName, setConnectedName] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      fetch('/api/bluetooth/status')
          .then(res => res.json())
          .then(data => {
            if (data.status === 'success') {
              setStatus(data.state);
              setConnectedName(data.device_name);
            }
          })
          .catch(() => setStatus('OFFLINE'));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const scanDevices = async () => {
    setIsScanning(true);
    setDevices([]);
    try {
      const res = await fetch('/api/bluetooth/scan');
      const data = await res.json();
      if (data.status === 'success') setDevices(data.devices);
    } catch (err) {
      console.error("Scan failed", err);
    }
    setIsScanning(false);
  };

  const connectDevice = async (mac) => {
    setStatus('LINKING...');
    try {
      const res = await fetch('/api/bluetooth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac: mac })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatus('CONNECTED');
        setIsExpanded(false); // Auto-close the drawer on success
      } else {
        setStatus('FAILED');
      }
    } catch (err) {
      setStatus('FAILED');
    }
  };

  if (theme === 'rickmorty') {
      return (
          <div style={{ background: 'rgba(10, 15, 20, 0.9)', border: '2px solid #97ce4c', borderRadius: '10px', boxShadow: '0 0 10px rgba(151, 206, 76, 0.4)', marginBottom: '20px', padding: '15px', color: '#97ce4c', fontFamily: "'Courier New', Courier, monospace", display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>// INTERDIMENSIONAL_PAIRING</div>
                  <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      style={{ background: 'transparent', border: '2px solid #97ce4c', color: '#97ce4c', fontFamily: "'Courier New', Courier, monospace", cursor: 'pointer', padding: '5px 10px', fontWeight: 'bold' }}
                  >
                      {isExpanded ? '[ DONE ]' : '[ MANAGE ]'}
                  </button>
              </div>
              
              <div style={{ opacity: 0.8, color: status === 'CONNECTED' && connectedName ? '#97ce4c' : 'inherit' }}>
                  {status === 'CONNECTED' && connectedName 
                      ? `> TARGET: ${connectedName.toUpperCase()}` 
                      : `> STATUS: ${status}`}
              </div>

              {isExpanded && (
                  <div style={{ borderTop: '1px dashed #97ce4c', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button 
                          onClick={scanDevices} 
                          disabled={isScanning}
                          style={{ width: '100%', padding: '8px', cursor: isScanning ? 'wait' : 'pointer', background: 'transparent', color: '#97ce4c', border: '1px solid #97ce4c', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold' }}
                      >
                          {isScanning ? 'CALIBRATING_PORTAL...' : 'INITIATE_SWEEP'}
                      </button>

                      {devices.length > 0 && (
                          <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              {devices.map((dev) => (
                                  <div key={dev.mac} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(151, 206, 76, 0.3)', paddingBottom: '5px' }}>
                                      <div style={{ overflow: 'hidden' }}>
                                          <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{dev.name || 'UNKNOWN_DIMENSION'}</div>
                                          <div style={{ fontSize: '0.8em', opacity: 0.6 }}>{dev.mac}</div>
                                      </div>
                                      <button 
                                          onClick={() => connectDevice(dev.mac)}
                                          style={{ marginLeft: '10px', padding: '5px 15px', cursor: 'pointer', border: '1px solid #97ce4c', background: '#97ce4c', color: 'rgba(10, 15, 20, 0.9)', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold' }}
                                      >
                                          LINK
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  }

  return (
      <div className={`dashboard-panel ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`}>

        {/* Header Block */}
        {theme === 'system7' && (
            <div className="s7-titlebar">
                <span className="s7-title-text">Bluetooth Setup</span>
            </div>
        )}
        
        {theme !== 'system7' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, flexGrow: 1 }}>
                {theme === '90s' ? 'Bluetooth' :
                    theme === 'cyberpunk' ? 'UPLINK_NODE' :
                        theme === 'fallout' ? 'RADIO_LINK' :
                            theme === 'y2k' ? 'SYS_COMMS // BLUETOOTH' :
                                theme === 'cli' ? 'BT_CONFIG' :
                                    'Connections'}
              </h2>

              {/* Toggle Button (Hidden in CLI mode so we can render it inline with the terminal text) */}
              {theme !== 'cli' && (
                  <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? (isExpanded ? 'md-btn-active' : 'md-btn-tonal') : ''}
                      style={theme !== 'fallout' && theme !== 'material' && theme !== '90s' && theme !== 'y2k' ? { background: isExpanded ? 'var(--accent)' : 'transparent', color: isExpanded ? 'var(--bg)' : 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer', fontWeight: 'bold', padding: '5px 10px' } : theme === 'y2k' ? { padding: '4px 10px' } : {}}
                  >
                    {isExpanded ? (theme === 'material' ? 'Done' : theme === 'y2k' ? '[ CLOSE_NODE ]' : '[ DONE ]') : (theme === 'material' ? 'Manage' : theme === 'y2k' ? '[ CONFIG ]' : '[ MANAGE ]')}
                  </button>
              )}
            </div>
        )}

        {theme === 'system7' ? (
            <div className="s7-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div><strong>Status:</strong> {status} {connectedName ? `- ${connectedName}` : ''}</div>
                    <button onClick={() => setIsExpanded(!isExpanded)} style={{ border: '1px solid #000', background: '#fff', color: '#000', cursor: 'pointer', padding: '2px 8px' }}>
                        {isExpanded ? 'Done' : 'Manage'}
                    </button>
                </div>
                {isExpanded && (
                    <div style={{ borderTop: '1px solid #000', paddingTop: '10px', marginTop: '10px' }}>
                        <button onClick={scanDevices} disabled={isScanning} style={{ border: '1px solid #000', background: '#fff', color: '#000', cursor: 'pointer', padding: '2px 8px', marginBottom: '10px' }}>
                            {isScanning ? 'Scanning...' : 'Scan Devices'}
                        </button>
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            {devices && devices.map((d, i) => (
                                <li key={i} style={{ marginBottom: '4px' }}>
                                    <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => connectDevice(d.mac)}>
                                        {d.name || d.mac}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        ) : theme === 'y2k' ? (
            /* =========================================
               Y2K 2ADVANCED FLASH LAYOUT
               ========================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Primary Status Text Block */}
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '10px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: status === 'CONNECTED' ? 'var(--accent)' : '#7bbcd5' }}></div>

                <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '5px' }}>CURRENT_STATE:</div>
                <div style={{ color: status === 'CONNECTED' ? '#fff' : '#7bbcd5', fontSize: '11px', fontWeight: 'bold', marginBottom: connectedName ? '5px' : '0', paddingLeft: '8px' }}>
                  [{status.toUpperCase()}]
                </div>

                {status === 'CONNECTED' && connectedName && (
                    <div style={{ fontSize: '9px', color: '#fff', paddingLeft: '8px', opacity: 0.9 }}>
                      <span style={{ color: 'var(--accent)', marginRight: '5px' }}>TARGET_NODE:</span>
                      {connectedName.toUpperCase()}
                    </div>
                )}
              </div>

              {/* Expanded Management Drawer */}
              {isExpanded && (
                  <div style={{ border: '1px dashed #2a4b66', padding: '8px', background: 'rgba(123, 188, 213, 0.05)', marginTop: '5px' }}>

                    <button
                        onClick={scanDevices}
                        disabled={isScanning}
                        style={{ width: '100%', marginBottom: '10px', padding: '6px', background: 'linear-gradient(180deg, #162942, #070c16)', color: '#7bbcd5', border: '1px solid #2a4b66', cursor: isScanning ? 'wait' : 'pointer', fontSize: '9px', letterSpacing: '2px', opacity: isScanning ? 0.5 : 1 }}
                    >
                      {isScanning ? 'EXECUTING_RADAR_SWEEP...' : 'INITIATE_SWEEP'}
                    </button>

                    {devices.length > 0 && (
                        <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                          <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '8px', letterSpacing: '1px' }}>DETECTED_HARDWARE:</div>
                          {devices.map((dev) => (
                              <div key={dev.mac} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '6px 4px',
                                borderBottom: '1px solid rgba(42, 75, 102, 0.5)',
                                background: 'rgba(0,0,0,0.2)',
                                marginBottom: '4px'
                              }}>
                                <div style={{ overflow: 'hidden', paddingRight: '10px' }}>
                                  <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{dev.name || 'UNKNOWN_DEVICE'}</div>
                                  <div style={{ fontSize: '8px', color: '#7bbcd5', opacity: 0.6 }}>MAC: {dev.mac}</div>
                                </div>

                                <button
                                    onClick={() => connectDevice(dev.mac)}
                                    style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '3px 8px', fontSize: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                >
                                  [ LINK ]
                                </button>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
              )}
            </div>
        ) : theme === 'cli' ? (
            /* =========================================
               CLI / TUI TERMINAL LAYOUT
               ========================================= */
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>

              <div style={{ color: 'var(--accent)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>root@mainframe:~# hciconfig</span>
                <button onClick={() => setIsExpanded(!isExpanded)} style={{ color: '#ffff55', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, fontSize: '14px', fontWeight: 'bold' }}>
                  {isExpanded ? '[ CLOSE ]' : '[ MANAGE ]'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px' }}>
                <span style={{ color: '#888' }}>ADAPTER_STATE</span>
                <span style={{ color: status === 'CONNECTED' ? '#00ff00' : '#ffff55', fontWeight: 'bold' }}>
                      [ {status.toUpperCase()} ]
                  </span>
              </div>

              {status === 'CONNECTED' && connectedName && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px' }}>
                    <span style={{ color: '#888' }}>ACTIVE_LINK</span>
                    <span style={{ color: 'var(--accent)' }}>{connectedName.toUpperCase()}</span>
                  </div>
              )}

              {isExpanded && (
                  <div style={{ marginTop: '10px', paddingTop: '10px' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>root@mainframe:~# hcitool scan</span>
                      <button onClick={scanDevices} disabled={isScanning} style={{ color: isScanning ? '#888' : '#ffff55', cursor: isScanning ? 'wait' : 'pointer', background: 'transparent', border: 'none', padding: 0, fontSize: '14px', fontWeight: 'bold' }}>
                        {isScanning ? '[ SCANNING... ]' : '[ EXECUTE ]'}
                      </button>
                    </div>

                    {devices.length > 0 && (
                        <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                          <div style={{ display: 'flex', borderBottom: '1px solid #555', paddingBottom: '4px', marginBottom: '8px', color: '#888', fontSize: '12px' }}>
                            <span style={{ width: '45%' }}>MAC_ADDRESS</span>
                            <span style={{ flex: 1 }}>DEVICE_NAME</span>
                            <span style={{ width: '60px', textAlign: 'right' }}>ACTION</span>
                          </div>
                          {devices.map((dev) => (
                              <div key={dev.mac} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '13px' }}>
                                <span style={{ width: '45%', color: '#ffff55' }}>{dev.mac}</span>
                                <span style={{ flex: 1, color: '#c0c0c0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }}>
                                          {dev.name ? dev.name.toUpperCase() : 'UNKNOWN_HOST'}
                                      </span>
                                <button
                                    onClick={() => connectDevice(dev.mac)}
                                    style={{ width: '60px', textAlign: 'right', color: '#00ff00', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 'bold' }}
                                >
                                  [ LINK ]
                                </button>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
              )}
            </div>
        ) : (
            /* =========================================
               DEFAULT / 90s / CP / FO / MD LAYOUT
               ========================================= */
            <>
              {/* Primary Status Text */}
              <div style={{
                opacity: theme === '90s' ? 1 : 0.8,
                marginBottom: isExpanded ? '15px' : '0',
                fontStyle: theme === '90s' ? 'normal' : 'italic',
                color: theme === '90s' ? '#000' : 'inherit'
              }}>
                {status === 'CONNECTED' && connectedName
                    ? (theme === '90s' ? `Device: ${connectedName}` : `> TARGET: ${connectedName.toUpperCase()}`)
                    : (theme === '90s' ? `Status: ${status}` : `> STATUS: ${status}`)}
              </div>

              {/* Expanded Management Drawer */}
              {isExpanded && (
                  <div style={{
                    borderTop: theme === '90s' ? '1px solid #808080' : '1px dashed var(--accent)',
                    paddingTop: '15px'
                  }}>

                    <button
                        onClick={scanDevices}
                        disabled={isScanning}
                        className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                        style={theme !== 'fallout' && theme !== 'material' && theme !== '90s'
                            ? { width: '100%', marginBottom: '15px', padding: '8px', cursor: isScanning ? 'wait' : 'pointer', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', fontWeight: 'bold' }
                            : { width: '100%', marginBottom: '15px' }}
                    >
                      {isScanning ? (theme === '90s' ? 'Searching...' : 'EXECUTING_RADAR_SWEEP...') : (theme === '90s' ? 'Scan for Devices' : 'INITIATE_SWEEP')}
                    </button>

                    {devices.length > 0 && (
                        <div style={{
                          maxHeight: '180px',
                          overflowY: 'auto',
                          /* Authentic Windows 95 sunken white listbox */
                          ...(theme === '90s' ? { background: '#ffffff', color: '#000000', padding: '2px', boxShadow: 'inset -2px -2px #fff, inset 2px 2px #0a0a0a' } : {})
                        }}>
                          {devices.map((dev) => (
                              <div key={dev.mac} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: theme === '90s' ? '2px 5px' : '8px 0',
                                borderBottom: theme === '90s' ? 'none' : '1px dashed rgba(255,255,255,0.2)'
                              }}>
                                <div style={{ overflow: 'hidden' }}>
                                  <div style={{ fontWeight: theme === '90s' ? 'normal' : 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{dev.name || 'Unknown Device'}</div>
                                  {theme !== '90s' && <div style={{ fontSize: '0.8em', opacity: 0.6 }}>{dev.mac}</div>}
                                </div>

                                <button
                                    onClick={() => connectDevice(dev.mac)}
                                    className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-active' : ''}
                                    style={theme !== 'fallout' && theme !== 'material' && theme !== '90s'
                                        ? { marginLeft: '10px', padding: '5px 15px', cursor: 'pointer', border: '1px solid var(--accent)', background: 'var(--accent)', color: 'var(--bg)', fontWeight: 'bold' }
                                        : {}}
                                >
                                  {theme === '90s' ? 'Pair' : 'LINK'}
                                </button>
                              </div>
                          ))}
                        </div>
                    )}
                  </div>
              )}
            </>
        )}

      </div>
  );
}