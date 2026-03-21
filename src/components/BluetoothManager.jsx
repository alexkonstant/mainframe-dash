import { useState, useEffect } from 'react';

export default function BluetoothManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState('IDLE'); // IDLE, CONNECTED, OFFLINE
  const [connectedName, setConnectedName] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Poll for current connection status
  useEffect(() => {
    const checkStatus = () => {
      fetch('/api/bluetooth/status')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setStatus(data.state);
            setConnectedName(data.device_name || null);
          }
        })
        .catch(() => setStatus('OFFLINE'));
    };
    
    checkStatus();
    // Optional: Poll every 10 seconds to keep indicator accurate
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const scanDevices = async () => {
    setIsScanning(true);
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
    setStatus('CONNECTING...');
    try {
      const res = await fetch('/api/bluetooth/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mac: mac })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setStatus('CONNECTED');
        setConnectedName(data.device_name);
      } else {
        setStatus('FAILED');
      }
    } catch (err) {
      setStatus('FAILED');
    }
  };

  // --- STYLES ---
  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999
  };

  const modalBoxStyle = {
    minWidth: '300px',
    maxWidth: '500px',
    padding: '20px',
    position: 'relative'
  };

  return (
    <>
      {/* 1. THE INDICATOR (Sits on the dashboard) */}
      <div 
        className="dashboard-block" 
        style={{ cursor: 'pointer', textAlign: 'center', padding: '10px' }}
        onClick={() => setIsModalOpen(true)}
      >
        <div style={{ fontWeight: 'bold' }}>BT: {status}</div>
        {connectedName && <div style={{ fontSize: '0.8em', marginTop: '5px' }}>🔗 {connectedName}</div>}
      </div>

      {/* 2. THE MODAL (Only renders when clicked) */}
      {isModalOpen && (
        <div style={overlayStyle}>
          {/* Notice we use your existing dashboard-block class here so it matches the active theme */}
          <div className="dashboard-block" style={modalBoxStyle}>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }}
            >
              [X]
            </button>

            <h3>Bluetooth Uplink</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <p>Current Target: {connectedName || 'None'}</p>
              <button onClick={scanDevices} disabled={isScanning} style={{ width: '100%' }}>
                {isScanning ? 'Executing Scan...' : 'Initiate Radar Scan'}
              </button>
            </div>

            {devices.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {devices.map((dev) => (
                    <li key={dev.mac} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid currentColor', paddingBottom: '4px' }}>
                      <span style={{ fontSize: '0.9em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dev.name || dev.mac}
                      </span>
                      <button onClick={() => connectDevice(dev.mac)}>Link</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}