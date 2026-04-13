import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function SysTime() {
    const [time, setTime] = useState(new Date());
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (theme === 'rickmorty') {
        return (
            <div style={{ background: 'rgba(10, 15, 20, 0.9)', border: '2px solid #97ce4c', borderRadius: '10px', boxShadow: '0 0 10px rgba(151, 206, 76, 0.4)', padding: '20px', color: '#97ce4c', fontFamily: "'Courier New', Courier, monospace", display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{ fontWeight: 'bold' }}>[ UNIVERSE_ID: C-137 ]</div>
                <div style={{ fontSize: '2.5em', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center' }}>
                    {time.toLocaleTimeString('en-US', { hour12: false })}
                </div>
                <div style={{ textAlign: 'center', opacity: 0.8, textTransform: 'uppercase' }}>
                    {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
        );
    }

    return (
        <div className={`dashboard-panel sys-time ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel md-panel-accent' : theme === 'system7' ? 's7-panel' : ''}`}>
            {theme === 'system7' ? (
                <div className="s7-titlebar">
                    <span className="s7-title-text">System Clock</span>
                </div>
            ) : theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'Date/Time Properties' :
                        theme === 'cyberpunk' ? 'LOCAL_CHRONO // SYNC' :
                            theme === 'fallout' ? 'ROBCO_OS // SYS_CLOCK' :
                                theme === 'cli' ? 'SYSTEM_CLOCK' :
                                    'SYS_TIME // LOCAL'}
                </h2>
            )}

            {theme === 'system7' ? (
                <div className="s7-content" style={{ fontFamily: "'Geneva', sans-serif", fontSize: '11px', color: '#000' }}>
                    <div style={{ border: '1px solid #000', padding: '6px', background: '#fff', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: "'Chicago', sans-serif" }}>Time</span>
                            <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: "'Chicago', sans-serif" }}>Date</span>
                            <span>{time.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                            <button 
                                onMouseDown={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; }}
                                onMouseUp={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                                style={{
                                    border: '1px solid #000', 
                                    borderRadius: '4px', 
                                    background: '#fff', 
                                    color: '#000', 
                                    boxShadow: '1px 1px 0px #000', 
                                    fontFamily: "'Geneva', sans-serif", 
                                    fontSize: '10px',
                                    padding: '2px 8px', 
                                    cursor: 'pointer',
                                    transition: 'none'
                                }}
                            >
                                Sync
                            </button>
                        </div>
                    </div>
                </div>
            ) : theme === '90s' ? (
                <div className="win95-dialog-body">
                    <fieldset className="win95-groupbox">
                        <legend>Current Time</legend>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="win95-sunken-input">
                                {time.toLocaleTimeString('en-US', { hour12: false })}
                                <div className="win95-spinner"><div className="spin-btn">▲</div><div className="spin-btn">▼</div></div>
                            </div>
                            <span style={{ color: '#000' }}>EET / Local</span>
                        </div>
                    </fieldset>
                    <fieldset className="win95-groupbox" style={{ marginTop: '15px' }}>
                        <legend>Current Date</legend>
                        <div style={{ color: '#000', padding: '5px' }}>{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </fieldset>
                </div>
            ) : theme === 'cyberpunk' ? (
                <div className="cp-time-container">
                    <div className="cp-time-large">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
                    <div className="cp-date-small">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    <div className="cp-hex-deco">SYS_TICK: 0x{Math.floor(time.getTime()/1000).toString(16).toUpperCase()}</div>
                </div>
            ) : theme === 'fallout' ? (
                <div className="fo-chrono-container">
                    <div style={{ opacity: 0.8, marginBottom: '10px' }}>&gt; SYNC_ESTABLISHED</div>
                    <div className="fo-time-large">{time.toLocaleTimeString('en-US', { hour12: false })}<span className="fo-cursor">█</span></div>
                    <div className="fo-date-small">[{time.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}]</div>
                </div>
            ) : theme === 'material' ? (
                /* Material You Clock Widget */
                <div className="md-chrono-container">
                    <div className="md-time">{time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="md-date">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                </div>
            ) : theme === 'y2k' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '5px 0' }}>
                    <div style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '4px', marginBottom: '5px' }}>LOCAL_CHRONO_SYNC</div>
                    <div style={{ fontSize: '38px', color: '#ffffff', textShadow: '0 0 15px rgba(123, 188, 213, 0.6)', lineHeight: 1, fontWeight: 'bold' }}>
                        {time.toLocaleTimeString('en-US', { hour12: false })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', width: '100%' }}>
                        <div style={{ flex: 1, height: '1px', background: '#2a4b66', marginRight: '10px' }}></div>
                        <div style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--text)' }}>
                            {time.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
                        </div>
                    </div>
                    <div style={{ fontSize: '9px', color: '#2a4b66', marginTop: '10px', fontFamily: 'monospace' }}>
                        UNIX_TS: {Math.floor(time.getTime() / 1000)}
                    </div>
                </div>
            ) : theme === 'cli' ? (
                /* --- CLI / TUI LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
                        C:\&gt; chrony stat
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px' }}>
                        <span style={{ color: '#888' }}>LOCAL_DATE</span>
                        <span style={{ color: '#fff' }}>{time.toLocaleDateString('sv-SE')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#888' }}>LOCAL_TIME</span>
                        <span style={{ color: '#fff', fontSize: '18px' }}>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #555', paddingBottom: '6px', marginBottom: '8px' }}>
                        <span style={{ color: '#888' }}>UNIX_EPOCH</span>
                        <span style={{ color: '#ffff55' }}>{Math.floor(time.getTime() / 1000)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                        <span style={{ color: '#888' }}>NTP_STATUS</span>
                        <span style={{ color: '#00ff00' }}>[ OK ]</span>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ fontSize: '2.5em', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center', margin: '15px 0' }}>{time.toLocaleTimeString('en-US', { hour12: false })}</div>
                    <div style={{ textAlign: 'center', opacity: 0.8, textTransform: 'uppercase' }}>{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </>
            )}
        </div>
    );
}