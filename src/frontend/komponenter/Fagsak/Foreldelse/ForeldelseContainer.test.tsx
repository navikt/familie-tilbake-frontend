import type { BehandlingApiHook } from '../../../api/behandling';
import type { Http } from '../../../api/http/HttpProvider';
import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';
import type {
    ForeldelsePeriode,
    IFeilutbetalingForeldelse,
} from '../../../typer/feilutbetalingtyper';
import type { Ressurs } from '../../../typer/ressurs';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { NavigateFunction } from 'react-router';

import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { FeilutbetalingForeldelseProvider } from './FeilutbetalingForeldelseContext';
import ForeldelseContainer from './ForeldelseContainer';
import { Fagsystem, Foreldelsevurdering } from '../../../kodeverk';
import { Behandlingstatus } from '../../../typer/behandling';
import { RessursStatus } from '../../../typer/ressurs';

jest.setTimeout(10000);

jest.mock('../../../api/http/HttpProvider', () => {
    return {
        useHttp: (): Http => ({
            systemetLaster: () => false,
            request: jest.fn(),
        }),
    };
});
const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));
const mockUseBehandlingApi = jest.fn();
jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: (): BehandlingApiHook => mockUseBehandlingApi(),
}));

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const renderForeldelseContainer = (behandling: IBehandling, fagsak: IFagsak): RenderResult => {
    return render(
        <FeilutbetalingForeldelseProvider behandling={behandling} fagsak={fagsak}>
            <ForeldelseContainer behandling={behandling} />
        </FeilutbetalingForeldelseProvider>
    );
};

