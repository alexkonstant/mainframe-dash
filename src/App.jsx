import { useContext } from 'react';
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
        <option value="material">Material You</option>  {/* <-- Inject this line */}
      </select>
    </div>
  );
};

function App() {
  return (
    <>
      <ThemeSelector />
      <div className="dashboard-grid">

        {/* Left Column: Local Systems & Links */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SysTime />
          <SysStats />
          <BluetoothManager />
          <SystemControl />
          <Shortcuts />
          <NetworkRadar />
        </div>

        {/* Right Column: World Data & Agenda */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Weather />
          <AgendaSync />
          <DataVault />
          <MediaDeck />
          <GlobalNews />
          <LocalDevices />
        </div>

        {/* Full Width Footer */}
        <OrbitalTracking />

      </div>
    </>
  );
}

export default App;