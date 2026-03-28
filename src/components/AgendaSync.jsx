import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function AgendaSync() {
    const [agenda, setAgenda] = useState([]);
    const [status, setStatus] = useState("> Syncing calendar...");
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchAgenda = () => {
            fetch('/api/agenda')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setAgenda(data.agenda);
                        setStatus("> Schedule synchronized.");
                    }
                })
                .catch(() => setStatus("> ERR_CALENDAR_OFFLINE"));
        };

        fetchAgenda();
        const interval = setInterval(fetchAgenda, 600000); // 10 mins
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`dashboard-panel agenda-sync ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>

            {/* Themed Headers */}
            {theme !== 'material' && theme !== 'cli' && (
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
            {theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && theme !== 'cli' && theme !== '90s' && (
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
            {theme === 'cli' ? (
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
                                        color: item.day === 'Today' ? '#00ff00' : '#ffff55',
                                        fontWeight: 'bold',
                                        fontSize: '13px'
                                    }}>
                                        [{item.day === 'Today' ? 'TODAY' : item.day === 'Tomorrow' ? 'TMRW' : item.day.toUpperCase()}]
                                    </span>
                                    {item.time && (
                                        <span style={{ color: '#888', fontSize: '12px', marginLeft: '4px' }}>
                                            {item.time}
                                        </span>
                                    )}
                                </div>
                                <span style={{ flex: 1, paddingLeft: '10px', lineHeight: '1.4' }}>
                                    {item.title.toUpperCase()}
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
                                    <div style={{ color: '#000', fontSize: '13px', fontFamily: 'Arial, sans-serif' }}>{item.title}</div>
                                    <div style={{ color: '#808080', fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
                                        {item.day}{item.time ? `, ${item.time}` : ''}
                                    </div>
                                </div>
                            </div>
                        ) : theme === 'y2k' ? (
                            <div key={i} style={{
                                background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '8px',
                                marginBottom: '8px', position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: item.day === 'Today' ? '#ff0055' : 'var(--accent)' }}></div>
                                <div style={{ fontSize: '9px', color: item.day === 'Today' ? '#ff0055' : 'var(--accent)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{item.day.toUpperCase()} {item.time && `// ${item.time}`}</span>
                                    <span>ID_0{i + 1}</span>
                                </div>
                                <div style={{ color: '#fff', fontSize: '10px', lineHeight: '1.4', fontWeight: 'bold' }}>
                                    {item.title.toUpperCase()}
                                </div>
                            </div>
                        ) : theme === 'cyberpunk' ? (
                            <div key={i} className="cp-agenda-item">
                                <div className="cp-agenda-date">
                                    {item.day === 'Today' ? 'URGENT // TODAY' : item.day.toUpperCase()}
                                    {item.time && <span className="cp-agenda-time"> // {item.time}</span>}
                                </div>
                                <div className="cp-agenda-title">{item.title}</div>
                            </div>
                        ) : theme === 'fallout' ? (
                            <div key={i} className="fo-agenda-item">
                                <div>&gt; {item.day === 'Today' ? 'TODAY' : item.day === 'Tomorrow' ? 'TOMORROW' : item.day.toUpperCase()}</div>
                                <div style={{ marginLeft: '15px' }}>{item.time && `[${item.time}] `}{item.title.toUpperCase()}</div>
                            </div>
                        ) : theme === 'material' ? (
                            <div key={i} className="md-agenda-card">
                                <div className="md-agenda-date">
                                    <span style={{ fontWeight: item.day === 'Today' ? 'bold' : 'normal', color: item.day === 'Today' ? 'var(--accent)' : 'inherit' }}>
                                        {item.day}
                                    </span>
                                    {item.time && <span className="md-agenda-time">{item.time}</span>}
                                </div>
                                <div className="md-agenda-title">{item.title}</div>
                            </div>
                        ) : (
                            <div key={i} style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '10px' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                                    {item.day === 'Today' ? 'TODAY' : item.day === 'Tomorrow' ? 'TOMORROW' : item.day}
                                    {item.time && <span style={{ opacity: 0.7, fontWeight: 'normal' }}> @ {item.time}</span>}
                                </div>
                                <div>{item.title}</div>
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