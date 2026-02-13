import { create } from 'zustand';

export type GlobalAlert = {
    id: string;
    title: string;
    message: string;
    status: 'error' | 'info' | 'success' | 'warning';
};

type GlobalAlertState = {
    alerts: GlobalAlert[];
    visAlert: (alert: Omit<GlobalAlert, 'id'>) => void;
    lukkAlert: (id: string) => void;
};

export const useGlobalAlertStore = create<GlobalAlertState>(set => ({
    alerts: [],
    visAlert: (alert): void => {
        const id = crypto.randomUUID();
        set(state => ({ alerts: [...state.alerts, { ...alert, id }] }));
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
