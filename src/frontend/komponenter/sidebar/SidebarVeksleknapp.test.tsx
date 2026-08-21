import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSidebarStore } from '@/stores/sidebarStore';

import { SidebarVeksleknapp } from './SidebarVeksleknapp';

describe('SidebarVeksleknapp', () => {
    beforeEach(() => {
        useSidebarStore.setState({ erÅpen: true });
    });

    test('Viser lukkeknapp når panelet er åpent', () => {
        render(<SidebarVeksleknapp />);

        const knapp = screen.getByRole('button', { name: 'Lukk informasjonspanelet' });
        expect(knapp).toHaveAttribute('aria-expanded', 'true');
        expect(knapp).toHaveAttribute('aria-controls', 'informasjonspanel');
    });

    test('Lukker panelet ved klikk', async () => {
        render(<SidebarVeksleknapp />);

        await userEvent.click(screen.getByRole('button', { name: 'Lukk informasjonspanelet' }));

        expect(useSidebarStore.getState().erÅpen).toBe(false);
        expect(screen.getByRole('button', { name: 'Åpne informasjonspanelet' })).toHaveAttribute(
            'aria-expanded',
            'false'
        );
    });

    test('Åpner panelet igjen ved nytt klikk', async () => {
        useSidebarStore.setState({ erÅpen: false });
        render(<SidebarVeksleknapp />);

        await userEvent.click(screen.getByRole('button', { name: 'Åpne informasjonspanelet' }));

        expect(useSidebarStore.getState().erÅpen).toBe(true);
    });
});
