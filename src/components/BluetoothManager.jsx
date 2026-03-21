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

  return (
    <div className={`dashboard-panel ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
      
      {/* Native Header: Automatically gets the Win95 Title Bar & Window Controls from index.css */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, flexGrow: 1 }}>
          {theme === '90s' ? 'Bluetooth' : theme === 'cyberpunk' ? 'UPLINK_NODE' : theme === 'fallout' ? 'RADIO_LINK' : 'Connections'}
        </h2>
        
        {/* Toggle Button styled exactly like Shortcuts */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? (isExpanded ? 'md-btn-active' : 'md-btn-tonal') : ''}
          style={theme !== 'fallout' && theme !== 'material' && theme !== '90s' ? { background: isExpanded ? 'var(--accent)' : 'transparent', color: isExpanded ? 'var(--bg)' : 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer', fontWeight: 'bold', padding: '5px 10px' } : {}}
        >
          {isExpanded ? (theme === 'material' ? 'Done' : '[ DONE ]') : (theme === 'material' ? 'Manage' : '[ MANAGE ]')}
        </button>
      </div>

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
      
    </div>
  );
}