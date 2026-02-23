import type { RenderResult } from '@testing-library/react';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { FagsakContext } from '~/context/FagsakContext';
import { Forhåndsvarsel } from '~/pages/fagsak/forhåndsvarsel/Forhåndsvarsel';
import { useForhåndsvarselMutations } from '~/pages/fagsak/forhåndsvarsel/useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from '~/pages/fagsak/forhåndsvarsel/useForhåndsvarselQueries';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandlingDto } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
    lagForhåndsvarselMutations,
} from '~/testdata/forhåndsvarselFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { configureZod } from '~/utils/zodConfig';

vi.mock('../useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: vi.fn(),
}));

vi.mock('../useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: vi.fn(),
    mapHarBrukerUttaltSegFraApiDto: vi.fn(),
}));

const renderBrukeruttalelse = (): RenderResult => {
    const behandling = lagBehandlingDto({
        varselSendt: true,
    });

    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <TestBehandlingProvider behandling={behandling}>
                <QueryClientProvider client={createTestQueryClient()}>
                    <Forhåndsvarsel />
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext.Provider>
    );
};

beforeAll(() => {
    configureZod();
});

describe('Brukeruttalelse', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useForhåndsvarselQueries).mockReturnValue(
            lagForhåndsvarselQueries({
                forhåndsvarselInfo: {
                    varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                    utsettUttalelseFrist: [
                        // { nyFrist: '2023-01-15', begrunnelse: 'Trenger mer tid' },
                    ],
                    brukeruttalelse: undefined,
                },
            })
        );

        vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Viser Ja og Nei alternativer', () => {
        renderBrukeruttalelse();

        expect(
            screen.getByText('Har brukeren uttalt seg etter forhåndsvarselet ble sendt?')
        ).toBeInTheDocument();

        const jaOptions = screen.getAllByLabelText('Ja');
        expect(jaOptions).toHaveLength(2);

        const neiOptions = screen.getAllByLabelText('Nei');
        expect(neiOptions).toHaveLength(2);
    });

    test('Viser "Utsett frist" alternativ hvis varsel er sendt', () => {
        renderBrukeruttalelse();

        expect(screen.getByLabelText('Utsett frist for å uttale seg')).toBeInTheDocument();
    });

    test('Viser uttalelsesfelter når Ja er valgt', async () => {
        renderBrukeruttalelse();

        expect(screen.queryByLabelText('Når uttalte brukeren seg?')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Hvordan uttalte brukeren seg?')).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText('Beskriv hva brukeren har uttalt seg om')
        ).not.toBeInTheDocument();

        const brukeruttalelseFieldset = screen.getByRole('group', {
            name: /har brukeren uttalt seg etter forhåndsvarselet/i,
        });
        const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
        fireEvent.click(jaRadio);

        expect(await screen.findByLabelText('Når uttalte brukeren seg?')).toBeInTheDocument();
        expect(screen.getByLabelText('Hvordan uttalte brukeren seg?')).toBeInTheDocument();
        expect(screen.getByLabelText('Beskriv hva brukeren har uttalt seg om')).toBeInTheDocument();
    });

    test('Viser beskrivelse for "Hvordan uttalte brukeren seg?" feltet', async () => {
        renderBrukeruttalelse();

        const brukeruttalelseFieldset = screen.getByRole('group', {
            name: /har brukeren uttalt seg etter forhåndsvarselet/i,
        });
        const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
        fireEvent.click(jaRadio);

        expect(
            await screen.findByText('For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss')
        ).toBeInTheDocument();
    });

    test('Viser kommentarfelt når Nei er valgt', async () => {
        renderBrukeruttalelse();

        expect(screen.queryByLabelText('Kommentar til valget over')).not.toBeInTheDocument();

        const brukeruttalelseFieldset = screen.getByRole('group', {
            name: /har brukeren uttalt seg etter forhåndsvarselet/i,
        });
        const neiRadio = within(brukeruttalelseFieldset).getByLabelText('Nei');
        fireEvent.click(neiRadio);

        expect(await screen.findByLabelText('Kommentar til valget over')).toBeInTheDocument();
    });

    test('Viser utsettelsesfelter når "Utsett frist" er valgt', async () => {
        renderBrukeruttalelse();

        expect(screen.queryByLabelText('Sett ny dato for frist')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Begrunnelse for utsatt frist')).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Utsett frist for å uttale seg'));

        expect(await screen.findByLabelText('Sett ny dato for frist')).toBeInTheDocument();
        expect(screen.getByLabelText('Begrunnelse for utsatt frist')).toBeInTheDocument();
    });

    describe('Fylt uttalelse', () => {
        test('Viser utfylte verdier når brukeruttalelse er fylt ut', async () => {
            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: {
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                        utsettUttalelseFrist: [],
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'JA',
                            uttalelsesdetaljer: [
                                {
                                    uttalelsesdato: '2023-06-15',
                                    hvorBrukerenUttalteSeg: 'Telefon',
                                    uttalelseBeskrivelse: 'Brukeren forklarte situasjonen',
                                },
                            ],
                        },
                    },
                })
            );

            const { findByRole } = renderBrukeruttalelse();

            const uttalelsesdato = await findByRole('textbox', {
                name: 'Når uttalte brukeren seg?',
            });
            expect(uttalelsesdato).toHaveValue('15.06.2023');
            const hvordanUttalteSeg = await findByRole('textbox', {
                name: 'Hvordan uttalte brukeren seg?',
            });
            expect(hvordanUttalteSeg).toHaveValue('Telefon');
            const beskrivelse = await findByRole('textbox', {
                name: 'Beskriv hva brukeren har uttalt seg om',
            });
            expect(beskrivelse).toHaveValue('Brukeren forklarte situasjonen');
        });
    });

    describe('Validering', () => {
        test('skal vise feilmelding når ingen alternativ er valgt', async () => {
            renderBrukeruttalelse();

            const nesteKnapp = await screen.findByRole('button', { name: 'Neste' });
            fireEvent.click(nesteKnapp);

            const brukeruttalelseFieldset = screen.getByRole('group', {
                name: /har brukeren uttalt seg etter forhåndsvarselet/i,
            });

            expect(
                await within(brukeruttalelseFieldset).findByText(
                    'Du må velge om brukeren har uttalt seg'
                )
            ).toBeInTheDocument();
        });

        describe('Når Ja er valgt', () => {
            test('skal vise dato-feilmelding når Ja er valgt uten fylt dato-felt', async () => {
                renderBrukeruttalelse();

                const brukeruttalelseFieldset = screen.getByRole('group', {
                    name: /har brukeren uttalt seg etter forhåndsvarselet/i,
                });
                const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
                fireEvent.click(jaRadio);

                const nesteKnapp = await screen.findByRole('button', {
                    name: 'Lagre og gå til neste',
                });
                fireEvent.click(nesteKnapp);

                expect(
                    await screen.findByText('Du må skrive en dato på denne måten: dd.mm.åååå')
                ).toBeInTheDocument();
            });

            test('skal vise dato-feilmelding når Ja er valgt uten fylt dato-felt på blur', async () => {
                renderBrukeruttalelse();

                const brukeruttalelseFieldset = screen.getByRole('group', {
                    name: /har brukeren uttalt seg etter forhåndsvarselet/i,
                });
                const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
                fireEvent.click(jaRadio);

                const datoInput = await screen.findByLabelText('Når uttalte brukeren seg?');
                fireEvent.blur(datoInput);

                expect(
                    await screen.findByText('Du må skrive en dato på denne måten: dd.mm.åååå')
                ).toBeInTheDocument();
            });

            test('skal vise riktig hvorUttalteBrukerenSeg og beskrivelse feilmelding ved tomme felt', async () => {
                renderBrukeruttalelse();

                const brukeruttalelseFieldset = screen.getByRole('group', {
                    name: /har brukeren uttalt seg etter forhåndsvarselet/i,
                });
                const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
                fireEvent.click(jaRadio);

                const nesteKnapp = await screen.findByRole('button', {
                    name: 'Lagre og gå til neste',
                });
                fireEvent.click(nesteKnapp);

                expect(await screen.findAllByText('Du må fylle inn en verdi')).toHaveLength(2);
            });

            test('skal vise feilmelding når dato er i fremtiden', async () => {
                renderBrukeruttalelse();

                const brukeruttalelseFieldset = screen.getByRole('group', {
                    name: /har brukeren uttalt seg etter forhåndsvarselet/i,
                });
                const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
                fireEvent.click(jaRadio);

                const datoInput = await screen.findByLabelText('Når uttalte brukeren seg?');
                fireEvent.change(datoInput, { target: { value: '01.01.2099' } });
                fireEvent.blur(datoInput);

                expect(
                    await screen.findByText('Datoen kan ikke være i fremtiden')
                ).toBeInTheDocument();
            });

            test('skal begrense kalenderen til dagens dato (toDate)', async () => {
                const user = userEvent.setup();
                renderBrukeruttalelse();

                const brukeruttalelseFieldset = screen.getByRole('group', {
                    name: /har brukeren uttalt seg etter forhåndsvarselet/i,
                });
                const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
                await user.click(jaRadio);

                await screen.findByLabelText('Når uttalte brukeren seg?');

                const kalenderKnapp = screen.getAllByRole('button', { name: 'Åpne datovelger' });
                const uttalelsesKalenderKnapp = kalenderKnapp[0];
                await user.click(uttalelsesKalenderKnapp);

                const nesteMånedKnapp = await screen.findByRole('button', {
                    name: /gå til neste måned/i,
                });
                expect(nesteMånedKnapp).toBeDisabled();
            });
        });
    });
});
