import type { Http } from '../../../../api/http/HttpProvider';
import type { BehandlingContextType } from '../../../../context/BehandlingContext';
import type { BehandlingDto } from '../../../../generated';
import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/vilkårsvurdering';
import type { VilkårsvurderingHook } from '../VilkårsvurderingContext';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriodeSkjema';
import { FagsakContext } from '../../../../context/FagsakContext';
import { Aktsomhet, SærligeGrunner, Vilkårsresultat } from '../../../../kodeverk';
import { lagBehandling } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { lagVilkårsvurderingPeriodeSkjemaData } from '../../../../testdata/vilkårsvurderingFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';

vi.setConfig({ testTimeout: 10000 });

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

vi.mock('../../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: vi.fn(),
        }),
    };
});

vi.mock('../../../../context/BehandlingContext', () => ({
    useBehandling: (): Partial<BehandlingContextType> => ({
        behandling: lagBehandling(),
        behandlingILesemodus: false,
        settIkkePersistertKomponent: vi.fn(),
        nullstillIkkePersisterteKomponenter: vi.fn(),
        ventegrunn: undefined,
        aktivtSteg: undefined,
        erStegBehandlet: vi.fn().mockReturnValue(false),
        actionBarStegtekst: vi.fn().mockReturnValue('Steg 1 av 5'),
    }),
}));

vi.mock('../VilkårsvurderingContext', () => {
    return {
        useVilkårsvurdering: (): Partial<VilkårsvurderingHook> => ({
            oppdaterPeriode: vi.fn(),
            gåTilNesteSteg: vi.fn(),
            sendInnSkjemaOgNaviger: vi.fn(),
            sendInnSkjemaMutation: {
                isPending: false,
                isError: false,
                error: null,
                reset: vi.fn(),
            },
        }),
    };
});

const renderVilkårsvurderingPeriodeSkjema = (
    behandling: BehandlingDto,
    periode: VilkårsvurderingPeriodeSkjemaData,
    erTotalbeløpUnder4Rettsgebyr: boolean,
    behandletPerioder: VilkårsvurderingPeriodeSkjemaData[] = []
): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak()}>
                <VilkårsvurderingPeriodeSkjema
                    behandling={behandling}
                    periode={periode}
                    behandletPerioder={behandletPerioder}
                    erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                    erLesevisning={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </FagsakContext.Provider>
        </QueryClientProvider>
    );
};

