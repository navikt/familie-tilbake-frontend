import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { FTHeader } from './FTHeader';
import { hentAInntektUrl, hentBrukerlenkeBaseUrl } from '../../../api/brukerlenker';
import { useFagsakStore } from '../../../store/fagsak';

jest.mock('../../../api/brukerlenker', () => ({
    hentBrukerlenkeBaseUrl: jest.fn(),
    hentAInntektUrl: jest.fn(),
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

describe('FTHeader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useFagsakStore.setState({ personIdent: undefined });

        (hentBrukerlenkeBaseUrl as jest.Mock).mockResolvedValue({
            aInntektUrl: 'https://a-inntekt.nav.no',
            gosysBaseUrl: 'https://gosys.nav.no',
            modiaBaseUrl: 'https://modia.nav.no',
        });

        (hentAInntektUrl as jest.Mock).mockImplementation((_, personIdent: string) => {
            return personIdent
                ? Promise.resolve(`https://a-inntekt.nav.no/mock=${personIdent}`)
                : Promise.resolve(null);
        });
    });

    const renderHeader = () => {
        const testSaksbehandler = {
            displayName: 'Test Saksbehandler',
            email: 'test@nav.no',
            firstName: 'Test',
            lastName: 'Saksbehandler',
            identifier: '12345678901',
            navIdent: 'TST123',
            enhet: 'Test Enhet',
        };
        return render(
            <QueryClientProvider client={queryClient}>
                <FTHeader innloggetSaksbehandler={testSaksbehandler} />
            </QueryClientProvider>
        );
    };
    test('hentBrukerlenkeBaseUrl blir kalt én gang ved rendering', () => {
        renderHeader();

        expect(hentBrukerlenkeBaseUrl).toHaveBeenCalledTimes(1);
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
        useFagsakStore.setState({ personIdent });
        renderHeader();

        await waitFor(() => {
            expect(hentAInntektUrl).toHaveBeenCalled();
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
        (hentBrukerlenkeBaseUrl as jest.Mock).mockResolvedValue({});

        renderHeader();

        await waitFor(() => {
            const menyknapp = screen.queryByTitle('Systemer og oppslagsverk');
            expect(menyknapp).not.toBeInTheDocument();
        });
    });
});
