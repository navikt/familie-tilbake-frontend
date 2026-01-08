import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { FaktaOmFeilutbetalingDto, OppdaterFaktaData } from '../../../generated';
import type { RenderResult } from '@testing-library/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import { FaktaSkjema } from './FaktaSkjema';
import { FagsakContext } from '../../../context/FagsakContext';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { configureZod } from '../../../utils/zodConfig';

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

const mockUseBehandling = vi.fn(() => ({
    actionBarStegtekst: (): string => 'Mocked!!',
    erStegBehandlet: (): boolean => false,
    hentBehandlingMedBehandlingId: async (): Promise<void> => Promise.resolve(),
}));

vi.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): Partial<BehandlingHook> => mockUseBehandling(),
}));

const faktaOmFeilutbetaling = (
    overrides?: Partial<FaktaOmFeilutbetalingDto>
): FaktaOmFeilutbetalingDto => ({
    feilutbetaling: {
        beløp: 6900,
        fom: '1969-04-20',
        tom: '1969-04-31',
        revurdering: {
            årsak: 'Ukjent',
            vedtaksdato: '2025-12-01',
            resultat: 'INNVILGET',
        },
    },
    tidligereVarsletBeløp: 6900,
    muligeRettsligGrunnlag: [
        {
            bestemmelse: {
                nøkkel: 'ANNET',
                beskrivelse: 'Annet',
            },
            grunnlag: [
                {
                    nøkkel: 'ANNET_FRITEKST',
                    beskrivelse: 'Annet fritekst',
                },
            ],
        },
    ],
    perioder: [
        {
            id: 'unik',
            fom: '1969-04-20',
            tom: '1969-04-31',
            feilutbetaltBeløp: 6900,
            splittbarePerioder: [],
            rettsligGrunnlag: [
                {
                    bestemmelse: 'ANNET',
                    grunnlag: 'ANNET_FRITEKST',
                },
            ],
        },
    ],
    ferdigvurdert: false,
    vurdering: {
        årsak: undefined,
        oppdaget: undefined,
    },
    ...overrides,
});

const renderFakta = (
    overrides?: Partial<FaktaOmFeilutbetalingDto>
): { result: RenderResult; mutationBody: Promise<OppdaterFaktaData> } => {
    const client = new QueryClient();
    const mutationBody = new Promise<OppdaterFaktaData>(resolve => {
        client.setMutationDefaults(['oppdaterFakta'], {
            mutationFn: async (fakta: OppdaterFaktaData) => {
                resolve(fakta);
                return faktaOmFeilutbetaling({
                    ferdigvurdert: true,
                });
            },
        });
    });

    return {
        result: render(
            <FagsakContext.Provider value={lagFagsak()}>
                <QueryClientProvider client={client}>
                    <FaktaSkjema
                        faktaOmFeilutbetaling={faktaOmFeilutbetaling(overrides)}
                        behandlingId="unik"
                        behandlingUrl="https://tilbakekreving"
                    />
                </QueryClientProvider>
            </FagsakContext.Provider>
        ),
        mutationBody,
    };
};

beforeAll(() => {
    configureZod();
});

