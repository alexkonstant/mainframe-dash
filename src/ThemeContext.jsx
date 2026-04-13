import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default');

    const themes = ['default', '90s', 'cyberpunk', 'fallout', 'material', 'y2k', 'cli', 'system7', 'rickmorty'];

    useEffect(() => {
        // Reverting back to the exact class names your old CSS expects
        document.body.className = theme;
        document.documentElement.setAttribute('data-theme', theme);

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