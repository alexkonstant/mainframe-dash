import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const getIcon = (name = '', url) => {
    const lower = (name || '').toLowerCase();
    const base = 'https://win98icons.alexmeub.com/icons/png/';
    if (lower.includes('youtube')) return base + 'multimedia-4.png';
    if (lower.includes('wiki')) return base + 'book_open-1.png';
    if (lower.includes('google')) return base + 'world-1.png';
    if (lower.includes('github') || lower.includes('git')) return base + 'computer_explorer-4.png';
    if (lower.includes('jira') || lower.includes('crm')) return base + 'briefcase-2.png';
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return base + 'directory_closed-4.png';
    }
};

export default function Shortcuts() {
    const [links, setLinks] = useState([]);
    const [status, setStatus] = useState("> Fetching directory...");
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const { theme } = useContext(ThemeContext);

    useEffect(() => {
        fetch('/api/shortcuts')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.shortcuts) {
                    setLinks(data.shortcuts);
                    setStatus("> Directory loaded.");
                }
            })
            .catch(() => setStatus("> ERR_DIRECTORY_OFFLINE"));
    }, []);

    const syncToHardware = async (updatedLinks) => {
        setStatus("> Writing to RAM...");
        try {
            await fetch('/api/shortcuts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedLinks) });
            setStatus("> Committing to SD Card...");
            await fetch('/api/commit', { method: 'POST' });
            setLinks(updatedLinks);
            setStatus("> Directory locked & committed.");
        } catch {
            setStatus("> ERR_COMMIT_FAILED");
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName || !newUrl) return;
        const formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;
        const updatedLinks = [...links, { name: newName, url: formattedUrl }];
        // Optimistic UI update before sync finishes
        setLinks(updatedLinks);
        syncToHardware(updatedLinks);
        setNewName(''); setNewUrl('');
    };

    const handleDelete = (index) => {
        const updatedLinks = links.filter((_, i) => i !== index);
        setLinks(updatedLinks);
        syncToHardware(updatedLinks);
    };

    if (theme === 'rickmorty') {
        const rmStatus = status === "> Directory loaded." ? "> Portal gun calibrated..." : status;
        return (
            <div style={{ background: 'rgba(10, 15, 20, 0.9)', border: '2px solid #97ce4c', borderRadius: '10px', boxShadow: '0 0 10px rgba(151, 206, 76, 0.4)', marginBottom: '20px', padding: '15px', color: '#97ce4c', fontFamily: "'Courier New', Courier, monospace", display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>// MULTIVERSE_PORTAL_COORDINATES</div>
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        style={{ background: 'transparent', border: '2px solid #97ce4c', color: '#97ce4c', fontFamily: "'Courier New', Courier, monospace", cursor: 'pointer', padding: '5px 10px', fontWeight: 'bold' }}
                    >
                        {isEditing ? '[ DONE ]' : '[ EDIT ]'}
                    </button>
                </div>
                
                <div style={{ opacity: 0.8 }}>{rmStatus}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {links.map((link, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                            {isEditing && (
                                <button 
                                    onClick={() => handleDelete(i)} 
                                    style={{ position: 'absolute', top: -5, right: -5, background: 'rgba(10, 15, 20, 0.9)', color: '#97ce4c', border: '1px solid #97ce4c', cursor: 'pointer', fontWeight: 'bold', zIndex: 10, padding: '2px 5px' }}
                                >
                                    X
                                </button>
                            )}
                            <a 
                                href={link.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                style={{ display: 'block', padding: '10px', border: '1px solid #97ce4c', color: '#97ce4c', background: 'rgba(10, 15, 20, 0.9)', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#97ce4c'; e.currentTarget.style.color = 'rgba(10, 15, 20, 0.9)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(10, 15, 20, 0.9)'; e.currentTarget.style.color = '#97ce4c'; }}
                            >
                                {link.name || 'TARGET'}
                            </a>
                        </div>
                    ))}
                </div>

                {isEditing && (
                    <form onSubmit={handleAdd} style={{ marginTop: '15px', borderTop: '1px dashed #97ce4c', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontWeight: 'bold' }}>// INJECT_NEW_COORDINATES</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                value={newName} 
                                onChange={e => setNewName(e.target.value)} 
                                placeholder="DIMENSION" 
                                style={{ background: 'transparent', border: '1px solid #97ce4c', color: '#97ce4c', padding: '5px', width: '30%', fontFamily: "'Courier New', Courier, monospace", outline: 'none' }} 
                            />
                            <input 
                                value={newUrl} 
                                onChange={e => setNewUrl(e.target.value)} 
                                placeholder="COORDINATES" 
                                style={{ background: 'transparent', border: '1px solid #97ce4c', color: '#97ce4c', padding: '5px', flex: 1, fontFamily: "'Courier New', Courier, monospace", outline: 'none' }} 
                            />
                            <button 
                                type="submit" 
                                style={{ background: '#97ce4c', color: 'rgba(10, 15, 20, 0.9)', border: '1px solid #97ce4c', cursor: 'pointer', fontWeight: 'bold', padding: '5px 15px', fontFamily: "'Courier New', Courier, monospace" }}
                            >
                                ADD
                            </button>
                        </div>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div className={`dashboard-panel shortcuts-module ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`}>

            {/* Header Block */}
            {theme === 'system7' ? (
                <div className="s7-titlebar">
                    <span className="s7-title-text">Shortcuts</span>
                </div>
            ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, flexGrow: 1 }}>
                    {theme === '90s' ? 'Control Panel' :
                        theme === 'cyberpunk' ? 'DATA_PORTS // SECURE_UPLINK' :
                            theme === 'fallout' ? 'ROBCO_IND // TERMLINK_PROTOCOL' :
                                theme === 'material' ? 'Favorites' :
                                    theme === 'y2k' ? 'UPLINK_DIR // QUICK_ACCESS' :
                                        theme === 'cli' ? 'SYMLINKS' :
                                            'QUICK_LINKS // DIRECTORY'}
                </h2>

                {/* Hide the default button for the CLI theme so we can place it inline with the terminal prompt */}
                {theme !== 'cli' && (
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? (isEditing ? 'md-btn-active' : 'md-btn-tonal') : ''}
                        style={theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { background: isEditing ? 'var(--accent)' : 'transparent', color: isEditing ? 'var(--bg)' : 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer', fontWeight: 'bold', padding: '5px 10px' } : theme === 'y2k' ? { padding: '4px 10px' } : {}}
                    >
                        {isEditing ? (theme === 'material' ? 'Done' : '[ DONE ]') : (theme === 'material' ? 'Edit' : '[ EDIT ]')}
                    </button>
                )}
            </div>
            )}

            {/* Terminal status text (hidden for specific themes) */}
            {theme !== '90s' && theme !== 'material' && theme !== 'y2k' && theme !== 'cli' && theme !== 'system7' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
            )}

            {/* Y2K Status Header Override */}
            {theme === 'y2k' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>ROUTING_NODES</span>
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>[ {links.length} ACTIVE ]</span>
                </div>
            )}

            {/* --- CLI / TUI LAYOUT --- */}
            {theme === 'cli' ? (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>root@mainframe:~# ls -l /symlinks</span>
                        <button onClick={() => setIsEditing(!isEditing)} style={{ color: '#ffff55', cursor: 'pointer', background: 'transparent', border: 'none', padding: 0, fontSize: '14px', fontWeight: 'bold' }}>
                            {isEditing ? '[ LOCK_DIR ]' : '[ CHMOD 777 ]'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {links.length > 0 ? links.map((link, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', color: '#c0c0c0' }}>
                                {isEditing && (
                                    <button onClick={() => handleDelete(i)} style={{ color: '#ff5555', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0 8px 0 0', fontWeight: 'bold' }}>
                                        [X]
                                    </button>
                                )}
                                <span style={{ color: 'var(--accent)', width: '35px' }}>[{String(i + 1).padStart(2, '0')}]</span>
                                <a href={link.url} target="_blank" rel="noreferrer" style={{ color: '#ffff55', textDecoration: 'none', width: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                    {(link.name || 'LINK').toUpperCase()}
                                </a>
                                <span style={{ color: '#555', margin: '0 8px' }}>-&gt;</span>
                                <span style={{ color: '#888', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {link.url}
                                </span>
                            </div>
                        )) : (
                            <div style={{ color: '#555', fontStyle: 'italic' }}>total 0</div>
                        )}
                    </div>
                </div>
            ) : theme === 'system7' ? (
                <div className="s7-content" style={{ fontFamily: "'Geneva', sans-serif", fontSize: '11px', color: '#000' }}>
                    <style>{`
                        .s7-shortcut:hover .s7-icon { filter: invert(1); }
                        .s7-shortcut:hover .s7-label { background: #000; color: #fff; }
                    `}</style>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            onMouseDown={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; }}
                            onMouseUp={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                            style={{ border: '1px solid #000', borderRadius: '4px', background: '#fff', color: '#000', boxShadow: '1px 1px 0px #000', fontFamily: "'Geneva', sans-serif", padding: '2px 8px', cursor: 'pointer', fontSize: '10px', transition: 'none' }}
                        >
                            {isEditing ? 'Done' : 'Edit'}
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '15px', border: '1px solid #000', background: '#fff' }}>
                        {links.length > 0 ? links.map((link, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                {isEditing && (
                                    <button 
                                        onClick={() => handleDelete(i)} 
                                        onMouseDown={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; }}
                                        onMouseUp={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                                        style={{ position: 'absolute', top: -5, right: -5, border: '1px solid #000', borderRadius: '4px', background: '#fff', color: '#000', boxShadow: '1px 1px 0px #000', fontFamily: "'Geneva', sans-serif", padding: '0 4px', cursor: 'pointer', fontSize: '9px', transition: 'none', zIndex: 10 }}
                                    >
                                        DEL
                                    </button>
                                )}
                                <a href={link.url} target="_blank" rel="noreferrer" className="s7-shortcut" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '64px', textDecoration: 'none', color: '#000' }}>
                                    <svg className="s7-icon" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: 'crispEdges' }}>
                                        <path d="M4 6h10v2h4v2h10v16H4V6z" fill="#fff" stroke="#000" strokeWidth="1" />
                                        <path d="M4 10h24" stroke="#000" strokeWidth="1" />
                                    </svg>
                                    <span className="s7-label" style={{ fontFamily: "'Geneva', sans-serif", fontSize: '11px', textAlign: 'center', marginTop: '4px', padding: '0 2px', lineHeight: '1.2' }}>
                                        {link.name || 'LINK'}
                                    </span>
                                </a>
                            </div>
                        )) : (
                            <div style={{ padding: '15px', fontStyle: 'italic' }}>No items found.</div>
                        )}
                    </div>
                </div>
            ) : (
                /* Single Unified Grid / List Rendering for all other themes */
                <div className={theme === '90s' ? 'win95-desktop-icons' : theme === 'cyberpunk' ? 'cp-shortcuts-grid' : theme === 'fallout' ? 'fo-termlink-list' : theme === 'material' ? 'md-shortcuts-grid' : ''} style={theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } : theme === 'y2k' ? { display: 'flex', flexDirection: 'column', gap: '5px' } : {}}>
                    {links.map((link, i) => (
                        theme === '90s' ? (
                            <div key={i} style={{ position: 'relative' }}>
                                {isEditing && <button onClick={() => handleDelete(i)} style={{ position: 'absolute', top: -5, right: -5, background: '#ff0000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', zIndex: 10, padding: '2px 5px' }}>X</button>}
                                <a href={link.url} target="_blank" rel="noreferrer" className="win95-icon">
                                    <img src={getIcon(link.name, link.url)} alt="icon" className="win95-crusty-image" onError={(e) => { e.target.src = 'https://win98icons.alexmeub.com/icons/png/directory_closed-4.png' }} />
                                    <div className="icon-text">{link.name || 'LINK'}</div>
                                </a>
                            </div>
                        ) : theme === 'cyberpunk' ? (
                            <div key={i} style={{ position: 'relative' }}>
                                {isEditing && <button onClick={() => handleDelete(i)} className="cp-delete-btn">X</button>}
                                <a href={link.url} target="_blank" rel="noreferrer" className="cp-shortcut-btn">
                                    <span className="cp-shortcut-decor"></span>{link.name || 'LINK'}
                                </a>
                            </div>
                        ) : theme === 'fallout' ? (
                            <div key={i} className="fo-link-row">
                                {isEditing && <button onClick={() => handleDelete(i)} className="fo-delete-btn">[DEL]</button>}
                                <a href={link.url} target="_blank" rel="noreferrer" className="fo-termlink-btn">
                                    &gt; {(link.name || 'LINK').toUpperCase()}
                                </a>
                            </div>
                        ) : theme === 'material' ? (
                            <div key={i} style={{ position: 'relative' }}>
                                {isEditing && <button onClick={() => handleDelete(i)} className="md-delete-btn">✕</button>}
                                <a href={link.url} target="_blank" rel="noreferrer" className="md-shortcut-btn">
                                    {link.name || 'LINK'}
                                </a>
                            </div>
                        ) : theme === 'y2k' ? (
                            <div key={i} style={{ display: 'flex', gap: '5px', position: 'relative' }}>
                                {isEditing && (
                                    <button onClick={() => handleDelete(i)} style={{ background: '#162942', color: '#ff0055', border: '1px solid #ff0055', cursor: 'pointer', fontSize: '9px', padding: '0 8px', letterSpacing: '1px' }}>
                                        [X]
                                    </button>
                                )}
                                <a href={link.url} target="_blank" rel="noreferrer" style={{
                                    flexGrow: 1, display: 'flex', alignItems: 'center', padding: '6px 10px',
                                    background: 'rgba(0,0,0,0.4)', border: '1px solid #2a4b66', color: '#7bbcd5',
                                    textDecoration: 'none', fontSize: '10px', letterSpacing: '1px', position: 'relative'
                                }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '2px', background: 'var(--accent)' }}></div>
                                    <span style={{ color: 'var(--accent)', marginRight: '8px' }}>&gt;&gt;</span>
                                    {(link.name || 'LINK').toUpperCase()}
                                </a>
                            </div>
                        ) : (
                            <div key={i} style={{ display: 'flex', gap: '5px' }}>
                                {isEditing && <button onClick={() => handleDelete(i)} style={{ background: '#ff0055', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>}
                                <a href={link.url} target="_blank" rel="noreferrer" style={{ flexGrow: 1, display: 'block', padding: '10px', border: '1px solid var(--accent)', color: 'var(--accent)', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    &gt; {link.name || 'LINK'}
                                </a>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Themed Injection Form */}
            {isEditing && (
                theme === 'system7' ? (
                    <form onSubmit={handleAdd} style={{ marginTop: '12px', border: '1px solid #000', background: '#fff', padding: '6px', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: "'Geneva', sans-serif", fontSize: '11px', color: '#000' }}>
                        <div style={{ fontFamily: "'Chicago', sans-serif" }}>Add Shortcut</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" style={{ border: '1px solid #000', padding: '2px 4px', flex: 1, fontFamily: "'Geneva', sans-serif", fontSize: '11px', outline: 'none' }} />
                            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL" style={{ border: '1px solid #000', padding: '2px 4px', flex: 2, fontFamily: "'Geneva', sans-serif", fontSize: '11px', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                type="submit" 
                                onMouseDown={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; }}
                                onMouseUp={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                                style={{ border: '1px solid #000', borderRadius: '4px', background: '#fff', color: '#000', boxShadow: '1px 1px 0px #000', fontFamily: "'Geneva', sans-serif", padding: '2px 8px', cursor: 'pointer', fontSize: '10px', transition: 'none' }}
                            >
                                Add
                            </button>
                        </div>
                    </form>
                ) : theme === 'cli' ? (
                    /* CLI "Create Symlink" Form Override */
                    <form onSubmit={handleAdd} style={{ marginTop: '15px', borderTop: '1px dashed #555', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ color: 'var(--accent)' }}>root@mainframe:~# ln -s [TARGET] [NAME]</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="NAME" style={{ background: '#000', color: '#ffff55', border: '1px solid #555', padding: '4px', fontFamily: 'var(--font)', width: '30%', outline: 'none' }} />
                            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL" style={{ background: '#000', color: '#ffff55', border: '1px solid #555', padding: '4px', fontFamily: 'var(--font)', flex: 1, outline: 'none' }} />
                            <button type="submit" style={{ color: '#00ff00', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                [ ADD ]
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Standard / Default Form */
                    <form onSubmit={handleAdd} style={{
                        marginTop: '20px', padding: '15px',
                        border: theme === '90s' ? '1px solid #808080' : theme === 'material' ? 'none' : theme === 'y2k' ? '1px solid #2a4b66' : '1px dashed var(--accent)',
                        background: theme === '90s' ? '#c0c0c0' : theme === 'material' ? 'var(--secondary-bg)' : theme === 'y2k' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)',
                        borderRadius: theme === 'material' ? '16px' : '0',
                        position: 'relative'
                    }}>
                        {theme === 'y2k' && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--accent)' }}></div>}

                        <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: theme === 'y2k' ? '9px' : 'inherit', color: theme === '90s' ? '#000' : theme === 'material' ? 'var(--text)' : 'var(--accent)', letterSpacing: theme === 'y2k' ? '2px' : 'normal' }}>
                            {theme === 'material' ? 'Add New Link' : theme === 'y2k' ? 'SYS_REQ // INJECT_NEW_NODE' : '> INJECT_NEW_UPLINK'}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="NAME" style={{ background: theme === '90s' ? '#fff' : theme === 'y2k' ? '#070c16' : 'transparent', border: theme === 'material' ? '1px solid rgba(255,255,255,0.2)' : theme === 'y2k' ? '1px solid #2a4b66' : '1px solid var(--accent)', color: theme === '90s' ? '#000' : theme === 'y2k' ? '#7bbcd5' : 'var(--text)', padding: '5px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font)', borderRadius: theme === 'material' ? '8px' : '0', fontSize: theme === 'y2k' ? '9px' : 'inherit' }} />
                            <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL" style={{ background: theme === '90s' ? '#fff' : theme === 'y2k' ? '#070c16' : 'transparent', border: theme === 'material' ? '1px solid rgba(255,255,255,0.2)' : theme === 'y2k' ? '1px solid #2a4b66' : '1px solid var(--accent)', color: theme === '90s' ? '#000' : theme === 'y2k' ? '#7bbcd5' : 'var(--text)', padding: '5px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font)', borderRadius: theme === 'material' ? '8px' : '0', fontSize: theme === 'y2k' ? '9px' : 'inherit' }} />
                            <button type="submit" className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-active' : ''} style={theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { background: 'var(--bg)', color: 'var(--accent)', border: '1px solid var(--accent)' } : theme === 'y2k' ? { cursor: 'pointer' } : {}}>
                                {theme === 'y2k' ? '[ ADD ]' : 'ADD'}
                            </button>
                        </div>
                    </form>
                )
            )}
        </div>
    );
}