describe('Tester: ForeldelseContainer', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
    });
    const perioder: ForeldelsePeriode[] = [
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-01-01',
                tom: '2020-03-31',
            },
            foreldelsesvurderingstype: undefined,
            begrunnelse: undefined,
            foreldelsesfrist: undefined,
            oppdagelsesdato: undefined,
        },
        {
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2020-05-01',
                tom: '2020-06-30',
            },
            foreldelsesvurderingstype: undefined,
            begrunnelse: undefined,
            foreldelsesfrist: undefined,
            oppdagelsesdato: undefined,
        },
    ];

    const feilutbetalingForeldelse: IFeilutbetalingForeldelse = {
        foreldetPerioder: perioder,
    };

    const setupMock = (
        behandlet: boolean,
        lesevisning: boolean,
        autoutført: boolean,
        foreldelse?: IFeilutbetalingForeldelse
    ): void => {
        if (foreldelse) {
            mockUseBehandlingApi.mockImplementation(() => ({
                gjerFeilutbetalingForeldelseKall: (): Promise<
                    Ressurs<IFeilutbetalingForeldelse>
                > => {
                    const ressurs = mock<Ressurs<IFeilutbetalingForeldelse>>({
                        status: RessursStatus.Suksess,
                        data: foreldelse,
                    });
                    return Promise.resolve(ressurs);
                },
                sendInnFeilutbetalingForeldelse: (): Promise<Ressurs<string>> => {
                    const ressurs = mock<Ressurs<string>>({
                        status: RessursStatus.Suksess,
                        data: 'suksess',
                    });
                    return Promise.resolve(ressurs);
                },
            }));
        }
        mockUseBehandling.mockImplementation(() => ({
            erStegBehandlet: (): boolean => behandlet,
            erStegAutoutført: (): boolean => autoutført,
            visVenteModal: false,
            behandlingILesemodus: lesevisning,
            hentBehandlingMedBehandlingId: (): Promise<void> => Promise.resolve(),
            settIkkePersistertKomponent: jest.fn(),
            nullstillIkkePersisterteKomponenter: jest.fn(),
        }));
    };

    test('- vis og fyll ut perioder og send inn', async () => {
        setupMock(false, false, false, feilutbetalingForeldelse);
        const fagsak = mock<IFagsak>({ fagsystem: Fagsystem.EF, eksternFagsakId: '1' });
        const behandling = mock<IBehandling>({ eksternBrukId: '1' });

        const { getByText, getByRole, getByLabelText, queryAllByText, queryByText } =
            renderForeldelseContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Foreldelse')).toBeInTheDocument();
            expect(getByText('Detaljer for valgt periode')).toBeInTheDocument();
        });

        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByText('3 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        ).toBeDisabled();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        });
        await user.type(getByLabelText('Vurdering'), 'Begrunnelse 1');
        await user.click(getByLabelText('Perioden er ikke foreldet'));

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        });

        expect(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        ).toBeDisabled();

        expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
        expect(getByText('2 måneder')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);
        });

        await user.type(getByLabelText('Vurdering'), 'Begrunnelse 2');
        await user.click(getByLabelText('Perioden er ikke foreldet'));

        await user.click(
            getByRole('button', {
                name: 'Bekreft',
            })
        );
        await waitFor(() => {
            expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        });

        expect(queryByText('Detaljer for valgt periode')).not.toBeInTheDocument();
        expect(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Lagre og fortsett',
            })
        );
    });

    test('- vis utfylt', async () => {
        setupMock(true, false, false, {
            foreldetPerioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: Foreldelsevurdering.Foreldet,
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...perioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: Foreldelsevurdering.Tilleggsfrist,
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryByText } = renderForeldelseContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            expect(getByText('Foreldelse')).toBeInTheDocument();
            expect(queryByText('Detaljer for valgt periode')).not.toBeInTheDocument();
            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeEnabled();
        });

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.01.2020 til 31.03.2020',
            })
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeDisabled();

        expect(queryByText('Detaljer for valgt periode')).toBeInTheDocument();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeInTheDocument();
        expect(getByLabelText('Vurdering')).toHaveValue('Begrunnelse 1');
        expect(getByLabelText('Perioden er foreldet')).toBeChecked();
        expect(
            getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('01.01.2021');

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        expect(getByText('01.05.2020 - 30.06.2020')).toBeInTheDocument();
        expect(getByLabelText('Vurdering')).toHaveValue('Begrunnelse 2');
        expect(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes')
        ).toBeChecked();
        expect(
            getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('01.01.2021');
        expect(getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '24.12.2020'
        );

        await user.click(
            getByRole('button', {
                name: 'Lukk',
            })
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();
    });

    test('- vis utfylt - lesevisning', async () => {
        setupMock(true, true, false, {
            foreldetPerioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: Foreldelsevurdering.Foreldet,
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...perioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: Foreldelsevurdering.Tilleggsfrist,
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });
        const behandling = mock<IBehandling>({ status: Behandlingstatus.FatterVedtak });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText } = renderForeldelseContainer(
            behandling,
            fagsak
        );

        await waitFor(() => {
            // Tittel skal alltid være synlig
            expect(getByText('Foreldelse', { selector: 'h2' })).toBeInTheDocument();
            // Første periode sitt endringspanel skal være åpnet by default i lesevisning, sjekker at riktige verdier er satt
            expect(getByText('Detaljer for valgt periode', { selector: 'h2' })).toBeInTheDocument();
        });
        expect(getByText('01.01.2020 - 31.03.2020', { selector: 'label' })).toBeInTheDocument();
        expect(getByText('Begrunnelse 1')).toBeInTheDocument();
        expect(
            getByLabelText('Perioden er foreldet', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();
        expect(getByLabelText('Foreldelsesfrist')).toHaveValue('01.01.2021');

        // Alle tidslinje knappene skal alltid være synlige
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();

        // Knapper for navigering mellom faner skal alltid være synlige og enabled
        expect(
            getByRole('button', {
                name: 'Forrige',
            })
        ).toBeEnabled();
        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();

        await user.click(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        );

        // Tittel skal alltid være synlig
        await waitFor(() => {
            expect(getByText('Foreldelse', { selector: 'h2' })).toBeInTheDocument();
        });

        // Andre periode sitt endringspanel skal nå være åpnet, sjekker at riktige verdier er satt
        expect(getByText('Detaljer for valgt periode', { selector: 'h2' })).toBeInTheDocument();
        expect(getByText('01.05.2020 - 30.06.2020', { selector: 'label' })).toBeInTheDocument();
        expect(getByText('Begrunnelse 2')).toBeInTheDocument();
        expect(
            getByLabelText('Perioden er foreldet', {
                selector: 'input',
                exact: false,
            })
        ).not.toBeChecked();
        expect(
            getByLabelText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes', {
                selector: 'input',
                exact: false,
            })
        ).toBeChecked();
        expect(getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '24.12.2020'
        );
        expect(getByLabelText('Foreldelsesfrist')).toHaveValue('01.01.2021');

        // Alle tidslinje knappene skal alltid være synlige
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.01.2020 til 31.03.2020',
            })
        ).toBeInTheDocument();
        expect(
            getByRole('button', {
                name: 'Suksess fra 01.05.2020 til 30.06.2020',
            })
        ).toBeInTheDocument();

        // Knapper for navigering mellom faner skal alltid være synlige og enabled
        expect(
            getByRole('button', {
                name: 'Forrige',
            })
        ).toBeEnabled();
        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();
    });

    test('- vis autoutført', async () => {
        setupMock(false, false, true);

        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole } = renderForeldelseContainer(behandling, fagsak);

        await waitFor(() => {
            expect(getByText('Foreldelse')).toBeInTheDocument();
        });
        expect(getByText('Foreldelsesloven §§ 2 og 3')).toBeInTheDocument();
        expect(getByText('Automatisk vurdert')).toBeInTheDocument();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();
    });
});
