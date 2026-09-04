import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { useSidebarStore } from '@/stores/sidebarStore';

import { Menysider } from './menysider';
import { useSidebarVisning } from './useSidebarVisning';

const settSkjermbredde = (bredde: number): void => {
    window.innerWidth = bredde;
};

describe('useSidebarVisning', () => {
    beforeEach(() => {
        settSkjermbredde(1440);
        useSidebarStore.setState({ erÅpen: true, modalErÅpen: false, valgtSide: null });
    });

    test('Viser panelet når skjermen har plass', () => {
        const { result } = renderHook(() => useSidebarVisning());

        expect(result.current.visPanel).toBe(true);
        expect(result.current.visModal).toBe(false);
    });

    test('Beholder ønsket om åpent panel når skjermen blir smal, og viser det igjen når det er plass', () => {
        const { result, rerender } = renderHook(() => useSidebarVisning());

        settSkjermbredde(800);
        rerender();

        expect(result.current.visPanel).toBe(false);
        expect(result.current.visModal).toBe(false);
        expect(useSidebarStore.getState().erÅpen).toBe(true);

        settSkjermbredde(1440);
        rerender();

        expect(result.current.visPanel).toBe(true);
    });

    test('Veksleknappen åpner modal på smal skjerm uten å endre panelvalget', () => {
        settSkjermbredde(800);
        const { result } = renderHook(() => useSidebarVisning());

        act(() => result.current.veksle());

        expect(result.current.visModal).toBe(true);
        expect(useSidebarStore.getState().erÅpen).toBe(true);

        act(() => result.current.veksle());

        expect(result.current.visModal).toBe(false);
    });

    test('Snarvei åpner panelet på valgt side når skjermen har plass', () => {
        useSidebarStore.setState({ erÅpen: false });
        const { result } = renderHook(() => useSidebarVisning());

        act(() => result.current.åpneSide(Menysider.Historikk));

        expect(result.current.visPanel).toBe(true);
        expect(useSidebarStore.getState().valgtSide).toBe(Menysider.Historikk);
    });

    test('Snarvei åpner modal på valgt side når skjermen er smal', () => {
        settSkjermbredde(800);
        const { result } = renderHook(() => useSidebarVisning());

        act(() => result.current.åpneSide(Menysider.Historikk));

        expect(result.current.visModal).toBe(true);
        expect(useSidebarStore.getState().valgtSide).toBe(Menysider.Historikk);
    });
});
