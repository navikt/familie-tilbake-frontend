import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { FaktaOmFeilutbetalingDto, OppdaterFaktaData } from '../../../generated';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';

import { FaktaSkjema } from './FaktaSkjema';

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const mockUseBehandling = jest.fn(() => ({
    actionBarStegtekst: (): string => 'Mocked!!',
    erStegBehandlet: (): boolean => false,
}));

jest.mock('../../../context/BehandlingContext', () => ({
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
            },
        });
    });
    return {
        result: render(
            <QueryClientProvider client={client}>
                <FaktaSkjema
                    faktaOmFeilutbetaling={faktaOmFeilutbetaling(overrides)}
                    behandlingId="unik"
                    behandlingUrl="https://tilbakekreving"
                />
            </QueryClientProvider>
        ),
        mutationBody,
    };
};
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

            fireEvent.change(await findByRole('textbox', { name: 'Årsak til feilutbetalingen' }), {
                target: { value: 'årsak' },
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

            fireEvent.click(
                await findByRole('button', { name: 'Gå videre til foreldelsessteget' })
            );
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
    });
});
