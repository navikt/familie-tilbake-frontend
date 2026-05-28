import type { JSX } from 'react';
import type { FaktaOmFeilutbetaling, BehandlingOppdaterFaktaData } from '~/generated-new';

import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';

import { FaktaSkjema } from './FaktaSkjema';

const faktaOmFeilutbetaling = (
    overrides?: Partial<FaktaOmFeilutbetaling>
): FaktaOmFeilutbetaling => ({
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
        årsak: null,
        oppdaget: undefined,
    },
    ...overrides,
});

const renderFakta = (
    overrides?: Partial<FaktaOmFeilutbetaling>
): Promise<BehandlingOppdaterFaktaData> => {
    const client = createTestQueryClient();
    const mutationBody = new Promise<BehandlingOppdaterFaktaData>(resolve => {
        client.setMutationDefaults(['oppdaterFakta'], {
            mutationFn: async (fakta: BehandlingOppdaterFaktaData) => {
                resolve(fakta);
                return faktaOmFeilutbetaling({
                    ferdigvurdert: true,
                });
            },
        });
    });

    render(
        <FagsakContext value={lagFagsak()}>
            <TestBehandlingProvider behandling={lagBehandling({ behandlingId: 'unik' })}>
                <QueryClientProvider client={client}>
                    <FaktaSkjema faktaOmFeilutbetaling={faktaOmFeilutbetaling(overrides)} />
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext>
    );

    return mutationBody;
};

const nesteKnapp = (): HTMLElement =>
    screen.getByRole('button', { name: 'Gå videre til forhåndsvarselsteget' });
const oppdagetDato = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: 'Når ble feilutbetalingen oppdaget?',
    });
const årsakBeskrivelse = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: 'Årsak til feilutbetalingen',
    });

