import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';
import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriodeSkjema';
import { BehandlingProvider } from '../../../../context/BehandlingContext';
import {
    Aktsomhet,
    HendelseType,
    SærligeGrunner,
    Vilkårsresultat,
    Ytelsetype,
} from '../../../../kodeverk';

jest.setTimeout(10000);

jest.mock('../../../../api/http/HttpProvider', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});
jest.mock('../VilkårsvurderingContext', () => {
    return {
        useVilkårsvurdering: () => ({
            kanIlleggeRenter: true,
            oppdaterPeriode: jest.fn(),
            onSplitPeriode: jest.fn(),
            lukkValgtPeriode: jest.fn(),
            sendInnSkjemaOgNaviger: jest.fn(),
            sendInnSkjemaMutation: {
                isPending: false,
                isError: false,
                error: null,
                reset: jest.fn(),
            },
        }),
    };
});

describe('Tester: VilkårsvurderingPeriodeSkjema', () => {
    const behandling = mock<IBehandling>();
    const fagsak = mock<IFagsak>({
        ytelsestype: Ytelsetype.Overgangsstønad,
    });
    const periode: VilkårsvurderingPeriodeSkjemaData = {
        index: 'i2',
        feilutbetaltBeløp: 2333,
        hendelsestype: HendelseType.Annet,
        foreldet: false,
        periode: {
            fom: '2021-01-01',
            tom: '2021-04-30',
        },
    };

    test('- god tro - beløp ikke i behold', async () => {
        const user = userEvent.setup();
        const { getByLabelText, getByRole, getByText, queryByLabelText, queryByText } = render(
            <BehandlingProvider>
                <VilkårsvurderingPeriodeSkjema
                    behandling={behandling}
                    fagsak={fagsak}
                    periode={{
                        aktiviteter: [
                            {
                                aktivitet: 'Aktivitet 1',
                                beløp: 1333,
                            },
                            {
                                aktivitet: 'Aktivitet 2',
                                beløp: 1000,
                            },
                        ],
                        ...periode,
                    }}
                    behandletPerioder={[
                        mock<VilkårsvurderingPeriodeSkjemaData>({
                            index: 'i1',
                            periode: {
                                fom: '2020-10-01',
                                tom: '2020-11-30',
                            },
                        }),
                    ]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                    erLesevisning={false}
                    perioder={[periode]}
                />
            </BehandlingProvider>
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(getByText('Feilutbetalt beløp')).toBeTruthy();
        expect(getByText('Aktivitet 1')).toBeTruthy();
        expect(getByText('1 333')).toBeTruthy();
        expect(getByText('Aktivitet 2')).toBeTruthy();
        expect(getByText('1 000')).toBeTruthy();
        expect(getByText('Kopier vilkårsvurdering fra')).toBeTruthy();
        expect(queryByText('Beløpet mottatt i god tro')).toBeFalsy();
        expect(queryByLabelText('Vurder om beløpet er i behold')).toBeFalsy();
        expect(
            getByText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil (1. ledd, 1. punkt)'
            )
        ).toBeTruthy();
        expect(
            getByText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger (1. ledd, 2. punkt)'
            )
        ).toBeTruthy();
        expect(
            getByText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger (1. ledd, 2. punkt)'
            )
        ).toBeTruthy();
        expect(getByText('Nei, mottaker har mottatt beløpet i god tro (1. ledd)')).toBeTruthy();

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Simpel uaktsomhet', {
                selector: 'input',
            })
        );

        expect(
            queryByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeTruthy();
        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeFalsy();

        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeTruthy();
    });

    test('- åpner vurdert periode - god tro - beløp i behold', async () => {
        const { getByLabelText, getByText } = render(
            <BehandlingProvider>
                <VilkårsvurderingPeriodeSkjema
                    behandling={behandling}
                    fagsak={fagsak}
                    periode={{
                        ...periode,
                        begrunnelse: 'Gitt i god tro',
                        vilkårsvurderingsresultatInfo: {
                            vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
                            godTro: {
                                begrunnelse: 'Deler av beløpet er i behold',
                                beløpErIBehold: true,
                                beløpTilbakekreves: 699,
                            },
                        },
                    }}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                    erLesevisning={false}
                    perioder={[periode]}
                />
            </BehandlingProvider>
        );
        await waitFor(async () => {
            expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        });
        expect(getByLabelText('Vilkårene for tilbakekreving')).toHaveValue('Gitt i god tro');
        expect(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(getByLabelText('Ja')).toBeChecked();
        expect(getByLabelText('Angi beløp som skal tilbakekreves')).toHaveValue('699');
    });

    test('- åpner vurdert periode - mangelfulle - simpel uaktsomhet - under 4 rettsgebyr', async () => {
        const { getByLabelText, getByTestId, getByText } = render(
            <BehandlingProvider>
                <VilkårsvurderingPeriodeSkjema
                    behandling={behandling}
                    fagsak={fagsak}
                    periode={{
                        ...periode,
                        begrunnelse: 'Gitt mangelfulle opplysninger',
                        vilkårsvurderingsresultatInfo: {
                            vilkårsvurderingsresultat:
                                Vilkårsresultat.MangelfulleOpplysningerFraBruker,
                            aktsomhet: {
                                begrunnelse: 'Vurdert aktsomhet til simpel',
                                aktsomhet: Aktsomhet.SimpelUaktsomhet,
                                tilbakekrevSmåbeløp: true,
                                særligeGrunnerBegrunnelse: 'Det finnes særlige grunner',
                                særligeGrunner: [
                                    { særligGrunn: SærligeGrunner.GradAvUaktsomhet },
                                    { særligGrunn: SærligeGrunner.StørrelseBeløp },
                                    {
                                        særligGrunn: SærligeGrunner.Annet,
                                        begrunnelse: 'Dette er en annen begrunnelse',
                                    },
                                ],
                                særligeGrunnerTilReduksjon: true,
                                andelTilbakekreves: 33,
                            },
                        },
                    }}
                    perioder={[periode]}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                    erLesevisning={false}
                />
            </BehandlingProvider>
        );
        await waitFor(async () => {
            expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        });
        expect(getByLabelText('Vilkårene for tilbakekreving')).toHaveValue(
            'Gitt mangelfulle opplysninger'
        );
        expect(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt')).toHaveValue(
            'Vurdert aktsomhet til simpel'
        );
        expect(getByLabelText('Simpel uaktsomhet')).toBeChecked();
        expect(
            getByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeTruthy();
        expect(getByTestId('tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Ja')).toBeChecked();
        expect(getByLabelText('Vurder særlige grunner du har vektlagt for resultatet')).toHaveValue(
            'Det finnes særlige grunner'
        );
        expect(getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot')).toBeChecked();
        expect(getByLabelText('Størrelsen på feilutbetalt beløp')).toBeChecked();
        expect(getByLabelText('Annet')).toBeChecked();
        expect(getByTestId('annetBegrunnelse')).toHaveValue('Dette er en annen begrunnelse');
        expect(getByTestId('harGrunnerTilReduksjon_Ja')).toBeChecked();
        expect(getByTestId('andelSomTilbakekrevesManuell')).toHaveValue('33');
    });
});