describe('VilkårsvurderingPeriodeSkjema', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('God tro - beløp ikke i behold', async () => {
        const vilkårsvurderingPeriode = lagVilkårsvurderingPeriodeSkjemaData({
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
        });
        const behandletPerioder = [lagVilkårsvurderingPeriodeSkjemaData()];

        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            vilkårsvurderingPeriode,
            false,
            behandletPerioder
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(getByText('Feilutbetalt beløp')).toBeInTheDocument();
        expect(getByText('Aktivitet 1')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Aktivitet 2')).toBeInTheDocument();
        expect(getByText('1 000')).toBeInTheDocument();
        expect(getByText('Kopier vilkårsvurdering fra')).toBeInTheDocument();
        expect(queryByText('Beløpet mottatt i god tro')).not.toBeInTheDocument();
        expect(queryByLabelText('Vurder om beløpet er i behold')).not.toBeInTheDocument();

        expect(
            getByRole('radio', {
                name: /mottaker forsto eller burde forstått at utbetalingen skyldtes en feil/i,
            })
        ).toBeInTheDocument();

        expect(
            getByRole('radio', {
                name: /mottaker har forårsaket feilutbetalingen.*feilaktige.*opplysninger/i,
            })
        ).toBeInTheDocument();

        expect(
            getByRole('radio', {
                name: /mottaker har forårsaket feilutbetalingen.*mangelfulle.*opplysninger/i,
            })
        ).toBeInTheDocument();

        expect(
            getByRole('radio', {
                name: /mottaker har mottatt beløpet i god tro/i,
            })
        ).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

        expect(
            getByRole('button', {
                name: 'Gå tilbake til foreldelsessteget',
            })
        ).toBeEnabled();

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        await user.type(getByLabelText('Vilkårene for tilbakekreving'), 'begrunnelse');

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );

        expect(queryByText('Beløpet mottatt i god tro')).toBeInTheDocument();
        expect(queryByLabelText('Vurder om beløpet er i behold')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryByText('Ingen tilbakekreving')).not.toBeInTheDocument();

        await user.type(getByLabelText('Vurder om beløpet er i behold'), 'begrunnelse');
        await user.click(
            getByLabelText('Nei', {
                selector: 'input',
            })
        );

        expect(queryByText('Ingen tilbakekreving')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('God tro - beløp i behold', async () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            lagVilkårsvurderingPeriodeSkjemaData(),
            false
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Kopier vilkårsvurdering fra')).not.toBeInTheDocument();
        expect(queryByText('Beløpet mottatt i god tro')).not.toBeInTheDocument();
        expect(queryByLabelText('Vurder om beløpet er i behold')).not.toBeInTheDocument();

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

        expect(queryByText('Ingen tilbakekreving')).not.toBeInTheDocument();
        expect(queryByLabelText('Angi beløp som skal tilbakekreves')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.type(getByLabelText('Angi beløp som skal tilbakekreves'), '2000');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Forsto/burde forstått - forsto', async () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            lagVilkårsvurderingPeriodeSkjemaData(),
            false
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();
        expect(
            queryByLabelText(
                'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
            )
        ).not.toBeInTheDocument();
        expect(
            queryByText('I hvilken grad burde mottaker forstått at utbetalingen skyldtes en feil?')
        ).not.toBeInTheDocument();

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

        expect(queryByText('Aktsomhet')).toBeInTheDocument();
        expect(
            queryByLabelText(
                'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
            )
        ).toBeInTheDocument();
        expect(
            queryByText('I hvilken grad burde mottaker forstått at utbetalingen skyldtes en feil?')
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(
            getByLabelText(
                'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
            ),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Forsto', {
                selector: 'input',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100 %')).toBeInTheDocument();
        expect(getByText('Skal det tillegges renter?')).toBeInTheDocument();
        expect(getByText('Nei')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Forsto/burde forstått - må ha forstått - ingen grunn til reduksjon', async () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByRole,
            queryByText,
        } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            lagVilkårsvurderingPeriodeSkjemaData(),
            false
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();
        expect(
            queryByLabelText(
                'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
            )
        ).not.toBeInTheDocument();
        expect(
            queryByText('I hvilken grad burde mottaker forstått at utbetalingen skyldtes en feil?')
        ).not.toBeInTheDocument();

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

        expect(queryByText('Aktsomhet')).toBeInTheDocument();
        expect(queryByText('Særlige grunner 4. ledd')).not.toBeInTheDocument();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).not.toBeInTheDocument();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).not.toBeInTheDocument();
        expect(
            queryByText('Skal særlige grunner gi reduksjon av beløpet?')
        ).not.toBeInTheDocument();

        await user.type(
            getByLabelText(
                'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
            ),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Må ha forstått', {
                selector: 'input',
            })
        );

        expect(queryByText('Særlige grunner 4. ledd')).toBeInTheDocument();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeInTheDocument();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).toBeInTheDocument();
        expect(queryByText('Skal særlige grunner gi reduksjon av beløpet?')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        // Annet begrunnelse
        expect(
            queryByRole('textbox', {
                name: '',
            })
        ).not.toBeInTheDocument();

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

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100 %')).toBeInTheDocument();
        expect(getByText('Skal det tillegges renter?')).toBeInTheDocument();
        expect(getByLabelText('Nei')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Feilaktig - forsto', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByText } =
            renderVilkårsvurderingPeriodeSkjema(
                lagBehandling(),
                lagVilkårsvurderingPeriodeSkjemaData(),
                false
            );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();

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

        expect(queryByText('Aktsomhet')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100 %')).toBeInTheDocument();
        expect(getByText('Skal det tillegges renter?')).toBeInTheDocument();
        expect(queryByText('Det legges til 10 % renter')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Feilaktige - grov uaktsomhet - ingen grunn til reduksjon', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByText, queryByTestId } =
            renderVilkårsvurderingPeriodeSkjema(
                lagBehandling(),
                lagVilkårsvurderingPeriodeSkjemaData(),
                false
            );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();

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

        expect(queryByText('Aktsomhet')).toBeInTheDocument();
        expect(queryByText('Særlige grunner 4. ledd')).not.toBeInTheDocument();

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Grov uaktsomhet', {
                selector: 'input',
            })
        );

        expect(queryByText('Særlige grunner 4. ledd')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('Skal det tillegges renter?')).toBeInTheDocument();
        expect(queryByTestId('skalDetTilleggesRenter_Nei')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);
    });

    test('Feilaktige - grov uaktsomhet - grunn til reduksjon', async () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            lagVilkårsvurderingPeriodeSkjemaData(),
            false
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();
        expect(
            queryByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt')
        ).not.toBeInTheDocument();
        expect(
            queryByText('I hvilken grad burde mottaker forstått at utbetalingen skyldtes en feil?')
        ).not.toBeInTheDocument();

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

        expect(queryByText('Aktsomhet')).toBeInTheDocument();

        expect(queryByText('Særlige grunner 4. ledd')).not.toBeInTheDocument();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).not.toBeInTheDocument();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).not.toBeInTheDocument();
        expect(
            queryByText('Skal særlige grunner gi reduksjon av beløpet?')
        ).not.toBeInTheDocument();

        await user.type(
            getByLabelText('Vurder i hvilken grad mottaker har handlet uaktsomt'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Grov uaktsomhet', {
                selector: 'input',
            })
        );

        expect(queryByText('Særlige grunner 4. ledd')).toBeInTheDocument();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeInTheDocument();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).toBeInTheDocument();
        expect(queryByText('Skal særlige grunner gi reduksjon av beløpet?')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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

        expect(getByText('Angi andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('Skal det tillegges renter?')).toBeInTheDocument();
        expect(getByLabelText('Nei')).toBeInTheDocument();
        expect(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            })
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Feilaktige - grov uaktsomhet - grunn til reduksjon - egendefinert', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByRole, queryByText } =
            renderVilkårsvurderingPeriodeSkjema(
                lagBehandling(),
                lagVilkårsvurderingPeriodeSkjemaData(),
                false
            );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();

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

        expect(queryByText('Aktsomhet')).toBeInTheDocument();

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
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);
        expect(
            queryByRole('textbox', {
                name: '',
            })
        ).not.toBeInTheDocument();

        await user.selectOptions(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            }),
            'Egendefinert'
        );

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Mangelfulle - simpel uaktsomhet - under 4 rettsgebyr - grunn til reduksjon', async () => {
        const {
            getByLabelText,
            getByRole,
            getByTestId,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            lagVilkårsvurderingPeriodeSkjemaData(),
            true
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();

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

        expect(queryByText('Aktsomhet')).toBeInTheDocument();
        expect(
            queryByText('Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?')
        ).not.toBeInTheDocument();
        expect(queryByText('Særlige grunner 4. ledd')).not.toBeInTheDocument();

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
        ).toBeInTheDocument();
        expect(queryByText('Særlige grunner 4. ledd')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );
        expect(queryByText('Særlige grunner 4. ledd')).toBeInTheDocument();
        expect(
            queryByLabelText('Vurder særlige grunner du har vektlagt for resultatet')
        ).toBeInTheDocument();
        expect(queryByText('Særlige grunner som er vektlagt (4.ledd)')).toBeInTheDocument();
        expect(queryByText('Skal særlige grunner gi reduksjon av beløpet?')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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

        expect(queryByText('Skal det tillegges renter?')).not.toBeInTheDocument();
        expect(
            getByRole('combobox', {
                name: 'Angi andel som skal tilbakekreves',
            })
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Mangelfulle - simpel uaktsomhet - under 4 rettsgebyr - ingen grunn til reduksjon', async () => {
        const { getByLabelText, getByRole, getByText, getByTestId, queryAllByText, queryByText } =
            renderVilkårsvurderingPeriodeSkjema(
                lagBehandling(),
                lagVilkårsvurderingPeriodeSkjemaData(),
                true
            );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();

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
        ).toBeInTheDocument();
        expect(
            queryByText('Når 6. ledd anvendes må alle perioder behandles likt')
        ).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(
            queryByText('Når 6. ledd anvendes må alle perioder behandles likt')
        ).not.toBeInTheDocument();
        expect(queryByText('Særlige grunner 4. ledd')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
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

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100 %')).toBeInTheDocument();
        expect(queryByText('Skal det tillegges renter?')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Mangelfulle - simpel uaktsomhet - under 4 rettsgebyr - ikke tilbakekreves', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByText } =
            renderVilkårsvurderingPeriodeSkjema(
                lagBehandling(),
                lagVilkårsvurderingPeriodeSkjemaData(),
                true
            );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Aktsomhet')).not.toBeInTheDocument();

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
        ).toBeInTheDocument();
        expect(
            queryByText('Når 6. ledd anvendes må alle perioder behandles likt')
        ).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(
            queryByText('Når 6. ledd anvendes må alle perioder behandles likt')
        ).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Åpner vurdert periode - god tro - beløp i behold', async () => {
        const { getByLabelText, getByText } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            lagVilkårsvurderingPeriodeSkjemaData({
                begrunnelse: 'Gitt i god tro',
                vilkårsvurderingsresultatInfo: {
                    vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
                    godTro: {
                        begrunnelse: 'Deler av beløpet er i behold',
                        beløpErIBehold: true,
                        beløpTilbakekreves: 699,
                    },
                },
            }),
            true
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
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

    test('Åpner vurdert periode - mangelfulle - simpel uaktsomhet - under 4 rettsgebyr', async () => {
        const { getByLabelText, getByTestId, getByText } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            lagVilkårsvurderingPeriodeSkjemaData({
                begrunnelse: 'Gitt mangelfulle opplysninger',
                vilkårsvurderingsresultatInfo: {
                    vilkårsvurderingsresultat: Vilkårsresultat.MangelfulleOpplysningerFraBruker,
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
            }),
            true
        );

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
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
        ).toBeInTheDocument();
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

    test('Validering vises når man forsøker å gå videre uten å fylle inn påkrevde felter', async () => {
        const { getByRole, queryAllByText } = renderVilkårsvurderingPeriodeSkjema(
            lagBehandling(),
            lagVilkårsvurderingPeriodeSkjemaData(),
            false
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
    });
});
