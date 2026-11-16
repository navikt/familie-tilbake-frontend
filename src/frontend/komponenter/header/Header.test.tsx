import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

vi.mock('@/api/brukerlenker');

import { hentAInntektUrl, hentBrukerlenkeBaseUrl } from '@/api/brukerlenker';
import { useBehandlingStore } from '@/stores/behandlingStore';
import { useFagsakStore } from '@/stores/fagsakStore';
import { createTestQueryClient } from '@/testutils/queryTestUtils';

import { Header } from './Header';

const mockHentBrukerlenkeBaseUrl = vi.mocked(hentBrukerlenkeBaseUrl);
const mockHentAInntektUrl = vi.mocked(hentAInntektUrl);
const menyknappNavn = 'Systemer, oppslagsverk og personvern';

const åpneMeny = async (): Promise<void> => {
    await userEvent.click(screen.getByRole('button', { name: menyknappNavn }));
};

const renderHeader = (): void => {
    const queryClient = createTestQueryClient();
    const router = createMemoryRouter([{ path: '*', element: <Header /> }], {
        initialEntries: ['/'],
    });
    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
};

const setUpMocks = (): void => {
    useBehandlingStore.setState({ behandlingId: undefined });
    useFagsakStore.setState({
        tilbakekrevingSakId: undefined,
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
        setUpMocks();
    });

    test('hentBrukerlenkeBaseUrl blir kalt én gang ved rendering', () => {
        renderHeader();
        expect(mockHentBrukerlenkeBaseUrl).toHaveBeenCalledTimes(1);
    });

    test('Viser riktig titler når ingen personIdent er satt', async () => {
        renderHeader();
        await åpneMeny();

        expect(await screen.findByRole('menuitem', { name: 'Modia' })).toBeInTheDocument();
        expect(
            screen.queryByRole('menuitem', { name: 'Modia personoversikt' })
        ).not.toBeInTheDocument();
    });

    test('Har riktig lenke til A-inntekt, Gosys og Modia når personIdent er satt', async () => {
        const personIdent = '12345678910';
        useBehandlingStore.setState({ behandlingId: 'test-behandling-id' });
        useFagsakStore.setState({
            tilbakekrevingSakId: 'test-fagsak-id',
            fagsystem: 'BA',
            personIdent,
        });
        renderHeader();

        expect(mockHentAInntektUrl).toHaveBeenCalled();

        await åpneMeny();

        expect(
            await screen.findByRole('menuitem', { name: 'A-inntekt personoversikt' })
        ).toHaveAttribute('href', `https://a-inntekt.nav.no/mock=${personIdent}`);
        expect(screen.getByRole('menuitem', { name: 'Gosys personoversikt' })).toHaveAttribute(
            'href',
            `https://gosys.nav.no/personoversikt/fnr=${personIdent}`
        );
        expect(screen.getByRole('menuitem', { name: 'Modia personoversikt' })).toHaveAttribute(
            'href',
            `https://modia.nav.no/person/${personIdent}`
        );
    });

    test('Gir kun baseUrl når personIdent ikke er satt', async () => {
        renderHeader();
        await åpneMeny();

        expect(await screen.findByRole('menuitem', { name: 'A-inntekt' })).toHaveAttribute(
            'href',
            'https://a-inntekt.nav.no'
        );
        expect(screen.getByRole('menuitem', { name: 'Gosys' })).toHaveAttribute(
            'href',
            'https://gosys.nav.no'
        );
        expect(screen.getByRole('menuitem', { name: 'Modia' })).toHaveAttribute(
            'href',
            'https://modia.nav.no'
        );
    });

    test('Viser kun personvern i menyen når ingen gyldige systemlenker eksisterer', async () => {
        mockHentBrukerlenkeBaseUrl.mockResolvedValue({
            aInntektUrl: '',
            gosysBaseUrl: '',
            modiaBaseUrl: '',
        });

        renderHeader();
        await åpneMeny();

        expect(
            screen.queryByRole('group', { name: 'Systemer og oppslagsverk' })
        ).not.toBeInTheDocument();
        const personvernGruppe = screen.getByRole('group', { name: 'Personvern og sikkerhet' });
        expect(
            within(personvernGruppe).getByRole('menuitem', {
                name: 'Personvern i Tilbakeløsningen',
            })
        ).toHaveAttribute('href', '/personvern');
    });

    describe('RolleTag', () => {
        test('Viser "Veileder"-rolletag', () => {
            useBehandlingStore.setState({ rolle: 'VEILEDER', erNyModell: true });
            renderHeader();

            expect(screen.getByText('Veileder')).toBeInTheDocument();
        });

        test('Viser "Beslutter"-rolletag', () => {
            useBehandlingStore.setState({ rolle: 'BESLUTTER', erNyModell: true });
            renderHeader();

            expect(screen.getByText('Beslutter')).toBeInTheDocument();
        });

        test('Viser "Saksbehandler"-rolletag', () => {
            useBehandlingStore.setState({ rolle: 'SAKSBEHANDLER', erNyModell: true });
            renderHeader();
            expect(screen.getByText('Saksbehandler')).toBeInTheDocument();
        });

        test('Viser ingen rolletag ved gammel modell', () => {
            useBehandlingStore.setState({ rolle: 'SAKSBEHANDLER', erNyModell: false });
            renderHeader();
            expect(screen.queryByText('Saksbehandler')).not.toBeInTheDocument();
        });
    });
});
