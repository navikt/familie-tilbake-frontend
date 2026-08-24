import type { FC, ReactNode } from 'react';
import type { BehandlingDto } from '@/generated';

import { renderHook } from '@testing-library/react';

import { useSidebarStore } from '@/stores/sidebarStore';
import {
    type BehandlingStateContextOverrides,
    TestBehandlingProvider,
} from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';

import { Menysider } from './menysider';
import { useMenysider } from './useMenysider';

const lagWrapper = (
    behandling: BehandlingDto,
    stateOverrides: BehandlingStateContextOverrides = {}
): FC<{ children: ReactNode }> => {
    return ({ children }: { children: ReactNode }): React.ReactElement => (
        <TestBehandlingProvider behandling={behandling} stateOverrides={stateOverrides}>
            {children}
        </TestBehandlingProvider>
    );
};

describe('useMenysider', () => {
    beforeEach(() => {
        useSidebarStore.setState({ erÅpen: true, valgtSide: null });
    });

    test('Bruker detaljer som standardside', () => {
        const { result } = renderHook(() => useMenysider(), {
            wrapper: lagWrapper(lagBehandling()),
        });

        expect(result.current.aktivSide).toBe(Menysider.Detaljer);
    });

    test('Bruker fatte vedtak som standardside når behandlingen fatter vedtak', () => {
        const { result } = renderHook(() => useMenysider(), {
            wrapper: lagWrapper(lagBehandling({ status: 'FATTER_VEDTAK' })),
        });

        expect(result.current.aktivSide).toBe(Menysider.Totrinn);
        expect(result.current.tilgjengeligeSider).toContain(Menysider.Totrinn);
    });

    test('Viser fatte vedtak når behandlingen har vært på steget', () => {
        const { result } = renderHook(() => useMenysider(), {
            wrapper: lagWrapper(lagBehandling(), {
                harVærtPåFatteVedtakSteget: (): boolean => true,
            }),
        });

        expect(result.current.tilgjengeligeSider).toContain(Menysider.Totrinn);
    });

    test('Skjuler fatte vedtak for behandlinger som ikke er på steget', () => {
        const { result } = renderHook(() => useMenysider(), {
            wrapper: lagWrapper(lagBehandling()),
        });

        expect(result.current.tilgjengeligeSider).not.toContain(Menysider.Totrinn);
    });

    test('Skjuler send brev for ny modell', () => {
        const { result } = renderHook(() => useMenysider(), {
            wrapper: lagWrapper(lagBehandling({ erNyModell: true })),
        });

        expect(result.current.tilgjengeligeSider).not.toContain(Menysider.SendBrev);
    });

    test('Bruker valgt side fra storen', () => {
        useSidebarStore.setState({ valgtSide: Menysider.Dokumenter });

        const { result } = renderHook(() => useMenysider(), {
            wrapper: lagWrapper(lagBehandling()),
        });

        expect(result.current.aktivSide).toBe(Menysider.Dokumenter);
    });

    test('Faller tilbake til standardsiden når valgt side ikke er tilgjengelig', () => {
        useSidebarStore.setState({ valgtSide: Menysider.SendBrev });

        const { result } = renderHook(() => useMenysider(), {
            wrapper: lagWrapper(lagBehandling({ erNyModell: true })),
        });

        expect(result.current.aktivSide).toBe(Menysider.Detaljer);
    });
});
