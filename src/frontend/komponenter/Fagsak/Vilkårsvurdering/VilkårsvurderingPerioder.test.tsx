import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import { BehandlingProvider } from '../../../context/BehandlingContext';
import { HendelseType, Ytelsetype } from '../../../kodeverk';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

jest.setTimeout(25000);

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

beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
});

const renderVilkårsvurderingPerioder = (
    behandling: IBehandling,
    fagsak: IFagsak,
    perioder: VilkårsvurderingPeriode[]
) => {
    const feilutbetalingVilkårsvurdering: IFeilutbetalingVilkårsvurdering = {
        perioder: perioder,
        rettsgebyr: 1199,
    };

    // Mock setup for VilkårsvurderingProvider
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

    // Create skjema data from perioder
    const skjemaData = perioder.map((periode, index) => ({
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

describe('Tester: VilkårsvurderingPerioder', () => {
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

    test('- bytte av periode uten ulagrede data - skal bytte direkte', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getAllByRole } = renderVilkårsvurderingPerioder(
            behandling,
            fagsak,
            perioder
        );

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Verifiser at første periode er valgt
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByText('3 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Bosatt i riket')).toBeInTheDocument();

        // Finn tidslinje knapper
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        expect(tidslinjeButtons.length).toBe(3);

        // Klikk på andre periode i tidslinjen
        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);

        // Verifiser at andre periode nå vises
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
            expect(getByText('2 måneder')).toBeInTheDocument();
            expect(getByText('2 000')).toBeInTheDocument();
            expect(getByText('Bor med søker')).toBeInTheDocument();
        });

        // Klikk på tredje periode i tidslinjen
        const tredjePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.07.2020') &&
                button.getAttribute('aria-label')?.includes('31.08.2020')
        );

        if (!tredjePeriodeButton) {
            throw new Error('Tredje periode button ikke funnet');
        }

        await user.click(tredjePeriodeButton);

        // Verifiser at tredje periode nå vises
        await waitFor(() => {
            expect(getByText('01.07.2020 - 31.08.2020')).toBeInTheDocument();
            expect(getByText('2 måneder')).toBeInTheDocument();
            expect(getByText('1 500')).toBeInTheDocument();
            expect(getByText('Bosatt i riket')).toBeInTheDocument();
        });
    });

    test('- bytte av periode med ulagrede data - skal vise modal for lagring', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText } =
            renderVilkårsvurderingPerioder(behandling, fagsak, perioder);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Verifiser at første periode er valgt
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();

        // Endre noe data for å få ulagrede endringer
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse som ikke er lagret');

        // Finn tidslinje knapper
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        // Klikk på andre periode i tidslinjen
        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

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

        // Verifiser modal knapper
        expect(getByRole('button', { name: 'Lagre og bytt periode' })).toBeInTheDocument();
        expect(getByRole('button', { name: 'Bytt uten å lagre' })).toBeInTheDocument();
    });

    test('- bytte av periode med ulagrede data - velg "Bytt uten å lagre"', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak, perioder);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Endre noe data
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse som ikke er lagret');

        // Klikk på andre periode i tidslinjen
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);

        // Vent på at modalen vises
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        // Klikk "Bytt uten å lagre"
        await user.click(getByRole('button', { name: 'Bytt uten å lagre' }));

        // Verifiser at vi har byttet til andre periode
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
            expect(getByText('2 000')).toBeInTheDocument();
            expect(getByText('Bor med søker')).toBeInTheDocument();
        });

        // Verifiser at modalen er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();

        // Verifiser at begrunnelsefeltet er tomt (endringene er forkastet)
        const nyBegrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        expect(nyBegrunnelseInput).toHaveValue('');
    });

    test('- bytte av periode med ulagrede data - velg "Lagre og bytt periode"', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak, perioder);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Endre noe data og oppfyll validering
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Gyldig begrunnelse');

        // Velg vilkårsresultat for å oppfylle validering
        await user.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );

        // Fyll ut påkrevde felter for god tro
        const godTroBegrunnelseInput = getByLabelText('Vurder om beløpet er i behold');
        await user.type(godTroBegrunnelseInput, 'Beløp vurdering');

        await user.click(getByRole('radio', { name: 'Nei' }));

        // Klikk på andre periode i tidslinjen
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);

        // Vent på at modalen vises
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        // Klikk "Lagre og bytt periode"
        await user.click(getByRole('button', { name: 'Lagre og bytt periode' }));

        // Verifiser at vi har byttet til andre periode
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
            expect(getByText('2 000')).toBeInTheDocument();
            expect(getByText('Bor med søker')).toBeInTheDocument();
        });

        // Verifiser at modalen er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();
    });

    test('- lukk periode bytte', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak, perioder);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Verifiser at første periode er valgt
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();

        // Endre noe data
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse');

        // Klikk på andre periode i tidslinjen
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);

        // Vent på at modalen vises
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        // Lukk modalen (klikk på X eller Lukk knappen)
        const lukkButton = getByRole('button', { name: 'Lukk' });
        await user.click(lukkButton);

        // Verifiser at vi fortsatt er på første periode
        await waitFor(() => {
            expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
            expect(getByText('1 333')).toBeInTheDocument();
            expect(getByText('Bosatt i riket')).toBeInTheDocument();
        });

        // Verifiser at modalen er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();

        // Verifiser at endringene fortsatt er der
        expect(begrunnelseInput).toHaveValue('Test begrunnelse');
    });
});

