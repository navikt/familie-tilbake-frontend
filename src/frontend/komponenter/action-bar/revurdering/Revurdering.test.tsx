import type {
    BehandlingOpprettRevurderingData,
    BehandlingOpprettRevurderingResponse,
    Options,
} from '@/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router';

import { FagsakContext } from '@/context/FagsakContext';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';
import { lagFagsak } from '@/testdata/fagsakFactory';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { OPPRETT_REVURDERING_MUTATION_KEY, Revurdering } from './Revurdering';

vi.unmock('react-router');

type Revurderingskall = Options<BehandlingOpprettRevurderingData>;
type Revurderingssvar = () => Promise<BehandlingOpprettRevurderingResponse>;

const behandlingId = '123e4567-e89b-42d3-a456-426614174000';
const behandlingsUrl = '/fagsystem/BA/fagsak/annen-sak/behandling/ny-behandling/fakta';
const nyBehandlingTekst = 'Ny behandling';

const menyknappNavn = 'BehandlingsvalgKnapp';
const menyvalgNavn = 'Revurder tilbakekrevingen';
const dialogNavn = 'Revurder tilbakekrevingen';
const årsakNavn = 'Hva er årsaken til revurderingen?';
const instansNavn = 'Hvilken instans har omgjort vedtaket?';
const begrunnelseNavn = 'Beskriv kort årsaken til revurderingen';
const begrunnelse = 'Vedtaket er omgjort';

const årsakPåkrevdFeil = 'Velg årsak til revurderingen';
const instansPåkrevdFeil = 'Velg hvilken instans som har omgjort vedtaket.';
const begrunnelsePåkrevdFeil = 'Beskriv kort årsaken til revurderingen.';
const serverFeil = 'Kunne ikke opprette revurderingen. Prøv igjen.';
const feiltittelFraServer = 'Revurdering kan ikke opprettes';
const feilmeldingFraServer = 'Det finnes allerede en åpen revurdering for denne saken.';
const manglerUrlFeil = 'Revurderingen ble opprettet, men svaret mangler URL til behandlingen.';

const vellykketSvar: Revurderingssvar = async () => ({ url: behandlingsUrl });

const renderRevurder = (svar: Revurderingssvar = vellykketSvar): Promise<Revurderingskall> => {
    const client = createTestQueryClient();
    const sendtKall = new Promise<Revurderingskall>(resolve => {
        client.setMutationDefaults(OPPRETT_REVURDERING_MUTATION_KEY, {
            mutationFn: async (kall: Revurderingskall) => {
                resolve(kall);
                return svar();
            },
        });
    });

    render(
        <QueryClientProvider client={client}>
            <MemoryRouter>
                <FagsakContext value={lagFagsak()}>
                    <TestBehandlingProvider
                        behandling={lagBehandling({ behandlingId, erNyModell: true })}
                    >
                        <Routes>
                            <Route path="/" element={<Revurdering />} />
                            <Route path={behandlingsUrl} element={<p>{nyBehandlingTekst}</p>} />
                        </Routes>
                    </TestBehandlingProvider>
                </FagsakContext>
            </MemoryRouter>
        </QueryClientProvider>
    );

    return sendtKall;
};

const dialog = (): HTMLElement => screen.getByRole('dialog', { name: dialogNavn });
const årsakSelect = (): HTMLElement => screen.getByRole('combobox', { name: årsakNavn });
const begrunnelseFelt = (): HTMLElement => screen.getByRole('textbox', { name: begrunnelseNavn });
const revurderKnapp = (): HTMLElement => within(dialog()).getByRole('button', { name: /Revurder/ });
const avbrytKnapp = (): HTMLElement => within(dialog()).getByRole('button', { name: 'Avbryt' });

