import type { Location } from 'react-router';
import type { BehandlingDto } from '~/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, fireEvent, screen } from '@testing-library/react';
import { Suspense } from 'react';

import { BehandlingProvider } from '~/context/BehandlingContext';
import { FagsakContext } from '~/context/FagsakContext';
import { Fagsystem } from '~/kodeverk';
import {
    lagBehandling,
    lagBrevmottakerSteg,
    lagFaktaSteg,
    lagForeldelseSteg,
    lagVilkårsvurderingSteg,
} from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { createTestQueryClient, setBehandlingQueryData } from '~/testutils/queryTestUtils';

import { Stegflyt } from './Stegflyt';

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router', () => ({
    useNavigate: (): ReturnType<typeof vi.fn> => mockNavigate,
    useLocation: (): Location => mockUseLocation(),
}));

const createMockBehandling = (overrides: Record<string, unknown> = {}): BehandlingDto =>
    lagBehandling({
        eksternBrukId: '456',
        behandlingId: '123',
        behandlingsstegsinfo: [lagFaktaSteg(), lagForeldelseSteg(), lagVilkårsvurderingSteg()],
        ...overrides,
    });

const renderStegflyt = (behandling: BehandlingDto = createMockBehandling()): void => {
    const queryClient = createTestQueryClient();
    setBehandlingQueryData(queryClient, '123', behandling);

    render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext
                value={lagFagsak({
                    eksternFagsakId: '123',
                    fagsystem: Fagsystem.BA,
                })}
            >
                <Suspense fallback={<div>Loading...</div>}>
                    <BehandlingProvider behandlingId="123">
                        <Stegflyt />
                    </BehandlingProvider>
                </Suspense>
            </FagsakContext>
        </QueryClientProvider>
    );
};

describe('Stegflyt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseLocation.mockReturnValue({
            pathname: '/fagsystem/BA/fagsak/123/behandling/456/fakta',
        });
    });

    describe('Synlighet av steg', () => {
        test('skal vise Fakta, Foreldelse, Vilkårsvurdering og Vedtak som alltid synlige', () => {
            renderStegflyt();

            expect(screen.getByText('Fakta')).toBeInTheDocument();
            expect(screen.getByText('Foreldelse')).toBeInTheDocument();
            expect(screen.getByText('Vilkårsvurdering')).toBeInTheDocument();
            expect(screen.getByText('Vedtak')).toBeInTheDocument();
        });

        test('skal ikke vise Brevmottaker når det ikke er i behandlingsstegsinfo', () => {
            renderStegflyt();
            expect(screen.queryByText('Brevmottaker')).not.toBeInTheDocument();
        });

        test('skal vise Brevmottaker når det er i behandlingsstegsinfo og støttet', () => {
            const behandling = createMockBehandling({
                behandlingsstegsinfo: [
                    lagFaktaSteg(),
                    lagForeldelseSteg(),
                    lagVilkårsvurderingSteg(),
                    lagBrevmottakerSteg(),
                ],
            });
            renderStegflyt(behandling);

            expect(screen.getByText('Brevmottaker(e)')).toBeInTheDocument();
        });
    });

    describe('Navigering', () => {
        test('skal ikke navigere til steget som allerede er aktivt', () => {
            renderStegflyt();

            const aktivtSteg = screen.getByText('Fakta');
            fireEvent.click(aktivtSteg);

            expect(mockNavigate).not.toHaveBeenCalled();
        });

        test('skal kunne navigere til andre aktive steg', () => {
            renderStegflyt();

            const foreldelseSteg = screen.getByText('Foreldelse');
            fireEvent.click(foreldelseSteg);

            expect(mockNavigate).toHaveBeenCalledWith(
                '/fagsystem/BA/fagsak/123/behandling/456/foreldelse'
            );
        });

        test('skal ikke kunne navigere til inaktive steg', () => {
            renderStegflyt();

            const vedtakSteg = screen.getByText('Vedtak');
            fireEvent.click(vedtakSteg);

            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('Aria-labels', () => {
        test('skal ha riktige aria-labels for aktive steg', () => {
            renderStegflyt();

            expect(screen.getByLabelText('Gå til Foreldelse')).toBeInTheDocument();
            expect(screen.getByLabelText('Gå til Vilkårsvurdering')).toBeInTheDocument();
        });

        test('skal ha riktige aria-labels for inaktive steg', () => {
            renderStegflyt();

            expect(
                screen.getByLabelText('Inaktivt steg, Vedtak, ikke klikkbar')
            ).toBeInTheDocument();
        });
    });

    describe('Ingen visning', () => {
        test('skal returnere null når aktiv stegnummer er mindre enn 1', () => {
            mockUseLocation.mockReturnValue({
                pathname: '/ugyldig-side',
            });

            renderStegflyt();
            expect(screen.queryByText('Fakta')).not.toBeInTheDocument();
        });
    });
});