describe('Tester: VilkårsvurderingPerioder', () => {
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

    test('- bytte av periode uten ulagrede data - skal bytte direkte', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getAllByRole } = renderVilkårsvurderingPerioder(
            behandling,
            fagsak,
            perioder
        );

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Verifiser at første periode er valgt
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByText('3 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Bosatt i riket')).toBeInTheDocument();

        // Finn tidslinje knapper
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        expect(tidslinjeButtons.length).toBe(3);

        // Klikk på andre periode i tidslinjen
        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);

        // Verifiser at andre periode nå vises
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
            expect(getByText('2 måneder')).toBeInTheDocument();
            expect(getByText('2 000')).toBeInTheDocument();
            expect(getByText('Bor med søker')).toBeInTheDocument();
        });

        // Klikk på tredje periode i tidslinjen
        const tredjePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.07.2020') &&
                button.getAttribute('aria-label')?.includes('31.08.2020')
        );

        if (!tredjePeriodeButton) {
            throw new Error('Tredje periode button ikke funnet');
        }

        await user.click(tredjePeriodeButton);

        // Verifiser at tredje periode nå vises
        await waitFor(() => {
            expect(getByText('01.07.2020 - 31.08.2020')).toBeInTheDocument();
            expect(getByText('2 måneder')).toBeInTheDocument();
            expect(getByText('1 500')).toBeInTheDocument();
            expect(getByText('Bosatt i riket')).toBeInTheDocument();
        });
    });

    test('- bytte av periode med ulagrede data - skal vise modal for lagring', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText } =
            renderVilkårsvurderingPerioder(behandling, fagsak, perioder);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Verifiser at første periode er valgt
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();

        // Endre noe data for å få ulagrede endringer
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse som ikke er lagret');

        // Finn tidslinje knapper
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        // Klikk på andre periode i tidslinjen
        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

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

        // Verifiser modal knapper
        expect(getByRole('button', { name: 'Lagre og bytt periode' })).toBeInTheDocument();
        expect(getByRole('button', { name: 'Bytt uten å lagre' })).toBeInTheDocument();
    });
    test('- bytte av periode med ulagrede data - velg "Bytt uten å lagre"', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak, perioder);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Endre noe data
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse som ikke er lagret');

        // Klikk på andre periode i tidslinjen
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        // Vent på at modalen vises
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        // Klikk "Bytt uten å lagre"
        await user.click(getByRole('button', { name: 'Bytt uten å lagre' }));

        // Verifiser at vi har byttet til andre periode
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
            expect(getByText('2 000')).toBeInTheDocument();
            expect(getByText('Bor med søker')).toBeInTheDocument();
        });

        // Verifiser at modalen er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();

        // Verifiser at begrunnelsefeltet er tomt (endringene er forkastet)
        const nyBegrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        expect(nyBegrunnelseInput).toHaveValue('');
    });

    test('- bytte av periode med ulagrede data - velg "Lagre og bytt periode"', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak, perioder);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Endre noe data og oppfyll validering
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Gyldig begrunnelse');

        // Velg vilkårsresultat for å oppfylle validering
        await user.click(
            getByLabelText('Nei, mottaker har mottatt beløpet i god tro', {
                selector: 'input',
                exact: false,
            })
        );

        // Fyll ut påkrevde felter for god tro
        const godTroBegrunnelseInput = getByLabelText('Vurder om beløpet er i behold');
        await user.type(godTroBegrunnelseInput, 'Beløp vurdering');

        await user.click(getByRole('radio', { name: 'Nei' }));

        // Klikk på andre periode i tidslinjen
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        // Vent på at modalen vises
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        // Klikk "Lagre og bytt periode"
        await user.click(getByRole('button', { name: 'Lagre og bytt periode' }));

        // Verifiser at vi har byttet til andre periode
        await waitFor(() => {
            expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
            expect(getByText('2 000')).toBeInTheDocument();
            expect(getByText('Bor med søker')).toBeInTheDocument();
        });

        // Verifiser at modalen er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();
    });

    test('- lukk periode bytte', async () => {
        const user = userEvent.setup();
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>({ ytelsestype: Ytelsetype.Barnetilsyn });

        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder(behandling, fagsak, perioder);

        await waitFor(() => {
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        // Verifiser at første periode er valgt
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();

        // Endre noe data
        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse');

        // Klikk på andre periode i tidslinjen
        const tidslinjeButtons = getAllByRole('button').filter(
            button =>
                button.getAttribute('aria-label')?.includes('fra') &&
                button.getAttribute('aria-label')?.includes('til')
        );

        const andrePeriodeButton = tidslinjeButtons.find(
            button =>
                button.getAttribute('aria-label')?.includes('01.05.2020') &&
                button.getAttribute('aria-label')?.includes('30.06.2020')
        );

        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        // Vent på at modalen vises
        await waitFor(() => {
            expect(
                getByText(
                    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
                )
            ).toBeInTheDocument();
        });

        // Lukk modalen (klikk på X eller Lukk knappen)
        const lukkButton = getByRole('button', { name: 'Lukk' });
        await user.click(lukkButton);

        // Verifiser at vi fortsatt er på første periode
        await waitFor(() => {
            expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
            expect(getByText('1 333')).toBeInTheDocument();
            expect(getByText('Bosatt i riket')).toBeInTheDocument();
        });

        // Verifiser at modalen er borte
        expect(
            queryByText(
                'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode'
            )
        ).not.toBeInTheDocument();

        // Verifiser at endringene fortsatt er der
        expect(begrunnelseInput).toHaveValue('Test begrunnelse');
    });
});
