import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { FagsakState } from '../../../stores/fagsakStore';
import type { Behandling, Behandlingsstegstilstand } from '../../../typer/behandling';
import type { Ressurs } from '../../../typer/ressurs';
import type { RenderResult } from '@testing-library/react';
import type { Location, NavigateFunction } from 'react-router';
import type { StoreApi, UseBoundStore } from 'zustand';

import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { Stegflyt } from './Stegflyt';
import { Fagsystem } from '../../../kodeverk';
import { Behandlingssteg, Behandlingsstegstatus } from '../../../typer/behandling';
import { RessursStatus } from '../../../typer/ressurs';

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
const mockUseBehandling = jest.fn();
const mockUseFagsakStore = jest.fn();

jest.mock('react-router', () => ({
    useNavigate: (): NavigateFunction => mockNavigate,
    useLocation: (): Location => mockUseLocation(),
}));

jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
    erStegUtført: (status: string): boolean => status === 'UTFØRT',
}));

jest.mock('../../../stores/fagsakStore', () => ({
    useFagsakStore: (): UseBoundStore<StoreApi<FagsakState>> => mockUseFagsakStore(),
}));

const createMockBehandling = (props = {}): Ressurs<Partial<Behandling>> => ({
    status: RessursStatus.Suksess,
    data: {
        eksternBrukId: '456',
        behandlingId: '123',
        behandlingsstegsinfo: createMockStegInfo(),
        ...props,
    },
});

const createMockStegInfo = (includeBrevmottaker = false): Behandlingsstegstilstand[] => {
    const synligeSteg = [
        {
            behandlingssteg: Behandlingssteg.Fakta,
            behandlingsstegstatus: Behandlingsstegstatus.Utført,
            venteårsak: undefined,
            tidsfrist: undefined,
        },
        {
            behandlingssteg: Behandlingssteg.Foreldelse,
            behandlingsstegstatus: Behandlingsstegstatus.Utført,
            venteårsak: undefined,
            tidsfrist: undefined,
        },
        {
            behandlingssteg: Behandlingssteg.Vilkårsvurdering,
            behandlingsstegstatus: Behandlingsstegstatus.Klar,
            venteårsak: undefined,
            tidsfrist: undefined,
        },
    ];

    if (includeBrevmottaker) {
        synligeSteg.splice(3, 0, {
            behandlingssteg: Behandlingssteg.Brevmottaker,
            behandlingsstegstatus: Behandlingsstegstatus.Klar,
            venteårsak: undefined,
            tidsfrist: undefined,
        });
    }

    return synligeSteg;
};

const renderStegflyt = (): RenderResult => render(<Stegflyt />);

describe('Stegflyt', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseBehandling.mockReturnValue({
            behandling: createMockBehandling(),
        });

        mockUseFagsakStore.mockReturnValue({
            eksternFagsakId: '123',
            fagsystem: Fagsystem.BA,
        });

        mockUseLocation.mockReturnValue({
            pathname: '/fagsystem/BA/fagsak/123/behandling/456/fakta',
        });
    });

    describe('Synlighet av steg', () => {
        test('skal vise Fakta, Foreldelse, Vilkårsvurdering og Vedtak som alltid synlige', () => {
            const { getByText } = renderStegflyt();

            expect(getByText('Fakta')).toBeInTheDocument();
            expect(getByText('Foreldelse')).toBeInTheDocument();
            expect(getByText('Vilkårsvurdering')).toBeInTheDocument();
            expect(getByText('Vedtak')).toBeInTheDocument();
        });

        test('skal ikke vise Brevmottaker når det ikke er i behandlingsstegsinfo', () => {
            const { queryByText } = renderStegflyt();
            expect(queryByText('Brevmottaker')).not.toBeInTheDocument();
        });

        test('skal vise Brevmottaker når det er i behandlingsstegsinfo og støttet', () => {
            mockUseBehandling.mockReturnValue({
                behandling: createMockBehandling({
                    behandlingsstegsinfo: createMockStegInfo(true),
                }),
            });
            const { getByText } = renderStegflyt();

            expect(getByText('Brevmottaker(e)')).toBeInTheDocument();
        });
    });

    describe('Navigering', () => {
        test('skal ikke navigere til steget som allerede er aktivt', () => {
            const { getByText } = renderStegflyt();

            const aktivtSteg = getByText('Fakta');
            fireEvent.click(aktivtSteg);

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        test('skal kunne navigere til andre aktive steg', () => {
            const { getByText } = renderStegflyt();

            const foreldelseSteg = getByText('Foreldelse');
            fireEvent.click(foreldelseSteg);

            expect(mockNavigate).toHaveBeenCalledWith(
                '/fagsystem/BA/fagsak/123/behandling/456/foreldelse'
            );
        });

        test('skal ikke kunne navigere til inaktive steg', () => {
            const { getByText } = renderStegflyt();

            const vedtakSteg = getByText('Vedtak');
            fireEvent.click(vedtakSteg);

            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('Aria-labels', () => {
        test('skal ha riktige aria-labels for aktive steg', () => {
            const { getByLabelText } = renderStegflyt();

            expect(getByLabelText('Gå til Foreldelse')).toBeInTheDocument();
            expect(getByLabelText('Gå til Vilkårsvurdering')).toBeInTheDocument();
        });

        test('skal ha riktige aria-labels for inaktive steg', () => {
            const { getByLabelText } = renderStegflyt();

            expect(getByLabelText('Inaktivt steg, Vedtak, ikke klikkbar')).toBeInTheDocument();
        });
    });

    describe('Ingen visning', () => {
        test('skal returnere null når aktiv stegnummer er mindre enn 1', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/ugyldig-side',
            });

            const { container } = renderStegflyt();
            expect(container.firstChild).toBeNull();
        });

        test('skal returnere null når stegsinfo er undefined', () => {
            mockUseBehandling.mockReturnValue({
                behandling: {
                    status: RessursStatus.Feilet,
                },
            });

            const { container } = renderStegflyt();
            expect(container.firstChild).toBeNull();
        });
    });
});
