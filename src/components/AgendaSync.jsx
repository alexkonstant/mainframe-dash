import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function AgendaSync() {
    const [agenda, setAgenda] = useState([]);
    const [status, setStatus] = useState("> Syncing calendar...");
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchAgenda = () => {
            fetch('/api/calendar')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setAgenda(data.events || []);
                        setStatus("> Schedule synchronized.");
                    }
                })
                .catch(() => setStatus("> ERR_CALENDAR_OFFLINE"));
        };

        fetchAgenda();
        const interval = setInterval(fetchAgenda, 600000); // 10 mins
        return () => clearInterval(interval);
    }, []);

    if (theme === 'rickmorty') {
        return (
            <div className="dashboard-panel agenda-sync" style={{
                background: 'rgba(10, 15, 20, 0.9)',
                border: '2px solid #97ce4c',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(151, 206, 76, 0.4)',
                marginBottom: '20px',
                padding: '20px',
                fontFamily: 'monospace',
                color: '#97ce4c'
            }}>
                <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>// MULTIVERSE_TIMELINE</div>
                {agenda && agenda.length > 0 ? agenda.map((item, i) => (
                    <div key={i} style={{ display: 'flex', borderBottom: '1px dashed #97ce4c', padding: '10px 0' }}>
                        <span style={{ color: '#e4a788', width: '120px', flexShrink: 0 }}>{item.display || '??/??'}</span>
                        <span style={{ flex: 1 }}>{item.summary || 'UNKNOWN_EVENT'}</span>
                    </div>
                )) : (
                    <div style={{ fontStyle: 'italic', marginTop: '10px' }}> No temporal disturbances detected.</div>
                )}
            </div>
        );
    }

    return (
        <div className={`dashboard-panel agenda-sync ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`}>

            {/* Themed Headers */}
            {theme === 'system7' ? (
                <div className="s7-titlebar">
                    <span className="s7-title-text">Task Scheduler</span>
                </div>
            ) : theme !== 'material' && theme !== 'cli' && (
                <h2>
                    {theme === '90s' ? 'Task Scheduler' :
                        theme === 'cyberpunk' ? 'PERSONAL_LOG // AGENDA' :
                            theme === 'fallout' ? 'ROBCO_OS // HOLOTAPE_LOG' :
                                theme === 'y2k' ? 'SYS_CRON // EVENT_LOG' :
                                    'AGENDA // SYNC'}
                </h2>
            )}

            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>Upcoming</h2>}

            {/* Default Status Text */}
            {theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && theme !== 'cli' && theme !== '90s' && theme !== 'system7' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
            )}

            {/* Y2K Status Header Override */}
            {theme === 'y2k' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>EVENT_INDEX</span>
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>[ {agenda.length} LOGS ]</span>
                </div>
            )}

            {/* --- CLI / TUI LAYOUT --- */}
            {theme === 'system7' ? (
                <div className="s7-content" style={{ fontFamily: "'Geneva', sans-serif", fontSize: '11px', color: '#000' }}>
                    <div style={{ border: '1px solid #000', background: '#fff', padding: '2px' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '2px', fontFamily: "'Chicago', sans-serif" }}>
                            <span style={{ width: '80px', paddingLeft: '4px' }}>Date/Time</span>
                            <span style={{ flex: 1 }}>Event</span>
                        </div>
                        {agenda && agenda.length > 0 ? agenda.map((item, i) => (
                            <div key={i} style={{ display: 'flex', borderBottom: i === agenda.length - 1 ? 'none' : '1px dotted #000', padding: '4px' }}>
                                <span style={{ width: '80px' }}>{item.display || '??/??'}</span>
                                <span style={{ flex: 1 }}>{item.summary || 'UNKNOWN_EVENT'}</span>
                            </div>
                        )) : (
                            <div style={{ padding: '4px', fontStyle: 'italic' }}>No tasks found.</div>
                        )}
                    </div>
                </div>
            ) : theme === 'cli' ? (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
                        root@mainframe:~# cat /var/spool/cron/agenda.log
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', borderBottom: '1px dashed #555', paddingBottom: '4px', marginBottom: '4px', color: '#888', fontSize: '12px' }}>
                            <span style={{ width: '110px' }}>TIMESTAMP</span>
                            <span style={{ flex: 1 }}>PROCESS_DESCRIPTION</span>
                        </div>

                        {agenda && agenda.length > 0 ? agenda.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', color: '#c0c0c0', marginBottom: '6px' }}>
                                <div style={{ width: '110px', display: 'flex', flexDirection: 'column' }}>
                                    <span style={{
                                        color: '#ffff55',
                                        fontWeight: 'bold',
                                        fontSize: '13px'
                                    }}>
                                        [{item.display || '??/??'}]
                                    </span>
                                </div>
                                <span style={{ flex: 1, paddingLeft: '10px', lineHeight: '1.4' }}>
                                    {(item.summary || 'UNKNOWN_EVENT').toUpperCase()}
                                </span>
                            </div>
                        )) : (
                            <div style={{ color: '#555', fontStyle: 'italic', marginTop: '10px' }}>
                                EOF: No scheduled tasks found.
                            </div>
                        )}
                    </div>
                </div>
            ) : agenda && agenda.length > 0 ? (
                <div className={theme === '90s' ? 'win95-listbox' : theme === 'cyberpunk' ? 'cp-agenda-list' : theme === 'fallout' ? 'fo-agenda-list' : theme === 'material' ? 'md-agenda-list' : ''} style={theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { display: 'flex', flexDirection: 'column', gap: '15px' } : {}}>
                    {agenda.map((item, i) => (
                        theme === '90s' ? (
                            <div key={i} style={{ padding: '4px', borderBottom: '1px dotted #c0c0c0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <img src="https://win98icons.alexmeub.com/icons/png/notepad-1.png" alt="task" style={{ width: '16px', height: '16px', marginTop: '2px' }} />
                                <div>
                                    <div style={{ color: '#000', fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>{item.summary || 'UNKNOWN_EVENT'}</div>
                                    <div style={{ color: '#808080', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
                                        {item.display || '??/??'}
                                    </div>
                                </div>
                            </div>
                        ) : theme === 'y2k' ? (
                            <div key={i} style={{
                                background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '8px',
                                marginBottom: '8px', position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--accent)' }}></div>
                                <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.display?.toUpperCase() || '??/??'}</span>
                                    <span>ID_0{i + 1}</span>
                                </div>
                                <div style={{ color: '#fff', fontSize: '10px', lineHeight: '1.4', fontWeight: 'bold' }}>
                                    {item.summary?.toUpperCase() || 'UNKNOWN_EVENT'}
                                </div>
                            </div>
                        ) : theme === 'cyberpunk' ? (
                            <div key={i} className="cp-agenda-item">
                                <div className="cp-agenda-date">
                                    {item.display?.toUpperCase() || '??/??'}
                                </div>
                                <div className="cp-agenda-title">{item.summary || 'UNKNOWN_EVENT'}</div>
                            </div>
                        ) : theme === 'fallout' ? (
                            <div key={i} className="fo-agenda-item">
                                <div>&gt; {item.display?.toUpperCase() || '??/??'}</div>
                                <div style={{ marginLeft: '15px' }}>{item.summary?.toUpperCase() || 'UNKNOWN_EVENT'}</div>
                            </div>
                        ) : theme === 'material' ? (
                            <div key={i} className="md-agenda-card">
                                <div className="md-agenda-date">
                                    <span>
                                        {item.display || '??/??'}
                                    </span>
                                </div>
                                <div className="md-agenda-title">{item.summary || 'UNKNOWN_EVENT'}</div>
                            </div>
                        ) : (
                            <div key={i} style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '10px' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                                    {item.display || '??/??'}
                                </div>
                                <div>{item.summary || 'UNKNOWN_EVENT'}</div>
                            </div>
                        )
                    ))}
                </div>
            ) : (
                <div style={{ opacity: 0.5 }}>{theme === '90s' ? 'No tasks found.' : theme === 'material' ? 'No events scheduled.' : '> NO EVENTS DETECTED'}</div>
            )}
        </div>
    );
}