import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '../ThemeContext';

export default function GlobalNews() {
    const [news, setNews] = useState([]);
    const [status, setStatus] = useState("> Intercepting broadcasts...");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { theme } = useContext(ThemeContext);

    const fetchNews = () => {
        setIsRefreshing(true);
        setStatus("> Intercepting broadcasts...");
        fetch('/api/news')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setNews(data.articles);
                    setStatus("> Broadcasts decrypted.");
                }
            })
            .catch(() => setStatus("> ERR_NEWS_FEED_OFFLINE"))
            .finally(() => setIsRefreshing(false));
    };

    useEffect(() => {
        fetchNews();
        const interval = setInterval(fetchNews, 1800000); // 30 mins
        return () => clearInterval(interval);
    }, []);

    if (theme === 'rickmorty') {
        return (
            <div className="dashboard-panel global-news" style={{
                background: 'rgba(10, 15, 20, 0.9)',
                border: '2px solid #97ce4c',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(151, 206, 76, 0.4)',
                marginBottom: '20px',
                padding: '15px',
                fontFamily: 'monospace',
                color: '#97ce4c'
            }}>
                <div style={{ marginBottom: '15px', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>// INTERDIMENSIONAL_CABLE</span>
                    <button onClick={fetchNews} disabled={isRefreshing} style={{ color: '#97ce4c', background: 'transparent', border: '1px solid #97ce4c', padding: '2px 8px', cursor: isRefreshing ? 'wait' : 'pointer' }}>
                        {isRefreshing ? 'SYNCING...' : 'SYNC'}
                    </button>
                </div>

                <div style={{ fontStyle: 'italic', marginBottom: '15px', opacity: 0.8 }}>
                    {isRefreshing ? '> Intercepting multiverse broadcasts...' : status || '> Broadcasts decrypted.'}
                </div>

                {news && news.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {news.map((item, i) => (
                            <div key={i} style={{ borderBottom: '1px dashed rgba(151, 206, 76, 0.5)', padding: '10px 0', display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ marginRight: '10px', flexShrink: 0 }}>&gt; [ BROADCAST ]</span>
                                <a
                                    href={item.link || item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#97ce4c', textDecoration: 'none', transition: 'all 0.2s', flex: 1 }}
                                    onMouseOver={(e) => { e.currentTarget.style.background = '#97ce4c'; e.currentTarget.style.color = 'rgba(10, 15, 20, 0.9)'; e.currentTarget.style.textShadow = '0 0 5px #97ce4c'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#97ce4c'; e.currentTarget.style.textShadow = 'none'; }}
                                >
                                    {item.title}
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ fontStyle: 'italic', marginTop: '10px' }}>
                        {!isRefreshing && '> No broadcasts detected.'}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={`dashboard-panel global-news ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : theme === 'system7' ? 's7-panel' : ''}`}
            style={theme === '90s' ? { padding: 0, background: '#c0c0c0', border: '2px solid', borderColor: '#ffffff #000000 #000000 #ffffff' } : {}}
        >
            {/* Header Area (Hidden for 90s, CLI, and System 7) */}
            {theme !== '90s' && theme !== 'cli' && theme !== 'system7' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme === 'material' ? '20px' : '15px' }}>
                    <h2 style={{ flexGrow: 1, marginRight: '15px', marginBottom: theme === 'material' ? '0' : '' }}>
                        {theme === 'cyberpunk' ? 'GLOBAL_FEED // N54_NEWS' :
                            theme === 'fallout' ? 'PUBLIC_OCCURRENCES' :
                                theme === 'material' ? 'Headlines' :
                                    theme === 'y2k' ? 'SYS_NEWS // WORLD_FEED' :
                                        'GLOBAL_NEWS // FEED'}
                    </h2>

                    <button onClick={fetchNews} disabled={isRefreshing}
                            className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                            style={theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: isRefreshing ? 'wait' : 'pointer', fontWeight: 'bold', padding: '5px 10px', height: 'fit-content', opacity: isRefreshing ? 0.5 : 1 }
                                : { opacity: isRefreshing ? 0.5 : 1 }}
                    >
                        {theme === 'material' ? 'Refresh' : '[ SYNC ]'}
                    </button>
                </div>
            )}

            {/* Default Status Indicators */}
            {theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && theme !== '90s' && theme !== 'cli' && theme !== 'system7' && (
                <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>
            )}

            {/* --- SYSTEM 7 LAYOUT --- */}
            {theme === 'system7' ? (
                <div style={{ background: '#fff', border: '1px solid #000', boxShadow: '4px 4px 0px #000', padding: '2px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '20px', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: '5px', background: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 2px)' }}>
                        <div style={{ position: 'absolute', left: '2px', top: '2px', width: '12px', height: '12px', border: '1px solid #000', background: '#fff', cursor: 'pointer' }}></div>
                        <span style={{ background: '#fff', padding: '0 8px', fontFamily: 'Chicago, sans-serif', fontSize: '12px', zIndex: 2 }}>
                            Global News
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '5px' }}>
                        <button 
                            onClick={fetchNews} 
                            disabled={isRefreshing} 
                            style={{ 
                                border: '1px solid #000', 
                                boxShadow: isRefreshing ? 'none' : '1px 1px 0px #000', 
                                background: '#fff', 
                                color: '#000', 
                                fontFamily: "'Geneva', sans-serif",
                                padding: '2px 8px',
                                fontSize: '11px',
                                cursor: isRefreshing ? 'wait' : 'pointer',
                                transform: isRefreshing ? 'translate(1px, 1px)' : 'none'
                            }}
                            onMouseDown={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translate(1px, 1px)'; }}
                            onMouseUp={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '1px 1px 0px #000'; e.currentTarget.style.transform = 'none'; }}
                        >
                            {isRefreshing ? 'Syncing...' : 'Sync'}
                        </button>
                    </div>
                    <div style={{ border: '1px solid #000', background: '#fff', flexGrow: 1, overflowY: 'auto', maxHeight: '250px' }}>
                        {news && news.length > 0 ? news.map((item, i) => (
                            <div key={i} style={{ borderBottom: '1px solid #000', padding: '4px' }}>
                                <a href={item.link || item.url} target="_blank" rel="noreferrer" style={{ color: '#000', textDecoration: 'none', fontFamily: "'Geneva', sans-serif", fontSize: '11px' }}>
                                    {item.title}
                                </a>
                            </div>
                        )) : (
                            <div style={{ color: '#000', fontFamily: "'Geneva', sans-serif", fontSize: '11px', padding: '4px' }}>
                                {isRefreshing ? 'Fetching data...' : 'No news available.'}
                            </div>
                        )}
                    </div>
                </div>
            ) : theme === 'cli' ? (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', fontFamily: 'var(--font)' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>root@mainframe:~# rsstail -i 5 -u global_feed</span>
                        <button onClick={fetchNews} disabled={isRefreshing} style={{ color: '#ffff55', cursor: isRefreshing ? 'wait' : 'pointer', background: 'transparent', border: 'none', padding: 0, fontSize: '14px', fontWeight: 'bold' }}>
                            {isRefreshing ? '[ FETCHING... ]' : '[ SYNC ]'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {news && news.length > 0 ? news.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ color: '#00ff00', marginRight: '10px' }}>[{String(i + 1).padStart(2, '0')}]</span>
                                <a href={item.link || item.url} target="_blank" rel="noreferrer" style={{ color: '#c0c0c0', textDecoration: 'none', lineHeight: '1.4', flex: 1 }}>
                                    {item.title.toUpperCase()}
                                </a>
                            </div>
                        )) : (
                            <div style={{ color: '#555', fontStyle: 'italic', marginTop: '10px' }}>
                                {isRefreshing ? 'EOF: Awaiting packets...' : 'EOF: No broadcasts intercepted.'}
                            </div>
                        )}
                    </div>
                </div>
            ) : theme === '90s' ? (
                /* --- 90s WINDOWS LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', padding: '2px' }}>
                    <div style={{ background: '#000080', color: '#ffffff', padding: '2px 4px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Internet Explorer - News</span>
                    </div>
                    <div style={{ padding: '4px 2px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #808080', marginBottom: '4px' }}>
                        <button onClick={fetchNews} disabled={isRefreshing} style={{
                            padding: '2px 10px', background: '#c0c0c0', color: '#000',
                            borderTop: '1px solid #fff', borderLeft: '1px solid #fff', borderRight: '1px solid #000', borderBottom: '1px solid #000',
                            boxShadow: 'inset -1px -1px #808080, inset 1px 1px #dfdfdf',
                            cursor: isRefreshing ? 'wait' : 'pointer', fontSize: '11px', fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                            {isRefreshing ? 'Loading...' : 'Refresh'}
                        </button>
                        <span style={{ fontSize: '11px', color: '#000', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            {isRefreshing ? 'Connecting to site...' : 'Done'}
                        </span>
                    </div>
                    <div style={{
                        background: '#ffffff', border: '2px solid', borderColor: '#808080 #ffffff #ffffff #808080',
                        padding: '10px', maxHeight: '280px', overflowY: 'scroll', boxShadow: 'inset 1px 1px #000',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                        {news && news.length > 0 ? news.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <img src="https://win98icons.alexmeub.com/icons/png/html-1.png" alt="Link" style={{ width: '16px', height: '16px', marginTop: '2px' }} />
                                <a href={item.link || item.url} target="_blank" rel="noreferrer" style={{ color: '#0000FF', textDecoration: 'underline', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px', lineHeight: '1.4' }}>
                                    {item.title}
                                </a>
                            </div>
                        )) : <div style={{ color: '#000', fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif' }}>{isRefreshing ? 'Downloading page...' : 'The page cannot be displayed.'}</div>}
                    </div>
                </div>
            ) : theme === 'y2k' ? (
                /* --- Y2K 2ADVANCED LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>WORLD_FEED</span>
                        <span style={{ fontSize: '9px', opacity: 0.7 }}>[ {news ? news.length : 0} ARTICLES ]</span>
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                        {news && news.length > 0 ? news.map((item, i) => (
                            <div key={i} style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid #2a4b66', padding: '8px', marginBottom: '8px', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--accent)' }}></div>
                                <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>DATA_NODE_0{i + 1}</span>
                                    <span>[ <a href={item.link || item.url} target="_blank" rel="noreferrer" style={{ color: '#7bbcd5', textDecoration: 'none' }}>OPEN_LINK</a> ]</span>
                                </div>
                                <div style={{ color: '#fff', fontSize: '10px', lineHeight: '1.4', fontWeight: 'bold', paddingLeft: '5px' }}>
                                    {item.title.toUpperCase()}
                                </div>
                            </div>
                        )) : <div style={{ opacity: 0.5, fontSize: '9px' }}>&gt; AWAITING_DATA_STREAM...</div>}
                    </div>
                </div>
            ) : news && news.length > 0 ? (
                /* --- ORIGINAL RENDERING LOGIC (DEFAULT/CP/FO/MD) --- */
                <div className={theme === 'cyberpunk' ? 'cp-news-feed' : theme === 'fallout' ? 'fo-news-list' : theme === 'material' ? 'md-news-list' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { padding: 0, margin: 0, lineHeight: '1.6' } : {}}>
                    {news.map((item, i) => (
                        <div key={i} className={theme === 'cyberpunk' ? 'cp-news-item' : theme === 'fallout' ? 'fo-news-item' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { marginBottom: '10px' } : {}}>
                            {theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' && <span style={{ marginRight: '8px', color: 'var(--accent)' }}>&gt;</span>}
                            {theme === 'fallout' && <span style={{ marginRight: '10px' }}>&gt;</span>}
                            <a href={item.link || item.url} target="_blank" rel="noreferrer" className={theme === 'fallout' ? 'fo-termlink-btn' : theme === 'material' ? 'md-news-card' : 'interactive-link'}>
                                {theme === 'fallout' ? item.title.toUpperCase() : item.title}
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ opacity: 0.5 }}>
                    {isRefreshing ? '> ESTABLISHING CONNECTION...' : '> NO NEWS FEED DETECTED'}
                </div>
            )}
        </div>
    );
}