describe('Fakta om feilutbetaling', () => {
    describe('Rettslig grunnlag', () => {
        test('Forhåndsutfylt rettslig grunnlag fra backend', async () => {
            const {
                result: { findByRole },
            } = renderFakta();

            const bestemmelse = await findByRole('combobox', { name: 'Velg bestemmelse' });
            expect(bestemmelse).toHaveTextContent('Annet');
            expect(bestemmelse).toHaveValue('ANNET');

            const grunnlag = await findByRole('combobox', { name: 'Velg grunnlag' });
            expect(grunnlag).toHaveTextContent('Annet fritekst');
            expect(grunnlag).toHaveValue('ANNET_FRITEKST');
        });

        test('Defaults hentes fra input objekt', async () => {
            const {
                result: { findByRole },
            } = renderFakta({
                vurdering: {
                    årsak: 'Svindel',
                    oppdaget: {
                        av: 'NAV',
                        dato: '2020-04-20',
                        beskrivelse: 'Fant et dokument under bordet.',
                    },
                },
            });

            const årsakBeskrivelse = await findByRole('textbox', {
                name: 'Årsak til feilutbetalingen',
            });
            expect(årsakBeskrivelse).toHaveValue('Svindel');

            const oppdagetDato = await findByRole('textbox', {
                name: 'Når ble feilutbetalingen oppdaget?',
            });
            expect(oppdagetDato).toHaveValue('20.04.2020');

            expect(await findByRole('radio', { name: 'Nav' })).toBeChecked();
            expect(await findByRole('radio', { name: 'Bruker' })).not.toBeChecked();
            const oppdagetBeskrivelse = await findByRole('textbox', {
                name: 'Hvordan ble feilutbetalingen oppdaget?',
            });
            expect(oppdagetBeskrivelse).toHaveValue('Fant et dokument under bordet.');
        });

        test('Submit form with all values', async () => {
            const {
                result: { findByRole },
                mutationBody,
            } = renderFakta({});

            await waitFor(async () => {
                fireEvent.change(
                    await findByRole('textbox', { name: 'Årsak til feilutbetalingen' }),
                    {
                        target: { value: 'årsak' },
                    }
                );
            });

            const oppdagetDato = await findByRole('textbox', {
                name: 'Når ble feilutbetalingen oppdaget?',
            });
            fireEvent.change(oppdagetDato, { target: { value: '20.04.2020' } });

            fireEvent.click(await findByRole('radio', { name: 'Nav' }));
            fireEvent.change(
                await findByRole('textbox', { name: 'Hvordan ble feilutbetalingen oppdaget?' }),
                {
                    target: { value: 'hvordan' },
                }
            );
            await waitFor(async () => {
                fireEvent.click(
                    await findByRole('button', { name: 'Gå videre til foreldelsessteget' })
                );
            });
            await expect(mutationBody).resolves.toEqual({
                path: {
                    behandlingId: 'unik',
                },
                body: {
                    perioder: [
                        {
                            id: 'unik',
                            rettsligGrunnlag: [
                                {
                                    bestemmelse: 'ANNET',
                                    grunnlag: 'ANNET_FRITEKST',
                                },
                            ],
                        },
                    ],
                    vurdering: {
                        årsak: 'årsak',
                        oppdaget: {
                            av: 'NAV',
                            beskrivelse: 'hvordan',
                            dato: '2020-04-20',
                        },
                    },
                },
            });
        });

        test('bytter til submit knapp når dato endres', async () => {
            const {
                result: { findByRole },
            } = renderFakta({});

            const nesteKnapp = await findByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            });
            expect(nesteKnapp).toHaveAttribute('type', 'submit');

            const oppdagetDato = await findByRole('textbox', {
                name: 'Når ble feilutbetalingen oppdaget?',
            });

            fireEvent.change(oppdagetDato, { target: { value: '20.04.2020' } });
            const submitKnapp = await findByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            });
            expect(submitKnapp).toHaveAttribute('type', 'submit');
        });

        test('bytter til submit knapp ', async () => {
            const {
                result: { findByRole },
            } = renderFakta({
                vurdering: {
                    oppdaget: {
                        av: 'NAV',
                        dato: '2020-04-20',
                        beskrivelse: 'VI OPPDAGET EN FEIL!!!!',
                    },
                },
            });

            const nesteKnapp = await findByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            });
            expect(nesteKnapp).toHaveAttribute('type', 'submit');

            const oppdagetDato = await findByRole('textbox', {
                name: 'Når ble feilutbetalingen oppdaget?',
            });
            fireEvent.change(oppdagetDato, { target: { value: '' } });

            const submitKnapp = await findByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            });
            expect(submitKnapp).toHaveAttribute('type', 'submit');
        });

        test('Bytting av bestemmelse i rettslig grunnlag', async () => {
            const {
                result: { findByRole },
            } = renderFakta({
                muligeRettsligGrunnlag: [
                    {
                        bestemmelse: { nøkkel: 'B1', beskrivelse: 'ok' },
                        grunnlag: [{ nøkkel: 'G1', beskrivelse: 'ok' }],
                    },
                    {
                        bestemmelse: { nøkkel: 'B2', beskrivelse: 'ok' },
                        grunnlag: [
                            { nøkkel: 'G2', beskrivelse: 'ok' },
                            { nøkkel: 'G3', beskrivelse: 'ok' },
                        ],
                    },
                ],
                perioder: [
                    {
                        id: 'unik',
                        fom: '2025-04-01',
                        tom: '2025-04-30',
                        feilutbetaltBeløp: 0,
                        splittbarePerioder: [],
                        rettsligGrunnlag: [{ bestemmelse: 'B1', grunnlag: 'G1' }],
                    },
                ],
            });

            expect(await findByRole('combobox', { name: 'Velg grunnlag' })).toHaveValue('G1');

            fireEvent.change(await findByRole('combobox', { name: 'Velg bestemmelse' }), {
                target: { value: 'B2' },
            });
            expect(await findByRole('combobox', { name: 'Velg grunnlag' })).not.toHaveValue();
        });

        test('Ingen forhåndsutfylt rettslig grunnlag', async () => {
            const {
                result: { findByRole },
            } = renderFakta({
                muligeRettsligGrunnlag: [
                    {
                        bestemmelse: { nøkkel: 'B1', beskrivelse: 'ok' },
                        grunnlag: [{ nøkkel: 'G1', beskrivelse: 'ok' }],
                    },
                    {
                        bestemmelse: { nøkkel: 'B2', beskrivelse: 'ok' },
                        grunnlag: [{ nøkkel: 'G2', beskrivelse: 'ok' }],
                    },
                ],
                perioder: [
                    {
                        id: 'unik',
                        fom: '2025-04-01',
                        tom: '2025-04-30',
                        feilutbetaltBeløp: 0,
                        splittbarePerioder: [],
                        rettsligGrunnlag: [],
                    },
                ],
                vurdering: {
                    årsak: 'en tekst',
                    oppdaget: {
                        av: 'NAV',
                        dato: '2020-04-20',
                        beskrivelse: 'VI OPPDAGET EN FEIL!!!!',
                    },
                },
            });

            // Tving en endring for å få opp lagre-knappen(ikke nødvendig etter backend-endring)
            fireEvent.change(await findByRole('textbox', { name: 'Årsak til feilutbetalingen' }), {
                target: { value: 'Ny årsak' },
            });

            fireEvent.blur(await findByRole('combobox', { name: 'Velg bestemmelse' }));
            const bestemmelseDropdown = await findByRole('combobox', {
                name: 'Velg bestemmelse',
            });
            expect(bestemmelseDropdown).not.toHaveValue();
            expect(bestemmelseDropdown).toBeInvalid();
            expect(bestemmelseDropdown).toHaveAccessibleDescription('Du må fylle inn en verdi');

            fireEvent.change(
                await findByRole('combobox', {
                    name: 'Velg bestemmelse',
                }),
                { target: { value: 'B1' } }
            );

            fireEvent.blur(await findByRole('combobox', { name: 'Velg grunnlag' }));
            const grunnlagDropdown = await findByRole('combobox', { name: 'Velg grunnlag' });
            expect(grunnlagDropdown).not.toHaveValue();
            expect(grunnlagDropdown).toBeInvalid();
            expect(grunnlagDropdown).toHaveAccessibleDescription('Du må fylle inn en verdi');
        });

        test('dato felt valideres ved unblur', async () => {
            const {
                result: { findByRole },
            } = renderFakta();

            fireEvent.change(await findByRole('textbox', { name: 'Årsak til feilutbetalingen' }), {
                target: { value: 'Ny årsak' },
            });

            fireEvent.blur(
                await findByRole('textbox', {
                    name: 'Når ble feilutbetalingen oppdaget?',
                })
            );
            const oppdagetDato = await findByRole('textbox', {
                name: 'Når ble feilutbetalingen oppdaget?',
            });
            expect(oppdagetDato).toBeInvalid();
            expect(oppdagetDato).toHaveAccessibleDescription('Ugyldig datoformat');
        });

        test('Viser lagreknapp dersom fakta ikke er ferdigvurdert, men uendret', async () => {
            const {
                result: { findByRole },
            } = renderFakta({
                ferdigvurdert: false,
            });

            const submitKnapp = await findByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            });
            expect(submitKnapp).toHaveAttribute('type', 'submit');
            expect(submitKnapp).toHaveTextContent('Lagre');
        });

        test('Viser nesteknapp dersom fakta er ferdigvurdert og uendret', async () => {
            const {
                result: { findByRole },
            } = renderFakta({
                ferdigvurdert: true,
            });

            const submitKnapp = await findByRole('button', {
                name: 'Gå videre til foreldelsessteget',
            });
            expect(submitKnapp).toHaveAttribute('type', 'submit');
            expect(submitKnapp).toHaveTextContent('Neste');
        });
    });
});
