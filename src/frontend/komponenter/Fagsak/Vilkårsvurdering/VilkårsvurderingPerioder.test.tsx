import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { Behandling } from '../../../typer/behandling';
import type { Ressurs } from '../../../typer/ressurs';
import type {
    VilkårsvurderingPeriode,
    VilkårsvurderingResponse,
} from '../../../typer/tilbakekrevingstyper';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ByRoleMatcher, ByRoleOptions, RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router';

import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { VilkårsvurderingProvider } from './VilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import { BehandlingProvider } from '../../../context/BehandlingContext';
import { FagsakContext } from '../../../context/FagsakContext';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import {
    lagVilkårsvurderingPeriode,
    lagVilkårsvurderingResponse,
} from '../../../testdata/vilkårsvurderingFactory';
import { RessursStatus } from '../../../typer/ressurs';

const mockUseHttp = jest.fn();
jest.mock('../../../api/http/HttpProvider', () => ({
    useHttp: (): Http => mockUseHttp(),
}));

const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

jest.mock('@tanstack/react-query', () => {
    return {
        useMutation: jest.fn(({ mutationFn, onSuccess }) => {
            const mutateAsync = async (behandlingId: string): Promise<UseMutationResult> => {
                const result = await mutationFn(behandlingId);
                if (onSuccess && result?.status === RessursStatus.Suksess) {
                    await onSuccess(result);
                }
                return result;
            };

            return {
                mutateAsync,
            };
        }),
    };
});

const perioder: VilkårsvurderingPeriode[] = [
    lagVilkårsvurderingPeriode({
        periode: {
            fom: '2020-01-01',
            tom: '2020-03-31',
        },
    }),
    lagVilkårsvurderingPeriode({
        periode: {
            fom: '2020-05-01',
            tom: '2020-06-30',
        },
    }),
    lagVilkårsvurderingPeriode({
        periode: {
            fom: '2020-07-01',
            tom: '2020-08-31',
        },
    }),
];

const setupMocks = (): void => {
    mockUseBehandlingApi.mockImplementation(() => ({
        gjerVilkårsvurderingKall: (): Promise<Ressurs<VilkårsvurderingResponse>> => {
            const ressurs = mock<Ressurs<VilkårsvurderingResponse>>({
                status: RessursStatus.Suksess,
                data: lagVilkårsvurderingResponse({ perioder }),
            });
            return Promise.resolve(ressurs);
        },
        sendInnVilkårsvurdering: (): Promise<Ressurs<string>> => {
            const ressurs = mock<Ressurs<string>>({
                status: RessursStatus.Suksess,
                data: 'suksess',
            });
            return Promise.resolve(ressurs);
        },
    }));

    mockUseHttp.mockImplementation(() => ({
        request: (): Promise<Ressurs<Behandling>> => {
            return Promise.resolve({
                status: RessursStatus.Suksess,
                data: mock<Behandling>({}),
            });
        },
    }));
};

const renderVilkårsvurderingPerioder = (): RenderResult => {
    const skjemaData = perioder.map((periode, index) => ({
        index: `idx_fpsd_${index}`,
        ...periode,
    }));

    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <BehandlingProvider>
                <VilkårsvurderingProvider behandling={lagBehandling()}>
                    <VilkårsvurderingPerioder
                        behandling={lagBehandling()}
                        perioder={skjemaData}
                        erTotalbeløpUnder4Rettsgebyr={false}
                        erLesevisning={false}
                    />
                </VilkårsvurderingProvider>
            </BehandlingProvider>
        </FagsakContext.Provider>
    );
};

const findPeriodButton = (
    getAllByRole: (role: ByRoleMatcher, options?: ByRoleOptions | undefined) => HTMLElement[],
    periodDate: string
): HTMLElement | undefined => {
    const tidslinjeButtons = getAllByRole('button').filter(
        (button: HTMLElement) =>
            button.getAttribute('aria-label')?.includes('fra') &&
            button.getAttribute('aria-label')?.includes('til')
    );

    return tidslinjeButtons.find((button: HTMLElement) =>
        button.getAttribute('aria-label')?.includes(periodDate)
    );
};

const modalTekst =
    'Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode';
const førstePeriode = '01.01.2020 - 31.03.2020';
const andrePeriode = '01.05.2020 - 30.06.2020';

describe('VilkårsvurderingPerioder', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
        setupMocks();
        Element.prototype.scrollIntoView = jest.fn();
    });

    test('Skal bytte periode når det ikke er ulagrede endringer', async () => {
        const { getByText, getAllByRole } = renderVilkårsvurderingPerioder();

        expect(getByText(førstePeriode)).toBeInTheDocument();
        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);
        expect(getByText(andrePeriode)).toBeInTheDocument();
    });

    test('Skal vise modal ved bytte av periode med ulagrede endringer', async () => {
        const { getByText, getAllByRole, getByLabelText } = renderVilkårsvurderingPerioder();

        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse som ikke er lagret');

        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (!andrePeriodeButton) {
            throw new Error('Andre periode button ikke funnet');
        }

        await user.click(andrePeriodeButton);

        expect(getByText(modalTekst)).toBeInTheDocument();
    });

    test('Skal bytte uten å lagre når "Bytt uten å lagre" klikkes', async () => {
        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder();

        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse som ikke er lagret');

        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        expect(getByText(modalTekst)).toBeInTheDocument();
        await user.click(getByRole('button', { name: 'Bytt uten å lagre' }));

        expect(getByText(andrePeriode)).toBeInTheDocument();
        expect(queryByText(modalTekst)).not.toBeInTheDocument();
    });

    test('Skal lagre og bytte når "Lagre og bytt periode" klikkes', async () => {
        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder();

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

        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        expect(getByText(modalTekst)).toBeInTheDocument();
        await user.click(getByRole('button', { name: 'Lagre og bytt periode' }));

        expect(getByText(andrePeriode)).toBeInTheDocument();
        expect(queryByText(modalTekst)).not.toBeInTheDocument();
    });

    test('Skal lukke modal og forbli på nåværende periode når "Lukk" klikkes', async () => {
        const { getByText, getByRole, getAllByRole, getByLabelText, queryByText } =
            renderVilkårsvurderingPerioder();

        const begrunnelseInput = getByLabelText('Vilkårene for tilbakekreving');
        await user.type(begrunnelseInput, 'Test begrunnelse');

        const andrePeriodeButton = findPeriodButton(getAllByRole, '01.05.2020');
        if (andrePeriodeButton) {
            await user.click(andrePeriodeButton);
        }

        expect(getByText(modalTekst)).toBeInTheDocument();
        await user.click(getByRole('button', { name: 'Lukk' }));

        expect(getByText(førstePeriode)).toBeInTheDocument();
        expect(queryByText(modalTekst)).not.toBeInTheDocument();
        expect(begrunnelseInput).toHaveValue('Test begrunnelse');
    });
});
