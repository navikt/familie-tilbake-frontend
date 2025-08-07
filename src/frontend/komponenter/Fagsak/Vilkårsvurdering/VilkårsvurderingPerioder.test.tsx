import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';
import type { ByRoleMatcher, ByRoleOptions } from '@testing-library/react';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import { BehandlingProvider } from '../../../context/BehandlingContext';
import { HendelseType, Ytelsetype } from '../../../kodeverk';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

const mockUseHttp = jest.fn();
jest.mock('../../../api/http/HttpProvider', () => ({
    useHttp: () => mockUseHttp(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: () => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: () => jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
    return {
        useMutation: jest.fn(({ mutationFn, onSuccess }) => {
            const mutateAsync = async (behandlingId: string) => {
                const result = await mutationFn(behandlingId);
                if (onSuccess && result?.status === RessursStatus.Suksess) {
                    await onSuccess(result);
                }
                return result;
            };

            return {
                mutate: mutateAsync,
                mutateAsync: mutateAsync,
                isError: false,
                error: null,
            };
        }),
        useQueryClient: jest.fn(() => ({
            invalidateQueries: jest.fn(),
        })),
    };
});

// Testdata - deles på tvers av alle tester
const perioder: VilkårsvurderingPeriode[] = [
    {
        feilutbetaltBeløp: 1333,
        periode: {
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
        hendelsestype: HendelseType.BosattIRiket,
        foreldet: false,
        begrunnelse: undefined,
    },
    {
        feilutbetaltBeløp: 2000,
        periode: {
            fom: '2020-05-01',
            tom: '2020-06-30',
        },
        hendelsestype: HendelseType.BorMedSøker,
        foreldet: false,
        begrunnelse: undefined,
    },
    {
        feilutbetaltBeløp: 1500,
        periode: {
            fom: '2020-07-01',
            tom: '2020-08-31',
        },
        hendelsestype: HendelseType.BosattIRiket,
        foreldet: false,
        begrunnelse: undefined,
    },
];

const setupMocks = () => {
    const feilutbetalingVilkårsvurdering: IFeilutbetalingVilkårsvurdering = {
        perioder: perioder,
        rettsgebyr: 1199,
    };

    mockUseBehandlingApi.mockImplementation(() => ({
        gjerFeilutbetalingVilkårsvurderingKall: () => {
            const ressurs = mock<Ressurs<IFeilutbetalingVilkårsvurdering>>({
                status: RessursStatus.Suksess,
                data: feilutbetalingVilkårsvurdering,
            });
            return Promise.resolve(ressurs);
        },
        sendInnVilkårsvurdering: () => {
            const ressurs = mock<Ressurs<string>>({
                status: RessursStatus.Suksess,
                data: 'suksess',
            });
            return Promise.resolve(ressurs);
        },
    }));

    mockUseHttp.mockImplementation(() => ({
        request: () => {
            return Promise.resolve({
                status: RessursStatus.Suksess,
                data: mock<IBehandling>({ eksternBrukId: '1' }),
            });
        },
    }));
};

const renderVilkårsvurderingPerioder = (
    behandling: IBehandling,
    fagsak: IFagsak,
    testPerioder: VilkårsvurderingPeriode[] = perioder
) => {
    const skjemaData = testPerioder.map((periode, index) => ({
        index: `idx_fpsd_${index}`,
        ...periode,
    }));

    return render(
        <BehandlingProvider>
            <VilkårsvurderingProvider behandling={behandling} fagsak={fagsak}>
                <VilkårsvurderingPerioder
                    behandling={behandling}
                    fagsak={fagsak}
                    perioder={skjemaData}
                    erTotalbeløpUnder4Rettsgebyr={false}
                    erLesevisning={false}
                />
            </VilkårsvurderingProvider>
        </BehandlingProvider>
    );
};

const findPeriodButton = (
    getAllByRole: (role: ByRoleMatcher, options?: ByRoleOptions | undefined) => HTMLElement[],
    periodDate: string
) => {
    const tidslinjeButtons = getAllByRole('button').filter(
        (button: HTMLElement) =>
            button.getAttribute('aria-label')?.includes('fra') &&
            button.getAttribute('aria-label')?.includes('til')
    );

    return tidslinjeButtons.find((button: HTMLElement) =>
        button.getAttribute('aria-label')?.includes(periodDate)
    );
};

describe('Tester: VilkårsvurderingPerioder', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
        setupMocks();
        Element.prototype.scrollIntoView = jest.fn();
    });

    test('skal bytte periode direkte når det ikke er ulagrede endringer', async () => {
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getAllByRole } = renderVilkårsvurderingPerioder(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Verifiser at første periode er valgt
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();

        // Klikk på andre periode
        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);

        // Verifiser at andre periode nå vises
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
        });
    });

    test('skal vise modal ved bytte av periode med ulagrede endringer', async () => {
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText } =
            renderVilkårsvurderingPerioder(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Legg til ulagrede endringer
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse som ikke er lagret');

        // Prøv å bytte periode
        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);

        // Verifiser at modal vises
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        // Verifiser modal-knapper
        expect(getByRole('button', { name: 'Lagre og bytt periode' })).toBeInTheDocument();
        expect(getByRole('button', { name: 'Bytt uten å lagre' })).toBeInTheDocument();
    });

    test('skal bytte uten å lagre når "Bytt uten å lagre" klikkes', async () => {
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Legg til ulagrede endringer
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse som ikke er lagret');

        // Bytt periode
        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        // Vent på modal og klikk "Bytt uten å lagre"
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        await user.click(getByRole('button', { name: 'Bytt uten å lagre' }));

        // Verifiser at periode er byttet
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
        });

        // Verifiser at modal er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();
    });

    test('skal lagre og bytte når "Lagre og bytt periode" klikkes', async () => {
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Fyll ut skjema for å gjøre det gyldig for lagring
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Gyldig begrunnelse');

        await user.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );

        const godTroBegrunnelseInput = getByLabelText('Vurder om beløpet er i behold');
        await user.type(godTroBegrunnelseInput, 'Beløp vurdering');

        await user.click(getByRole('radio', { name: 'Nei' }));

        // Bytt periode
        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        // Klikk "Lagre og bytt periode"
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        await user.click(getByRole('button', { name: 'Lagre og bytt periode' }));

        // Verifiser at periode er byttet
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
        });

        // Verifiser at modal er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();
    });

    test('skal lukke modal og forbli på nåværende periode når "Lukk" klikkes', async () => {
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Legg til ulagrede endringer
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse');

        // Prøv å bytte periode
        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        // Lukk modal
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        const lukkButton = getByRole('button', { name: 'Lukk' });
        await user.click(lukkButton);

        // Verifiser at vi fortsatt er på første periode
        await waitFor(() => {
            expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        });

        // Verifiser at modal er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();

        // Verifiser at ulagrede endringer er bevart
        expect(begrunnelseInput).toHaveValue('Test begrunnelse');
    });
});
