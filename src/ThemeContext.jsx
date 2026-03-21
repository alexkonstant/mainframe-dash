import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('dashboardTheme') || 'terminal');

    useEffect(() => {
        // Injects the theme directly into the root HTML tag for global CSS targeting
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('dashboardTheme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {/* Conditional CRT overlay for retro themes */}
            {(theme === 'fallout' || theme === 'terminal') && <div className="crt-scanlines"></div>}
            
            <div className={`app-container theme-${theme}`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};