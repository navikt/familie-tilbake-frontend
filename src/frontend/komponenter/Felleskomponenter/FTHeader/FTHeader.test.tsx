import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { FTHeader } from './FTHeader';
import { hentSystemUrl } from '../../../api/systemUrl';
import { usePersonIdentStore } from '../../../store/personIdent';

jest.mock('../../../api/systemUrl', () => ({
    hentSystemUrl: jest.fn(),
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
        usePersonIdentStore.setState({ personIdent: undefined });

        (hentSystemUrl as jest.Mock).mockResolvedValue({
            aInntektBaseUrl: 'https://a-inntekt.nav.no',
            gosysBaseUrl: 'https://gosys.nav.no',
            modiaBaseUrl: 'https://modia.nav.no',
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
    test('hentSystemUrl blir kalt én gang ved rendering', () => {
        renderHeader();

        expect(hentSystemUrl).toHaveBeenCalledTimes(1);
    });

    test('Viser riktig overskrift når ingen personIdent er satt', async () => {
        const mockUrls = {
            aInntektBaseUrl: 'https://arbeid-og-inntekt.dev.adeo.no',
            gosysBaseUrl: 'https://gosys-q1.dev.intern.nav.no/gosys',
            modiaBaseUrl: 'https://app-q1.adeo.no/modiapersonoversikt',
        };
        (hentSystemUrl as jest.Mock).mockResolvedValue(mockUrls);

        renderHeader();

        const systemerOgOppslagsverkHeader = screen.getByText('Systemer og oppslagsverk', {
            selector: '.navds-dropdown__list-heading',
        });

        const personoversiktHeader = screen.queryByText('Personoversikt', {
            selector: '.navds-dropdown__list-heading',
        });
        expect(personoversiktHeader).not.toBeInTheDocument();
        expect(systemerOgOppslagsverkHeader).toBeInTheDocument();
    });

    test('Viser riktig overskrift når personIdent er satt', async () => {
        usePersonIdentStore.setState({ personIdent: '12345678910' });

        renderHeader();

        const menyknapp = screen.getByTitle('Systemer og oppslagsverk');
        await userEvent.click(menyknapp);
        const personoversiktHeader = screen.getByText('Personoversikt', {
            selector: '.navds-dropdown__list-heading',
        });
        const systemerOgOppslagsverkHeader = screen.queryByText('Systemer og oppslagsverk', {
            selector: '.navds-dropdown__list-heading',
        });
        expect(systemerOgOppslagsverkHeader).not.toBeInTheDocument();
        expect(personoversiktHeader).toBeInTheDocument();
    });

    test('Har riktig lenke til A-inntekt, Gosys og Modia når personIdent er satt', async () => {
        const personIdent = '12345678910';
        usePersonIdentStore.setState({ personIdent });

        renderHeader();

        const menyknapp = screen.getByTitle('Systemer og oppslagsverk');
        await userEvent.click(menyknapp);

        const aInntektLenke = screen.getByText('A-inntekt').closest('a');
        const gosysLenke = screen.getByText('Gosys').closest('a');
        const modiaLenke = screen.getByText('Modia').closest('a');

        expect(aInntektLenke).toHaveAttribute('href', `https://a-inntekt.nav.no/${personIdent}`);
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
        (hentSystemUrl as jest.Mock).mockResolvedValue({});

        renderHeader();

        await waitFor(() => {
            const menyknapp = screen.queryByTitle('Systemer og oppslagsverk');
            expect(menyknapp).not.toBeInTheDocument();
        });
    });
});
