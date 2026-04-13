import { useState, useContext, useEffect, useRef } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function SystemControl() {
    const { theme } = useContext(ThemeContext);
    const [isProcessing, setIsProcessing] = useState(false);
    const [updateStatus, setUpdateStatus] = useState('idle');
    const [updateLogs, setUpdateLogs] = useState([]);
    const logContainerRef = useRef(null);

    useEffect(() => {
        let interval;
        if (updateStatus === 'running') {
            interval = setInterval(async () => {
                try {
                    const res = await fetch('/api/system/update/poll');
                    const data = await res.json();
                    if (data.status) {
                        setUpdateStatus(data.status);
                        if (data.logs) setUpdateLogs(data.logs);
                    }
                } catch (e) {
                    console.error("Poll failed", e);
                }
            }, 1500);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [updateStatus]);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [updateLogs]);

    const handleUpdate = async () => {
        if (window.confirm("WARNING: Initiate system update?")) {
            setUpdateStatus('running');
            try {
                await fetch('/api/system/update/start', { method: 'POST' });
            } catch (e) {
                console.error("Start update failed", e);
                setUpdateStatus('idle');
            }
        }
    };

    const handleSystemAction = async (action) => {
        const warning = action === 'reboot'
            ? 'WARNING: Initiate system reboot?'
            : 'WARNING: Initiate complete system shutdown?';

        if (window.confirm(warning)) {
            setIsProcessing(true);
            try {
                // Adjust this endpoint if your Python backend uses a different route!
                await fetch('/api/system/control', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action })
                });
            } catch (e) {
                console.error("System command failed", e);
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className={`dashboard-panel system-control ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`}>

            {/* Themed Headers */}
            {theme === 'system7' ? (
                <div className="s7-titlebar">
                    <span className="s7-title-text">Control Panel</span>
                </div>
            ) : theme !== 'material' && theme !== 'cli' && (
                <h2>
                    {theme === '90s' ? 'Control Panel' :
                        theme === 'cyberpunk' ? 'SYS_CTRL // MASTER' :
                            theme === 'fallout' ? 'ROBCO_OS // SETTINGS' :
                                theme === 'y2k' ? 'SYS_CONFIG // CORE' :
                                    theme === 'rickmorty' ? '// PORTAL_UPLINK' :
                                    'SYSTEM_CONTROL'}
                </h2>
            )}
            {theme === 'cli' && <h2>ROOT_ACCESS</h2>}
            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>System Settings</h2>}

            {/* --- RICK & MORTY LAYOUT --- */}
            {theme === 'rickmorty' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            onClick={() => handleSystemAction('reboot')}
                            style={{ flex: 1, background: '#0d1117', color: '#97ce4c', border: '2px solid #97ce4c', padding: '10px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#97ce4c'; e.currentTarget.style.color = '#0d1117'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#0d1117'; e.currentTarget.style.color = '#97ce4c'; }}
                        >
                            [ REBOOT_UNIVERSE ]
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={updateStatus === 'running'}
                            style={{ flex: 1, background: '#0d1117', color: '#97ce4c', border: '2px solid #97ce4c', padding: '10px', cursor: updateStatus === 'running' ? 'wait' : 'pointer', fontWeight: 'bold', borderRadius: '8px' }}
                            onMouseEnter={(e) => { if(updateStatus !== 'running') { e.currentTarget.style.background = '#97ce4c'; e.currentTarget.style.color = '#0d1117'; } }}
                            onMouseLeave={(e) => { if(updateStatus !== 'running') { e.currentTarget.style.background = '#0d1117'; e.currentTarget.style.color = '#97ce4c'; } }}
                        >
                            [ SYNC_MULTIVERSE ]
                        </button>
                        <button
                            onClick={() => handleSystemAction('shutdown')}
                            style={{ flex: 1, background: '#0d1117', color: '#e4a788', border: '2px solid #e4a788', padding: '10px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#e4a788'; e.currentTarget.style.color = '#0d1117'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#0d1117'; e.currentTarget.style.color = '#e4a788'; }}
                        >
                            [ DESTROY_UNIVERSE ]
                        </button>
                    </div>
                </div>
            ) : theme === 'cli' ? (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '15px' }}>
                        root@mainframe:~# sysconfig --env
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
                            onClick={handleUpdate}
                            disabled={updateStatus === 'running'}
                            style={{ color: updateStatus === 'running' ? '#888' : '#55ff55', background: 'transparent', border: 'none', cursor: updateStatus === 'running' ? 'wait' : 'pointer', fontWeight: 'bold' }}
                        >
                            [ INSTALL UPDATES ]
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
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleSystemAction('reboot')} style={{ flex: 1, background: 'linear-gradient(180deg, #162942, #070c16)', border: '1px solid #2a4b66', color: '#7bbcd5', fontSize: '9px', padding: '6px', cursor: 'pointer', letterSpacing: '1px' }}>
                            [ SYS_REBOOT ]
                        </button>
                        <button onClick={handleUpdate} disabled={updateStatus === 'running'} style={{ flex: 1, background: 'linear-gradient(180deg, #164229, #07160c)', border: '1px solid #2a664b', color: '#7bd59c', fontSize: '9px', padding: '6px', cursor: updateStatus === 'running' ? 'wait' : 'pointer', letterSpacing: '1px' }}>
                            [ INSTALL UPDATES ]
                        </button>
                        <button onClick={() => handleSystemAction('shutdown')} style={{ flex: 1, background: 'linear-gradient(180deg, #421616, #160707)', border: '1px solid #662a2a', color: '#d57b7b', fontSize: '9px', padding: '6px', cursor: 'pointer', letterSpacing: '1px' }}>
                            [ HARD_SHUTDOWN ]
                        </button>
                    </div>
                </div>
            ) : theme === '90s' ? (
                /* --- 90s WINDOWS LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '5px' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #808080', paddingTop: '10px' }}>
                        <button onClick={() => handleSystemAction('reboot')} style={{ background: '#c0c0c0', color: '#000', borderTop: '1px solid #fff', borderLeft: '1px solid #fff', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 15px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                            Restart
                        </button>
                        <button onClick={handleUpdate} disabled={updateStatus === 'running'} style={{ background: '#c0c0c0', color: '#000', borderTop: '1px solid #fff', borderLeft: '1px solid #fff', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 15px', cursor: updateStatus === 'running' ? 'wait' : 'pointer', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                            INSTALL UPDATES
                        </button>
                        <button onClick={() => handleSystemAction('shutdown')} style={{ background: '#c0c0c0', color: '#000', borderTop: '1px solid #fff', borderLeft: '1px solid #fff', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 15px', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                            Shut Down...
                        </button>
                    </div>
                </div>
            ) : theme === 'system7' ? (
                <div className="s7-content" style={{ fontFamily: "'Geneva', sans-serif", fontSize: '11px', color: '#000' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px dotted #000', paddingTop: '8px' }}>
                        <button
                            onMouseDown={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; }}
                            onMouseUp={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                            onClick={() => handleSystemAction('reboot')}
                            style={{ border: '1px solid #000', borderRadius: '4px', background: '#fff', color: '#000', boxShadow: '1px 1px 0px #000', fontFamily: "'Geneva', sans-serif", padding: '2px 8px', cursor: 'pointer', fontSize: '11px', transition: 'none' }}
                        >
                            Restart
                        </button>
                        <button
                            onMouseDown={(e) => { if(updateStatus !== 'running') { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; } }}
                            onMouseUp={(e) => { if(updateStatus !== 'running') { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; } }}
                            onMouseLeave={(e) => { if(updateStatus !== 'running') { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; } }}
                            onClick={handleUpdate}
                            disabled={updateStatus === 'running'}
                            style={{ border: '1px solid #000', borderRadius: '4px', background: '#fff', color: '#000', boxShadow: updateStatus === 'running' ? 'none' : '1px 1px 0px #000', fontFamily: "'Geneva', sans-serif", padding: '2px 8px', cursor: updateStatus === 'running' ? 'wait' : 'pointer', fontSize: '11px', transition: 'none' }}
                        >
                            INSTALL UPDATES
                        </button>
                        <button
                            onMouseDown={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; }}
                            onMouseUp={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                            onClick={() => handleSystemAction('shutdown')}
                            style={{ border: '1px solid #000', borderRadius: '4px', background: '#fff', color: '#000', boxShadow: '1px 1px 0px #000', fontFamily: "'Geneva', sans-serif", padding: '2px 8px', cursor: 'pointer', fontSize: '11px', transition: 'none' }}
                        >
                            Shut Down...
                        </button>
                    </div>
                </div>
            ) : (
                /* --- DEFAULT / CP / FO / MD LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
                            onClick={() => handleSystemAction('reboot')}
                            className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                            style={theme !== 'fallout' && theme !== 'material' ? { flex: 1, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '10px', cursor: 'pointer', fontWeight: 'bold' } : { flex: 1 }}
                        >
                            {theme === 'fallout' ? '[ REBOOT ]' : 'REBOOT'}
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={updateStatus === 'running'}
                            className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                            style={theme !== 'fallout' && theme !== 'material' ? { flex: 1, background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '10px', cursor: updateStatus === 'running' ? 'wait' : 'pointer', fontWeight: 'bold' } : { flex: 1 }}
                        >
                            {theme === 'fallout' ? '[ INSTALL UPDATES ]' : 'INSTALL UPDATES'}
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

            {/* --- UPDATE LOG MODAL --- */}
            {(updateStatus === 'running' || updateStatus === 'done') && (
                <div style={{
                    marginTop: '20px',
                    padding: '10px',
                    border: theme === 'system7' ? '2px solid' : theme === 'cyberpunk' ? '1px solid var(--accent)' : theme === 'rickmorty' ? '2px solid #97ce4c' : '1px solid #555',
                    borderColor: theme === 'system7' ? '#888 #fff #fff #888' : undefined,
                    background: theme === 'cyberpunk' ? 'rgba(0, 0, 0, 0.7)' : theme === 'system7' ? '#fff' : theme === 'rickmorty' ? '#000' : '#111',
                    color: theme === 'system7' ? '#000' : theme === 'rickmorty' ? '#97ce4c' : 'var(--accent)',
                    fontFamily: theme === 'system7' ? "'Geneva', sans-serif" : 'var(--font)',
                    fontSize: '12px'
                }}>
                    <div style={{ marginBottom: '10px' }}>
                        {updateStatus === 'running' ? '> Update in progress...' : '> Update complete.'}
                    </div>
                    {/* Animated Progress Bar */}
                    <div style={{ width: '100%', height: '10px', background: theme === 'rickmorty' ? '#111' : '#333', marginBottom: '10px', position: 'relative', overflow: 'hidden', border: theme === 'system7' ? '1px solid #000' : 'none' }}>
                        <div style={{
                            width: updateStatus === 'done' ? '100%' : '50%',
                            height: '100%',
                            background: theme === 'cyberpunk' ? 'var(--accent)' : theme === 'system7' ? '#000' : theme === 'rickmorty' ? '#97ce4c' : '#4CAF50',
                            animation: updateStatus === 'running' ? 'pulse 1.5s infinite alternate' : 'none',
                            transition: 'width 0.3s'
                        }}></div>
                    </div>
                    <style>{`
                        @keyframes pulse {
                            from { opacity: 0.6; width: 30%; }
                            to { opacity: 1; width: 80%; }
                        }
                    `}</style>
                    <pre ref={logContainerRef} style={{
                        maxHeight: '250px',
                        overflowY: 'auto',
                        background: theme === 'system7' ? '#fff' : '#000',
                        color: theme === 'system7' ? '#000' : theme === 'rickmorty' ? '#97ce4c' : '#ccc',
                        padding: '5px',
                        border: theme === 'system7' ? '1px inset #000' : '1px solid #333',
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        fontFamily: 'monospace'
                    }}>
                        {updateLogs.join('\n')}
                    </pre>
                </div>
            )}
        </div>
    );
}