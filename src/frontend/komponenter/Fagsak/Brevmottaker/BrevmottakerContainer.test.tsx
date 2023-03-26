import * as React from 'react';

import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandlingApi } from '../../../api/behandling';
import { useBehandling } from '../../../context/BehandlingContext';
import { Vergetype } from '../../../kodeverk/verge';
import { VergeDto } from '../../../typer/api';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import BrevmottakerContainer from './BrevmottakerContainer';
import { BrevmottakerProvider } from './BrevmottakerContext';

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

describe('Tester: BrevmottakerContainer', () => {
    const setupMock = (
        behandlet: boolean,
        lesevisning: boolean,
        autoutført: boolean,
        verge?: VergeDto
    ) => {
        // @ts-ignore
        useBehandlingApi.mockImplementation(() => ({
            gjerVergeKall: () => {
                const ressurs = mock<Ressurs<VergeDto>>({
                    status: RessursStatus.SUKSESS,
                    data: verge,
                });
                return Promise.resolve(ressurs);
            },
            sendInnVerge: () => {
                const ressurs = mock<Ressurs<string>>({
                    status: RessursStatus.SUKSESS,
                    data: 'suksess',
                });
                return Promise.resolve(ressurs);
            },
        }));
        // @ts-ignore
        useBehandling.mockImplementation(() => ({
            erStegBehandlet: () => behandlet,
            erStegAutoutført: () => autoutført,
            behandlingILesemodus: lesevisning,
            hentBehandlingMedBehandlingId: jest.fn(),
        }));
    };

    test('- fyller ut advokat', async () => {
        const user = userEvent.setup();
        setupMock(false, false, false);
        const behandling = mock<IBehandling>({
            harVerge: false,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryAllByText } = render(
            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                <BrevmottakerContainer />
            </BrevmottakerProvider>
        );

        await waitFor(async () => {
            expect(getByText('Verge')).toBeTruthy();
        });

        await user.click(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        );

        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(getByLabelText('Vergetype'), Vergetype.ADVOKAT);

        await user.type(getByLabelText('Begrunn endringene'), 'Verge er advokat');

        await user.click(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(getByLabelText('Navn'), 'Advokat Advokatesen');
        await user.type(getByLabelText('Organisasjonsnummer'), 'DummyOrg');

        await user.click(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
    });

    test('- fyller ut verge for barn', async () => {
        const user = userEvent.setup();
        setupMock(false, false, false);
        const behandling = mock<IBehandling>({
            harVerge: false,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryAllByText, queryByText } = render(
            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                <BrevmottakerContainer />
            </BrevmottakerProvider>
        );

        await waitFor(async () => {
            expect(getByText('Verge')).toBeTruthy();
        });

        await user.click(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.selectOptions(getByLabelText('Vergetype'), Vergetype.VERGE_FOR_BARN);
        await user.type(getByLabelText('Begrunn endringene'), 'Verge er advokat');

        await user.click(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(2);

        await user.type(getByLabelText('Navn'), 'Verge Vergesen');
        await user.type(getByLabelText('Fødselsnummer'), '12sdf678901');

        await user.click(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        );
        expect(queryByText('Du må skrive minst 3 tegn')).toBeFalsy();
        expect(queryByText('Ugyldig fødselsnummer')).toBeTruthy();

        await user.clear(getByLabelText('Fødselsnummer'));
        await user.type(getByLabelText('Fødselsnummer'), '27106903129');

        await user.click(
            getByRole('button', {
                name: 'Bekreft og fortsett',
            })
        );
        expect(queryAllByText('Feltet må fylles ut')).toHaveLength(0);
        expect(queryByText('Ugyldig fødselsnummer')).toBeFalsy();
    });

    test('- vis utfylt - advokat - autoutført', async () => {
        setupMock(true, false, true, {
            type: Vergetype.ADVOKAT,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: '',
        });
        const behandling = mock<IBehandling>({
            harVerge: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryByLabelText } = render(
            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                <BrevmottakerContainer />
            </BrevmottakerProvider>
        );

        await waitFor(async () => {
            expect(getByText('Verge')).toBeTruthy();
            expect(getByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')).toBeTruthy();
        });

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();

        expect(getByLabelText('Vergetype')).toHaveValue(Vergetype.ADVOKAT);
        expect(getByLabelText('Begrunn endringene')).toHaveValue('');
        expect(getByLabelText('Navn')).toHaveValue('Advokat Advokatesen');
        expect(getByLabelText('Organisasjonsnummer')).toHaveValue('DummyOrg');
        expect(queryByLabelText('Fødselsnummer')).toBeFalsy();
    });

    test('- vis utfylt - verge barn', async () => {
        setupMock(true, false, false, {
            type: Vergetype.VERGE_FOR_BARN,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: 'Verge er opprettet',
        });
        const behandling = mock<IBehandling>({
            harVerge: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, getByLabelText, queryByText, queryByLabelText } = render(
            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                <BrevmottakerContainer />
            </BrevmottakerProvider>
        );

        await waitFor(async () => {
            expect(getByText('Verge')).toBeTruthy();
            expect(
                queryByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).toBeFalsy();

            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeEnabled();
        });

        expect(getByLabelText('Vergetype')).toHaveValue(Vergetype.VERGE_FOR_BARN);
        expect(getByLabelText('Begrunn endringene')).toHaveValue('Verge er opprettet');
        expect(getByLabelText('Navn')).toHaveValue('Verge Vergesen');
        expect(getByLabelText('Fødselsnummer')).toHaveValue('27106903129');
        expect(queryByLabelText('Organisasjonsnummer')).toBeFalsy();
    });

    test('- vis utfylt - advokat - lesevisning', async () => {
        setupMock(true, true, false, {
            type: Vergetype.ADVOKAT,
            navn: 'Advokat Advokatesen',
            orgNr: 'DummyOrg',
            begrunnelse: 'Bruker har engasjert advokat',
        });
        const behandling = mock<IBehandling>({
            harVerge: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, queryByText } = render(
            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                <BrevmottakerContainer />
            </BrevmottakerProvider>
        );

        await waitFor(async () => {
            expect(getByText('Verge')).toBeTruthy();
            expect(
                queryByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')
            ).toBeFalsy();

            expect(
                getByRole('button', {
                    name: 'Neste',
                })
            ).toBeEnabled();
        });

        expect(getByText('Advokat/advokatfullmektig')).toBeTruthy();
        expect(getByText('Bruker har engasjert advokat')).toBeTruthy();
        expect(getByText('Advokat Advokatesen')).toBeTruthy();
        expect(getByText('DummyOrg')).toBeTruthy();
        expect(queryByText('Fødselsnummer')).toBeFalsy();
    });

    test('- vis utfylt - verge barn - autoutført - lesevisning', async () => {
        setupMock(true, true, true, {
            type: Vergetype.VERGE_FOR_BARN,
            navn: 'Verge Vergesen',
            ident: '27106903129',
            begrunnelse: '',
        });
        const behandling = mock<IBehandling>({
            harVerge: true,
        });
        const fagsak = mock<IFagsak>();

        const { getByText, getByRole, queryByText } = render(
            <BrevmottakerProvider behandling={behandling} fagsak={fagsak}>
                <BrevmottakerContainer />
            </BrevmottakerProvider>
        );

        await waitFor(async () => {
            expect(getByText('Verge')).toBeTruthy();
            expect(getByText('Automatisk vurdert. Verge er kopiert fra fagsystemet.')).toBeTruthy();
        });

        expect(
            getByRole('button', {
                name: 'Neste',
            })
        ).toBeEnabled();

        expect(getByText('Verge for barn under 18 år')).toBeTruthy();
        expect(getByText('Ingen opplysninger oppgitt.')).toBeTruthy();
        expect(getByText('Verge Vergesen')).toBeTruthy();
        expect(getByText('27106903129')).toBeTruthy();
        expect(queryByText('Organisasjonsnummer')).toBeFalsy();
    });
});
