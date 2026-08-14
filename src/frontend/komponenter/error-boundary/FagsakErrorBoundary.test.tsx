import type { FC } from 'react';

import { render, screen } from '@testing-library/react';

import { FagsakIkkeFunnetError, FagsakIkkeStøttetError } from '@/context/FagsakContext';

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
        const Kaster = lagKomponentSomKaster(new FagsakIkkeFunnetError('Fant ingen fagsak'));

        render(
            <FagsakErrorBoundary>
                <Kaster />
            </FagsakErrorBoundary>
        );

        expect(
            screen.getByRole('heading', { name: 'Beklager, vi fant ikke siden' })
        ).toBeInTheDocument();
    });

    test('burde vise egen melding når fagsystemet ikke er støttet', () => {
        const Kaster = lagKomponentSomKaster(
            new FagsakIkkeStøttetError('Ikke støttet', 'Ytelsen støttes ikke ennå', 'BA', '123')
        );

        render(
            <FagsakErrorBoundary>
                <Kaster />
            </FagsakErrorBoundary>
        );

        expect(screen.getByRole('heading', { name: 'Ikke støttet' })).toBeInTheDocument();
        expect(screen.getByText('Ytelsen støttes ikke ennå')).toBeInTheDocument();
    });

    test('burde vise generell feilmelding ved uventede feil', () => {
        const Kaster = lagKomponentSomKaster(new Error('Noe uventet'));

        render(
            <FagsakErrorBoundary>
                <Kaster />
            </FagsakErrorBoundary>
        );

        expect(screen.getByText('Noe uventet')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Prøv på nytt' })).toBeInTheDocument();
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
