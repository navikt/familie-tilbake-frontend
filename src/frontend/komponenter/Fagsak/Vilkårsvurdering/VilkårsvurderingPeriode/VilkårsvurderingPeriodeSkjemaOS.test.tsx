import * as React from 'react';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { HendelseType, Ytelsetype } from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriodeSkjema';

jest.mock('@navikt/familie-http', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});
jest.mock('../FeilutbetalingVilkårsvurderingContext', () => {
    return {
        useFeilutbetalingVilkårsvurdering: () => ({
            kanIlleggeRenter: true,
            oppdaterPeriode: jest.fn(),
            onSplitPeriode: jest.fn(),
            lukkValgtPeriode: jest.fn(),
        }),
    };
});

describe('Tester: VilkårsvurderingPeriodeSkjema', () => {
    const behandling = mock<IBehandling>();
    const fagsak = mock<IFagsak>({
        ytelsestype: Ytelsetype.OVERGANGSSTØNAD,
    });
    const periode: VilkårsvurderingPeriodeSkjemaData = {
        index: 'i2',
        feilutbetaltBeløp: 2333,
        hendelsestype: HendelseType.EF_ANNET,
        foreldet: false,
        periode: {
            fom: '2021-01-01',
            tom: '2021-04-30',
        },
    };
    const behandletPerioder: VilkårsvurderingPeriodeSkjemaData[] = [
        mock<VilkårsvurderingPeriodeSkjemaData>({
            index: 'i1',
            periode: {
                fom: '2020-10-01',
                tom: '2020-11-30',
            },
        }),
    ];

    test('- god tro - beløp ikke i behold', () => {
        const {
            getAllByRole,
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = render(
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
                behandletPerioder={behandletPerioder}
                erTotalbeløpUnder4Rettsgebyr={false}
                erLesevisning={false}
            />
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
            getByRole('tooltip', {
                name: 'Folketrygdloven § 22-15, 1. ledd, 1. punkt',
            })
        ).toBeTruthy();
        expect(
            getAllByRole('tooltip', {
                name: 'Folketrygdloven § 22-15, 1. ledd, 2. punkt',
            })
        ).toHaveLength(2);
        expect(
            getByRole('tooltip', {
                name: 'Folketrygdloven § 22-15, 1. ledd',
            })
        ).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );

        expect(queryByText('Beløpet mottatt i god tro')).toBeTruthy();
        expect(queryByLabelText('Vurder om beløpet er i behold')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryByText('Ingen tilbakekreving')).toBeFalsy();

        userEvent.type(getByLabelText('Vurder om beløpet er i behold'), 'begrunnelse');
        userEvent.click(
            getByLabelText('Nei', {
                selector: 'input',
            })
        );

        expect(queryByText('Ingen tilbakekreving')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- god tro - beløp i behold', () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = render(
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={periode}
                behandletPerioder={[]}
                erTotalbeløpUnder4Rettsgebyr={false}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Kopier vilkårsvurdering fra')).toBeFalsy();
        expect(queryByText('Beløpet mottatt i god tro')).toBeFalsy();
        expect(queryByLabelText('Vurder om beløpet er i behold')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );

        userEvent.type(getByLabelText('Vurder om beløpet er i behold'), 'begrunnelse');
        userEvent.click(
            getByLabelText('Ja', {
                selector: 'input',
            })
        );

        expect(queryByText('Ingen tilbakekreving')).toBeFalsy();
        expect(queryByLabelText('Angi beløp som skal tilbakekreves')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        userEvent.type(getByLabelText('Angi beløp som skal tilbakekreves'), '2000');

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- forsto/burde forstått - forsto', () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = render(
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={periode}
                behandletPerioder={[]}
                erTotalbeløpUnder4Rettsgebyr={false}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Aktsomhet')).toBeFalsy();
        expect(queryByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt')).toBeFalsy();
        expect(queryByText('I hvilken grad har mottaker handlet uaktsomt?')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();
        expect(
            queryByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt')
        ).toBeTruthy();
        expect(queryByText('I hvilken grad har mottaker handlet uaktsomt?')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        userEvent.click(
            getByLabelText('Forsto', {
                selector: 'input',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('100 %')).toBeTruthy();
        expect(getByText('Skal det tillegges renter?')).toBeTruthy();
        expect(getByLabelText('Nei')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        userEvent.click(getByLabelText('Nei'));

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- forsto/burde forstått - må ha forstått - ingen grunn til reduksjon', () => {
        const {
            getByLabelText,
            getByRole,
            getByTestId,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByRole,
            queryByText,
        } = render(
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={periode}
                behandletPerioder={[]}
                erTotalbeløpUnder4Rettsgebyr={false}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Aktsomhet')).toBeFalsy();
        expect(queryByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt')).toBeFalsy();
        expect(queryByText('I hvilken grad har mottaker handlet uaktsomt?')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();

        expect(queryByText('Særlige grunner 4. ledd')).toBeFalsy();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeFalsy();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).toBeFalsy();
        expect(queryByText('Skal særlige grunner gi reduksjon av beløpet?')).toBeFalsy();

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        userEvent.click(
            getByLabelText('Må ha forstått', {
                selector: 'input',
            })
        );

        expect(queryByText('Særlige grunner 4. ledd')).toBeTruthy();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeTruthy();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).toBeTruthy();
        expect(queryByText('Skal særlige grunner gi reduksjon av beløpet?')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        // Annet begrunnelse
        expect(
            queryByRole('textbox', {
                name: '',
            })
        ).toBeFalsy();

        userEvent.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );

        userEvent.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        userEvent.click(
            getByLabelText('Annet', {
                selector: 'input',
            })
        );
        userEvent.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('100 %')).toBeTruthy();
        expect(getByText('Skal det tillegges renter?')).toBeTruthy();
        expect(getByTestId('skalDetTilleggesRenter_Ja')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);

        userEvent.type(
            getByRole('textbox', {
                name: '',
            }),
            'begrunnelse'
        );

        userEvent.click(getByTestId('skalDetTilleggesRenter_Ja'));

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- feilaktig - forsto', () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByText } = render(
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={periode}
                behandletPerioder={[]}
                erTotalbeløpUnder4Rettsgebyr={false}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Aktsomhet')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        userEvent.click(
            getByLabelText('Forsett', {
                selector: 'input',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('100 %')).toBeTruthy();
        expect(queryByText('Skal det tillegges renter?')).toBeFalsy();
        expect(getByText('Det legges til 10 % renter')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- feilaktige - grov uaktsomhet - ingen grunn til reduksjon', () => {
        const { getByLabelText, getByRole, getByTestId, getByText, queryAllByText, queryByText } =
            render(
                <VilkårsvurderingPeriodeSkjema
                    behandling={behandling}
                    fagsak={fagsak}
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    erLesevisning={false}
                />
            );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Aktsomhet')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();
        expect(queryByText('Særlige grunner 4. ledd')).toBeFalsy();

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        userEvent.click(
            getByLabelText('Grov uaktsomhet', {
                selector: 'input',
            })
        );

        expect(queryByText('Særlige grunner 4. ledd')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        userEvent.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );

        userEvent.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        userEvent.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('Skal det tillegges renter?')).toBeTruthy();
        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);

        userEvent.click(getByTestId('skalDetTilleggesRenter_Nei'));

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- feilaktige - grov uaktsomhet - grunn til reduksjon', () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = render(
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={periode}
                behandletPerioder={[]}
                erTotalbeløpUnder4Rettsgebyr={false}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Aktsomhet')).toBeFalsy();
        expect(queryByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt')).toBeFalsy();
        expect(queryByText('I hvilken grad har mottaker handlet uaktsomt?')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();

        expect(queryByText('Særlige grunner 4. ledd')).toBeFalsy();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeFalsy();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).toBeFalsy();
        expect(queryByText('Skal særlige grunner gi reduksjon av beløpet?')).toBeFalsy();

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        userEvent.click(
            getByLabelText('Grov uaktsomhet', {
                selector: 'input',
            })
        );

        expect(queryByText('Særlige grunner 4. ledd')).toBeTruthy();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeTruthy();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).toBeTruthy();
        expect(queryByText('Skal særlige grunner gi reduksjon av beløpet?')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        userEvent.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );

        userEvent.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        userEvent.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(getByText('Angi andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('Skal det tillegges renter?')).toBeTruthy();
        expect(getByLabelText('Nei')).toBeTruthy();
        expect(
            getByRole('combobox', {
                name: '',
            })
        ).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);

        userEvent.selectOptions(
            getByRole('combobox', {
                name: '',
            }),
            '30'
        );

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- feilaktige - grov uaktsomhet - grunn til reduksjon - egendefinert', () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByRole, queryByText } =
            render(
                <VilkårsvurderingPeriodeSkjema
                    behandling={behandling}
                    fagsak={fagsak}
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    erLesevisning={false}
                />
            );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Aktsomhet')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        userEvent.click(
            getByLabelText('Grov uaktsomhet', {
                selector: 'input',
            })
        );

        userEvent.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );

        userEvent.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        userEvent.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(
            getByRole('combobox', {
                name: '',
            })
        ).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);
        expect(
            queryByRole('textbox', {
                name: '',
            })
        ).toBeFalsy();

        userEvent.selectOptions(
            getByRole('combobox', {
                name: '',
            }),
            'Egendefinert'
        );

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        userEvent.type(
            getByRole('textbox', {
                name: '',
            }),
            '22'
        );

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- mangelfulle - simpel uaktsomhet - under 4 rettsgebyr - grunn til reduksjon', () => {
        const {
            getByLabelText,
            getByRole,
            getByTestId,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = render(
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={periode}
                behandletPerioder={[]}
                erTotalbeløpUnder4Rettsgebyr={true}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Aktsomhet')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();
        expect(
            queryByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeFalsy();
        expect(queryByText('Særlige grunner 4. ledd')).toBeFalsy();

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        userEvent.click(
            getByLabelText('Simpel uaktsomhet', {
                selector: 'input',
            })
        );

        expect(
            queryByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeTruthy();
        expect(queryByText('Særlige grunner 4. ledd')).toBeFalsy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        userEvent.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );
        expect(queryByText('Særlige grunner 4. ledd')).toBeTruthy();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeTruthy();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).toBeTruthy();
        expect(queryByText('Skal særlige grunner gi reduksjon av beløpet?')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        userEvent.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );

        userEvent.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        userEvent.click(getByTestId('harGrunnerTilReduksjon_Ja'));

        expect(queryByText('Skal det tillegges renter?')).toBeFalsy();
        expect(
            getByRole('combobox', {
                name: '',
            })
        ).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);

        userEvent.selectOptions(
            getByRole('combobox', {
                name: '',
            }),
            '30'
        );

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- mangelfulle - simpel uaktsomhet - under 4 rettsgebyr - ikke tilbakekreves', () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByText } = render(
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={periode}
                behandletPerioder={[]}
                erTotalbeløpUnder4Rettsgebyr={true}
                erLesevisning={false}
            />
        );

        expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        expect(queryByText('Aktsomhet')).toBeFalsy();

        userEvent.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        userEvent.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        userEvent.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        userEvent.click(
            getByLabelText('Simpel uaktsomhet', {
                selector: 'input',
            })
        );

        expect(
            queryByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeTruthy();
        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeFalsy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        userEvent.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeTruthy();

        userEvent.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });
});
