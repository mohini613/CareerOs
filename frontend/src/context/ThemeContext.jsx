import { createContext, useState,useContext, useEffect, Children } from 'react';
const ThemeContext = createContext(null);

export const ThemeProvider = ({ Children}) => {
    const [theme, setTheme] = useState(()=> {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        
        }
        if (window.matchMedia('(prefers-color-scheme:dark)').matches) {
            return 'dark';
        }
    });
    useEffect(() => {
        localStorage.setItem('theme', theme);

        if(theme==='dark'){
            document .documentElement.classList.add('dark');
        }else{
            document.documentElement.classList.remove('dark');

        }
        }, [theme]);
        const toggleTheme = () => {
            setTheme(prevTheme => prevTheme ==='light' ?'dark':'light');

        };
        return (
            <ThemeContext.Provider value={{theme, toggleTheme}}>
                {childern}
                </ThemeContext.Provider>
        );

};
export const useTheme = () => {
    const context=useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
    };
