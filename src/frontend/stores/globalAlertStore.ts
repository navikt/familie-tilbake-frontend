import type { LocalAlertProps } from '@navikt/ds-react';

import { create } from 'zustand';

export type GlobalAlert = {
    id: string;
    title: string;
    status: LocalAlertProps['status'];
    message?: string;
    visPortenLenke?: boolean;
};

type GlobalAlertState = {
    alerts: GlobalAlert[];
    visAlert: (alert: Omit<GlobalAlert, 'id'>) => void;
    lukkAlert: (id: string) => void;
};

const autoLukkEtterMs = 6000;

const skalAutoLukke = (status: LocalAlertProps['status']): boolean =>
    status !== 'error' && status !== 'warning';

export const useGlobalAlertStore = create<GlobalAlertState>((set, get) => ({
    alerts: [],
    visAlert: (alert): void => {
        const id = crypto.randomUUID();
        set(() => ({ alerts: [{ ...alert, id }] }));

        if (skalAutoLukke(alert.status)) {
            globalThis.setTimeout((): void => {
                get().lukkAlert(id);
            }, autoLukkEtterMs);
        }
    },
    lukkAlert: (id): void => {
        set(state => ({ alerts: state.alerts.filter(alert => alert.id !== id) }));
    },
}));

export const useGlobalAlerts = (): GlobalAlert[] => useGlobalAlertStore(state => state.alerts);
export const useVisGlobalAlert = (): GlobalAlertState['visAlert'] =>
    useGlobalAlertStore(state => state.visAlert);
export const useLukkGlobalAlert = (): GlobalAlertState['lukkAlert'] =>
    useGlobalAlertStore(state => state.lukkAlert);
