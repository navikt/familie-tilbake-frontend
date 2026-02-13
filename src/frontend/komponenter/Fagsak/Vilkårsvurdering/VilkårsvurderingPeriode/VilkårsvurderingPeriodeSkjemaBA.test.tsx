import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/vilkårsvurdering';
import type { VilkårsvurderingHook } from '../VilkårsvurderingContext';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { VilkårsvurderingPeriodeSkjema } from './VilkårsvurderingPeriodeSkjema';
import { FagsakContext } from '../../../../context/FagsakContext';
import { Aktsomhet, SærligeGrunner, Vilkårsresultat } from '../../../../kodeverk';
import { TestBehandlingProvider } from '../../../../testdata/behandlingContextFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import { lagVilkårsvurderingPeriodeSkjemaData } from '../../../../testdata/vilkårsvurderingFactory';
import { createTestQueryClient } from '../../../../testutils/queryTestUtils';

vi.setConfig({ testTimeout: 10000 });

vi.mock('../VilkårsvurderingContext', () => {
    return {
        useVilkårsvurdering: (): Partial<VilkårsvurderingHook> => ({
            oppdaterPeriode: vi.fn(),
            navigerTilNeste: vi.fn(),
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
    periode: VilkårsvurderingPeriodeSkjemaData,
    erTotalbeløpUnder4Rettsgebyr: boolean,
    behandletPerioder: VilkårsvurderingPeriodeSkjemaData[] = []
): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext.Provider value={lagFagsak()}>
                <TestBehandlingProvider>
                    <VilkårsvurderingPeriodeSkjema
                        periode={periode}
                        behandletPerioder={behandletPerioder}
                        erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                        perioder={[periode]}
                        pendingPeriode={undefined}
                        settPendingPeriode={vi.fn()}
                    />
                </TestBehandlingProvider>
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

        const { getByLabelText, getByRole, getByText, queryAllByText, queryByLabelText } =
            renderVilkårsvurderingPeriodeSkjema(vilkårsvurderingPeriode, false, behandletPerioder);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(getByText('Feilutbetalt beløp')).toBeInTheDocument();
        expect(getByText('Aktivitet 1')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Aktivitet 2')).toBeInTheDocument();
        expect(getByText('1 000')).toBeInTheDocument();
        expect(getByText('Kopier vilkårsvurdering fra')).toBeInTheDocument();

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
                name: /Mottaker har mottatt beløpet i aktsom god tro/i,
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

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );

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
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        );

        expect(
            queryByLabelText('Begrunn hvorfor beløpet ikke er i behold')
        ).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.click(
            getByLabelText('Nei', {
                selector: 'input',
            })
        );
        await user.type(getByLabelText('Begrunn hvorfor beløpet ikke er i behold'), 'begrunnelse');

        const tilbakekrevdBeløp = getByLabelText('Beløp som skal tilbakekreves');
        expect(tilbakekrevdBeløp).toHaveValue('0');

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
        } = renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), false);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Kopier vilkårsvurdering fra')).not.toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        );

        await user.click(
            getByLabelText('Ja', {
                selector: 'input',
            })
        );
        await user.type(getByLabelText('Begrunn hvorfor beløpet er i behold'), 'begrunnelse');

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
        } = renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), false);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(
            queryByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).not.toBeInTheDocument();
        expect(queryByText('Vurder mottakers grad av aktsomhet')).not.toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(
            queryByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).toBeInTheDocument();
        expect(queryByText('Vurder mottakers grad av aktsomhet')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte alternativet ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Mottaker forsto at utbetalingen skyldtes en feil', {
                selector: 'input',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100%')).toBeInTheDocument();
        expect(getByText('Skal det beregnes 10% rentetillegg?')).toBeInTheDocument();
        expect(getByText('Nei')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Forsto/burde forstått - Mottaker må ha forstått at utbetalingen skyldtes en feil - ingen grunn til reduksjon', async () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByRole,
            queryByText,
            getByTestId,
        } = renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), false);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(
            queryByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).not.toBeInTheDocument();
        expect(queryByText('Vurder mottakers grad av aktsomhet')).not.toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(
            queryByLabelText('Begrunn resultatet av vurderingen ovenfor')
        ).not.toBeInTheDocument();
        expect(
            queryByText('Hvilke særlige grunner kan være aktuelle i denne saken?')
        ).not.toBeInTheDocument();
        expect(queryByText('Skal særlige grunner redusere beløpet?')).not.toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte alternativet ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText('Mottaker må ha forstått at utbetalingen skyldtes en feil', {
                selector: 'input',
            })
        );

        expect(queryByLabelText('Begrunn resultatet av vurderingen ovenfor')).toBeInTheDocument();
        expect(
            queryByText('Hvilke særlige grunner kan være aktuelle i denne saken?')
        ).toBeInTheDocument();
        expect(queryByText('Skal særlige grunner redusere beløpet?')).toBeInTheDocument();

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

        await user.type(getByLabelText('Begrunn resultatet av vurderingen ovenfor'), 'begrunnelse');
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot', {
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
        expect(getByText('100%')).toBeInTheDocument();
        expect(getByText('Skal det beregnes 10% rentetillegg?')).toBeInTheDocument();
        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeChecked();

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
        const { getByLabelText, getByRole, getByText, queryAllByText, getByTestId } =
            renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), false);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');
        await user.click(
            getByLabelText('Forsettlig', {
                selector: 'input',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100%')).toBeInTheDocument();
        expect(getByText('Skal det beregnes 10% rentetillegg?')).toBeInTheDocument();
        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Feilaktige - grovt uaktsomt - ingen grunn til reduksjon', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, getByTestId } =
            renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), false);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');
        await user.click(
            getByLabelText('Grovt uaktsomt', {
                selector: 'input',
            })
        );

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        await user.type(getByLabelText('Begrunn resultatet av vurderingen ovenfor'), 'begrunnelse');
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(
            getByRole('radio', {
                name: 'Nei',
            })
        );

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('Skal det beregnes 10% rentetillegg?')).toBeInTheDocument();
        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);
    });

    test('Feilaktige - grovt uaktsomt - grunn til reduksjon', async () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
            getByTestId,
        } = renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), false);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Vurder mottakers grad av aktsomhet')).not.toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(
            queryByLabelText('Begrunn resultatet av vurderingen ovenfor')
        ).not.toBeInTheDocument();
        expect(
            queryByText('Hvilke særlige grunner kan være aktuelle i denne saken?')
        ).not.toBeInTheDocument();
        expect(queryByText('Skal særlige grunner redusere beløpet?')).not.toBeInTheDocument();

        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');
        await user.click(
            getByLabelText('Grovt uaktsomt', {
                selector: 'input',
            })
        );

        expect(queryByLabelText('Begrunn resultatet av vurderingen ovenfor')).toBeInTheDocument();
        expect(
            queryByText('Hvilke særlige grunner kan være aktuelle i denne saken?')
        ).toBeInTheDocument();
        expect(queryByText('Skal særlige grunner redusere beløpet?')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        await user.type(getByLabelText('Begrunn resultatet av vurderingen ovenfor'), 'begrunnelse');
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(
            getByRole('radio', {
                name: 'Ja',
            })
        );

        expect(getByText('Angi andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('Skal det beregnes 10% rentetillegg?')).toBeInTheDocument();
        expect(getByTestId('skalDetTilleggesRenter_Nei')).toBeInTheDocument();
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

    test('Feilaktige - grovt uaktsomt - grunn til reduksjon - egendefinert', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByRole } =
            renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), false);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');
        await user.click(
            getByLabelText('Grovt uaktsomt', {
                selector: 'input',
            })
        );

        await user.type(getByLabelText('Begrunn resultatet av vurderingen ovenfor'), 'begrunnelse');
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot', {
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

    test('Mangelfulle - uaktsomt - under 4 rettsgebyr - grunn til reduksjon', async () => {
        const {
            getByLabelText,
            getByRole,
            getByTestId,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByText,
        } = renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), true);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        expect(
            queryByText(
                'Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).not.toBeInTheDocument();

        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');
        await user.click(
            getByLabelText('Uaktsomt', {
                selector: 'input',
            })
        );

        expect(
            queryByText(
                'Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).toBeInTheDocument();

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

        expect(queryByLabelText('Begrunn resultatet av vurderingen ovenfor')).toBeInTheDocument();
        expect(
            queryByText('Hvilke særlige grunner kan være aktuelle i denne saken?')
        ).toBeInTheDocument();
        expect(queryByText('Skal særlige grunner redusere beløpet?')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        await user.type(getByLabelText('Begrunn resultatet av vurderingen ovenfor'), 'begrunnelse');
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(getByTestId('harGrunnerTilReduksjon_Ja'));

        expect(queryByText('Skal det beregnes 10% rentetillegg?')).not.toBeInTheDocument();
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

    test('Mangelfulle - uaktsomt - under 4 rettsgebyr - ingen grunn til reduksjon', async () => {
        const { getByLabelText, getByRole, getByText, getByTestId, queryAllByText, queryByText } =
            renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), true);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');
        await user.click(
            getByLabelText('Uaktsomt', {
                selector: 'input',
            })
        );

        expect(
            queryByText(
                'Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
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

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);

        await user.type(getByLabelText('Begrunn resultatet av vurderingen ovenfor'), 'begrunnelse');
        await user.click(
            getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot', {
                selector: 'input',
            })
        );
        await user.click(getByTestId('harGrunnerTilReduksjon_Nei'));

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100%')).toBeInTheDocument();
        expect(queryByText('Skal det beregnes 10% rentetillegg?')).not.toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Mangelfulle - uaktsomt - under 4 rettsgebyr - ikke tilbakekreves', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByText } =
            renderVilkårsvurderingPeriodeSkjema(lagVilkårsvurderingPeriodeSkjemaData(), true);

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );
        await user.click(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        );

        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');
        await user.click(
            getByLabelText('Uaktsomt', {
                selector: 'input',
            })
        );

        expect(
            queryByText(
                'Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
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
        expect(getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor')).toHaveValue(
            'Gitt i god tro'
        );
        expect(
            getByLabelText('Mottaker har mottatt beløpet i aktsom god tro', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(getByLabelText('Ja')).toBeChecked();
        expect(getByLabelText('Angi beløp som skal tilbakekreves')).toHaveValue('699');
    });

    test('Åpner vurdert periode - mangelfulle - uaktsomt - under 4 rettsgebyr', async () => {
        const { getByLabelText, getByTestId, getByText } = renderVilkårsvurderingPeriodeSkjema(
            lagVilkårsvurderingPeriodeSkjemaData({
                begrunnelse: 'Gitt mangelfulle opplysninger',
                vilkårsvurderingsresultatInfo: {
                    vilkårsvurderingsresultat: Vilkårsresultat.MangelfulleOpplysningerFraBruker,
                    aktsomhet: {
                        begrunnelse: 'Vurdert aktsomhet til uaktsomt',
                        aktsomhet: Aktsomhet.Uaktsomt,
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
        expect(getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor')).toHaveValue(
            'Gitt mangelfulle opplysninger'
        );
        expect(
            getByLabelText(
                'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
                {
                    selector: 'input',
                    exact: false,
                }
            )
        ).toBeChecked();
        expect(getByLabelText('Begrunn mottakerens aktsomhetsgrad')).toHaveValue(
            'Vurdert aktsomhet til uaktsomt'
        );
        expect(getByLabelText('Uaktsomt')).toBeChecked();
        expect(
            getByText(
                'Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).toBeInTheDocument();
        expect(getByTestId('tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Ja')).toBeChecked();
        expect(getByLabelText('Begrunn resultatet av vurderingen ovenfor')).toHaveValue(
            'Det finnes særlige grunner'
        );
        expect(
            getByLabelText('Graden av uaktsomhet hos den som kravet retter seg mot')
        ).toBeChecked();
        expect(getByLabelText('Størrelsen av det feilutbetalte beløpet')).toBeChecked();
        expect(getByLabelText('Annet')).toBeChecked();
        expect(getByTestId('annetBegrunnelse')).toHaveValue('Dette er en annen begrunnelse');
        expect(getByTestId('harGrunnerTilReduksjon_Ja')).toBeChecked();
        expect(getByTestId('andelSomTilbakekrevesManuell')).toHaveValue('33');
    });

    test('Validering vises når man forsøker å gå videre uten å fylle inn påkrevde felter', async () => {
        const { getByRole, queryAllByText } = renderVilkårsvurderingPeriodeSkjema(
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
