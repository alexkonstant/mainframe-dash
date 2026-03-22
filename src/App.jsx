import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import SysTime from './components/SysTime';
import SysStats from './components/SysStats';
import Weather from './components/Weather';
import DataVault from './components/DataVault';
import NetworkRadar from './components/NetworkRadar';
import AgendaSync from './components/AgendaSync';
import Shortcuts from './components/Shortcuts';
import GlobalNews from './components/GlobalNews';
import OrbitalTracking from './components/OrbitalTracking';
import SystemControl from './components/SystemControl';
import LocalDevices from './components/LocalDevices';
import BluetoothManager from './components/BluetoothManager';
import MediaDeck from './components/MediaDeck';

const ThemeSelector = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="theme-selector"
      >
        <option value="90s">Windows 95</option>
        <option value="cyberpunk">Cyberpunk</option>
        <option value="fallout">RobCo Terminal</option>
        <option value="material">Material You</option>
        <option value="y2k">Y2K Flash</option> {/* <-- ADD THIS LINE */}
      </select>
    </div>
  );
};

function App() {
  // Master state holds the single payload from the Pi 1
  const [syncData, setSyncData] = useState({
    hardware: null,
    audio: null,
    network: []
  });

  // The Mainframe Heartbeat (Fires every 3 seconds)
  useEffect(() => {
    const fetchSync = async () => {
      try {
        const response = await fetch('/api/sync');
        const data = await response.json();
        if (data.status === 'success') {
          setSyncData({
            hardware: data.hardware,
            audio: data.audio,
            network: data.network
          });
        }
      } catch (error) {
        console.error("MAINFRAME UPLINK SEVERED", error);
      }
    };

    fetchSync();
    const interval = setInterval(fetchSync, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ThemeSelector />
      <div className="dashboard-grid">

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SysTime />
          <SysStats stats={syncData.hardware} />
          <BluetoothManager />
          <SystemControl />
          <Shortcuts />
          <NetworkRadar />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Weather />
          <AgendaSync />
          <DataVault />
          <MediaDeck audioData={syncData.audio} />
          <GlobalNews />
          <LocalDevices devices={syncData.network} />
        </div>

        {/* Full Width Footer */}
        <OrbitalTracking />

      </div>
    </>
  );
}

export default App;