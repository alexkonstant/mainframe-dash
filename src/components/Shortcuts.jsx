import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

const getIcon = (name, url) => {
    const lower = name.toLowerCase();
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
        syncToHardware([...links, { name: newName, url: formattedUrl }]);
        setNewName(''); setNewUrl('');
    };

    const handleDelete = (index) => {
        syncToHardware(links.filter((_, i) => i !== index));
    };

    return (
        <div className={`dashboard-panel shortcuts-module ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, flexGrow: 1 }}>
                    {theme === '90s' ? 'Control Panel' :
                        theme === 'cyberpunk' ? 'DATA_PORTS // SECURE_UPLINK' :
                            theme === 'fallout' ? 'ROBCO_IND // TERMLINK_PROTOCOL' :
                                theme === 'material' ? 'Favorites' :
                                    'QUICK_LINKS // DIRECTORY'}
                </h2>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? (isEditing ? 'md-btn-active' : 'md-btn-tonal') : ''}
                    style={theme !== 'fallout' && theme !== 'material' ? { background: isEditing ? 'var(--accent)' : 'transparent', color: isEditing ? 'var(--bg)' : 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer', fontWeight: 'bold', padding: '5px 10px' } : {}}
                >
                    {isEditing ? (theme === 'material' ? 'Done' : '[ DONE ]') : (theme === 'material' ? 'Edit' : '[ EDIT ]')}
                </button>
            </div>

            {/* Terminal status text (hidden for 90s and Material You) */}
            {theme !== '90s' && theme !== 'material' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
            )}

            {/* Single Unified Grid */}
            <div className={theme === '90s' ? 'win95-desktop-icons' : theme === 'cyberpunk' ? 'cp-shortcuts-grid' : theme === 'fallout' ? 'fo-termlink-list' : theme === 'material' ? 'md-shortcuts-grid' : ''} style={theme !== '90s' && theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } : {}}>
                {links.map((link, i) => (
                    theme === '90s' ? (
                        <div key={i} style={{ position: 'relative' }}>
                            {isEditing && <button onClick={() => handleDelete(i)} style={{ position: 'absolute', top: -5, right: -5, background: '#ff0000', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', zIndex: 10, padding: '2px 5px' }}>X</button>}
                            <a href={link.url} target="_blank" rel="noreferrer" className="win95-icon">
                                <img src={getIcon(link.name, link.url)} alt="icon" className="win95-crusty-image" onError={(e) => { e.target.src = 'https://win98icons.alexmeub.com/icons/png/directory_closed-4.png' }} />
                                <div className="icon-text">{link.name}</div>
                            </a>
                        </div>
                    ) : theme === 'cyberpunk' ? (
                        <div key={i} style={{ position: 'relative' }}>
                            {isEditing && <button onClick={() => handleDelete(i)} className="cp-delete-btn">X</button>}
                            <a href={link.url} target="_blank" rel="noreferrer" className="cp-shortcut-btn">
                                <span className="cp-shortcut-decor"></span>{link.name}
                            </a>
                        </div>
                    ) : theme === 'fallout' ? (
                        <div key={i} className="fo-link-row">
                            {isEditing && <button onClick={() => handleDelete(i)} className="fo-delete-btn">[DEL]</button>}
                            <a href={link.url} target="_blank" rel="noreferrer" className="fo-termlink-btn">
                                &gt; {link.name.toUpperCase()}
                            </a>
                        </div>
                    ) : theme === 'material' ? (
                        <div key={i} style={{ position: 'relative' }}>
                            {isEditing && <button onClick={() => handleDelete(i)} className="md-delete-btn">✕</button>}
                            <a href={link.url} target="_blank" rel="noreferrer" className="md-shortcut-btn">
                                {link.name}
                            </a>
                        </div>
                    ) : (
                        <div key={i} style={{ display: 'flex', gap: '5px' }}>
                            {isEditing && <button onClick={() => handleDelete(i)} style={{ background: '#ff0055', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>}
                            <a href={link.url} target="_blank" rel="noreferrer" style={{ flexGrow: 1, display: 'block', padding: '10px', border: '1px solid var(--accent)', color: 'var(--accent)', textDecoration: 'none', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                &gt; {link.name}
                            </a>
                        </div>
                    )
                ))}
            </div>

            {isEditing && (
                <form onSubmit={handleAdd} style={{ marginTop: '20px', padding: '15px', border: theme === '90s' ? '1px solid #808080' : theme === 'material' ? 'none' : '1px dashed var(--accent)', background: theme === '90s' ? '#c0c0c0' : theme === 'material' ? 'var(--secondary-bg)' : 'rgba(0,0,0,0.2)', borderRadius: theme === 'material' ? '16px' : '0' }}>
                    <div style={{ marginBottom: '10px', fontWeight: 'bold', color: theme === '90s' ? '#000' : theme === 'material' ? 'var(--text)' : 'var(--accent)' }}>{theme === 'material' ? 'Add New Link' : '> INJECT_NEW_UPLINK'}</div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="NAME" style={{ background: theme === '90s' ? '#fff' : 'transparent', border: theme === 'material' ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--accent)', color: theme === '90s' ? '#000' : 'var(--text)', padding: '5px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font)', borderRadius: theme === 'material' ? '8px' : '0' }} />
                        <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="URL" style={{ background: theme === '90s' ? '#fff' : 'transparent', border: theme === 'material' ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--accent)', color: theme === '90s' ? '#000' : 'var(--text)', padding: '5px', width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font)', borderRadius: theme === 'material' ? '8px' : '0' }} />
                        <button type="submit" className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-active' : ''} style={theme !== 'fallout' && theme !== 'material' ? { background: 'var(--bg)', color: 'var(--accent)', border: '1px solid var(--accent)' } : {}}>ADD</button>
                    </div>
                </form>
            )}
        </div>
    );
}