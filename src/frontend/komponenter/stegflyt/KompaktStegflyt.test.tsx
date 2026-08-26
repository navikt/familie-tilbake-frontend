import type { BehandlingDto, BehandlingsstegsinfoDto } from '@/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Suspense } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { BehandlingProvider } from '@/context/BehandlingContext';
import { FagsakContext } from '@/context/FagsakContext';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient, setBehandlingQueryData } from '@/testutils/queryTestUtils';

import { KompaktStegflyt } from './KompaktStegflyt';

const BEHANDLING_URL = '/fagsystem/BA/fagsak/123/behandling/456';

/**
 * Fakta og Forhåndsvarsel er utført, Foreldelse og Vilkårsvurdering er tilgjengelige,
 * og Vedtak mangler i stegsinfoen og er derfor ikke tilgjengelig.
 */
const STEGSINFO: BehandlingsstegsinfoDto[] = [
    { behandlingssteg: 'FAKTA', behandlingsstegstatus: 'UTFØRT' },
    { behandlingssteg: 'FORHÅNDSVARSEL', behandlingsstegstatus: 'UTFØRT' },
    { behandlingssteg: 'FORELDELSE', behandlingsstegstatus: 'KLAR' },
    { behandlingssteg: 'VILKÅRSVURDERING', behandlingsstegstatus: 'KLAR' },
];

const lagTestbehandling = (overrides: Partial<BehandlingDto> = {}): BehandlingDto =>
    lagBehandling({
        eksternBrukId: '456',
        behandlingId: '123',
        erNyModell: true,
        // Skjuler Verge-steget, slik at stegflyten matcher designet.
        støtterManuelleBrevmottakere: true,
        behandlingsstegsinfo: STEGSINFO,
        ...overrides,
    });

const renderKompaktStegflyt = (
    behandling: BehandlingDto = lagTestbehandling(),
    startUrl = `${BEHANDLING_URL}/foreldelse`
): void => {
    const queryClient = createTestQueryClient();
    setBehandlingQueryData(queryClient, '123', behandling);

    const router = createMemoryRouter(
        [
            {
                path: '*',
                element: (
                    <QueryClientProvider client={queryClient}>
                        <FagsakContext
                            value={lagFagsak({ eksternFagsakId: '123', fagsystem: 'BA' })}
                        >
                            <Suspense fallback={<div>Laster...</div>}>
                                <BehandlingProvider behandlingId="123">
                                    <KompaktStegflyt />
                                </BehandlingProvider>
                            </Suspense>
                        </FagsakContext>
                    </QueryClientProvider>
                ),
            },
        ],
        { initialEntries: [startUrl] }
    );

    render(<RouterProvider router={router} />);
};

describe('KompaktStegflyt', () => {
    describe('Synlighet av steg', () => {
        test('viser alle synlige steg i én liste', () => {
            renderKompaktStegflyt();

            expect(screen.getByRole('list', { name: 'Behandlingssteg' })).toBeInTheDocument();
            expect(screen.getAllByRole('listitem')).toHaveLength(5);
            expect(screen.getByText('Fakta')).toBeInTheDocument();
            expect(screen.getByText('Forhåndsvarsel')).toBeInTheDocument();
            expect(screen.getByText('Foreldelse')).toBeInTheDocument();
            expect(screen.getByText('Vilkårsvurdering')).toBeInTheDocument();
            expect(screen.getByText('Vedtak')).toBeInTheDocument();
        });

        test('viser Brevmottaker(e) når steget finnes i behandlingsstegsinfo', () => {
            renderKompaktStegflyt(
                lagTestbehandling({
                    behandlingsstegsinfo: [
                        ...STEGSINFO,
                        { behandlingssteg: 'BREVMOTTAKER', behandlingsstegstatus: 'KLAR' },
                    ],
                })
            );

            expect(screen.getByText('Brevmottaker(e)')).toBeInTheDocument();
        });

        test('rendrer ingenting når ingen av stegene matcher URL-en', () => {
            renderKompaktStegflyt(lagTestbehandling(), '/ugyldig-side');

            expect(screen.queryByRole('list', { name: 'Behandlingssteg' })).not.toBeInTheDocument();
        });
    });

    describe('Tilstander', () => {
        test('markerer kun gjeldende steg med aria-current', () => {
            renderKompaktStegflyt();

            expect(screen.getByRole('link', { name: /^Foreldelse/ })).toHaveAttribute(
                'aria-current',
                'step'
            );
            expect(screen.getByRole('link', { name: /^Vilkårsvurdering/ })).not.toHaveAttribute(
                'aria-current'
            );
        });

        test('gjør tilgjengelige steg til lenker med riktig mål', () => {
            renderKompaktStegflyt();

            expect(screen.getByRole('link', { name: /^Vilkårsvurdering/ })).toHaveAttribute(
                'href',
                `${BEHANDLING_URL}/vilkaarsvurdering`
            );
        });

        test('gjør ikke-tilgjengelige steg til ren tekst uten lenke', () => {
            renderKompaktStegflyt();

            expect(screen.queryByRole('link', { name: /^Vedtak/ })).not.toBeInTheDocument();
            expect(screen.getByText('Vedtak')).toBeInTheDocument();
            expect(screen.getByText('Vedtak, ikke tilgjengelig')).toBeInTheDocument();
        });

        test('formidler fullført status i tilgjengelig navn, ikke bare visuelt', () => {
            renderKompaktStegflyt();

            expect(screen.getByRole('link', { name: 'Fakta, fullført' })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Vilkårsvurdering' })).toBeInTheDocument();
        });

        test('beholder stegnavnet som tilgjengelig navn selv når det skjules visuelt', () => {
            renderKompaktStegflyt();

            // Navnet ligger alltid i DOM-en og skjules kun visuelt med sr-only når det ikke er
            // plass, slik at lenken aldri får kun stegnummeret som navn.
            expect(
                screen.getByRole('link', { name: 'Forhåndsvarsel, fullført' })
            ).toBeInTheDocument();
        });
    });

    describe('Navigering', () => {
        test('navigerer til valgt steg ved klikk', async () => {
            const bruker = userEvent.setup();
            renderKompaktStegflyt();

            await bruker.click(screen.getByRole('link', { name: /^Vilkårsvurdering/ }));

            expect(screen.getByRole('link', { name: /^Vilkårsvurdering/ })).toHaveAttribute(
                'aria-current',
                'step'
            );
        });

        test('kan aktivere steg med tastatur', async () => {
            const bruker = userEvent.setup();
            renderKompaktStegflyt();

            screen.getByRole('link', { name: 'Fakta, fullført' }).focus();
            await bruker.keyboard('{Enter}');

            expect(screen.getByRole('link', { name: 'Fakta, fullført' })).toHaveAttribute(
                'aria-current',
                'step'
            );
        });
    });
});
