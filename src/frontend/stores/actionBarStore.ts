import { create } from 'zustand';

type ActionBarBase = {
    stegtekst: string | undefined;
    forrigeAriaLabel: string | undefined;
    onForrige: (() => void) | undefined;
    isLoading?: boolean;
    forrigeTekst?: string;
};

type MedNesteKnapp = {
    nesteAriaLabel: string;
    onNeste: () => void;
    skjulNeste?: false;
    nesteTekst?: string;
    disableNeste?: boolean;
};

type UtenNesteKnapp = {
    skjulNeste: true;
    nesteAriaLabel?: never;
    nesteTekst?: never;
    disableNeste?: never;
    onNeste?: never;
};

type MedNesteSubmit = {
    skjulNeste?: false;
    nesteAriaLabel: string;
    nesteTekst?: string;
    disableNeste?: boolean;
    onNeste?: never;
};

type UtenNesteSubmit = {
    skjulNeste: true;
    nesteAriaLabel?: never;
    nesteTekst?: never;
    disableNeste?: never;
    onNeste?: never;
};

type ButtonConfig = ActionBarBase & {
    type?: 'button';
    formId?: never;
} & (MedNesteKnapp | UtenNesteKnapp);

type SubmitConfig = ActionBarBase & {
    type: 'submit';
    formId: string;
} & (MedNesteSubmit | UtenNesteSubmit);

export type ActionBarConfig = ButtonConfig | SubmitConfig;

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
