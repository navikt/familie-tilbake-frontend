import type { FC } from 'react';

import { render, screen } from '@testing-library/react';

import { ApiStatusError } from '@/utils/httpUtils';

import { FagsakErrorBoundary } from './FagsakErrorBoundary';

const lagKomponentSomKaster = (feil: Error): FC => {
    return () => {
        throw feil;
    };
};

describe('FagsakErrorBoundary', () => {
    // React logger alltid feil som fanges av en error boundary
    beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {
            // Demper støy i testutskriften
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('burde vise 404-siden når fagsaken ikke finnes', () => {
        const Kaster = lagKomponentSomKaster(new ApiStatusError(404));

        render(
            <FagsakErrorBoundary fagsystem="TS" fagsakId="123">
                <Kaster />
            </FagsakErrorBoundary>
        );

        expect(
            screen.getByRole('heading', { name: 'Beklager, vi fant ikke siden' })
        ).toBeInTheDocument();
    });

    test('burde vise 403-siden med feilmelding fra backend når fagsakskallet ikke gir tilgang', () => {
        const Kaster = lagKomponentSomKaster(
            new ApiStatusError(403, 'Du mangler rolle for å se denne saken')
        );

        render(
            <FagsakErrorBoundary fagsystem="TS" fagsakId="123">
                <Kaster />
            </FagsakErrorBoundary>
        );

        expect(
            screen.getByRole('heading', { name: 'Ingen tilgang til behandlingen' })
        ).toBeInTheDocument();
        expect(screen.getByText('Du mangler rolle for å se denne saken')).toBeInTheDocument();
    });

    test('burde vise 500-siden ved uventede feil', () => {
        const Kaster = lagKomponentSomKaster(new ApiStatusError(500));

        render(
            <FagsakErrorBoundary fagsystem="TS" fagsakId="123">
                <Kaster />
            </FagsakErrorBoundary>
        );

        expect(
            screen.getByRole('heading', { name: 'Oi, dette fungerte visst ikke' })
        ).toBeInTheDocument();
    });

    test('burde vise feilmeldingens tittel og melding ved status 405', () => {
        const feil = Object.assign(new Error('Kravgrunnlaget er bortfalt'), {
            response: {
                status: 405,
                data: {
                    tittel: 'Kravgrunnlag bortfalt',
                    melding: 'Kravgrunnlaget kan ikke behandles videre.',
                },
            },
        });
        const Kaster = lagKomponentSomKaster(feil);

        render(
            <FagsakErrorBoundary fagsystem="TS" fagsakId="123">
                <Kaster />
            </FagsakErrorBoundary>
        );

        expect(screen.getByRole('heading', { name: 'Kravgrunnlag bortfalt' })).toBeInTheDocument();
        expect(screen.getByText('Kravgrunnlaget kan ikke behandles videre.')).toBeInTheDocument();
        expect(screen.getByText('Fagsystem: TS')).toBeInTheDocument();
        expect(screen.getByText('Fagsak: 123')).toBeInTheDocument();
    });

    test('burde vise innholdet når ingen feil oppstår', () => {
        render(
            <FagsakErrorBoundary fagsystem="TS" fagsakId="123">
                <p>Fagsakinnhold</p>
            </FagsakErrorBoundary>
        );

        expect(screen.getByText('Fagsakinnhold')).toBeInTheDocument();
    });
});
