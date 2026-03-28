import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default');

    // Added 'cli' to the master rotation array
    const themes = ['default', '90s', 'cyberpunk', 'fallout', 'material', 'y2k', 'cli'];

    useEffect(() => {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    return (
        <ThemeContext.Provider value={{ theme, cycleTheme, setTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
};