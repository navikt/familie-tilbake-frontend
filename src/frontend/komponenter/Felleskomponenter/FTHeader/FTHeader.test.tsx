import type { RenderResult } from '@testing-library/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

jest.mock('../../../api/brukerlenker');

import { FTHeader } from './FTHeader';
import { hentBrukerlenkeBaseUrl, hentAInntektUrl } from '../../../api/brukerlenker';
import { useBehandlingStore } from '../../../stores/behandlingStore';
import { useFagsakStore } from '../../../stores/fagsakStore';

const mockHentBrukerlenkeBaseUrl = jest.mocked(hentBrukerlenkeBaseUrl);
const mockHentAInntektUrl = jest.mocked(hentAInntektUrl);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});
const mockSaksbehandler = {
    displayName: 'Test Saksbehandler',
    email: 'test@nav.no',
    firstName: 'Test',
    lastName: 'Saksbehandler',
    identifier: '12345678901',
    navIdent: 'TST123',
    enhet: 'Test Enhet',
};

const renderHeader = (): RenderResult => {
    return render(
        <QueryClientProvider client={queryClient}>
            <FTHeader innloggetSaksbehandler={mockSaksbehandler} />
        </QueryClientProvider>
    );
};

const setUpMocks = (): void => {
    useBehandlingStore.setState({ behandlingId: undefined });
    useFagsakStore.setState({
        eksternFagsakId: undefined,
        fagsystem: undefined,
        personIdent: undefined,
    });
    mockHentBrukerlenkeBaseUrl.mockResolvedValue({
        aInntektUrl: 'https://a-inntekt.nav.no',
        gosysBaseUrl: 'https://gosys.nav.no',
        modiaBaseUrl: 'https://modia.nav.no',
    });
    mockHentAInntektUrl.mockImplementation((_, personIdent: string | undefined) => {
        return Promise.resolve(personIdent ? `https://a-inntekt.nav.no/mock=${personIdent}` : null);
    });
};

describe('FTHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setUpMocks();
    });

    test('hentBrukerlenkeBaseUrl blir kalt én gang ved rendering', () => {
        renderHeader();

        expect(mockHentBrukerlenkeBaseUrl).toHaveBeenCalledTimes(1);
    });

    test('Viser riktig titler når ingen personIdent er satt', async () => {
        renderHeader();

        const modiaLenkeTekst = screen.getByText('Modia');
        const modiaPersonoversiktLenkeTekst = screen.queryByText('Modia personoversikt');
        expect(modiaPersonoversiktLenkeTekst).not.toBeInTheDocument();
        expect(modiaLenkeTekst).toBeInTheDocument();
    });

    test('Har riktig lenke til A-inntekt, Gosys og Modia når personIdent er satt', async () => {
        const personIdent = '12345678910';
        useBehandlingStore.setState({ behandlingId: 'test-behandling-id' });
        useFagsakStore.setState({
            eksternFagsakId: 'test-fagsak-id',
            fagsystem: 'BA',
            personIdent,
        });
        renderHeader();

        await waitFor(() => {
            expect(mockHentAInntektUrl).toHaveBeenCalled();
        });

        const menyknapp = screen.getByTitle('Systemer og oppslagsverk');
        await userEvent.click(menyknapp);

        const aInntektLenke = screen.getByText('A-inntekt personoversikt').closest('a');
        const gosysLenke = screen.getByText('Gosys personoversikt').closest('a');
        const modiaLenke = screen.getByText('Modia personoversikt').closest('a');

        expect(aInntektLenke).toHaveAttribute(
            'href',
            `https://a-inntekt.nav.no/mock=${personIdent}`
        );
        expect(gosysLenke).toHaveAttribute(
            'href',
            `https://gosys.nav.no/personoversikt/fnr=${personIdent}`
        );
        expect(modiaLenke).toHaveAttribute('href', `https://modia.nav.no/person/${personIdent}`);
    });

    test('Gir kun baseUrl når personIdent ikke er satt', async () => {
        renderHeader();

        const menyknapp = screen.getByTitle('Systemer og oppslagsverk');
        await userEvent.click(menyknapp);

        const aInntektLenke = screen.getByText('A-inntekt').closest('a');
        const gosysLenke = screen.getByText('Gosys').closest('a');
        const modiaLenke = screen.getByText('Modia').closest('a');

        expect(aInntektLenke).toHaveAttribute('href', 'https://a-inntekt.nav.no');
        expect(gosysLenke).toHaveAttribute('href', 'https://gosys.nav.no');
        expect(modiaLenke).toHaveAttribute('href', 'https://modia.nav.no');
    });

    test('Viser ingen menyknapp når ingen gyldige lenker eksisterer', async () => {
        mockHentBrukerlenkeBaseUrl.mockResolvedValue({
            aInntektUrl: '',
            gosysBaseUrl: '',
            modiaBaseUrl: '',
        });

        renderHeader();

        await waitFor(() => {
            const menyknapp = screen.queryByTitle('Systemer og oppslagsverk');
            expect(menyknapp).not.toBeInTheDocument();
        });
    });
});
