import { render, screen } from '@testing-library/react';

import { ActionBarSkeleton } from './ActionBarSkeleton';

describe('ActionBarSkeleton', () => {
    test('Viser menyknappen kun for gammel modell', () => {
        render(<ActionBarSkeleton variant="meny" />);

        expect(screen.getByRole('button', { name: /meny/i })).toBeInTheDocument();
    });

    test('Viser ikke stegflyt når behandlingen ikke er lastet ennå', () => {
        const { container } = render(<ActionBarSkeleton />);

        // Kun knappegruppen, som er felles for alle variantene.
        expect(container.firstElementChild?.childElementCount).toBe(1);
    });
});
