import * as React from 'react';

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import {
    Aktsomhet,
    HendelseType,
    SærligeGrunner,
    Vilkårsresultat,
    Ytelsetype,
} from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriodeSkjema';

jest.setTimeout(10000);

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
        hendelsestype: HendelseType.ANNET,
        foreldet: false,
        periode: {
            fom: '2021-01-01',
            tom: '2021-04-30',
        },
    };

    test('- god tro - beløp ikke i behold', async () => {
        const user = userEvent.setup();
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
                behandletPerioder={[
                    mock<VilkårsvurderingPeriodeSkjemaData>({
                        index: 'i1',
                        periode: {
                            fom: '2020-10-01',
                            tom: '2020-11-30',
                        },
                    }),
                ]}
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

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );

        expect(queryByText('Beløpet mottatt i god tro')).toBeTruthy();
        expect(queryByLabelText('Vurder om beløpet er i behold')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryByText('Ingen tilbakekreving')).toBeFalsy();

        await user.type(getByLabelText('Vurder om beløpet er i behold'), 'begrunnelse');
        await user.click(
            getByLabelText('Nei', {
                selector: 'input',
            })
        );

        expect(queryByText('Ingen tilbakekreving')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- god tro - beløp i behold', async () => {
        const user = userEvent.setup();
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

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );

        await user.type(getByLabelText('Vurder om beløpet er i behold'), 'begrunnelse');
        await user.click(
            getByLabelText('Ja', {
                selector: 'input',
            })
        );

        expect(queryByText('Ingen tilbakekreving')).toBeFalsy();
        expect(queryByLabelText('Angi beløp som skal tilbakekreves')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(getByLabelText('Angi beløp som skal tilbakekreves'), '2000');

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- forsto/burde forstått - forsto', async () => {
        const user = userEvent.setup();
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

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
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

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Forsto', {
                selector: 'input',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('100 %')).toBeTruthy();
        expect(getByText('Skal det tillegges renter?')).toBeTruthy();
        expect(getByLabelText('Nei')).toBeTruthy();
        expect(getByLabelText('Ja')).toBeTruthy();

        expect(getByLabelText('Nei')).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- forsto/burde forstått - må ha forstått - ingen grunn til reduksjon', async () => {
        const user = userEvent.setup();
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

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
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

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
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

        await user.click(
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

        await user.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(
            getByLabelText('Annet', {
                selector: 'input',
            })
        );
        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('100 %')).toBeTruthy();
        expect(getByText('Skal det tillegges renter?')).toBeTruthy();
        expect(getByTestId('skalDetTilleggesRenter_Ja')).toBeTruthy();
        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeTruthy();
        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);

        await user.type(
            getByRole('textbox', {
                name: 'Begrunnelse: Annet',
            }),
            'begrunnelse'
        );

        await user.click(getByTestId('skalDetTilleggesRenter_Ja'));

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- feilaktig - forsto', async () => {
        const user = userEvent.setup();
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

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Forsett', {
                selector: 'input',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('100 %')).toBeTruthy();
        expect(queryByText('Skal det tillegges renter?')).toBeFalsy();
        expect(getByText('Det legges til 10 % renter')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- feilaktige - grov uaktsomhet - ingen grunn til reduksjon', async () => {
        const user = userEvent.setup();
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

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
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

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Grov uaktsomhet', {
                selector: 'input',
            })
        );

        expect(queryByText('Særlige grunner 4. ledd')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        await user.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('Skal det tillegges renter?')).toBeTruthy();
        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);

        await user.click(getByTestId('skalDetTilleggesRenter_Nei'));

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- feilaktige - grov uaktsomhet - grunn til reduksjon', async () => {
        const user = userEvent.setup();
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

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
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

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
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

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        await user.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(getByText('Angi andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('Skal det tillegges renter?')).toBeTruthy();
        expect(getByLabelText('Nei')).toBeTruthy();
        expect(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            })
        ).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);

        await user.selectOptions(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            }),
            '30'
        );

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- feilaktige - grov uaktsomhet - grunn til reduksjon - egendefinert', async () => {
        const user = userEvent.setup();
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

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');
        await user.click(
            getByLabelText(
                'Ja, mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(queryByText('Aktsomhet')).toBeTruthy();

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Grov uaktsomhet', {
                selector: 'input',
            })
        );

        await user.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            })
        ).toBeTruthy();

        await user.click(
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

        await user.selectOptions(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            }),
            'Egendefinert'
        );

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(
            getByRole('textbox', {
                name: 'Angi andel som skal tilbakekreves - fritekst',
            }),
            '22'
        );

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- mangelfulle - simpel uaktsomhet - under 4 rettsgebyr - grunn til reduksjon', async () => {
        const user = userEvent.setup();
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

        expect(queryByText('Aktsomhet')).toBeTruthy();
        expect(
            queryByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).toBeFalsy();
        expect(queryByText('Særlige grunner 4. ledd')).toBeFalsy();

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
        expect(queryByText('Særlige grunner 4. ledd')).toBeFalsy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
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

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        await user.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(getByTestId('harGrunnerTilReduksjon_Ja'));

        expect(queryByText('Skal det tillegges renter?')).toBeFalsy();
        expect(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            })
        ).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);

        await user.selectOptions(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            }),
            '30'
        );

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- mangelfulle - simpel uaktsomhet - under 4 rettsgebyr - ingen grunn til reduksjon', async () => {
        const user = userEvent.setup();
        const { getByLabelText, getByRole, getByText, getByTestId, queryAllByText, queryByText } =
            render(
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
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeFalsy();
        expect(queryByText('Særlige grunner 4. ledd')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        await user.type(
            getByLabelText('Vurder særlige grunner du har vektlagt for resultatet'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(getByTestId('harGrunnerTilReduksjon_Nei'));

        expect(getByText('Andel som skal tilbakekreves')).toBeTruthy();
        expect(getByText('100 %')).toBeTruthy();
        expect(queryByText('Skal det tillegges renter?')).toBeFalsy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- mangelfulle - simpel uaktsomhet - under 4 rettsgebyr - ikke tilbakekreves', async () => {
        const user = userEvent.setup();
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
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(queryByText('Når 6. ledd anvendes må alle perioder behandles likt')).toBeTruthy();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- åpner vurdert periode - god tro - beløp i behold', async () => {
        const { getByLabelText, getByText } = render(
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={{
                    ...periode,
                    begrunnelse: 'Gitt i god tro',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat: Vilkårsresultat.GOD_TRO,
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
            />
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
            <VilkårsvurderingPeriodeSkjema
                behandling={behandling}
                fagsak={fagsak}
                periode={{
                    ...periode,
                    begrunnelse: 'Gitt mangelfulle opplysninger',
                    vilkårsvurderingsresultatInfo: {
                        vilkårsvurderingsresultat:
                            Vilkårsresultat.MANGELFULLE_OPPLYSNINGER_FRA_BRUKER,
                        aktsomhet: {
                            begrunnelse: 'Vurdert aktsomhet til simpel',
                            aktsomhet: Aktsomhet.SIMPEL_UAKTSOMHET,
                            tilbakekrevSmåbeløp: true,
                            særligeGrunnerBegrunnelse: 'Det finnes særlige grunner',
                            særligeGrunner: [
                                { særligGrunn: SærligeGrunner.GRAD_AV_UAKTSOMHET },
                                { særligGrunn: SærligeGrunner.STØRRELSE_BELØP },
                                {
                                    særligGrunn: SærligeGrunner.ANNET,
                                    begrunnelse: 'Dette er en annen begrunnelse',
                                },
                            ],
                            særligeGrunnerTilReduksjon: true,
                            andelTilbakekreves: 33,
                        },
                    },
                }}
                behandletPerioder={[]}
                erTotalbeløpUnder4Rettsgebyr={true}
                erLesevisning={false}
            />
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
