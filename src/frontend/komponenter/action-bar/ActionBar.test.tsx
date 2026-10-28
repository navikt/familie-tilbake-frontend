import type { BehandlingDto } from '@/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { FagsakContext } from '@/context/FagsakContext';
import { ToggleName } from '@/context/TogglesContext';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling, lagFaktaSteg, lagForeldelseSteg } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { TestTogglesProvider } from '@/testdata/togglesContextFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { ActionBar } from './ActionBar';

type RenderProps = {
    onForrige?: () => void;
    onNeste?: () => void;
    isLoading?: boolean;
    behandling?: BehandlingDto;
    harKravgrunnlag?: boolean;
    nyStegflytPåskrudd?: boolean;
    revurderingPåskrudd?: boolean;
};

const renderActionBar = ({
    onForrige = vi.fn(),
    onNeste = vi.fn(),
    isLoading = false,
    behandling,
    harKravgrunnlag = true,
    nyStegflytPåskrudd = true,
    revurderingPåskrudd = false,
}: RenderProps = {}): void => {
    render(
        <MemoryRouter initialEntries={['/fagsystem/BA/fagsak/1/behandling/2/fakta']}>
            <TestTogglesProvider
                påskrudde={[
                    ...(nyStegflytPåskrudd ? [ToggleName.NyStegflyt] : []),
                    ...(revurderingPåskrudd ? [ToggleName.Revurdering] : []),
                ]}
            >
                <QueryClientProvider client={createTestQueryClient()}>
                    <FagsakContext value={lagFagsak()}>
                        <TestBehandlingProvider
                            behandling={behandling}
                            stateOverrides={{ harKravgrunnlag }}
                        >
                            <ActionBar
                                stegtekst="Steg 2 av 5"
                                forrigeAriaLabel="gå tilbake til faktasteget"
                                nesteAriaLabel="gå videre til vilkårsvurderingssteget"
                                onNeste={onNeste}
                                isLoading={isLoading}
                                onForrige={onForrige}
                            />
                        </TestBehandlingProvider>
                    </FagsakContext>
                </QueryClientProvider>
            </TestTogglesProvider>
        </MemoryRouter>
    );
};

const renderUtenForrige = (behandling: BehandlingDto): void => {
    render(
        <MemoryRouter initialEntries={['/fagsystem/BA/fagsak/1/behandling/2/fakta']}>
            <TestTogglesProvider påskrudde={[ToggleName.NyStegflyt]}>
                <FagsakContext value={lagFagsak()}>
                    <TestBehandlingProvider
                        behandling={behandling}
                        stateOverrides={{ harKravgrunnlag: true }}
                    >
                        <ActionBar
                            stegtekst="Steg 1 av 5"
                            forrigeAriaLabel={undefined}
                            onForrige={undefined}
                            nesteAriaLabel="gå videre til foreldelsessteget"
                            onNeste={vi.fn()}
                        />
                    </TestBehandlingProvider>
                </FagsakContext>
            </TestTogglesProvider>
        </MemoryRouter>
    );
};

