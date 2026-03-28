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
        const interval = setInterval(fetchNews, 1800000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            className={`dashboard-panel global-news ${theme === 'cyberpunk' ? 'cp-panel' : theme === 'material' ? 'md-panel' : ''}`}
            style={theme === '90s' ? { padding: 0, background: '#c0c0c0', border: '2px solid', borderColor: '#ffffff #000000 #000000 #ffffff' } : {}}
        >

            {/* Header Area (Hidden for 90s, handled inside the theme block below) */}
            {theme !== '90s' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme === 'material' ? '20px' : '10px' }}>
                    <h2 style={{ flexGrow: 1, marginRight: '15px', marginBottom: theme === 'material' ? '0' : '' }}>
                        {theme === 'cyberpunk' ? 'N54_NEWS_BROADCAST // LIVE' :
                            theme === 'fallout' ? 'GALAXY_NEWS_RADIO // TEXT_RELAY' :
                                theme === 'material' ? 'Latest News' :
                                    theme === 'y2k' ? 'GLOBAL_INTEL // SYNDICATE_FEED' :
                                        'GLOBAL_NEWS // HEADLINES'}
                    </h2>
                    <button onClick={fetchNews} disabled={isRefreshing}
                            className={theme === 'fallout' ? 'fo-edit-btn' : theme === 'material' ? 'md-btn-tonal' : ''}
                            style={theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' ? { background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: isRefreshing ? 'wait' : 'pointer', fontWeight: 'bold', padding: '5px 10px', height: 'fit-content', opacity: isRefreshing ? 0.5 : 1 }
                                : { opacity: isRefreshing ? 0.5 : 1 }}
                    >
                        {theme === 'material' ? 'Refresh' : '[ REFRESH ]'}
                    </button>
                </div>
            )}

            {/* Default Status Indicators */}
            {theme !== 'fallout' && theme !== 'material' && theme !== 'y2k' && theme !== '90s' && <div style={{ opacity: 0.7, marginBottom: '15px', fontStyle: 'italic' }}>{status}</div>}
            {theme === 'fallout' && <div style={{ marginBottom: '15px', opacity: 0.8 }}>&gt; SIGNAL_STRENGTH: GOOD</div>}

            {/* --- 90s WINDOWS LAYOUT --- */}
            {theme === '90s' ? (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '2px' }}>

                    {/* Classic Navy Blue Title Bar */}
                    <div style={{ background: '#000080', color: '#ffffff', padding: '2px 4px', fontWeight: 'bold', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Internet News Explorer</span>
                    </div>

                    {/* Toolbar / Menu Area */}
                    <div style={{ padding: '4px 2px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #808080', marginBottom: '4px' }}>
                        <button onClick={fetchNews} disabled={isRefreshing} style={{
                            padding: '2px 10px',
                            background: '#c0c0c0',
                            color: '#000',
                            borderTop: '1px solid #fff',
                            borderLeft: '1px solid #fff',
                            borderRight: '1px solid #000',
                            borderBottom: '1px solid #000',
                            boxShadow: 'inset -1px -1px #808080, inset 1px 1px #dfdfdf',
                            cursor: isRefreshing ? 'wait' : 'pointer',
                            fontWeight: 'normal',
                            opacity: isRefreshing ? 0.7 : 1,
                            fontSize: '11px',
                            fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                            {isRefreshing ? 'Updating...' : 'Update'}
                        </button>
                        <span style={{ fontSize: '11px', color: '#000', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                            Status: {isRefreshing ? 'Downloading data from server...' : 'Done'}
                        </span>
                    </div>

                    {/* Sunken Content Area */}
                    <div style={{
                        background: '#ffffff',
                        border: '2px solid',
                        borderColor: '#808080 #ffffff #ffffff #808080',
                        padding: '4px',
                        maxHeight: '280px',
                        overflowY: 'scroll',
                        boxShadow: 'inset 1px 1px #000'
                    }}>
                        {news && news.length > 0 ? news.map((article, i) => (
                            <div key={i} style={{ padding: '6px 4px', borderBottom: '1px dashed #c0c0c0', display: 'flex', flexDirection: 'column' }}>
                                <a href={article.url || article.link} target="_blank" rel="noopener noreferrer" style={{
                                    color: '#0000ee',
                                    textDecoration: 'underline',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    fontSize: '13px',
                                    marginBottom: '2px',
                                    fontWeight: 'normal'
                                }}>
                                    {article.title}
                                </a>
                                <span style={{ fontSize: '11px', color: '#808080', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                                    Source: {article.source || 'Internet'}
                                </span>
                            </div>
                        )) : (
                            <div style={{ color: '#000', padding: '10px', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px' }}>
                                {isRefreshing ? 'Connecting...' : 'No new messages.'}
                            </div>
                        )}
                    </div>
                </div>
            ) : theme === 'y2k' ? (
                /* --- Y2K 2ADVANCED LAYOUT --- */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #2a4b66', paddingBottom: '4px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--accent)', letterSpacing: '2px' }}>LIVE_UPLINK</span>
                        <span style={{ fontSize: '9px', opacity: 0.7 }}>[ {news ? news.length : 0} PACKETS ]</span>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                        {news && news.length > 0 ? news.map((article, i) => (
                            <div key={i} style={{
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid #2a4b66',
                                padding: '8px',
                                marginBottom: '8px',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--accent)' }}></div>

                                <div style={{ fontSize: '9px', color: 'var(--accent)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>SRC: {article.source || 'SYNDICATE'}</span>
                                    <span>ID_0{i + 1}</span>
                                </div>

                                <div style={{ color: '#fff', fontSize: '10px', lineHeight: '1.4', marginBottom: '8px' }}>
                                    {article.title}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <a href={article.url || article.link} target="_blank" rel="noopener noreferrer"
                                       style={{
                                           display: 'inline-block',
                                           background: 'linear-gradient(180deg, #162942, #070c16)',
                                           border: '1px solid #2a4b66',
                                           color: '#7bbcd5',
                                           fontSize: '8px',
                                           padding: '2px 6px',
                                           textDecoration: 'none',
                                           letterSpacing: '1px'
                                       }}>
                                        [ ACCESS_NODE ]
                                    </a>
                                </div>
                            </div>
                        )) : (
                            <div style={{ opacity: 0.5, fontSize: '9px' }}>&gt; AWAITING_TRANSMISSION...</div>
                        )}
                    </div>
                </div>
            ) : news.length > 0 ? (
                /* The Original Rendering Logic for Default / CP / FO / MD */
                <div className={theme === 'cyberpunk' ? 'cp-news-feed' : theme === 'fallout' ? 'fo-news-list' : theme === 'material' ? 'md-news-list' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { padding: 0, margin: 0, lineHeight: '1.6' } : {}}>
                    {news.map((item, i) => (
                        <div key={i} className={theme === 'cyberpunk' ? 'cp-news-item' : theme === 'fallout' ? 'fo-news-item' : ''} style={theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' ? { marginBottom: '10px' } : {}}>
                            {theme !== 'cyberpunk' && theme !== 'fallout' && theme !== 'material' && '&gt; '}
                            {theme === 'fallout' && <span style={{ marginRight: '10px' }}>&gt;</span>}
                            <a href={item.link || item.url} target="_blank" rel="noreferrer" className={theme === 'fallout' ? 'fo-termlink-btn' : theme === 'material' ? 'md-news-card' : 'interactive-link'}>
                                {theme === 'fallout' ? item.title.toUpperCase() : item.title}
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ opacity: 0.5 }}>{theme === 'material' ? 'Fetching headlines...' : '> WAITING FOR TRANSMISSION...'}</div>
            )}
        </div>
    );
}