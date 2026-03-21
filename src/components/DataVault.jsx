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
                            <div className="cp-shard-meta"><span className="cp-meta-label">SRC:</span> {lore.author} <span className="cp-meta-label" style={{marginLeft: '10px'}}>TAG:</span> [{lore.tag}]</div>
                        </div>
                    ) : theme === 'fallout' ? (
                        /* ... Fallout Layout ... */
                        <div className="fo-vault-log">
                            <div className="fo-log-header">WELCOME TO ROBCO INDUSTRIES (TM) TERMLINK<br/>&gt; LOG ENTRY: [{lore.tag.toUpperCase()}]<br/>==========================================</div>
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