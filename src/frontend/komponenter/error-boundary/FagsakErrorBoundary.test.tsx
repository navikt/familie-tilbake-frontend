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
            <FagsakErrorBoundary>
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
            <FagsakErrorBoundary>
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
            <FagsakErrorBoundary>
                <Kaster />
            </FagsakErrorBoundary>
        );

        expect(
            screen.getByRole('heading', { name: 'Oi, dette fungerte visst ikke' })
        ).toBeInTheDocument();
    });

    test('burde vise innholdet når ingen feil oppstår', () => {
        render(
            <FagsakErrorBoundary>
                <p>Fagsakinnhold</p>
            </FagsakErrorBoundary>
        );

        expect(screen.getByText('Fagsakinnhold')).toBeInTheDocument();
    });
});