describe('Fakta om feilutbetaling', () => {
    let user: ReturnType<typeof userEvent.setup>;
    beforeAll(() => {
        user = userEvent.setup({ delay: null });
    });

    describe('Rettslig grunnlag', () => {
        test('Forhåndsutfylt rettslig grunnlag fra backend', async () => {
            renderFakta();

            const bestemmelse = screen.getByRole('combobox', { name: 'Velg bestemmelse' });
            expect(bestemmelse).toHaveTextContent('Annet');
            expect(bestemmelse).toHaveValue('ANNET');

            const grunnlag = screen.getByRole('combobox', { name: 'Velg grunnlag' });
            expect(grunnlag).toHaveTextContent('Annet fritekst');
            expect(grunnlag).toHaveValue('ANNET_FRITEKST');
        });

        test('Defaults hentes fra input objekt', async () => {
            renderFakta({
                vurdering: {
                    årsak: 'Svindel',
                    oppdaget: {
                        av: 'NAV',
                        dato: '2020-04-20',
                        beskrivelse: 'Fant et dokument under bordet.',
                    },
                },
            });

            expect(årsakBeskrivelse()).toHaveValue('Svindel');
            expect(oppdagetDato()).toHaveValue('20.04.2020');

            expect(screen.getByRole('radio', { name: 'Nav' })).toBeChecked();
            expect(screen.getByRole('radio', { name: 'Bruker' })).not.toBeChecked();
            const oppdagetBeskrivelse = screen.getByRole('textbox', {
                name: 'Hvordan ble feilutbetalingen oppdaget?',
            });
            expect(oppdagetBeskrivelse).toHaveValue('Fant et dokument under bordet.');
        });

        test('Submit form with all values', async () => {
            const mutationBody = renderFakta();

            await user.type(årsakBeskrivelse(), 'årsak');
            await user.type(oppdagetDato(), '20.04.2020');

            await user.click(screen.getByRole('radio', { name: 'Nav' }));
            await user.type(
                screen.getByRole('textbox', { name: 'Hvordan ble feilutbetalingen oppdaget?' }),
                'hvordan'
            );

            await user.click(nesteKnapp());

            await expect(mutationBody).resolves.toEqual({
                path: { behandlingId: 'unik' },
                body: {
                    perioder: [
                        {
                            id: 'unik',
                            rettsligGrunnlag: [
                                { bestemmelse: 'ANNET', grunnlag: 'ANNET_FRITEKST' },
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

        test('Bytter til submit knapp ', async () => {
            renderFakta({
                vurdering: {
                    årsak: 'Toast',
                    oppdaget: {
                        av: 'NAV',
                        dato: '2020-04-20',
                        beskrivelse: 'VI OPPDAGET EN FEIL!!!!',
                    },
                },
                ferdigvurdert: true,
            });

            expect(nesteKnapp()).toHaveAttribute('type', 'button');

            await user.clear(oppdagetDato());

            expect(nesteKnapp()).toHaveAttribute('type', 'submit');
        });

        test('Bytting av bestemmelse i rettslig grunnlag', async () => {
            renderFakta({
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

            expect(screen.getByRole('combobox', { name: 'Velg grunnlag' })).toHaveValue('G1');
            await user.selectOptions(
                screen.getByRole('combobox', { name: 'Velg bestemmelse' }),
                'B2'
            );
            expect(screen.getByRole('combobox', { name: 'Velg grunnlag' })).not.toHaveValue();
        });

        test('Ingen forhåndsutfylt rettslig grunnlag', async () => {
            renderFakta({
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

            await user.click(nesteKnapp());

            const bestemmelseDropdown = async (): Promise<HTMLElement> =>
                await screen.findByRole('combobox', {
                    name: 'Velg bestemmelse',
                });
            expect(await bestemmelseDropdown()).not.toHaveValue();
            expect(await bestemmelseDropdown()).toBeInvalid();
            expect(await bestemmelseDropdown()).toHaveAccessibleDescription(
                'Du må fylle inn en verdi'
            );

            await user.type(
                screen.getByRole('combobox', {
                    name: 'Velg bestemmelse',
                }),
                'B1'
            );

            await user.click(nesteKnapp());
            const grunnlagDropdown = screen.getByRole('combobox', { name: 'Velg grunnlag' });
            expect(grunnlagDropdown).not.toHaveValue();
            expect(grunnlagDropdown).toBeInvalid();
            expect(grunnlagDropdown).toHaveAccessibleDescription('Du må fylle inn en verdi');
        });

        test('Datofelt valideres ved unblur', async () => {
            renderFakta();

            fireEvent.change(årsakBeskrivelse(), {
                target: { value: 'Ny årsak' },
            });

            fireEvent.click(nesteKnapp());

            const oppdagetDato = await screen.findByRole('textbox', {
                name: 'Når ble feilutbetalingen oppdaget?',
            });
            expect(oppdagetDato).toBeInvalid();
            expect(oppdagetDato).toHaveAccessibleDescription(
                'Du må skrive en dato på denne måten: dd.mm.åååå'
            );
        });

        test('Viser fortsatt "Neste" dersom fakta ikke er ferdigvurdert, men uendret', async () => {
            renderFakta({
                ferdigvurdert: false,
            });

            const submitKnapp = nesteKnapp();
            expect(submitKnapp).toHaveAttribute('type', 'submit');
            expect(submitKnapp).toHaveTextContent('Neste');
        });

        test('Viser nesteknapp dersom fakta er ferdigvurdert og uendret', async () => {
            renderFakta({
                ferdigvurdert: true,
                vurdering: {
                    årsak: 'Begrunnelse',
                    oppdaget: {
                        av: 'NAV',
                        dato: '2020-04-20',
                        beskrivelse: 'VI OPPDAGET EN FEIL!!!!',
                    },
                },
            });

            const submitKnapp = nesteKnapp();
            expect(submitKnapp).toHaveAttribute('type', 'button');
            expect(submitKnapp).toHaveTextContent('Neste');
        });

        test('Valg av dato med musepeker - skal revalidere etter valg', async () => {
            renderFakta({
                vurdering: {
                    årsak: 'test',
                    oppdaget: {
                        av: 'NAV',
                        dato: null,
                        beskrivelse: 'test',
                    },
                },
            });

            const datoSelector = async (): Promise<HTMLElement> =>
                await screen.findByRole('textbox', { name: 'Når ble feilutbetalingen oppdaget?' });

            fireEvent.change(await datoSelector(), { target: { value: 'lol' } });
            fireEvent.click(nesteKnapp());
            expect(await datoSelector()).toHaveAccessibleDescription(
                'Du må skrive en dato på denne måten: dd.mm.åååå'
            );

            fireEvent.click(screen.getByRole('button', { name: 'Åpne datovelger' }));
            fireEvent.change(screen.getByRole('combobox', { name: 'År' }), {
                target: { value: '2020' },
            });
            fireEvent.change(screen.getByRole('combobox', { name: 'Måned' }), {
                target: { value: 'januar' },
            });
            fireEvent.click(screen.getByRole('button', { name: 'onsdag 1' }));

            expect(await datoSelector()).toHaveValue('01.01.2020');
            expect(await datoSelector()).not.toHaveAccessibleDescription();
        });
    });

    describe('Start på nytt', () => {
        test('Skjemadata nullstilles når faktaOmFeilutbetaling oppdateres med tomme verdier', async () => {
            const utfyltFakta = faktaOmFeilutbetaling({
                vurdering: {
                    årsak: 'Svindel',
                    oppdaget: {
                        av: 'NAV',
                        dato: '2020-04-20',
                        beskrivelse: 'Fant et dokument under bordet.',
                    },
                },
                ferdigvurdert: true,
            });

            const nullstiltFakta = faktaOmFeilutbetaling({
                vurdering: {
                    årsak: null,
                    oppdaget: undefined,
                },
                ferdigvurdert: false,
            });

            const client = createTestQueryClient();
            client.setMutationDefaults(['oppdaterFakta'], {
                mutationFn: async () => utfyltFakta,
            });

            const wrapMedProviders = (fakta: FaktaOmFeilutbetaling): JSX.Element => (
                <FagsakContext value={lagFagsak()}>
                    <TestBehandlingProvider behandling={lagBehandling({ behandlingId: 'unik' })}>
                        <QueryClientProvider client={client}>
                            <FaktaSkjema
                                key={String(fakta.ferdigvurdert)}
                                faktaOmFeilutbetaling={fakta}
                            />
                        </QueryClientProvider>
                    </TestBehandlingProvider>
                </FagsakContext>
            );

            const { rerender } = render(wrapMedProviders(utfyltFakta));

            expect(årsakBeskrivelse()).toHaveValue('Svindel');
            expect(screen.getByRole('radio', { name: 'Nav' })).toBeChecked();
            expect(oppdagetDato()).toHaveValue('20.04.2020');
            expect(
                screen.getByRole('textbox', { name: 'Hvordan ble feilutbetalingen oppdaget?' })
            ).toHaveValue('Fant et dokument under bordet.');

            // Simulerer at faktaOmFeilutbetaling oppdateres med nullstilt data, slik det gjøres ved start på nytt
            rerender(wrapMedProviders(nullstiltFakta));

            expect(årsakBeskrivelse()).toHaveValue('');
            expect(screen.getByRole('radio', { name: 'Nav' })).not.toBeChecked();
            expect(screen.getByRole('radio', { name: 'Bruker' })).not.toBeChecked();
            expect(oppdagetDato()).toHaveValue('');
            expect(
                screen.getByRole('textbox', { name: 'Hvordan ble feilutbetalingen oppdaget?' })
            ).toHaveValue('');
        });
    });
});
