import { useState, useEffect } from 'react';

export const useTheme = () => {
    // 1. Initialize state directly from localStorage so it doesn't flash on route change
    const [isDark, setIsDark] = useState<boolean>(() => {
        const savedTheme = localStorage.getItem('wtw_theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // 2. Apply the CSS class whenever the component mounts or state changes
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // 3. Toggle function to use on your buttons
    const toggleTheme = () => {
        setIsDark(prev => {
            const newDark = !prev;
            localStorage.setItem('wtw_theme', newDark ? 'dark' : 'light');
            return newDark;
        });
    };

    return { isDark, toggleTheme };
};