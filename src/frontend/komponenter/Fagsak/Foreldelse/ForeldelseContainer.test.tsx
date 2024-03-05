import * as React from 'react';

import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { FeilutbetalingForeldelseProvider } from './FeilutbetalingForeldelseContext';
import ForeldelseContainer from './ForeldelseContainer';
import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Foreldelsevurdering } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { ForeldelsePeriode, IFeilutbetalingForeldelse } from '../../../typer/feilutbetalingtyper';

jest.setTimeout(10000);

jest.mock('@navikt/familie-http', () => {
    return {
        useHttp: () => ({
            request: () => jest.fn(),
        }),
    };
});

jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: jest.fn(),
}));

jest.mock('../../../api/behandling', () => ({
    useBehandlingApi: jest.fn(),
}));

describe('Tester: ForeldelseContainer', () => {
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
    ) => {
        if (foreldelse) {
            // @ts-ignore
            useBehandlingApi.mockImplementation(() => ({
                gjerFeilutbetalingForeldelseKall: () => {
                    const ressurs = mock<Ressurs<IFeilutbetalingForeldelse>>({
                        status: RessursStatus.SUKSESS,
                        data: foreldelse,
                    });
                    return Promise.resolve(ressurs);
                },
                sendInnFeilutbetalingForeldelse: () => {
                    const ressurs = mock<Ressurs<string>>({
                        status: RessursStatus.SUKSESS,
                        data: 'suksess',
                    });
                    return Promise.resolve(ressurs);
                },
            }));
        }
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            erStegBehandlet: () => behandlet,
            erStegAutoutført: () => autoutført,
            visVenteModal: false,
            behandlingILesemodus: lesevisning,
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
    };

    test('- vis og fyll ut perioder og send inn', async () => {
        const user = userEvent.setup();
        setupMock(false, false, false, feilutbetalingForeldelse);
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryAllByText, queryByText } = render(
            <FeilutbetalingForeldelseProvider behandling={behandling} fagsak={fagsak}>
                <ForeldelseContainer behandling={behandling} />
            </FeilutbetalingForeldelseProvider>
        );

        await waitFor(async () => {
            expect(getByText('Foreldelse')).toBeTruthy();
            expect(getByText('Detaljer for valgt periode')).toBeTruthy();
        });

        expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();
        expect(getByText('3 måneder')).toBeTruthy();
        expect(getByText('1 333')).toBeTruthy();

        expect(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        ).toBeDisabled();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() => user.type(getByLabelText('Vurdering'), 'Begrunnelse 1'));
        await act(() => user.click(getByLabelText('Perioden er ikke foreldet')));

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        ).toBeDisabled();

        expect(getByText('01.05.2020 - 30.06.2020')).toBeTruthy();
        expect(getByText('2 måneder')).toBeTruthy();
        expect(getByText('1 333')).toBeTruthy();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await act(() => user.type(getByLabelText('Vurdering'), 'Begrunnelse 2'));
        await act(() => user.click(getByLabelText('Perioden er ikke foreldet')));

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft',
                })
            )
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);

        expect(queryByText('Detaljer for valgt periode')).toBeFalsy();

        expect(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        ).toBeEnabled();

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Bekreft og fortsett',
                })
            )
        );
    });

    test('- vis utfylt', async () => {
        const user = userEvent.setup();
        setupMock(true, false, false, {
            foreldetPerioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: Foreldelsevurdering.FORELDET,
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...perioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: Foreldelsevurdering.TILLEGGSFRIST,
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryByText } = render(
            <FeilutbetalingForeldelseProvider behandling={behandling} fagsak={fagsak}>
                <ForeldelseContainer behandling={behandling} />
            </FeilutbetalingForeldelseProvider>
        );

        await waitFor(async () => {
            expect(getByText('Foreldelse')).toBeTruthy();
            expect(queryByText('Detaljer for valgt periode')).toBeFalsy();

            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeEnabled();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'suksess fra 01.01.2020 til og med 31.03.2020',
                })
            )
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeDisabled();

        expect(queryByText('Detaljer for valgt periode')).toBeTruthy();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();

        expect(getByLabelText('Vurdering')).toHaveValue('Begrunnelse 1');
        expect(getByLabelText('Perioden er foreldet')).toBeChecked();
        expect(
            getByLabelText('Foreldelsesfrist', {
                selector: 'input',
                exact: false,
            })
        ).toHaveValue('01.01.2021');

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'suksess fra 01.05.2020 til og med 30.06.2020',
                })
            )
        );

        expect(getByText('01.05.2020 - 30.06.2020')).toBeTruthy();

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

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'Lukk',
                })
            )
        );

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();
    });

    test('- vis utfylt - lesevisning', async () => {
        const user = userEvent.setup();
        setupMock(true, true, false, {
            foreldetPerioder: [
                {
                    ...perioder[0],
                    begrunnelse: 'Begrunnelse 1',
                    foreldelsesvurderingstype: Foreldelsevurdering.FORELDET,
                    foreldelsesfrist: '2021-01-01',
                },
                {
                    ...perioder[1],
                    begrunnelse: 'Begrunnelse 2',
                    foreldelsesvurderingstype: Foreldelsevurdering.TILLEGGSFRIST,
                    foreldelsesfrist: '2021-01-01',
                    oppdagelsesdato: '2020-12-24',
                },
            ],
        });
        const behandling = mock<IBehandling>();
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, queryByText, queryByRole, getByLabelText } = render(
            <FeilutbetalingForeldelseProvider behandling={behandling} fagsak={fagsak}>
                <ForeldelseContainer behandling={behandling} />
            </FeilutbetalingForeldelseProvider>
        );

        await waitFor(async () => {
            expect(getByText('Foreldelse')).toBeTruthy();
            expect(queryByText('Detaljer for valgt periode')).toBeFalsy();

            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeEnabled();
        });

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'suksess fra 01.01.2020 til og med 31.03.2020',
                })
            )
        );

        expect(
            queryByRole('button', {
                name: 'Bekreft',
            })
        ).toBeFalsy();

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();

        expect(queryByText('Detaljer for valgt periode')).toBeTruthy();
        expect(getByText('01.01.2020 - 31.03.2020')).toBeTruthy();

        expect(getByText('Begrunnelse 1')).toBeTruthy();
        expect(getByText('Perioden er foreldet')).toBeTruthy();
        expect(getByLabelText('Foreldelsesfrist')).toHaveValue('01.01.2021');

        await act(() =>
            user.click(
                getByRole('button', {
                    name: 'suksess fra 01.05.2020 til og med 30.06.2020',
                })
            )
        );

        expect(getByText('01.05.2020 - 30.06.2020')).toBeTruthy();

        expect(getByText('Begrunnelse 2')).toBeTruthy();
        expect(
            getByText('Perioden er ikke foreldet, regel om tilleggsfrist (10 år) benyttes')
        ).toBeTruthy();
        expect(getByLabelText('Foreldelsesfrist')).toHaveValue('01.01.2021');
        expect(getByLabelText('Dato for når feilutbetaling ble oppdaget')).toHaveValue(
            '24.12.2020'
        );

        expect(
            queryByRole('button', {
                name: 'Lukk',
            })
        ).toBeFalsy();

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

        const { getByText, getByRole } = render(
            <FeilutbetalingForeldelseProvider behandling={behandling} fagsak={fagsak}>
                <ForeldelseContainer behandling={behandling} />
            </FeilutbetalingForeldelseProvider>
        );

        await waitFor(async () => {
            expect(getByText('Foreldelse')).toBeTruthy();
            expect(getByText('Foreldelsesloven §§ 2 og 3')).toBeTruthy();
            expect(getByText('Automatisk vurdert')).toBeTruthy();

            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeEnabled();
        });
    });
});
