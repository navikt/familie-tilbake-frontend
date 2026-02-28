import type { ComponentProps, FC, ReactNode } from 'react';

import { Theme } from '@navikt/ds-react';
import { createContext, useContext, useEffect, useState } from 'react';

const COOKIE_NAVN = 'app-theme';
const COOKIE_MAKS_ALDER_DAGER = 365;

const hentTemaCookie = (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
};

const settTemaCookie = (name: string, value: string | undefined, days: number): void => {
    if (typeof document === 'undefined' || !value) return;
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
};

type Themes = ComponentProps<typeof Theme>['theme'];

type ThemeContextValue = {
    theme: Themes;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
    theme: 'light',
    toggleTheme: () => {},
});

export const useTheme = (): ThemeContextValue => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme må være inne i en ThemeProvider');
    }
    return context;
};

type ThemeProviderProps = {
    children: ReactNode;
    defaultTheme?: Themes;
};

export const ThemeProvider: FC<ThemeProviderProps> = ({
    children,
    defaultTheme = 'light',
}: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Themes>(() => {
        const lagretTema = hentTemaCookie(COOKIE_NAVN);
        if (lagretTema === 'light' || lagretTema === 'dark') {
            return lagretTema;
        }
        return defaultTheme;
    });

    const toggleTheme = (): void => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        settTemaCookie(COOKIE_NAVN, theme, COOKIE_MAKS_ALDER_DAGER);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <Theme theme={theme}>{children}</Theme>
        </ThemeContext.Provider>
    );
};
