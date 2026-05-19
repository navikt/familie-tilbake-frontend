import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useGlobalAlertStore } from './globalAlertStore';

describe('globalAlertStore', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useGlobalAlertStore.setState({ alerts: [] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('visAlert legger til alert i listen', () => {
        useGlobalAlertStore.getState().visAlert({ title: 'Test', status: 'success' });

        expect(useGlobalAlertStore.getState().alerts).toHaveLength(1);
        expect(useGlobalAlertStore.getState().alerts[0].title).toBe('Test');
    });

    test('lukkAlert fjerner alert fra listen', () => {
        useGlobalAlertStore.getState().visAlert({ title: 'Test', status: 'error' });
        const id = useGlobalAlertStore.getState().alerts[0].id;

        useGlobalAlertStore.getState().lukkAlert(id);

        expect(useGlobalAlertStore.getState().alerts).toHaveLength(0);
    });

    test('success-alert lukkes automatisk etter 6 sekunder', () => {
        useGlobalAlertStore.getState().visAlert({ title: 'Lagret', status: 'success' });

        expect(useGlobalAlertStore.getState().alerts).toHaveLength(1);

        vi.advanceTimersByTime(6000);

        expect(useGlobalAlertStore.getState().alerts).toHaveLength(0);
    });

    test('info-alert lukkes automatisk etter 6 sekunder', () => {
        useGlobalAlertStore.getState().visAlert({ title: 'Info', status: 'announcement' });

        vi.advanceTimersByTime(6000);

        expect(useGlobalAlertStore.getState().alerts).toHaveLength(0);
    });

    test('error-alert lukkes IKKE automatisk', () => {
        useGlobalAlertStore.getState().visAlert({ title: 'Feil', status: 'error' });

        vi.advanceTimersByTime(6000);

        expect(useGlobalAlertStore.getState().alerts).toHaveLength(1);
    });

    test('warning-alert lukkes IKKE automatisk', () => {
        useGlobalAlertStore.getState().visAlert({ title: 'Advarsel', status: 'warning' });

        vi.advanceTimersByTime(6000);

        expect(useGlobalAlertStore.getState().alerts).toHaveLength(1);
    });
});
