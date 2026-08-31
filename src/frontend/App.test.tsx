import type { AxiosResponse } from 'axios';

import { render, screen, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';

import { hentInnloggetBruker } from '@/api/saksbehandler';

import { App } from './App';

vi.mock('@/api/saksbehandler', () => ({ hentInnloggetBruker: vi.fn() }));

const lagAxiosFeil = (httpStatus?: number): AxiosError => {
    const feil = new AxiosError('Kall mot /user/profile feilet');
    if (httpStatus !== undefined) {
        feil.response = { status: httpStatus } as AxiosResponse;
    }
    return feil;
};

describe('App - innloggingsstatus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('viser laster mens innlogget bruker hentes', () => {
        vi.mocked(hentInnloggetBruker).mockReturnValue(
            new Promise(() => {
                // Løses aldri, slik at kallet forblir underveis gjennom hele testen.
            })
        );

        render(<App />);

        expect(screen.getByTitle('Laster inn siden')).toBeInTheDocument();
    });

    test('viser ikke tilgang når sesjonen har utløpt', async () => {
        vi.mocked(hentInnloggetBruker).mockRejectedValue(lagAxiosFeil(401));

        render(<App />);

        await waitFor(() =>
            expect(screen.getByText('Sesjonen din har utløpt')).toBeInTheDocument()
        );
    });

    test('viser serverfeil med statuskode når kallet feiler', async () => {
        vi.mocked(hentInnloggetBruker).mockRejectedValue(lagAxiosFeil(500));

        render(<App />);

        await waitFor(() =>
            expect(screen.getByText('Oi, dette fungerte visst ikke')).toBeInTheDocument()
        );
        expect(screen.getByText('Statuskode 500')).toBeInTheDocument();
    });

    test('viser serverfeil uten statuskode ved nettverksfeil', async () => {
        vi.mocked(hentInnloggetBruker).mockRejectedValue(lagAxiosFeil());

        render(<App />);

        await waitFor(() =>
            expect(screen.getByText('Oi, dette fungerte visst ikke')).toBeInTheDocument()
        );
        expect(screen.queryByText(/^Statuskode/)).not.toBeInTheDocument();
    });
});
