import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import type { BehandlingDto } from '~/generated';
import type { VilkårsvurderingHook } from '~/pages/fagsak/vilkaarsvurdering/VilkårsvurderingContext';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { Aktsomhet, SærligeGrunner, Vilkårsresultat } from '~/kodeverk';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { lagVilkårsvurderingPeriodeSkjemaData } from '~/testdata/vilkårsvurderingFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { SkalUnnlates } from '~/typer/tilbakekrevingstyper';

import { VilkårsvurderingPeriodeSkjema } from './VilkårsvurderingPeriodeSkjema';

vi.setConfig({ testTimeout: 10000 });

vi.mock('../VilkårsvurderingContext', () => {
    return {
        useVilkårsvurdering: (): Partial<VilkårsvurderingHook> => ({
            kanIlleggeRenter: true,
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

const periode = lagVilkårsvurderingPeriodeSkjemaData();

const TestWrapper = ({
    children,
    behandling,
}: {
    children: ReactNode;
    behandling?: BehandlingDto;
}): ReactElement => {
    const queryClient = createTestQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider behandling={behandling}>{children}</TestBehandlingProvider>
            </FagsakContext>
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
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByLabelText } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
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
                        lagVilkårsvurderingPeriodeSkjemaData({
                            periode: {
                                fom: '2020-10-01',
                                tom: '2020-11-30',
                            },
                        }),
                    ]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(getByText('Feilutbetalt beløp')).toBeInTheDocument();
        expect(getByText('Aktivitet 1')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Aktivitet 2')).toBeInTheDocument();
        expect(getByText('1 000')).toBeInTheDocument();

        expect(
            queryByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).not.toBeInTheDocument();

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

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

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
        } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(queryByText('Kopier vilkårsvurdering fra')).not.toBeInTheDocument();

        expect(
            queryByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).not.toBeInTheDocument();

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

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

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
        } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(
            queryByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).not.toBeInTheDocument();
        expect(queryByText('Vurder mottakers grad av aktsomhet')).not.toBeInTheDocument();

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
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

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
        expect(getByLabelText('Nei')).toBeInTheDocument();
        expect(getByLabelText('Ja')).toBeInTheDocument();

        expect(getByLabelText('Nei')).toBeChecked();

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
            getByTestId,
            getByText,
            queryAllByText,
            queryByLabelText,
            queryByRole,
            queryByText,
        } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(
            queryByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).not.toBeInTheDocument();
        expect(queryByText('Vurder mottakers grad av aktsomhet')).not.toBeInTheDocument();

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
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

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

        await user.click(getByTestId('skalDetTilleggesRenter_Ja'));

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Feilaktig - forsto', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByText, getByTestId } =
            render(
                <TestWrapper>
                    <VilkårsvurderingPeriodeSkjema
                        periode={periode}
                        behandletPerioder={[]}
                        erTotalbeløpUnder4Rettsgebyr={false}
                        perioder={[periode]}
                        pendingPeriode={undefined}
                        settPendingPeriode={vi.fn()}
                    />
                </TestWrapper>
            );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

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

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100%')).toBeInTheDocument();
        expect(queryByText('Skal det beregnes 10% rentetillegg?')).toBeInTheDocument();
        expect(getByTestId('skalDetTilleggesRenter_Ja')).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Feilaktige - grovt uaktsomt - ingen grunn til reduksjon', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

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
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

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
        const rentetilleggRadioGroup = getByRole('radiogroup', {
            name: 'Skal det beregnes 10% rentetillegg?',
        });
        expect(within(rentetilleggRadioGroup).getByRole('radio', { name: 'Ja' })).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );

        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('nyModell - Feilaktige - grovt uaktsomt - ingen grunn til reduksjon', async () => {
        const { getByLabelText, getByRole, getByText, queryAllByText } = render(
            <TestWrapper behandling={lagBehandling({ erNyModell: true })}>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

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
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

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
        const rentetilleggRadioGroup = getByRole('radiogroup', {
            name: 'SkrivebeskyttetSkal det beregnes 10% rentetillegg?',
        });
        expect(within(rentetilleggRadioGroup).getByRole('radio', { name: 'Ja' })).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );

        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(0);
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Feilaktige - grovt uaktsomt - grunn til reduksjon', async () => {
        const {
            getByLabelText,
            getByRole,
            getByText,
            queryByLabelText,
            queryAllByText,
            queryByText,
        } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(
            queryByLabelText('Begrunn hvorfor du valgte alternativet ovenfor')
        ).not.toBeInTheDocument();
        expect(
            queryByText('I hvilken grad har mottaker handlet uaktsomt?')
        ).not.toBeInTheDocument();

        const vilkårRadioGroup = getByRole('radiogroup', {
            name: 'Velg det vilkåret i folketrygdloven §22-15 som gjelder for perioden',
        });
        await user.click(
            within(vilkårRadioGroup).getByRole('radio', {
                name: /Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger/i,
            })
        );
        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );

        expect(
            queryByLabelText('Begrunn resultatet av vurderingen ovenfor')
        ).not.toBeInTheDocument();
        expect(
            queryByText('Hvilke særlige grunner kan være aktuelle i denne saken?')
        ).not.toBeInTheDocument();
        expect(queryByText('Skal særlige grunner redusere beløpet?')).not.toBeInTheDocument();

        const aktsomhetsgradRadioGroup = getByRole('radiogroup', {
            name: 'I hvilken grad har mottaker handlet uaktsomt?',
        });
        await user.click(
            within(aktsomhetsgradRadioGroup).getByRole('radio', {
                name: 'Grovt uaktsomt',
            })
        );
        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Du må velge minst en særlig grunn')).toHaveLength(1);
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        const særligeGrunnerCheckboxGroup = getByRole('group', {
            name: 'Hvilke særlige grunner kan være aktuelle i denne saken?',
        });
        await user.click(
            within(særligeGrunnerCheckboxGroup).getByRole('checkbox', {
                name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
            })
        );

        const særligeGrunnerRadioGroup = getByRole('radiogroup', {
            name: 'Skal særlige grunner redusere beløpet?',
        });
        await user.click(within(særligeGrunnerRadioGroup).getByRole('radio', { name: 'Ja' }));
        await user.type(getByLabelText('Begrunn resultatet av vurderingen ovenfor'), 'begrunnelse');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        const andelAvBeløp = getByRole('combobox', {
            name: 'Angi andel som skal tilbakekreves',
        });
        await user.selectOptions(andelAvBeløp, '30');

        const rentetilleggRadioGroup = getByRole('radiogroup', {
            name: 'SkrivebeskyttetSkal det beregnes 10% rentetillegg?',
        });
        expect(within(rentetilleggRadioGroup).getByRole('radio', { name: 'Ja' })).toBeChecked();

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('Feilaktige - grovt uaktsomt - grunn til reduksjon - egendefinert', async () => {
        const { getByLabelText, getByRole, queryAllByText } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        const vilkårRadioGroup = getByRole('radiogroup', {
            name: 'Velg det vilkåret i folketrygdloven §22-15 som gjelder for perioden',
        });
        await user.click(
            within(vilkårRadioGroup).getByRole('radio', {
                name: /Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger/i,
            })
        );
        await user.type(
            getByLabelText('Begrunn hvorfor du valgte vilkåret ovenfor'),
            'begrunnelse'
        );

        const aktsomhetsgradRadioGroup = getByRole('radiogroup', {
            name: 'I hvilken grad har mottaker handlet uaktsomt?',
        });
        await user.click(
            within(aktsomhetsgradRadioGroup).getByRole('radio', {
                name: 'Grovt uaktsomt',
            })
        );
        await user.type(getByLabelText('Begrunn mottakerens aktsomhetsgrad'), 'begrunnelse');

        const særligeGrunnerCheckboxGroup = getByRole('group', {
            name: 'Hvilke særlige grunner kan være aktuelle i denne saken?',
        });
        await user.click(
            within(særligeGrunnerCheckboxGroup).getByRole('checkbox', {
                name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
            })
        );

        const særligeGrunnerRadioGroup = getByRole('radiogroup', {
            name: 'Skal særlige grunner redusere beløpet?',
        });
        await user.click(within(særligeGrunnerRadioGroup).getByRole('radio', { name: 'Ja' }));
        await user.type(getByLabelText('Begrunn resultatet av vurderingen ovenfor'), 'begrunnelse');

        const andelAvBeløp = getByRole('combobox', {
            name: 'Angi andel som skal tilbakekreves',
        });
        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        await user.selectOptions(andelAvBeløp, 'Egendefinert');

        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(1);

        const andelAvBeløpFritekst = getByRole('textbox', {
            name: 'Angi andel som skal tilbakekreves - fritekst',
        });
        await user.type(andelAvBeløpFritekst, '22');

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
        } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

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
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

        expect(
            queryByText(
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
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
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
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
            render(
                <TestWrapper>
                    <VilkårsvurderingPeriodeSkjema
                        periode={periode}
                        behandletPerioder={[]}
                        erTotalbeløpUnder4Rettsgebyr={true}
                        perioder={[periode]}
                        pendingPeriode={undefined}
                        settPendingPeriode={vi.fn()}
                    />
                </TestWrapper>
            );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

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
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

        expect(
            queryByText(
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
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
        const { getByLabelText, getByRole, getByText, queryAllByText, queryByText } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();

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
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        ).toBeEnabled();

        expect(
            queryByText(
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
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
        const { getByLabelText, getByText } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={lagVilkårsvurderingPeriodeSkjemaData({
                        begrunnelse: 'Gitt i god tro',
                        vilkårsvurderingsresultatInfo: {
                            vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
                            godTro: {
                                begrunnelse: 'Deler av beløpet er i behold',
                                beløpErIBehold: true,
                                beløpTilbakekreves: 699,
                            },
                        },
                    })}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );
        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });
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
        const { getByLabelText, getByTestId, getByText } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={lagVilkårsvurderingPeriodeSkjemaData({
                        begrunnelse: 'Gitt mangelfulle opplysninger',
                        vilkårsvurderingsresultatInfo: {
                            vilkårsvurderingsresultat:
                                Vilkårsresultat.MangelfulleOpplysningerFraBruker,
                            aktsomhet: {
                                begrunnelse: 'Vurdert aktsomhet til uaktsomt',
                                aktsomhet: Aktsomhet.Uaktsomt,
                                unnlates4Rettsgebyr: SkalUnnlates.Tilbakekreves,
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
                    })}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                />
            </TestWrapper>
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
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
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

    test('Viser særlige grunner og for over 4 rettsgebyr alternativ - uaktsomt', async () => {
        const behandling = lagBehandling({ erNyModell: true });
        const { getByTestId, getByText } = render(
            <TestWrapper behandling={behandling}>
                <VilkårsvurderingPeriodeSkjema
                    periode={lagVilkårsvurderingPeriodeSkjemaData({
                        begrunnelse: 'Gitt mangelfulle opplysninger',
                        vilkårsvurderingsresultatInfo: {
                            vilkårsvurderingsresultat:
                                Vilkårsresultat.MangelfulleOpplysningerFraBruker,
                            aktsomhet: {
                                begrunnelse: 'Vurdert aktsomhet til uaktsomt',
                                aktsomhet: Aktsomhet.Uaktsomt,
                                unnlates4Rettsgebyr: SkalUnnlates.Over4Rettsgebyr,
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
                    })}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                />
            </TestWrapper>
        );
        expect(
            getByText(
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).toBeInTheDocument();
        expect(
            getByTestId('tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Over4Rettsgebyr')
        ).toBeChecked();
        expect(
            getByText('Hvilke særlige grunner kan være aktuelle i denne saken?')
        ).toBeInTheDocument();
    });

    test('Viser ikke over 4 rettsgebyr alternativ for gammel modell', async () => {
        const behandling = lagBehandling({ erNyModell: false });
        const { queryByTestId, getByText } = render(
            <TestWrapper behandling={behandling}>
                <VilkårsvurderingPeriodeSkjema
                    periode={lagVilkårsvurderingPeriodeSkjemaData({
                        begrunnelse: 'Gitt mangelfulle opplysninger',
                        vilkårsvurderingsresultatInfo: {
                            vilkårsvurderingsresultat:
                                Vilkårsresultat.MangelfulleOpplysningerFraBruker,
                            aktsomhet: {
                                begrunnelse: 'Vurdert aktsomhet til uaktsomt',
                                aktsomhet: Aktsomhet.Uaktsomt,
                                unnlates4Rettsgebyr: SkalUnnlates.Unnlates,
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
                    })}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={true}
                />
            </TestWrapper>
        );
        expect(
            getByText(
                'Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?'
            )
        ).toBeInTheDocument();
        expect(
            queryByTestId('tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Over4Rettsgebyr')
        ).not.toBeInTheDocument();
    });

    test('Validering vises når man forsøker å gå videre uten å fylle inn påkrevde felter', async () => {
        const { getByRole, queryAllByText } = render(
            <TestWrapper>
                <VilkårsvurderingPeriodeSkjema
                    periode={periode}
                    behandletPerioder={[]}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    perioder={[periode]}
                    pendingPeriode={undefined}
                    settPendingPeriode={vi.fn()}
                />
            </TestWrapper>
        );

        // Sjekk at det ikke er noen feilmeldinger fra start
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        // Klikk på "Gå videre til vedtak" uten å fylle inn noen felter
        await user.click(
            getByRole('button', {
                name: 'Gå videre til vedtakssteget',
            })
        );

        // Sjekk at validering vises - skal være feil på vilkårsbegrunnelse og vilkårsresultat
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
    });
});
