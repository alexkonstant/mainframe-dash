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

    if (theme === 'rickmorty') {
        return (
            <div className="dashboard-panel data-vault" style={{
                background: 'rgba(10, 15, 20, 0.9)',
                border: '2px solid #97ce4c',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(151, 206, 76, 0.4)',
                marginBottom: '20px',
                padding: '20px',
                fontFamily: 'monospace',
                color: '#97ce4c'
            }}>
                <style>{`
                    .data-vault textarea, .data-vault input {
                        background: transparent;
                        border: 1px solid #97ce4c;
                        color: #97ce4c;
                        font-family: monospace;
                        outline: none;
                        transition: box-shadow 0.2s;
                    }
                    .data-vault textarea:focus, .data-vault input:focus {
                        box-shadow: 0 0 10px rgba(151, 206, 76, 0.8);
                    }
                    .data-vault button {
                        background: rgba(10, 15, 20, 0.9);
                        border: 1px solid #97ce4c;
                        color: #97ce4c;
                        font-family: monospace;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .data-vault button:hover {
                        background: #97ce4c;
                        color: rgba(10, 15, 20, 0.9);
                    }
                `}</style>
                <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '1.2rem' }}>// RICK_OS_SECURE_ARCHIVE</div>
                {lore ? (
                    <div>
                        <div style={{ color: '#97ce4c', textShadow: '0 0 5px rgba(151, 206, 76, 0.5)', marginBottom: '10px' }}>
                            &gt; DECRYPTED_FILE: [{lore.tag}]
                        </div>
                        <div style={{ fontStyle: 'italic', lineHeight: '1.5' }}>
                            "{lore.text}"
                        </div>
                        <div style={{ marginTop: '10px', opacity: 0.8 }}>
                            -- {lore.author}
                        </div>
                    </div>
                ) : (
                    <div style={{ fontStyle: 'italic', marginTop: '10px' }}>
                        &gt; BRUTEFORCING ENCRYPTION...
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`dashboard-panel data-vault ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`}>

            {/* Themed Headers */}
            {theme === 'system7' ? (
                <div className="s7-titlebar">
                    <span className="s7-title-text">Notepad</span>
                </div>
            ) : theme !== 'material' && theme !== 'cli' && (
                <h2>
                    {theme === '90s' ? 'Untitled - Notepad' :
                        theme === 'cyberpunk' ? 'SECURE_ARCHIVE // FRAGMENT_ACCESS' :
                            theme === 'fallout' ? 'VAULT-TEC // PERSONAL_LOGS' :
                                theme === 'y2k' ? 'COMM_LINK // DECRYPTED_DATA' :
                                    'DATA_VAULT // DECRYPTED_SHARDS'}
                </h2>
            )}
            {theme === 'cli' && <h2>DATA_ARCHIVE</h2>}

            {theme === '90s' && (
                <div className="win95-menubar"><span><u>F</u>ile</span> <span><u>E</u>dit</span> <span><u>S</u>earch</span> <span><u>H</u>elp</span></div>
            )}

            {theme === 'material' && <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px' }}>Daily Wisdom</h2>}

            <div className={theme === '90s' ? 'vault-content' : theme === 'cyberpunk' ? 'cp-shard-body' : ''}>

                {/* Default Status Text */}
                {theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' && theme !== 'cli' && theme !== 'system7' && (
                    <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
                )}

                {lore ? (
                    theme === 'system7' ? (
                        <div className="s7-content" style={{ fontFamily: "'Geneva', sans-serif", fontSize: '11px', color: '#000' }}>
                            <div style={{ border: '1px solid #000', background: '#fff', padding: '6px', minHeight: '60px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ flexGrow: 1, marginBottom: '8px' }}>
                                    {lore.text}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dotted #000', paddingTop: '4px' }}>
                                    <span style={{ fontFamily: "'Chicago', sans-serif" }}>Author: {lore.author}</span>
                                    <span>[{lore.tag}]</span>
                                </div>
                            </div>
                        </div>
                    ) : theme === 'cli' ? (
                        /* --- CLI / TUI LAYOUT --- */
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                            <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>
                                root@mainframe:~# gpg --decrypt archive_shard.gpg
                            </div>

                            <div style={{ color: '#888', fontSize: '12px', marginBottom: '10px' }}>
                                gpg: AES256 encrypted data<br/>
                                gpg: original cipher bypassed... <span style={{ color: '#00ff00', fontWeight: 'bold' }}>[ DECRYPTED ]</span>
                            </div>

                            <div style={{ borderLeft: '2px solid #555', paddingLeft: '10px', margin: '5px 0', color: '#fff', fontStyle: 'italic', lineHeight: '1.5' }}>
                                "{lore.text}"
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #555', paddingTop: '8px', marginTop: '10px', fontSize: '12px' }}>
                                <span style={{ color: '#888' }}>SRC: <span style={{ color: '#c0c0c0', fontWeight: 'bold' }}>{lore.author.toUpperCase()}</span></span>
                                <span style={{ color: '#888' }}>TAG: <span style={{ color: '#ffff55' }}>[{lore.tag.toUpperCase()}]</span></span>
                            </div>
                        </div>
                    ) : theme === 'cyberpunk' ? (
                        /* --- CYBERPUNK LAYOUT --- */
                        <div className="cp-shard-container">
                            <div className="cp-shard-badge">STATUS: DECRYPTED</div><div className="cp-shard-text">"{lore.text}"</div>
                            <div className="cp-shard-meta"><span className="cp-meta-label">SRC:</span> {lore.author} <span className="cp-meta-label" style={{ marginLeft: '10px' }}>TAG:</span> [{lore.tag}]</div>
                        </div>
                    ) : theme === 'fallout' ? (
                        /* --- FALLOUT LAYOUT --- */
                        <div className="fo-vault-log">
                            <div className="fo-log-header">WELCOME TO ROBCO INDUSTRIES (TM) TERMLINK<br />&gt; LOG ENTRY: [{lore.tag.toUpperCase()}]<br />==========================================</div>
                            <div className="fo-log-body">{lore.text.toUpperCase()}</div>
                            <div className="fo-log-footer">AUTHOR: {lore.author.toUpperCase()}<span className="fo-cursor">█</span></div>
                        </div>
                    ) : theme === 'material' ? (
                        /* --- MATERIAL YOU LAYOUT --- */
                        <div className="md-vault-card">
                            <div className="md-vault-quote">"{lore.text}"</div>
                            <div className="md-vault-meta">
                                <span className="md-meta-pill">👤 {lore.author}</span>
                                <span className="md-meta-pill">🏷️ {lore.tag}</span>
                            </div>
                        </div>
                    ) : theme === 'y2k' ? (
                        /* --- Y2K 2ADVANCED LAYOUT --- */
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
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', background: 'var(--accent)' }}></div>

                                <div style={{ color: '#fff', marginBottom: '10px', paddingLeft: '8px' }}>
                                    "{lore.text}"
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '9px' }}>
                                    <span style={{ color: 'var(--accent)', marginRight: '5px' }}>SRC_ENTITY:</span>
                                    <span style={{ fontWeight: 'bold', letterSpacing: '1px' }}>{lore.author.toUpperCase()}</span>
                                </div>
                            </div>

                            <div className="y2k-progress-bar" style={{ height: '4px', padding: '1px', marginTop: '0px' }}>
                                <div className="y2k-progress-block active" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    ) : (
                        /* --- DEFAULT / 90s LAYOUT --- */
                        <div style={{ lineHeight: '1.6' }}>
                            <div style={{ fontStyle: theme === '90s' ? 'normal' : 'italic' }}>{theme === '90s' ? lore.text : `"${lore.text}"`}</div><br />
                            <div style={{ opacity: 0.6, fontSize: '0.9em' }}>{theme === '90s' ? '' : '--'} {lore.author} {theme === '90s' ? '' : `// [${lore.tag}]`}</div>
                        </div>
                    )
                ) : (
                    <div style={{ opacity: 0.5 }}>
                        {theme === 'system7' ? <span style={{ fontFamily: "'Geneva', sans-serif", fontSize: '11px', color: '#000' }}>Loading archives...</span> : theme === '90s' ? '' : theme === 'cyberpunk' ? 'BRUTEFORCING ICE...' : theme === 'material' ? 'Decrypting daily archive...' : theme === 'cli' ? 'root@mainframe:~# gpg --decrypt\n> AWAITING PASSPHRASE...' : '> BRUTEFORCING ENCRYPTION...'}
                    </div>
                )}
            </div>
        </div>
    );
}