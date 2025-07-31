import type { VilkårsvurderingPeriodeSkjemaData } from './typer/feilutbetalingVilkårsvurdering';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';

import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import * as VilkårsvurderingContext from './VilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import * as BehandlingContext from '../../../context/BehandlingContext';
import { HendelseType, Ytelsetype } from '../../../kodeverk';

jest.setTimeout(10000);

jest.mock('../../../api/http/HttpProvider', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});

// Mock the child components
jest.mock('./VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema', () => {
    return function MockVilkårsvurderingPeriodeSkjema() {
        return <div data-testid="vilkårsvurdering-periode-skjema">Periode Skjema</div>;
    };
});

jest.mock('../../Felleskomponenter/TilbakeTidslinje/TilbakeTidslinje', () => {
    return function MockTilbakeTidslinje() {
        return <div data-testid="tilbake-tidslinje">Tidslinje</div>;
    };
});

const mockGåTilForrigeSteg = jest.fn();
const mockGåTilNesteSteg = jest.fn();
const mockGåTilPeriode = jest.fn();

describe('Tester: VilkårsvurderingPerioder', () => {
    const behandling = mock<IBehandling>();
    const fagsak = mock<IFagsak>({
        ytelsestype: Ytelsetype.Barnetrygd,
    });

    const periode: VilkårsvurderingPeriodeSkjemaData = {
        index: 'i1',
        feilutbetaltBeløp: 2333,
        hendelsestype: HendelseType.Annet,
        foreldet: false,
        periode: {
            fom: '2021-01-01',
            tom: '2021-04-30',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();

        jest.spyOn(VilkårsvurderingContext, 'useVilkårsvurdering').mockReturnValue({
            kanIlleggeRenter: false,
            oppdaterPeriode: jest.fn(),
            onSplitPeriode: jest.fn(),
            lukkValgtPeriode: jest.fn(),
            sendInnSkjemaOgNaviger: jest.fn(),
            gåTilPeriode: mockGåTilPeriode,
            gåTilForrigeSteg: mockGåTilForrigeSteg,
            gåTilNesteSteg: mockGåTilNesteSteg,
            valgtPeriode: periode,
            perioder: [periode],
            visFeilmeldinger: false,
            sendInnSkjemaMutation: {
                isPending: false,
                isError: false,
                error: null,
                reset: jest.fn(),
            },
            validerOgOppdaterFelterRef: { current: null },
            behandletPerioder: [],
            valideringsFeilmelding: undefined,
            nestePeriode: jest.fn(),
            forrigePeriode: jest.fn(),
        } as unknown as ReturnType<typeof VilkårsvurderingContext.useVilkårsvurdering>);

        jest.spyOn(BehandlingContext, 'useBehandling').mockReturnValue({
            harUlagredeData: false,
            nullstillIkkePersisterteKomponenter: jest.fn(),
        } as unknown as ReturnType<typeof BehandlingContext.useBehandling>);
    });

    test('- viser navigasjonsknapper', async () => {
        const { getByRole } = render(
            <VilkårsvurderingPerioder
                behandling={behandling}
                fagsak={fagsak}
                erLesevisning={false}
                erTotalbeløpUnder4Rettsgebyr={false}
                perioder={[periode]}
            />
        );

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtak',
            })
        ).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Gå tilbake til foreldelse',
            })
        ).toBeInTheDocument();
    });

    test('- navigasjonsknapper er aktivert når data er fylt ut', async () => {
        const { getByRole } = render(
            <VilkårsvurderingPerioder
                behandling={behandling}
                fagsak={fagsak}
                erLesevisning={false}
                erTotalbeløpUnder4Rettsgebyr={false}
                perioder={[periode]}
            />
        );

        expect(
            getByRole('button', {
                name: 'Gå videre til vedtak',
            })
        ).toBeEnabled();

        expect(
            getByRole('button', {
                name: 'Gå tilbake til foreldelse',
            })
        ).toBeEnabled();
    });

    test('- kan klikke på navigasjonsknapper', async () => {
        const user = userEvent.setup();
        const { getByRole } = render(
            <VilkårsvurderingPerioder
                behandling={behandling}
                fagsak={fagsak}
                erLesevisning={false}
                erTotalbeløpUnder4Rettsgebyr={false}
                perioder={[periode]}
            />
        );

        const forrigeKnapp = getByRole('button', {
            name: 'Gå tilbake til foreldelse',
        });

        const nesteKnapp = getByRole('button', {
            name: 'Gå videre til vedtak',
        });

        await user.click(forrigeKnapp);
        await user.click(nesteKnapp);

        expect(forrigeKnapp).toBeEnabled();
        expect(nesteKnapp).toBeEnabled();
    });
});
