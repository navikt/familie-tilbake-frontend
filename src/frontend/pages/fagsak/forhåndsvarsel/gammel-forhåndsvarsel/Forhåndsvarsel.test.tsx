import type { BehandlingDto, ForhåndsvarselDto } from '~/generated';

import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';

import { FagsakContext } from '~/context/FagsakContext';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandlingDto } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
    lagForhåndsvarselMutations,
} from '~/testdata/forhåndsvarselFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';

import { Forhåndsvarsel } from './Forhåndsvarsel';
import { useForhåndsvarselMutations } from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';

vi.mock('./useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: vi.fn(),
}));

vi.mock('./useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: vi.fn(),
    mapHarBrukerUttaltSegFraApiDto: vi.fn(),
}));

const lagForhåndsvarselInfo = (overrides?: Partial<ForhåndsvarselDto>): ForhåndsvarselDto => ({
    varselbrevDto: { varselbrevSendtTid: undefined },
    utsettUttalelseFrist: undefined,
    brukeruttalelse: undefined,
    ...overrides,
});

const renderForhåndsvarsel = (behandling: BehandlingDto = lagBehandlingDto()): void => {
    render(
        <FagsakContext value={lagFagsak()}>
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
        </FagsakContext>
    );
};

describe('Forhåndsvarsel', () => {
    let user: UserEvent;

    beforeEach(() => {
        vi.clearAllMocks();
        user = userEvent.setup();
        vi.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueries());
        vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Viser radiogruppe med riktig spørsmål og beskrivelse', () => {
        renderForhåndsvarsel();

        expect(
            screen.getByRole('radiogroup', {
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

    test('Viser skjema for opprettelse når Ja er valgt', () => {
        renderForhåndsvarsel();

        expect(screen.queryByText(/Opprett forhåndsvarsel/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(screen.getByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
    });

    test('Viser forhåndsvisning knapp når Ja er valgt og fritekst er fyllt ut', () => {
        renderForhåndsvarsel();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(screen.getByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
        const fritekstFelt = screen.getByLabelText(/Legg til utdypende tekst/i);
        fireEvent.change(fritekstFelt, { target: { value: 'Dette er en fritekst' } });

        expect(screen.getByRole('button', { name: 'Vis brevet' })).toBeInTheDocument();
    });

    test('Viser skjema for unntak når Nei er valgt', () => {
        renderForhåndsvarsel();

        expect(screen.queryByText(/Velg begrunnelse for unntak/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Nei'));

        expect(
            screen.getByRole('radiogroup', {
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

    test('Låser valg når varsel er sendt', () => {
        const mockQueries = vi.mocked(useForhåndsvarselQueries);
        mockQueries.mockReturnValue(
            lagForhåndsvarselQueries({
                forhåndsvarselInfo: lagForhåndsvarselInfo({
                    varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                }),
            })
        );

        renderForhåndsvarsel();

        const radioGroup = screen.getByRole('radiogroup', {
            name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
        });
        expect(radioGroup).toHaveClass('aksel-fieldset--readonly');
    });

    describe('Viser "nei"-valg og default values når unntak er sendt inn', () => {
        test('IKKE_PRAKTISK_MULIG', () => {
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

            const forhåndsvarselRadioGroup = screen.getByRole('radiogroup', {
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
                fireEvent.click(screen.getByRole('button', { name: 'Send forhåndsvarselet' }));

                expect(await screen.findByText('Du må fylle inn en verdi')).toBeInTheDocument();
            });
        });
    });

    describe('Knappetekst i ActionBar', () => {
        test('Viser "Send forhåndsvarselet" når Ja er valgt og varsel ikke er sendt', () => {
            renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

            fireEvent.click(screen.getByLabelText('Ja'));

            expect(
                screen.getByRole('button', { name: 'Send forhåndsvarselet' })
            ).toBeInTheDocument();
        });

        test('Viser "Lagre og gå til neste" når Nei er valgt (for å sende unntak)', () => {
            renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

            fireEvent.click(screen.getByLabelText('Nei'));

            expect(
                screen.getByRole('button', { name: 'Lagre og gå til neste' })
            ).toBeInTheDocument();
        });

        test('Viser "Lagre og gå til neste" når kun kommentarfeltet i uttalelse endres', () => {
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

            const kommentarFelt = screen.getByLabelText('Kommentar til valget over');
            fireEvent.change(kommentarFelt, { target: { value: 'Endret kommentar' } });

            expect(
                screen.getByRole('button', { name: 'Lagre og gå til neste' })
            ).toBeInTheDocument();
        });

        test('Viser "Neste" når varsel er sendt og bruker skal uttale seg', () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                    }),
                })
            );

            renderForhåndsvarsel();

            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
        });

        test('Viser "Utsett frist"-modal når bruker klikker utsett frist-knappen', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: {
                            varselbrevSendtTid: '2023-01-01T10:00:00Z',
                            opprinneligFristForUttalelse: '2023-01-22',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            fireEvent.click(screen.getByRole('button', { name: /utsett frist/i }));

            expect(
                await screen.findByRole('dialog', { name: /utsett frist for uttalelse/i })
            ).toBeInTheDocument();
        });
    });

    describe('formId - riktig skjema sendes inn', () => {
        test('Bruker opprettForm når varsel ikke er sendt og unntak ikke finnes', () => {
            renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

            const nesteKnapp = screen.getByRole('button', { name: 'Neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'opprettForm');
        });

        test('Bruker uttalelseForm når varsel er sendt', () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                    }),
                })
            );

            renderForhåndsvarsel();

            const nesteKnapp = screen.getByRole('button', { name: 'Neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'uttalelseForm');
        });

        test('Bruker opprettForm når bruker velger Nei og ÅPENBART_UNØDVENDIG', () => {
            renderForhåndsvarsel();

            const neiRadio = screen.getByRole('radio', { name: 'Nei' });
            fireEvent.click(neiRadio);

            const åpenbartUnødvendigRadio = screen.getByRole('radio', {
                name: /Varsel anses som åpenbart unødvendig/,
            });
            fireEvent.click(åpenbartUnødvendigRadio);

            const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'opprettForm');
        });

        test('Bruker opprettForm når unntak er lagret og bruker endrer til ÅPENBART_UNØDVENDIG', () => {
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

            const åpenbartUnødvendigRadio = screen.getByRole('radio', {
                name: /Varsel anses som åpenbart unødvendig/,
            });
            fireEvent.click(åpenbartUnødvendigRadio);

            const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'opprettForm');
        });

        test('Neste-knapp har form-attributt når brukeruttalelse allerede er registrert (kan redigeres)', () => {
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

            const nesteKnapp = screen.getByRole('button', { name: 'Neste' });
            expect(nesteKnapp).toHaveAttribute('form', 'uttalelseForm');
        });

        test('Neste-knapp har form-attributt når varsel er sendt og uttalelse er registrert (kan redigeres)', () => {
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

            const nesteKnapp = screen.getByRole('button', { name: 'Neste' });
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

            const nesteKnapp = screen.getByRole('button', { name: 'Neste' });
            await user.click(nesteKnapp);

            expect(mockMutations.navigerTilNeste).toHaveBeenCalled();
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
            await user.type(beskrivelsesFelt, 'Endret beskrivelse');

            const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
            await user.click(nesteKnapp);

            expect(mockMutations.sendUnntak).toHaveBeenCalled();
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

            const kommentarFelt = screen.getByLabelText('Kommentar til valget over');
            await user.type(kommentarFelt, 'Endret kommentar');

            const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
            await user.click(nesteKnapp);

            expect(mockMutations.sendBrukeruttalelse).toHaveBeenCalled();
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

            const brukeruttalelseFieldset = screen.getByRole('radiogroup', {
                name: /har brukeren uttalt seg/i,
            });
            fireEvent.click(within(brukeruttalelseFieldset).getByLabelText('Ja'));

            const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
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

            const brukeruttalelseFieldset = await screen.findByRole('radiogroup', {
                name: /har brukeren uttalt seg/i,
            });
            expect(brukeruttalelseFieldset).toBeInTheDocument();

            const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
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

            const begrunnelseFieldset = screen.getByRole('radiogroup', {
                name: /velg begrunnelse for unntak/i,
            });
            fireEvent.click(within(begrunnelseFieldset).getByLabelText(/forvaltningsloven §16c/i));
            const brukeruttalelseFieldset = screen.getByRole('radiogroup', {
                name: /har brukeren uttalt seg/i,
            });
            expect(brukeruttalelseFieldset).toBeInTheDocument();

            const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
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

            const brukeruttalelseFieldset = screen.getByRole('radiogroup', {
                name: /har brukeren uttalt seg/i,
            });

            const nesteKnapp = screen.getByRole('button', { name: 'Lagre og gå til neste' });
            await user.click(nesteKnapp);

            const feilmelding = screen.getByText('Du må velge om brukeren har uttalt seg');
            expect(feilmelding).toBeInTheDocument();

            await user.click(within(brukeruttalelseFieldset).getByLabelText('Nei'));

            expect(
                screen.queryByText('Du må velge om brukeren har uttalt seg')
            ).not.toBeInTheDocument();
        });
    });

    describe('Knappetekst ved endring tilbake til utgangspunkt', () => {
        test('Viser "Neste" når bruker bytter harUttaltSeg fra Nei til Ja og tilbake til Nei', () => {
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

            const brukeruttalelseFieldset = screen.getByRole('radiogroup', {
                name: /har brukeren uttalt seg/i,
            });

            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();

            fireEvent.click(within(brukeruttalelseFieldset).getByLabelText('Ja'));
            expect(
                screen.getByRole('button', { name: 'Lagre og gå til neste' })
            ).toBeInTheDocument();

            fireEvent.click(within(brukeruttalelseFieldset).getByLabelText('Nei'));

            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
        });

        test('Viser "Neste" når bruker bytter skalSendeForhåndsvarsel fra Nei til Ja og tilbake til Nei', () => {
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

            const skalSendeFieldset = screen.getByRole('radiogroup', {
                name: /skal det sendes forhåndsvarsel/i,
            });

            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();

            fireEvent.click(within(skalSendeFieldset).getByLabelText('Ja'));
            expect(
                screen.getByRole('button', { name: 'Send forhåndsvarselet' })
            ).toBeInTheDocument();

            fireEvent.click(within(skalSendeFieldset).getByLabelText('Nei'));
            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
        });

        test('Viser "Neste" når bruker bytter begrunnelseForUnntak og tilbake til opprinnelig', () => {
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

            const begrunnelseFieldset = screen.getByRole('radiogroup', {
                name: /velg begrunnelse for unntak/i,
            });

            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();

            fireEvent.click(within(begrunnelseFieldset).getByLabelText(/ikke praktisk mulig/i));
            expect(
                screen.getByRole('button', { name: 'Lagre og gå til neste' })
            ).toBeInTheDocument();

            fireEvent.click(within(begrunnelseFieldset).getByLabelText(/forvaltningsloven §16c/i));
            expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
        });
    });

    describe('Fristinfo', () => {
        test('Viser fristinfo med opprinnelig frist når varsel er sendt', () => {
            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: {
                            varselbrevSendtTid: '2023-01-01T10:00:00Z',
                            opprinneligFristForUttalelse: '2023-01-22',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            expect(screen.getByText('Frist for uttalelse')).toBeInTheDocument();
            expect(screen.getByText('22.01.2023')).toBeInTheDocument();
        });

        test('Viser ny frist i fristinfo når frist er utsatt', () => {
            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: {
                            varselbrevSendtTid: '2023-01-01T10:00:00Z',
                            opprinneligFristForUttalelse: '2023-01-22',
                        },
                        utsettUttalelseFrist: {
                            nyFrist: '2023-02-15',
                            begrunnelse: 'Trenger mer tid',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            expect(screen.getByText('Opprinnelig frist')).toBeInTheDocument();
            expect(screen.getByText('Ny frist for uttalelse')).toBeInTheDocument();
            expect(screen.getByText('15.02.2023')).toBeInTheDocument();
        });

        test('Viser ikke fristinfo når opprinneligFristForUttalelse mangler', () => {
            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                    }),
                })
            );

            renderForhåndsvarsel();

            expect(screen.queryByText('Frist for uttalelse')).not.toBeInTheDocument();
        });

        test('Viser utsett frist-knapp i fristinfo', () => {
            vi.mocked(useForhåndsvarselQueries).mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        varselbrevDto: {
                            varselbrevSendtTid: '2023-01-01T10:00:00Z',
                            opprinneligFristForUttalelse: '2023-01-22',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            expect(screen.getByRole('button', { name: /utsett frist/i })).toBeInTheDocument();
        });
    });
});