describe('Revurdering', () => {
    let user: ReturnType<typeof userEvent.setup>;
    beforeEach(() => {
        user = userEvent.setup();
    });

    const åpneDialog = async (): Promise<void> => {
        await user.click(screen.getByRole('button', { name: menyknappNavn }));
        await user.click(screen.getByRole('menuitem', { name: menyvalgNavn }));
    };

    const fyllUtForeldelse = async (): Promise<void> => {
        await user.selectOptions(årsakSelect(), 'foreldelse');
        await user.type(begrunnelseFelt(), begrunnelse);
    };

    test('Åpner revurderingsdialogen med tastaturet', async () => {
        renderRevurder();

        await user.tab();
        expect(screen.getByRole('button', { name: menyknappNavn })).toHaveFocus();
        await user.keyboard('{Enter}');
        const menyvalg = await screen.findByRole('menuitem', { name: menyvalgNavn });
        await waitFor(() => expect(screen.getByRole('menu')).toHaveFocus());
        await user.keyboard('{ArrowDown}');
        await waitFor(() => expect(menyvalg).toHaveFocus());
        await user.keyboard('{Enter}');

        expect(await screen.findByRole('dialog', { name: dialogNavn })).toBeInTheDocument();
    });

    test.each([
        { årsak: 'feilutbetalt_belop_endret', antallInstanser: 4 },
        { årsak: 'etter_klage', antallInstanser: 4 },
        { årsak: 'uten_klage', antallInstanser: 2 },
    ])(
        'Viser $antallInstanser instansvalg for årsak $årsak',
        async ({ årsak, antallInstanser }) => {
            renderRevurder();
            await åpneDialog();

            await user.selectOptions(årsakSelect(), årsak);

            const instansgruppe = screen.getByRole('radiogroup', { name: instansNavn });
            expect(within(instansgruppe).getAllByRole('radio')).toHaveLength(antallInstanser);
        }
    );

    test('Viser ikke instansvalg for foreldelse', async () => {
        renderRevurder();
        await åpneDialog();

        await user.selectOptions(årsakSelect(), 'foreldelse');

        expect(screen.queryByRole('radiogroup', { name: instansNavn })).not.toBeInTheDocument();
        expect(begrunnelseFelt()).toBeInTheDocument();
    });

    test.each([
        { årsak: 'feilutbetalt_belop_endret', instans: 'Domstolen' },
        { årsak: 'etter_klage', instans: 'Trygderetten' },
        { årsak: 'uten_klage', instans: 'Klageinstansen' },
    ])('Sender instans og begrunnelse for årsak $årsak', async ({ årsak, instans }) => {
        const sendtKall = renderRevurder();
        await åpneDialog();

        await user.selectOptions(årsakSelect(), årsak);
        await user.click(screen.getByRole('radio', { name: instans }));
        await user.type(begrunnelseFelt(), begrunnelse);
        await user.click(revurderKnapp());

        await expect(sendtKall).resolves.toEqual({
            path: { behandlingId },
            body: { revurderingsarsak: { revurderingsarsak: årsak, instans, begrunnelse } },
        });
    });

    test('Sender kun begrunnelse for foreldelse', async () => {
        const sendtKall = renderRevurder();
        await åpneDialog();

        await fyllUtForeldelse();
        await user.click(revurderKnapp());

        await expect(sendtKall).resolves.toEqual({
            path: { behandlingId },
            body: { revurderingsarsak: { revurderingsarsak: 'foreldelse', begrunnelse } },
        });
    });

    test('Navigerer til URL-en fra responsen etter opprettelse', async () => {
        renderRevurder();
        await åpneDialog();

        await fyllUtForeldelse();
        await user.click(revurderKnapp());

        expect(await screen.findByText(nyBehandlingTekst)).toBeInTheDocument();
    });

    test('Krever at saksbehandler velger en årsak', async () => {
        renderRevurder();
        await åpneDialog();

        await user.click(revurderKnapp());

        expect(await screen.findByText(årsakPåkrevdFeil)).toBeInTheDocument();
    });

    test('Krever instans og begrunnelse for årsak med instans', async () => {
        renderRevurder();
        await åpneDialog();

        await user.selectOptions(årsakSelect(), 'etter_klage');
        await user.click(revurderKnapp());

        expect(await screen.findByText(instansPåkrevdFeil)).toBeInTheDocument();
        expect(screen.getByText(begrunnelsePåkrevdFeil)).toBeInTheDocument();
    });

    test('Viser feil og navigerer ikke når opprettelsen feiler', async () => {
        renderRevurder(async () => {
            throw new Error('Serverfeil');
        });
        await åpneDialog();

        await fyllUtForeldelse();
        await user.click(revurderKnapp());

        expect(await screen.findByText(serverFeil)).toBeInTheDocument();
        expect(screen.queryByText(nyBehandlingTekst)).not.toBeInTheDocument();
    });

    test('Viser tittel og melding fra feilresponsen', async () => {
        renderRevurder(async () => {
            throw new AxiosError('Bad Request', '400', undefined, undefined, {
                data: { tittel: feiltittelFraServer, melding: feilmeldingFraServer },
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config: { headers: new AxiosHeaders() },
            });
        });
        await åpneDialog();

        await fyllUtForeldelse();
        await user.click(revurderKnapp());

        expect(await screen.findByText(feiltittelFraServer)).toBeInTheDocument();
        expect(screen.getByText(feilmeldingFraServer)).toBeInTheDocument();
    });

    test('Viser feil og hindrer ny innsending når responsen mangler URL', async () => {
        renderRevurder(async () => ({ url: '' }));
        await åpneDialog();

        await fyllUtForeldelse();
        await user.click(revurderKnapp());

        expect(await screen.findByText(manglerUrlFeil)).toBeInTheDocument();
        expect(revurderKnapp()).toBeDisabled();
        expect(screen.queryByText(nyBehandlingTekst)).not.toBeInTheDocument();
    });

    test('Nullstiller skjemaet når dialogen åpnes på nytt', async () => {
        renderRevurder();
        await åpneDialog();

        await user.selectOptions(årsakSelect(), 'foreldelse');
        await user.click(avbrytKnapp());
        await åpneDialog();

        expect(årsakSelect()).toHaveValue('');
    });

    test('Deaktiverer knappene mens opprettelsen pågår', async () => {
        renderRevurder(() => new Promise(vi.fn()));
        await åpneDialog();

        await fyllUtForeldelse();
        await user.click(revurderKnapp());

        expect(revurderKnapp()).toBeDisabled();
        expect(avbrytKnapp()).toBeDisabled();
    });

    test('Lukker ikke dialogen mens opprettelsen pågår', async () => {
        renderRevurder(() => new Promise(vi.fn()));
        await åpneDialog();

        await fyllUtForeldelse();
        await user.click(revurderKnapp());
        await user.click(within(dialog()).getByRole('button', { name: 'Lukk' }));

        expect(dialog()).toBeInTheDocument();
    });
});
