import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { FaktaOmFeilutbetalingDto } from '../../../generated';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render } from '@testing-library/react';
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

const renderFakta = (overrides?: Partial<FaktaOmFeilutbetalingDto>): RenderResult => {
    return render(<FaktaSkjema faktaOmFeilutbetaling={faktaOmFeilutbetaling(overrides)} />);
};
describe('Fakta om feilutbetaling', () => {
    describe('Rettslig grunnlag', () => {
        test('Forhåndsutfylt rettslig grunnlag fra backend', async () => {
            const { findByRole } = renderFakta();

            const bestemmelse = await findByRole('combobox', { name: 'Velg bestemmelse' });
            expect(bestemmelse).toHaveTextContent('Annet');
            expect(bestemmelse).toHaveValue('ANNET');

            const grunnlag = await findByRole('combobox', { name: 'Velg grunnlag' });
            expect(grunnlag).toHaveTextContent('Annet fritekst');
            expect(grunnlag).toHaveValue('ANNET_FRITEKST');
        });

        test('Defaults hentes fra input objekt', async () => {
            const { findByRole } = renderFakta({
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
    });
});
