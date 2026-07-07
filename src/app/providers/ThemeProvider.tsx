import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipamos el Contexto
interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

// Creamos el Contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Creamos el Provider (Este componente envolverá a la app)
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkMode(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Exportamos el Custom Hook desde aquí para consumirlo fácilmente en cualquier parte
export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme debe usarse dentro de un ThemeProvider');
    }
    return context;
};