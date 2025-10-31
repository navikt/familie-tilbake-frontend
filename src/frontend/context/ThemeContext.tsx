import { Theme } from '@navikt/ds-react';
import { createContext, useContext, useState } from 'react';
import React from 'react';

type Themes = 'dark' | 'light';

type ThemeContextValue = {
    theme: Themes;
    toggleTheme: () => void;
};

const ThemeContext = createContext<{
    theme: Themes;
    toggleTheme: () => void;
}>({
    theme: 'light',
    toggleTheme: () => {},
});

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Themes;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
    children,
    defaultTheme = 'light',
}: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Themes>(defaultTheme);

    const toggleTheme = (): void => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <Theme theme={theme}>{children}</Theme>
        </ThemeContext.Provider>
    );
};
