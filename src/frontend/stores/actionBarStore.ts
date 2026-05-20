import { create } from 'zustand';

type ActionBarBaseConfig = {
    stegtekst: string | undefined;
    forrigeAriaLabel: string | undefined;
    nesteAriaLabel: string;
    onForrige: (() => void) | undefined;
    nesteTekst?: string;
    forrigeTekst?: string;
    isLoading?: boolean;
    skjulNeste?: boolean;
    disableNeste?: boolean;
};

type ActionBarKnappConfig = ActionBarBaseConfig & {
    type?: 'button';
    formId?: never;
    onNeste: () => void;
};

type ActionBarSubmitConfig = ActionBarBaseConfig & {
    type: 'submit';
    formId: string;
    onNeste?: never;
};

export type ActionBarConfig = ActionBarKnappConfig | ActionBarSubmitConfig;

type ActionBarState = {
    config: ActionBarConfig | null;
    registrer: (config: ActionBarConfig) => void;
    avregistrer: () => void;
};

export const useActionBarStore = create<ActionBarState>(set => ({
    config: null,
    registrer: (config): void => set({ config }),
    avregistrer: (): void => set({ config: null }),
}));

export const useActionBarConfig = (): ActionBarConfig | null => useActionBarStore(s => s.config);
export const useRegistrerActionBar = (): ((config: ActionBarConfig) => void) =>
    useActionBarStore(s => s.registrer);
export const useAvregistrerActionBar = (): (() => void) => useActionBarStore(s => s.avregistrer);
