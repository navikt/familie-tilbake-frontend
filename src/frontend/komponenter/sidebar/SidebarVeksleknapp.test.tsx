import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useSidebarStore } from '@/stores/sidebarStore';

import { SidebarVeksleknapp } from './SidebarVeksleknapp';

const settSkjermbredde = (bredde: number): void => {
    window.innerWidth = bredde;
};

describe('SidebarVeksleknapp', () => {
    beforeEach(() => {
        useSidebarStore.setState({ erÅpen: true, erÅpenPåSmalSkjerm: false });
        settSkjermbredde(1280);
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

    test('Viser åpneknapp på små skjermer, der panelet starter lukket', () => {
        settSkjermbredde(800);
        render(<SidebarVeksleknapp />);

        const knapp = screen.getByRole('button', { name: 'Åpne informasjonspanelet' });
        expect(knapp).toHaveAttribute('aria-expanded', 'false');
        expect(knapp).toHaveAttribute('aria-controls', 'informasjonspanel');
        expect(knapp).not.toHaveAttribute('aria-haspopup');
    });

    test('Åpner panelet på små skjermer uten å endre det lagrede valget', async () => {
        settSkjermbredde(800);
        render(<SidebarVeksleknapp />);

        await userEvent.click(screen.getByRole('button', { name: 'Åpne informasjonspanelet' }));

        expect(useSidebarStore.getState().erÅpenPåSmalSkjerm).toBe(true);
        expect(useSidebarStore.getState().erÅpen).toBe(true);
    });

    test('Åpner panelet igjen ved nytt klikk', async () => {
        useSidebarStore.setState({ erÅpen: false });
        render(<SidebarVeksleknapp />);

        await userEvent.click(screen.getByRole('button', { name: 'Åpne informasjonspanelet' }));

        expect(useSidebarStore.getState().erÅpen).toBe(true);
    });
});
