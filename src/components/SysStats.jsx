import { useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function SysStats({ stats }) {
    const { theme } = useContext(ThemeContext);

    // Derive status directly from the prop instead of managing local state
    const status = stats ? "> Telemetry locked." : "> Establishing uplink...";

    const drawAsciiBar = (percent) => `[${'#'.repeat(Math.round(percent / 10)).padEnd(10, '.')}]`;
    const drawFalloutBar = (percent) => `[${'█'.repeat(Math.round(percent / 10)).padEnd(10, '-')} ]`;

    const drawWin95Bar = (percent) => {
        const activeBlocks = Math.round((percent / 100) * 15);
        return (
            <div className="win95-progress-bar">
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="win95-progress-block" style={{ visibility: i < activeBlocks ? 'visible' : 'hidden' }}></div>
                ))}
            </div>
        );
    };

    const drawY2KBar = (percent) => {
        const totalBlocks = 20;
        const activeBlocks = Math.round((percent / 100) * totalBlocks);
        return (
            <div className="y2k-progress-bar">
                {[...Array(totalBlocks)].map((_, i) => (
                    <div key={i} className={`y2k-progress-block ${i < activeBlocks ? 'active' : ''}`}></div>
                ))}
            </div>
        );
    };

    return (
        <div className={`dashboard-panel sys-stats ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`}>
            {theme === 'system7' ? (
                <div className="s7-titlebar">
                    <span className="s7-title-text">System Data</span>
                </div>
            ) : (
                <h2>
                    {theme === '90s' ? 'System Properties' :
                        theme === 'cyberpunk' ? 'CORE_DIAGNOSTICS' :
                            theme === 'fallout' ? 'ROBCO_SYS_MONITOR' :
                                theme === 'y2k' ? 'SYS_TELEMETRY // LIVE' :
                                    theme === 'cli' ? 'SYS_STAT' :
                                        'HARDWARE_MONITOR'}
                </h2>
            )}

            {theme !== 'fallout' && theme !== 'material' && theme !== 'cli' && theme !== 'system7' && (
                <div style={{ opacity: theme === '90s' ? 1 : 0.7, marginBottom: '15px', fontStyle: theme === '90s' ? 'normal' : 'italic' }}>
                    {theme === '90s' ? `Status:  ${status.replace('>', '').trim()}` : status}
                </div>
            )}

            {stats ? (
                <div style={{ lineHeight: '1.6' }}>
                    {theme === 'system7' ? (
                        <div className="s7-content" style={{ fontFamily: "'Geneva', sans-serif", fontSize: '11px', color: '#000' }}>
                            <div style={{ border: '1px solid #000', padding: '6px', background: '#fff', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: "'Chicago', sans-serif" }}>CPU Usage</span>
                                    <span>{stats.cpu_percent}%</span>
                                </div>
                                <div style={{ border: '1px solid #000', height: '12px', background: '#fff', marginBottom: '4px' }}>
                                    <div style={{ width: `${stats.cpu_percent}%`, height: '100%', background: '#000' }}></div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: "'Chicago', sans-serif" }}>Memory</span>
                                    <span>{stats.ram_used_mb}MB / {stats.ram_total_mb}MB</span>
                                </div>
                                <div style={{ border: '1px solid #000', height: '12px', background: '#fff' }}>
                                    <div style={{ width: `${stats.ram_percent}%`, height: '100%', background: 'repeating-linear-gradient(45deg, #000, #000 1px, #fff 1px, #fff 2px)' }}></div>
                                </div>
                            </div>
                            <div style={{ border: '1px solid #000', padding: '6px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: "'Chicago', sans-serif" }}>Thermal Core</span>
                                <span>{stats.temp_c > 0 ? `${stats.temp_c}°C` : 'Offline'}</span>
                            </div>
                        </div>
                    ) : theme === '90s' ? (
                        /* ... 90s Layout ... */
                        <div className="win95-stats-container">
                            <div className="win95-stat-row"><span>CPU Usage... ({stats.cpu_percent}%)</span>{drawWin95Bar(stats.cpu_percent)}</div>
                            <div className="win95-stat-row"><span>Memory allocated... {stats.ram_used_mb}MB / {stats.ram_total_mb}MB</span>{drawWin95Bar(stats.ram_percent)}</div>
                            <div className="win95-stat-row" style={{ marginTop: '5px' }}><span>Thermal Core: {stats.temp_c > 0 ? `${stats.temp_c}°C` : 'Offline'}</span></div>
                        </div>
                    ) : theme === 'cyberpunk' ? (
                        /* ... Cyberpunk Layout ... */
                        <div className="cp-hud-grid">
                            <div className="cp-hud-item"><div className="cp-hud-label">NEURAL_PROC <span>[{stats.cpu_percent}%]</span></div><div className="cp-hud-bar-bg"><div className="cp-hud-bar-fill" style={{ width: `${stats.cpu_percent}%` }}></div></div></div>
                            <div className="cp-hud-item"><div className="cp-hud-label">RAM_CAPACITY <span>[{stats.ram_percent}%]</span></div><div className="cp-hud-bar-bg"><div className="cp-hud-bar-fill" style={{ width: `${stats.ram_percent}%` }}></div></div></div>
                            <div className="cp-hud-item cp-thermal"><div className="cp-hud-label">THERMAL_CORE</div><div className={`cp-hud-value ${stats.temp_c > 60 ? 'cp-warning' : ''}`}>{stats.temp_c > 0 ? `${stats.temp_c}°C` : 'ERR_SENSOR'}{stats.temp_c > 60 && <span className="cp-warning-text"> // OVERHEAT</span>}</div></div>
                        </div>
                    ) : theme === 'fallout' ? (
                        /* ... Fallout Layout ... */
                        <div className="fo-stats-container">
                            <div className="fo-stat-line"><span className="fo-label">CPU_LOAD:</span><span>{drawFalloutBar(stats.cpu_percent)} {String(stats.cpu_percent).padStart(3, '0')}%</span></div>
                            <div className="fo-stat-line"><span className="fo-label">RAM_ALLOC:</span><span>{drawFalloutBar(stats.ram_percent)} {String(stats.ram_percent).padStart(3, '0')}%</span></div>
                            <div className="fo-stat-line"><span className="fo-label">MEM_PAGES:</span><span>{String(stats.ram_used_mb).padStart(4, '0')}MB / {stats.ram_total_mb}MB</span></div>
                            <div className="fo-stat-line"><span className="fo-label">CORE_TEMP:</span><span className={stats.temp_c > 60 ? 'fo-warning-blink' : ''}>{stats.temp_c > 0 ? `${stats.temp_c} DEG_C` : 'SENSOR_DEAD'}</span></div>
                        </div>
                    ) : theme === 'material' ? (
                        /* Material You Layout */
                        <div className="md-stats-container">
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>Device Health</h2>

                            <div className="md-stat-group">
                                <div className="md-stat-header"><span>CPU Load</span><span>{stats.cpu_percent}%</span></div>
                                <div className="md-progress-track"><div className="md-progress-fill" style={{ width: `${stats.cpu_percent}%` }}></div></div>
                            </div>

                            <div className="md-stat-group">
                                <div className="md-stat-header"><span>Memory</span><span>{stats.ram_percent}%</span></div>
                                <div className="md-progress-track"><div className="md-progress-fill" style={{ width: `${stats.ram_percent}%` }}></div></div>
                                <div className="md-stat-subtext">{stats.ram_used_mb} MB of {stats.ram_total_mb} MB</div>
                            </div>

                            <div className="md-stat-group" style={{ marginTop: '10px' }}>
                                <div className="md-stat-header">
                                    <span>Thermal Core</span>
                                    <span style={{ color: stats.temp_c > 60 ? '#FFB4AB' : 'inherit' }}>
                                        {stats.temp_c > 0 ? `${stats.temp_c}°C` : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : theme === 'y2k' ? (
                        /* ... Y2K Layout ... */
                        <div>
                            <div className="y2k-stat-row">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>CPU_USAGE:</span>
                                    <span style={{ color: 'var(--accent)' }}>{stats ? stats.cpu_percent : 0}%</span>
                                </div>
                                {drawY2KBar(stats ? stats.cpu_percent : 0)}
                            </div>
                            <div className="y2k-stat-row">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>MEMORY_ALLOC:</span>
                                    <span style={{ color: 'var(--accent)' }}>{stats ? stats.ram_percent : 0}%</span>
                                </div>
                                {drawY2KBar(stats ? stats.ram_percent : 0)}
                            </div>
                            <div className="y2k-stat-row">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>THERMAL_CORE:</span>
                                    <span style={{ color: stats && stats.temp_c > 75 ? '#ff0055' : 'var(--text)' }}>
                                        {stats ? stats.temp_c : 0}°C
                                    </span>
                                </div>
                                {drawY2KBar(stats ? (stats.temp_c / 85) * 100 : 0)}
                            </div>
                        </div>
                    ) : theme === 'cli' ? (
                        /* --- CLI / TUI LAYOUT --- */
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
                                root@mainframe:~# sysstat -a
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#888' }}>CPU_LOAD</span>
                                <span style={{ color: stats.cpu_percent > 85 ? '#ff5555' : '#00ff00', whiteSpace: 'pre' }}>
                                    {drawAsciiBar(stats.cpu_percent)} {String(stats.cpu_percent).padStart(3, ' ')}%
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#888' }}>RAM_ALLOC</span>
                                <span style={{ color: stats.ram_percent > 85 ? '#ff5555' : '#00ff00', whiteSpace: 'pre' }}>
                                    {drawAsciiBar(stats.ram_percent)} {String(stats.ram_percent).padStart(3, ' ')}%
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#888' }}>RAM_PAGES</span>
                                <span style={{ color: '#ffff55' }}>
                                    {String(stats.ram_used_mb).padStart(4, ' ')} / {stats.ram_total_mb} MB
                                </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#888' }}>CORE_TEMP</span>
                                <span style={{ color: stats.temp_c > 75 ? '#ff5555' : '#00ff00' }}>
                                    {stats.temp_c > 0 ? `${stats.temp_c}°C` : 'OFFLINE'}
                                    {stats.temp_c > 75 ? ' [WARN]' : ' [ OK ]'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        /* ... Default Layout ... */
                        <div>
                            <div>&gt; CPU LOAD: {drawAsciiBar(stats.cpu_percent)} {stats.cpu_percent}%</div>
                            <div>&gt; THERMAL CORE: {stats.temp_c > 0 ? `${stats.temp_c}°C` : 'SENSOR OFFLINE'}</div>
                            <div>&gt; RAM USAGE: {stats.ram_used_mb}MB / {stats.ram_total_mb}MB</div>
                            <div>&gt; RAM LEVEL: {drawAsciiBar(stats.ram_percent)} {stats.ram_percent}%</div>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ opacity: 0.5 }}>{theme === '90s' ? 'Calculating time remaining...' : theme === 'material' ? 'Syncing hardware data...' : '> WAITING FOR DATA PACKETS...'}</div>
            )}
        </div>
    );
}