describe('ActionBar', () => {
    test('Kaller ikke onNeste eller onForrige når isLoading = true', () => {
        const onNeste = vi.fn();
        const onForrige = vi.fn();
        renderActionBar({ onForrige, onNeste, isLoading: true });

        fireEvent.click(
            screen.getByRole('button', { name: /gå videre til vilkårsvurderingssteget/i })
        );
        fireEvent.click(screen.getByRole('button', { name: /gå tilbake til faktasteget/i }));

        expect(onNeste).not.toHaveBeenCalled();
        expect(onForrige).not.toHaveBeenCalled();
    });

    test('Har ikke knapp tilbake til Tilbakekrevingen når ikke på inaktiv side', () => {
        renderActionBar();
        expect(screen.queryByRole('link', { name: /gå til behandling/i })).not.toBeInTheDocument();
    });

    describe('Gammel modell', () => {
        test('Viser behandlingsmenyen', () => {
            renderActionBar({ behandling: lagBehandling({ erNyModell: false }) });

            expect(screen.getByRole('button', { name: /meny/i })).toBeInTheDocument();
        });

        test('Viser stegtekst i stedet for stegflyt', () => {
            renderActionBar({ behandling: lagBehandling({ erNyModell: false }) });

            expect(screen.getByText('Steg 2 av 5')).toBeInTheDocument();
            expect(
                screen.queryByRole('list', { name: /behandlingssteg/i })
            ).not.toBeInTheDocument();
        });
    });

    describe('Ny modell', () => {
        const revurderingsøy = (): HTMLElement | null =>
            screen.queryByRole('navigation', { name: 'Behandlingsvalg' });
        const lagAvsluttetNyModellBehandling = (): BehandlingDto =>
            lagBehandling({ erNyModell: true, status: 'AVSLUTTET' });

        test('Viser revurderingsøyen når avsluttet behandling kan revurderes', () => {
            renderActionBar({
                behandling: lagAvsluttetNyModellBehandling(),
                revurderingPåskrudd: true,
            });

            expect(revurderingsøy()).toBeInTheDocument();
        });

        test('Viser ikke revurderingsøyen når revurdering er skrudd av', () => {
            renderActionBar({
                behandling: lagAvsluttetNyModellBehandling(),
                revurderingPåskrudd: false,
            });

            expect(revurderingsøy()).not.toBeInTheDocument();
        });

        const lagNyModellBehandling = (
            behandlingsstegsinfo = [lagFaktaSteg(), lagForeldelseSteg()]
        ): BehandlingDto =>
            lagBehandling({
                eksternBrukId: '2',
                erNyModell: true,
                støtterManuelleBrevmottakere: true,
                behandlingsstegsinfo,
            });

        test('Viser stegflyten i stedet for behandlingsmenyen og stegteksten', () => {
            renderActionBar({ behandling: lagNyModellBehandling() });

            expect(screen.getByRole('list', { name: 'Behandlingssteg' })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /meny/i })).not.toBeInTheDocument();
            expect(screen.queryByText('Steg 2 av 5')).not.toBeInTheDocument();
        });

        test('Beholder stegteksten når behandlingen venter på kravgrunnlag', () => {
            renderActionBar({ behandling: lagNyModellBehandling(), harKravgrunnlag: false });

            expect(screen.queryByRole('list', { name: 'Behandlingssteg' })).not.toBeInTheDocument();
            expect(screen.getByText('Steg 2 av 5')).toBeInTheDocument();
        });

        test('Beholder navigasjonsknappene ved siden av stegflyten', () => {
            renderActionBar({ behandling: lagNyModellBehandling() });

            expect(
                screen.getByRole('button', { name: /gå videre til vilkårsvurderingssteget/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /gå tilbake til faktasteget/i })
            ).toBeInTheDocument();
        });

        test('Reserverer plassen etter forrige-knappen på første steg', () => {
            renderUtenForrige(lagNyModellBehandling());

            // Plassholderen skal holde bredden lik gjennom hele flyten, men den må
            // verken være synlig for skjermlesere eller nåbar med tastatur.
            const plassholder = screen.getByText('Forrige').closest('button');
            expect(plassholder).toHaveClass('invisible');
            expect(plassholder).toHaveAttribute('aria-hidden', 'true');
            expect(plassholder).toHaveAttribute('tabindex', '-1');
            expect(screen.queryByRole('button', { name: /forrige/i })).not.toBeInTheDocument();
        });

        test('Reserverer ikke plass i gammel modell, som ikke viser stegflyten', () => {
            renderUtenForrige(lagBehandling({ erNyModell: false }));

            expect(screen.queryByText('Forrige')).not.toBeInTheDocument();
        });

        test('Viser stegteksten i stedet for stegflyten når toggelen er avskrudd', () => {
            renderActionBar({ behandling: lagNyModellBehandling(), nyStegflytPåskrudd: false });

            expect(screen.queryByRole('list', { name: 'Behandlingssteg' })).not.toBeInTheDocument();
            expect(screen.getByText('Steg 2 av 5')).toBeInTheDocument();
        });
    });
});
