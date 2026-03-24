import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function DataVault() {
    const [lore, setLore] = useState(null);
    const [status, setStatus] = useState("> Accessing archives...");
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchLore = () => {
            fetch('/api/lore')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        setLore(data.quote);
                        setStatus("> Decryption complete.");
                    }
                })
                .catch(() => setStatus("> ERR_ARCHIVE_LOCKED"));
        };

        fetchLore();
        const interval = setInterval(fetchLore, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`dashboard-panel data-vault ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
            {theme !== 'material' && (
                <h2>
                    {theme === '90s' ? 'Untitled - Notepad' :
                        theme === 'cyberpunk' ? 'SECURE_ARCHIVE // FRAGMENT_ACCESS' :
                            theme === 'fallout' ? 'VAULT-TEC // PERSONAL_LOGS' :
                                theme === 'y2k' ? 'COMM_LINK // DECRYPTED_DATA' :
                                    'DATA_VAULT // DECRYPTED_SHARDS'}
                </h2>
            )}

            {theme === '90s' && (
                <div className="win95-menubar"><span><u>F</u>ile</span> <span><u>E</u>dit</span> <span><u>S</u>earch</span> <span><u>H</u>elp</span></div>
            )}

            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>Daily Wisdom</h2>}

            <div className={theme === '90s' ? 'vault-content' : theme === 'cyberpunk' ? 'cp-shard-body' : ''}>
                {theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' && (
                    <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
                )}

                {lore ? (
                    theme === 'cyberpunk' ? (
                        /* ... Cyberpunk Layout ... */
                        <div className="cp-shard-container">
                            <div className="cp-shard-badge">STATUS: DECRYPTED</div><div className="cp-shard-text">"{lore.text}"</div>
                            <div className="cp-shard-meta"><span className="cp-meta-label">SRC:</span> {lore.author} <span className="cp-meta-label" style={{ marginLeft: '10px' }}>TAG:</span> [{lore.tag}]</div>
                        </div>
                    ) : theme === 'fallout' ? (
                        /* ... Fallout Layout ... */
                        <div className="fo-vault-log">
                            <div className="fo-log-header">WELCOME TO ROBCO INDUSTRIES (TM) TERMLINK<br />&gt; LOG ENTRY: [{lore.tag.toUpperCase()}]<br />==========================================</div>
                            <div className="fo-log-body">{lore.text.toUpperCase()}</div>
                            <div className="fo-log-footer">AUTHOR: {lore.author.toUpperCase()}<span className="fo-cursor">█</span></div>
                        </div>
                    ) : theme === 'material' ? (
                        /* Material You Layout */
                        <div className="md-vault-card">
                            <div className="md-vault-quote">"{lore.text}"</div>
                            <div className="md-vault-meta">
                                <span className="md-meta-pill">👤 {lore.author}</span>
                                <span className="md-meta-pill">🏷️ {lore.tag}</span>
                            </div>
                        </div>
                    ) : theme === 'y2k' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px' }}>
                                <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>STATUS: DECRYPTED</span>
                                <span style={{ fontSize: '9px', opacity: 0.7 }}>TAG: [{lore.tag.toUpperCase()}]</span>
                            </div>

                            <div style={{
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid #2a4b66',
                                padding: '10px',
                                position: 'relative',
                                lineHeight: '1.6'
                            }}>
                                {/* Orange Accent Bar on the Left */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--accent)' }}></div>

                                <div style={{ color: '#fff', marginBottom: '10px', paddingLeft: '8px' }}>
                                    "{lore.text}"
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '9px' }}>
                                    <span style={{ color: 'var(--accent)', marginRight: '5px' }}>SRC_ENTITY:</span>
                                    <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>{lore.author.toUpperCase()}</span>
                                </div>
                            </div>

                            {/* Decorative Tech Footer Bar */}
                            <div className="y2k-progress-bar" style={{ height: '4px', padding: '1px', marginTop: '0px' }}>
                                <div className="y2k-progress-block active" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    ) : (
                        /* ... Default Layout ... */
                        <div style={{ lineHeight: '1.6' }}>
                            <div style={{ fontStyle: theme === '90s' ? 'normal' : 'italic' }}>{theme === '90s' ? lore.text : `"${lore.text}"`}</div><br />
                            <div style={{ opacity: 0.6, fontSize: '0.9em' }}>{theme === '90s' ? '' : '--'} {lore.author} {theme === '90s' ? '' : `// [${lore.tag}]`}</div>
                        </div>
                    )
                ) : (
                    <div style={{ opacity: 0.5 }}>
                        {theme === '90s' ? '' : theme === 'cyberpunk' ? 'BRUTEFORCING ICE...' : theme === 'material' ? 'Decrypting daily archive...' : '> BRUTEFORCING ENCRYPTION...'}
                    </div>
                )}
            </div>
        </div>
    );
}