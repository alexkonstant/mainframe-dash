import { useState, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function SystemControl() {
    const { theme, setTheme } = useContext(ThemeContext);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSystemAction = async (action) => {
        const warning = action === 'reboot'
            ? 'WARNING: Initiate system reboot?'
            : 'WARNING: Initiate complete system shutdown?';

        if (window.confirm(warning)) {
            setIsProcessing(true);
            try {
                // Adjust this endpoint if your Python backend uses a different route!
                await fetch(`/api/system/${action}`, { method: 'POST' });
            } catch (e) {
                console.error("System command failed", e);
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className={`dashboard-panel system-control ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>

            {/* Themed Headers */}
            {theme !== 'material' && theme !== 'cli' && (
                <h2>
                    {theme === '90s' ? 'Control Panel' :
                        theme === 'cyberpunk' ? 'SYS_CTRL // MASTER' :
                            theme === 'fallout' ? 'ROBCO_OS // SETTINGS' :
                                theme === 'y2k' ? 'SYS_CONFIG // CORE' :
                                    'SYSTEM_CONTROL'}
                </h2>
            )}
            {theme === 'cli' && <h2>ROOT_ACCESS</h2>}
            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>System Settings</h2>}

            {/* --- CLI / TUI TERMINAL LAYOUT --- */}
            {theme === 'cli' ? (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '15px' }}>
                        root@mainframe:~# sysconfig --env
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                        <span style={{ color: '#888' }}>ACTIVE_GUI_ENV</span>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            style={{
                                background: '#000', color: '#ffff55', border: '1px solid #555',
                                fontFamily: 'var(--font)', padding: '2px 4px', outline: 'none',
                                cursor: 'pointer', appearance: 'none', textAlign: 'right'
                            }}
                        >
                            <option value="default">[ tty0_default ]</option>
                            <option value="90s">[ win.com_95 ]</option>
                            <option value="cyberpunk">[ ncpd_net_v2 ]</option>
                            <option value="fallout">[ robco_os_89 ]</option>
                            <option value="material">[ md_shell_ui ]</option>
                            <option value="y2k">[ flash_gui_x ]</option>
                            <option value="cli">[ bash_tui_mode ]</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #555', paddingTop: '12px', marginTop: '10px' }}>
                        <button
                            onClick={() => handleSystemAction('reboot')}
                            disabled={isProcessing}
                            style={{ color: isProcessing ? '#888' : '#ffff55', background: 'transparent', border: 'none', cursor: isProcessing ? 'wait' : 'pointer', fontWeight: 'bold' }}
                        >
                            [ INIT_6_REBOOT ]
                        </button>
                        <button
                            onClick={() => handleSystemAction('shutdown')}
                            disabled={isProcessing}
                            style={{ color: isProcessing ? '#888' : '#ff5555', background: 'transparent', border: 'none', cursor: isProcessing ? 'wait' : 'pointer', fontWeight: 'bold' }}
                        >
                            [ INIT_0_HALT ]
                        </button>
                    </div>
                </div>
            ) : theme === 'y2k' ? (
                /* --- Y2K 2ADVANCED LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '10px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--accent)' }}></div>
                        <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '5px', letterSpacing: '1px' }}>ACTIVE_INTERFACE_THEME</div>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            style={{ width: '100%', background: '#070c16', color: '#7bbcd5', border: '1px solid #2a4b66', padding: '5px', fontSize: '10px', fontFamily: 'var(--font)', outline: 'none' }}
                        >
                            <option value="default">SYSTEM_DEFAULT</option>
                            <option value="90s">LEGACY_WIN95</option>
                            <option value="cyberpunk">NCPD_OVERLAY</option>
                            <option value="fallout">ROBCO_TERMINAL</option>
                            <option value="material">MATERIAL_YOU</option>
                            <option value="y2k">FLASH_Y2K (ACTIVE)</option>
                            <option value="cli">RAW_CLI_TERMINAL</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleSystemAction('reboot')} style={{ flex: 1, background: 'linear-gradient(180deg, #162942, #070c16)', border: '1px solid #2a4b66', color: '#7bbcd5', fontSize: '9px', padding: '6px', cursor: 'pointer', letterSpacing: '1px' }}>
                            [ SYS_REBOOT ]
                        </button>
                        <button onClick={() => handleSystemAction('shutdown')} style={{ flex: 1, background: 'linear-gradient(180deg, #421616, #160707)', border: '1px solid #662a2a', color: '#d57b7b', fontSize: '9px', padding: '6px', cursor: 'pointer', letterSpacing: '1px' }}>
                            [ HARD_SHUTDOWN ]
                        </button>
                    </div>
                </div>
            ) : theme === '90s' ? (
                /* --- 90s WINDOWS LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ color: '#000', fontSize: '12px' }}>Desktop Theme:</label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            style={{ background: '#fff', color: '#000', border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080', padding: '2px', fontFamily: 'Arial, sans-serif', fontSize: '12px', flexGrow: 1 }}
                        >
                            <option value="default">Windows Standard</option>
                            <option value="90s">Windows 95</option>
                            <option value="cyberpunk">Cyberpunk</option>
                            <option value="fallout">Fallout</option>
                            <option value="material">Material</option>
                            <option value="y2k">Y2K</option>
                            <option value="cli">MS-DOS Prompt</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #808080', paddingTop: '10px' }}>
                        <button onClick={() => handleSystemAction('reboot')} style={{ background: '#c0c0c0', color: '#000', borderTop: '1px solid #fff', borderLeft: '1px solid #fff', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 15px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                            Restart
                        </button>
                        <button onClick={() => handleSystemAction('shutdown')} style={{ background: '#c0c0c0', color: '#000', borderTop: '1px solid #fff', borderLeft: '1px solid #fff', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 15px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                            Shut Down...
                        </button>
                    </div>
                </div>
            ) : (
                /* --- DEFAULT / CP / FO / MD LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-input' : ''}
                        style={theme !== 'fallout' && theme !== 'material' ? { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '8px', fontFamily: 'var(--font)', cursor: 'pointer', fontSize: '1em' } : { width: '100%' }}
                    >
                        <option value="default">Default Theme</option>
                        <option value="90s">Windows 95 Theme</option>
                        <option value="cyberpunk">Cyberpunk 2077 Theme</option>
                        <option value="fallout">Fallout Theme</option>
                        <option value="material">Material You Theme</option>
                        <option value="y2k">Y2K / Flash Theme</option>
                        <option value="cli">CLI / TUI Theme</option>
                    </select>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            onClick={() => handleSystemAction('reboot')}
                            className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                            style={theme !== 'fallout' && theme !== 'material' ? { flex: 1, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '10px', cursor: 'pointer', fontWeight: 'bold' } : { flex: 1 }}
                        >
                            {theme === 'fallout' ? '[ REBOOT ]' : 'REBOOT'}
                        </button>
                        <button
                            onClick={() => handleSystemAction('shutdown')}
                            className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-active' : ''}
                            style={theme !== 'fallout' && theme !== 'material' ? { flex: 1, background: 'var(--accent)', color: 'var(--bg)', border: '1px solid var(--accent)', padding: '10px', cursor: 'pointer', fontWeight: 'bold' } : { flex: 1, background: '#FFB4AB', color: '#690005' }}
                        >
                            {theme === 'fallout' ? '[ SHUTDOWN ]' : 'SHUTDOWN'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}