import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function AgendaSync() {
    const [events, setEvents] = useState([]);
    const [status, setStatus] = useState("> Synchronizing schedule...");
    const [currentTime, setCurrentTime] = useState(new Date());
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchCalendar = () => {
            fetch('/api/calendar')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setEvents(data.events);
                        setStatus("> Schedule synchronized.");
                    } else if (data.message === "ERR_NO_ICS_LINK") {
                        setStatus("> ERR_MISSING_ICS_URL");
                    }
                })
                .catch(() => setStatus("> ERR_CALENDAR_OFFLINE"));
        };

        fetchCalendar();
        const fetchInterval = setInterval(fetchCalendar, 900000);
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000);

        return () => {
            clearInterval(fetchInterval);
            clearInterval(timeInterval);
        };
    }, []);

    const uniqueEvents = events.filter((event, index, self) =>
        index === self.findIndex((e) => (
            e.display === event.display && e.summary === event.summary
        ))
    );

    const renderEvent = (e, idx) => {
        const yyyy = currentTime.getFullYear();
        const mm = String(currentTime.getMonth() + 1).padStart(2, '0');
        const dd = String(currentTime.getDate()).padStart(2, '0');
        const hh = String(currentTime.getHours()).padStart(2, '0');
        const min = String(currentTime.getMinutes()).padStart(2, '0');

        const todayStr = `${yyyy}${mm}${dd}`;
        const nowStr = `${todayStr}${hh}${min}00`;

        const isToday = e.sort.startsWith(todayStr);
        const isAllDay = e.display.includes("ALL DAY");
        const isPast = e.sort < nowStr && !isAllDay;

        if (theme === '90s') { /* ... 90s ... */
            return <div key={idx} className="win95-list-row" style={{ opacity: isPast ? 0.5 : 1, textDecoration: isPast ? 'line-through' : 'none' }}><div className="col-time">{e.display}</div><div className="col-event">{e.summary}</div></div>;
        }

        if (theme === 'cyberpunk') { /* ... CP ... */
            return <div key={idx} className={`cp-agenda-item ${isPast ? 'cp-agenda-past' : ''}`}><div className="cp-agenda-time">{e.display}</div><div className="cp-agenda-desc">{e.summary}</div><div className="cp-agenda-status">{isPast ? '[ COMPLETED ]' : '[ PENDING ]'}</div></div>;
        }

        if (theme === 'fallout') { /* ... FO ... */
            return <div key={idx} className={`fo-quest-item ${isPast ? 'fo-quest-past' : ''}`}><div className="fo-quest-box">{isPast ? '[X]' : '[ ]'}</div><div className="fo-quest-details"><span className="fo-quest-time">{e.display}</span><span className="fo-quest-title">{e.summary.toUpperCase()}</span></div></div>;
        }

        if (theme === 'y2k') {
            return (
                <div key={idx} style={{
                    display: 'flex',
                    padding: '8px 5px',
                    background: idx % 2 === 0 ? 'rgba(0,0,0,0.3)' : 'rgba(123,188,213,0.05)',
                    borderLeft: `2px solid var(--accent)`,
                    marginBottom: '4px',
                    opacity: isPast ? 0.5 : 1
                }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 'bold', textDecoration: isPast ? 'line-through' : 'none' }}>
                            {e.summary}
                        </div>
                        <div style={{ fontSize: '9px', color: 'var(--accent)', marginTop: '4px' }}>
                            {e.display}
                        </div>
                    </div>
                </div>
            );
        }

        if (theme === 'material') {
            /* Material You Event Card */
            return (
                <div key={idx} className={`md-agenda-card ${isPast ? 'md-agenda-past' : ''}`}>
                    <div className="md-agenda-time">{e.display}</div>
                    <div className="md-agenda-title">{e.summary}</div>
                </div>
            );
        }

        // Terminal Rendering
        let style = { marginBottom: '5px' };
        let prefix = ">";
        if (isPast && isToday) { style.textDecoration = 'line-through'; style.opacity = 0.4; }
        else if (isToday) { style.color = 'var(--accent)'; style.fontWeight = 'bold'; style.textShadow = '0 0 5px var(--accent)'; prefix = ">>"; }
        return <div key={idx} style={style}>{prefix} [{e.display}] {e.summary}</div>;
    };

    return (
        <div className={`dashboard-panel agenda-sync ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'C:\\Windows\\Schedule' :
                        theme === 'cyberpunk' ? 'OP_LOG // UPCOMING_TASKS' :
                            theme === 'fallout' ? 'PIP-OS // QUEST_LOG' :
                                theme === 'y2k' ? 'DATABANK // TASK_QUEUE' :
                                    'AGENDA // SYNC'}
                </h2>
            )}

            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>Upcoming Schedule</h2>}

            {theme === 'y2k' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--accent)', paddingBottom: '5px', marginBottom: '10px', fontSize: '10px' }}>
                    <span>EVENT_ID</span>
                    <span>T-MINUS</span>
                </div>
            )}

            {theme !== '90s' && theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>}
            <div className={theme === '90s' ? 'win95-explorer-body' : theme === 'material' ? 'md-agenda-list' : ''}>
                {uniqueEvents.length > 0 ? (
                    <div style={{ padding: 0, margin: 0, lineHeight: '1.6' }}>
                        {uniqueEvents.map((e, idx) => renderEvent(e, idx))}
                    </div>
                ) : (
                    <div style={{ opacity: 0.5, padding: theme === '90s' ? '10px' : '0' }}>
                        {status === "> ERR_MISSING_ICS_URL" ? "Insert Google Calendar link." : theme === 'material' ? "Your schedule is clear." : "No active objectives."}
                    </div>
                )}
            </div>
        </div>
    );
}