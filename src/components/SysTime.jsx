import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function SysTime() {
    const [time, setTime] = useState(new Date());
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`dashboard-panel sys-time ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel md-panel-accent' : ''}`}>
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'Date/Time Properties' : 
                     theme === 'cyberpunk' ? 'LOCAL_CHRONO // SYNC' : 
                     theme === 'fallout' ? 'ROBCO_OS // SYS_CLOCK' :
                     'SYS_TIME // LOCAL'}
                </h2>
            )}
            
            {theme === '90s' ? (
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
            ) : (
                <>
                    <div style={{ fontSize: '2.5em', fontWeight: 'bold', letterSpacing: '2px', textAlign: 'center', margin: '15px 0' }}>{time.toLocaleTimeString('en-US', { hour12: false })}</div>
                    <div style={{ textAlign: 'center', opacity: 0.8, textTransform: 'uppercase' }}>{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </>
            )}
        </div>
    );
}