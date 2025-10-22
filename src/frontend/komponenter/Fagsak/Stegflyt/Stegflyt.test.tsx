import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { FagsakState } from '../../../stores/fagsakStore';
import type { Behandling } from '../../../typer/behandling';
import type { Ressurs } from '../../../typer/ressurs';
import type { RenderResult } from '@testing-library/react';
import type { Location, NavigateFunction } from 'react-router';
import type { StoreApi, UseBoundStore } from 'zustand';

import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { Stegflyt } from './Stegflyt';
import { Fagsystem } from '../../../kodeverk';
import {
    lagBehandling,
    lagBrevmottakerSteg,
    lagFaktaSteg,
    lagForeldelseSteg,
    lagVilkårsvurderingSteg,
} from '../../../testdata/behandlingFactory';
import { Behandlingsstegstatus } from '../../../typer/behandling';
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
    erStegUtført: (status: Behandlingsstegstatus): boolean =>
        status === Behandlingsstegstatus.Utført,
}));

jest.mock('../../../stores/fagsakStore', () => ({
    useFagsakStore: (): UseBoundStore<StoreApi<FagsakState>> => mockUseFagsakStore(),
}));

const createMockRessursBehandling = (
    overrides: Partial<Behandling> = {}
): Ressurs<Partial<Behandling>> => ({
    status: RessursStatus.Suksess,
    data: lagBehandling({
        eksternBrukId: '456',
        behandlingId: '123',
        behandlingsstegsinfo: [lagFaktaSteg(), lagForeldelseSteg(), lagVilkårsvurderingSteg()],
        ...overrides,
    }),
});

const renderStegflyt = (): RenderResult => render(<Stegflyt />);

const setupMocks = (): void => {
    mockUseBehandling.mockReturnValue({
        behandling: createMockRessursBehandling(),
    });

    mockUseFagsakStore.mockReturnValue({
        eksternFagsakId: '123',
        fagsystem: Fagsystem.BA,
    });

    mockUseLocation.mockReturnValue({
        pathname: '/fagsystem/BA/fagsak/123/behandling/456/fakta',
    });
};

describe('Stegflyt', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupMocks();
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
                behandling: createMockRessursBehandling({
                    behandlingsstegsinfo: [
                        lagFaktaSteg(),
                        lagForeldelseSteg(),
                        lagVilkårsvurderingSteg(),
                        lagBrevmottakerSteg(),
                    ],
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
