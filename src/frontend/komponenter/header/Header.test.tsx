import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('~/api/brukerlenker');

import { hentBrukerlenkeBaseUrl, hentAInntektUrl } from '~/api/brukerlenker';
import { useBehandlingStore } from '~/stores/behandlingStore';
import { useFagsakStore } from '~/stores/fagsakStore';
import { createTestQueryClient } from '~/testutils/queryTestUtils';

import { Header } from './Header';

const mockHentBrukerlenkeBaseUrl = vi.mocked(hentBrukerlenkeBaseUrl);
const mockHentAInntektUrl = vi.mocked(hentAInntektUrl);

const renderHeader = (): void => {
    const queryClient = createTestQueryClient();
    render(
        <QueryClientProvider client={queryClient}>
            <Header />
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

describe('Header', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setUpMocks();
    });

    test('hentBrukerlenkeBaseUrl blir kalt én gang ved rendering', () => {
        renderHeader();
        expect(mockHentBrukerlenkeBaseUrl).toHaveBeenCalledTimes(1);
    });

    test('Viser riktig titler når ingen personIdent er satt', async () => {
        renderHeader();

        expect(await screen.findByText('Modia')).toBeInTheDocument();
        expect(screen.queryByText('Modia personoversikt')).not.toBeInTheDocument();
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

        expect(mockHentAInntektUrl).toHaveBeenCalled();

        const menyknapp = await screen.findByRole('button', { name: 'Systemer og oppslagsverk' });
        await userEvent.click(menyknapp);

        const aInntektLenke = screen.getByRole('link', { name: 'A-inntekt personoversikt' });
        const gosysLenke = screen.getByRole('link', { name: 'Gosys personoversikt' });
        const modiaLenke = screen.getByRole('link', { name: 'Modia personoversikt' });

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

        const menyknapp = await screen.findByRole('button', { name: 'Systemer og oppslagsverk' });
        await userEvent.click(menyknapp);

        const aInntektLenke = screen.getByRole('link', { name: 'A-inntekt' });
        const gosysLenke = screen.getByRole('link', { name: 'Gosys' });
        const modiaLenke = screen.getByRole('link', { name: 'Modia' });

        expect(aInntektLenke).toHaveAttribute('href', 'https://a-inntekt.nav.no');
        expect(gosysLenke).toHaveAttribute('href', 'https://gosys.nav.no');
        expect(modiaLenke).toHaveAttribute('href', 'https://modia.nav.no');
    });

    test('Viser ingen menyknapp når ingen gyldige lenker eksisterer', () => {
        mockHentBrukerlenkeBaseUrl.mockResolvedValue({
            aInntektUrl: '',
            gosysBaseUrl: '',
            modiaBaseUrl: '',
        });

        renderHeader();

        expect(
            screen.queryByRole('button', {
                name: 'Systemer og oppslagsverk',
            })
        ).not.toBeInTheDocument();
    });

    describe('RolleTag', () => {
        test('Viser "Veileder"-rolletag', async () => {
            useBehandlingStore.setState({ rolle: 'VEILEDER', erNyModell: true });
            renderHeader();

            expect(await screen.findByText('Veileder')).toBeInTheDocument();
        });

        test('Viser "Beslutter"-rolletag', async () => {
            useBehandlingStore.setState({ rolle: 'BESLUTTER', erNyModell: true });
            renderHeader();

            expect(await screen.findByText('Beslutter')).toBeInTheDocument();
        });

        test('Viser "Saksbehandler"-rolletag', async () => {
            useBehandlingStore.setState({ rolle: 'SAKSBEHANDLER', erNyModell: true });
            renderHeader();
            expect(await screen.findByText('Saksbehandler')).toBeInTheDocument();
        });

        test('Viser ingen rolletag ved gammel modell', async () => {
            useBehandlingStore.setState({ rolle: 'SAKSBEHANDLER', erNyModell: false });
            renderHeader();
            expect(screen.queryByText('Saksbehandler')).not.toBeInTheDocument();
        });
    });
});
