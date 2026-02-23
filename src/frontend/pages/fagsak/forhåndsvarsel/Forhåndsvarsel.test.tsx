import type { BehandlingDto, ForhåndsvarselDto } from '../../../generated';
import type { RenderResult } from '@testing-library/react';

import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';

import { Forhåndsvarsel } from './Forhåndsvarsel';
import { useForhåndsvarselMutations } from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';
import { FagsakContext } from '../../../context/FagsakContext';
import { TestBehandlingProvider } from '../../../testdata/behandlingContextFactory';
import { lagBehandlingDto } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
    lagForhåndsvarselMutations,
} from '../../../testdata/forhåndsvarselFactory';
import { createTestQueryClient } from '../../../testutils/queryTestUtils';
import { configureZod } from '../../../utils/zodConfig';

vi.mock('./useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: vi.fn(),
}));

vi.mock('./useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: vi.fn(),
    mapHarBrukerUttaltSegFraApiDto: vi.fn(),
}));

const lagForhåndsvarselInfo = (overrides?: Partial<ForhåndsvarselDto>): ForhåndsvarselDto => ({
    varselbrevDto: { varselbrevSendtTid: undefined },
    utsettUttalelseFrist: [],
    brukeruttalelse: undefined,
    ...overrides,
});

const renderForhåndsvarsel = (behandling: BehandlingDto = lagBehandlingDto()): RenderResult => {
    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <TestBehandlingProvider
                behandling={behandling}
                stateOverrides={{
                    actionBarStegtekst: (): string | undefined => 'Steg 2 av 5',
                }}
            >
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

describe('Forhåndsvarsel', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueries());
        vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Viser radiogruppe med riktig spørsmål og beskrivelse', () => {
        renderForhåndsvarsel();

        expect(
            screen.getByRole('group', {
                name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
            })
        ).toBeInTheDocument();

        expect(screen.getByText(/Brukeren skal som klar hovedregel varsles/)).toBeInTheDocument();
    });

    test('Viser alle radioknapp-alternativene', () => {
        renderForhåndsvarsel();

        expect(screen.getByLabelText('Ja')).toBeInTheDocument();
        expect(screen.getByLabelText('Nei')).toBeInTheDocument();
    });

    test('Viser skjema for opprettelse når Ja er valgt', async () => {
        renderForhåndsvarsel();

        expect(screen.queryByText(/Opprett forhåndsvarsel/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(await screen.findByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
    });

    test('Viser forhåndsvisning knapp når Ja er valgt og fritekst er fyllt ut', async () => {
        renderForhåndsvarsel();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(await screen.findByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
        const fritekstFelt = screen.getByLabelText(/Legg til utdypende tekst/i);
        fireEvent.change(fritekstFelt, { target: { value: 'Dette er en fritekst' } });

        expect(await screen.findByRole('button', { name: 'Forhåndsvis' })).toBeInTheDocument();
    });

    test('Viser skjema for unntak når Nei er valgt', () => {
        renderForhåndsvarsel();

        expect(screen.queryByText(/Velg begrunnelse for unntak/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Nei'));

        expect(
            screen.getByRole('group', {
                name: /Velg begrunnelse for unntak fra forhåndsvarsel/,
            })
        ).toBeInTheDocument();
    });

    test('Viser ActionBar med riktig stegtekst', () => {
        renderForhåndsvarsel();

        expect(screen.getByText('Steg 2 av 5')).toBeInTheDocument();
    });

    test('Viser "Neste" som standard knappetekst', () => {
        renderForhåndsvarsel();

        expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
    });

    test('Viser tag med sendt informasjon når forhåndsvarsel er sendt', async () => {
        const mockQueries = vi.mocked(useForhåndsvarselQueries);
        mockQueries.mockReturnValue(
            lagForhåndsvarselQueries({
                forhåndsvarselInfo: lagForhåndsvarselInfo({
                    varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                }),
            })
        );

        renderForhåndsvarsel();

        const tag = await screen.findByText(/Sendt/);
        expect(tag).toBeInTheDocument();
    });

    test('Låser valg når varsel er sendt', async () => {
        const mockQueries = vi.mocked(useForhåndsvarselQueries);
        mockQueries.mockReturnValue(
            lagForhåndsvarselQueries({
                forhåndsvarselInfo: lagForhåndsvarselInfo({
                    varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                }),
            })
        );

        renderForhåndsvarsel();

        const radioGroup = await screen.findByRole('group', {
            name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
        });
        expect(radioGroup).toHaveClass('aksel-fieldset--readonly');
    });

    describe('Viser "nei"-valg og default values når unntak er sendt inn', () => {
        test('IKKE_PRAKTISK_MULIG', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'IKKE_PRAKTISK_MULIG',
                            beskrivelse: 'Dette er en beskrivelse',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const forhåndsvarselRadioGroup = await screen.findByRole('group', {
                name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
            });
            expect(
                within(forhåndsvarselRadioGroup).getByRole('radio', { name: 'Nei' })
            ).toBeChecked();
            expect(
                screen.getByRole('radio', {
                    name: /Varsling er ikke praktisk mulig eller vil hindre gjennomføring av vedtaket/,
                })
            ).toBeChecked();
            expect(
                screen.getByLabelText(/Forklar hvorfor forhåndsvarselet ikke skal bli sendt/)
            ).toHaveValue('Dette er en beskrivelse');
        });
    });

    describe('Validering', () => {
        test('Skal vise feilmelding dersom ingen Skalsendeforhåndsvarsel-alternativ er valgt', async () => {
            renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

            fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

            expect(
                await screen.findByText('Du må velge om forhåndsvarselet skal sendes eller ikke')
            ).toBeInTheDocument();
        });

        describe("Når 'Ja' er valgt", () => {
            test('Vises feilmelding dersom fritekstfelt er tomt', async () => {
                renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

                fireEvent.click(screen.getByText('Ja'));
                fireEvent.click(screen.getByRole('button', { name: 'Send forhåndsvarsel' }));

                expect(await screen.findByText('Du må fylle inn en verdi')).toBeInTheDocument();
            });
        });
    });

    describe('Knappetekst i ActionBar', () => {
        test('Viser "Send forhåndsvarsel" når Ja er valgt og varsel ikke er sendt', async () => {
            renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

            fireEvent.click(screen.getByLabelText('Ja'));

            expect(
                await screen.findByRole('button', { name: 'Send forhåndsvarsel' })
            ).toBeInTheDocument();
        });

        test('Viser "Lagre og gå til neste" når Nei er valgt (for å sende unntak)', async () => {
            renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

            fireEvent.click(screen.getByLabelText('Nei'));

            expect(
                await screen.findByRole('button', { name: 'Lagre og gå til neste' })
            ).toBeInTheDocument();
        });

        test('Viser "Lagre og gå til neste" når kun kommentarfeltet i uttalelse endres', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'NEI',
                            kommentar: 'Opprinnelig kommentar',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const kommentarFelt = await screen.findByLabelText('Kommentar til valget over');
            fireEvent.change(kommentarFelt, { target: { value: 'Endret kommentar' } });

            expect(
                await screen.findByRole('button', { name: 'Lagre og gå til neste' })
            ).toBeInTheDocument();
        });

        test('Viser "Neste" når varsel er sendt og bruker skal uttale seg', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                    }),
                })
            );

            renderForhåndsvarsel();

            expect(await screen.findByRole('button', { name: 'Neste' })).toBeInTheDocument();
        });

        test('Viser "Utsett frist" når bruker velger å utsette frist', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                    }),
                })
            );

            renderForhåndsvarsel();

            const brukeruttalelseFieldset = await screen.findByRole('group', {
                name: /har brukeren uttalt seg/i,
            });
            fireEvent.click(
                within(brukeruttalelseFieldset).getByLabelText('Utsett frist for å uttale seg')
            );

            expect(await screen.findByRole('button', { name: 'Utsett frist' })).toBeInTheDocument();
        });
    });

    describe('formId - riktig skjema sendes inn', () => {
        test('Bruker opprettForm når varsel ikke er sendt og unntak ikke finnes', async () => {
            renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

            const nesteKnapp = screen.getByRole('button', { name: 'Neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'opprettForm');
        });

        test('Bruker uttalelseForm når varsel er sendt', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                    }),
                })
            );

            renderForhåndsvarsel();

            const nesteKnapp = await screen.findByRole('button', { name: 'Neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'uttalelseForm');
        });

        test('Bruker opprettForm når bruker velger Nei og ÅPENBART_UNØDVENDIG', async () => {
            renderForhåndsvarsel();

            const neiRadio = screen.getByRole('radio', { name: 'Nei' });
            fireEvent.click(neiRadio);

            const åpenbartUnødvendigRadio = await screen.findByRole('radio', {
                name: /Varsel anses som åpenbart unødvendig/,
            });
            fireEvent.click(åpenbartUnødvendigRadio);

            const nesteKnapp = await screen.findByRole('button', { name: 'Lagre og gå til neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'opprettForm');
        });

        test('Bruker opprettForm når unntak er lagret og bruker endrer til ÅPENBART_UNØDVENDIG', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'IKKE_PRAKTISK_MULIG',
                            beskrivelse: 'Beskrivelse',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const åpenbartUnødvendigRadio = await screen.findByRole('radio', {
                name: /Varsel anses som åpenbart unødvendig/,
            });
            fireEvent.click(åpenbartUnødvendigRadio);

            const nesteKnapp = await screen.findByRole('button', { name: 'Lagre og gå til neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'opprettForm');
        });

        test('Neste-knapp har form-attributt når brukeruttalelse allerede er registrert (kan redigeres)', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'JA',
                            uttalelsesdetaljer: [
                                {
                                    uttalelsesdato: '2023-01-15',
                                    hvorBrukerenUttalteSeg: 'Telefon',
                                    uttalelseBeskrivelse: 'Bruker har uttalt seg',
                                },
                            ],
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const nesteKnapp = await screen.findByRole('button', { name: 'Neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'uttalelseForm');
        });

        test('Neste-knapp har form-attributt når varsel er sendt og uttalelse er registrert (kan redigeres)', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'JA',
                            uttalelsesdetaljer: [
                                {
                                    uttalelsesdato: '2023-01-15',
                                    hvorBrukerenUttalteSeg: 'Telefon',
                                    uttalelseBeskrivelse: 'Bruker har uttalt seg',
                                },
                            ],
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const nesteKnapp = await screen.findByRole('button', { name: 'Neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'uttalelseForm');
        });
    });

    describe('API-kall', () => {
        test('Kaller ikke sendBrukeruttalelse når uttalelse ikke er endret', async () => {
            const mockMutations = lagForhåndsvarselMutations();
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(mockMutations);

            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'JA',
                            uttalelsesdetaljer: [
                                {
                                    uttalelsesdato: '2023-01-15',
                                    hvorBrukerenUttalteSeg: 'Telefon',
                                    uttalelseBeskrivelse: 'Bruker har uttalt seg',
                                },
                            ],
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const nesteKnapp = await screen.findByRole('button', { name: 'Neste' });
            fireEvent.click(nesteKnapp);

            await waitFor(() => {
                expect(mockMutations.navigerTilNeste).toHaveBeenCalled();
            });
            expect(mockMutations.sendBrukeruttalelse).not.toHaveBeenCalled();
        });

        test('Kaller kun sendUnntak når kun unntak er endret ved ÅPENBART_UNØDVENDIG', async () => {
            const mockMutations = lagForhåndsvarselMutations();
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(mockMutations);

            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Opprinnelig beskrivelse',
                        },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'NEI',
                            kommentar: 'Kommentar',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const beskrivelsesFelt = await screen.findByLabelText(
                'Forklar hvorfor forhåndsvarselet ikke skal bli sendt'
            );
            fireEvent.change(beskrivelsesFelt, { target: { value: 'Endret beskrivelse' } });

            const nesteKnapp = await screen.findByRole('button', { name: 'Lagre og gå til neste' });
            fireEvent.click(nesteKnapp);

            await waitFor(() => {
                expect(mockMutations.sendUnntak).toHaveBeenCalled();
            });
            expect(mockMutations.sendBrukeruttalelse).not.toHaveBeenCalled();
        });

        test('Kaller kun sendBrukeruttalelse når kun uttalelse er endret (unntak uendret)', async () => {
            const mockMutations = lagForhåndsvarselMutations();
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(mockMutations);

            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'NEI',
                            kommentar: 'Opprinnelig kommentar',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const kommentarFelt = await screen.findByLabelText('Kommentar til valget over');
            fireEvent.change(kommentarFelt, { target: { value: 'Endret kommentar' } });

            const nesteKnapp = await screen.findByRole('button', { name: 'Lagre og gå til neste' });
            fireEvent.click(nesteKnapp);

            await waitFor(() => {
                expect(mockMutations.sendBrukeruttalelse).toHaveBeenCalled();
            });
            expect(mockMutations.sendUnntak).not.toHaveBeenCalled();
        });

        test('Validerer uttalelsesfelt når bruker endrer fra Nei til Ja ved ÅPENBART_UNØDVENDIG', async () => {
            const mockMutations = lagForhåndsvarselMutations();
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(mockMutations);

            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'NEI',
                            kommentar: 'Kommentar',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const brukeruttalelseFieldset = await screen.findByRole('group', {
                name: /har brukeren uttalt seg/i,
            });
            fireEvent.click(within(brukeruttalelseFieldset).getByLabelText('Ja'));

            const nesteKnapp = await screen.findByRole('button', { name: 'Lagre og gå til neste' });
            fireEvent.click(nesteKnapp);

            const feilmeldinger = await screen.findAllByText('Du må fylle inn en verdi');
            expect(feilmeldinger.length).toBeGreaterThan(0);
            expect(mockMutations.sendBrukeruttalelse).not.toHaveBeenCalled();
        });

        test('Validerer uttalelse ved ÅPENBART_UNØDVENDIG når uttalelse ikke er lagret', async () => {
            const mockMutations = lagForhåndsvarselMutations();
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(mockMutations);

            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: undefined,
                    }),
                })
            );

            renderForhåndsvarsel();

            const brukeruttalelseFieldset = await screen.findByRole('group', {
                name: /har brukeren uttalt seg/i,
            });
            expect(brukeruttalelseFieldset).toBeInTheDocument();

            const nesteKnapp = await screen.findByRole('button', { name: 'Lagre og gå til neste' });
            fireEvent.click(nesteKnapp);

            const feilmelding = await screen.findByText('Du må velge om brukeren har uttalt seg');
            expect(feilmelding).toBeInTheDocument();
            expect(mockMutations.sendBrukeruttalelse).not.toHaveBeenCalled();
            expect(mockMutations.navigerTilNeste).not.toHaveBeenCalled();
        });

        test('Validerer uttalelse når bruker bytter fra §16b til §16c uten uttalelse lagret', async () => {
            const mockMutations = lagForhåndsvarselMutations();
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(mockMutations);

            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'UKJENT_ADRESSE_ELLER_URIMELIG_ETTERSPORING',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: undefined,
                    }),
                })
            );

            renderForhåndsvarsel();

            const begrunnelseFieldset = await screen.findByRole('group', {
                name: /velg begrunnelse for unntak/i,
            });
            fireEvent.click(within(begrunnelseFieldset).getByLabelText(/forvaltningsloven §16c/i));
            const brukeruttalelseFieldset = await screen.findByRole('group', {
                name: /har brukeren uttalt seg/i,
            });
            expect(brukeruttalelseFieldset).toBeInTheDocument();

            const nesteKnapp = await screen.findByRole('button', { name: 'Lagre og gå til neste' });
            fireEvent.click(nesteKnapp);

            const feilmelding = await screen.findByText('Du må velge om brukeren har uttalt seg');
            expect(feilmelding).toBeInTheDocument();
            expect(mockMutations.sendUnntak).not.toHaveBeenCalled();
            expect(mockMutations.sendBrukeruttalelse).not.toHaveBeenCalled();
        });

        test('Fjerner feilmelding når bruker fyller ut påkrevd felt etter validering', async () => {
            const mockMutations = lagForhåndsvarselMutations();
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(mockMutations);

            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: undefined,
                    }),
                })
            );

            renderForhåndsvarsel();

            const brukeruttalelseFieldset = await screen.findByRole('group', {
                name: /har brukeren uttalt seg/i,
            });

            const nesteKnapp = await screen.findByRole('button', { name: 'Lagre og gå til neste' });
            fireEvent.click(nesteKnapp);

            const feilmelding = await screen.findByText('Du må velge om brukeren har uttalt seg');
            expect(feilmelding).toBeInTheDocument();

            fireEvent.click(within(brukeruttalelseFieldset).getByLabelText('Nei'));

            await waitFor(() => {
                expect(
                    screen.queryByText('Du må velge om brukeren har uttalt seg')
                ).not.toBeInTheDocument();
            });
        });
    });

    describe('Knappetekst ved endring tilbake til utgangspunkt', () => {
        test('Viser "Neste" når bruker bytter harUttaltSeg fra Nei til Ja og tilbake til Nei', async () => {
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'NEI',
                            kommentar: 'Kommentar',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const brukeruttalelseFieldset = await screen.findByRole('group', {
                name: /har brukeren uttalt seg/i,
            });

            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();

            fireEvent.click(within(brukeruttalelseFieldset).getByLabelText('Ja'));
            expect(
                screen.getByRole('button', { name: 'Lagre og gå til neste' })
            ).toBeInTheDocument();

            fireEvent.click(within(brukeruttalelseFieldset).getByLabelText('Nei'));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
            });
        });

        test('Viser "Neste" når bruker bytter skalSendeForhåndsvarsel fra Nei til Ja og tilbake til Nei', async () => {
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'NEI',
                            kommentar: 'Kommentar',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const skalSendeFieldset = await screen.findByRole('group', {
                name: /skal det sendes forhåndsvarsel/i,
            });

            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();

            fireEvent.click(within(skalSendeFieldset).getByLabelText('Ja'));
            expect(screen.getByRole('button', { name: 'Send forhåndsvarsel' })).toBeInTheDocument();

            fireEvent.click(within(skalSendeFieldset).getByLabelText('Nei'));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
            });
        });

        test('Viser "Neste" når bruker bytter begrunnelseForUnntak og tilbake til opprinnelig', async () => {
            vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'ÅPENBART_UNØDVENDIG',
                            beskrivelse: 'Beskrivelse',
                        },
                        brukeruttalelse: {
                            harBrukerUttaltSeg: 'NEI',
                            kommentar: 'Kommentar',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            const begrunnelseFieldset = await screen.findByRole('group', {
                name: /velg begrunnelse for unntak/i,
            });

            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();

            fireEvent.click(within(begrunnelseFieldset).getByLabelText(/ikke praktisk mulig/i));
            expect(
                screen.getByRole('button', { name: 'Lagre og gå til neste' })
            ).toBeInTheDocument();

            fireEvent.click(within(begrunnelseFieldset).getByLabelText(/forvaltningsloven §16c/i));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
            });
        });
    });
});
