import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { useSidebarStore } from '@/stores/sidebarStore';

import { BehandlingInnhold } from './BehandlingInnhold';

const settSkjermbredde = (bredde: number): void => {
    window.innerWidth = bredde;
};

const renderInnhold = (): { rerender: () => void } => {
    const innhold = (
        <BehandlingInnhold aria-label="Behandlingsinnhold">
            <label>
                Begrunnelse
                <input type="text" />
            </label>
        </BehandlingInnhold>
    );
    const { rerender } = render(innhold);
    return { rerender: (): void => rerender(innhold) };
};

const begrunnelsesfelt = (): HTMLElement => screen.getByLabelText('Begrunnelse');

describe('BehandlingInnhold', () => {
    beforeEach(() => {
        settSkjermbredde(1440);
        useSidebarStore.setState({ erÅpen: true, erÅpenPåSmalSkjerm: false });
    });

    test('Viser innholdet når panelet ikke tar over skjermen', () => {
        renderInnhold();

        expect(screen.getByRole('region', { name: 'Behandlingsinnhold' })).toBeVisible();
    });

    test('Beholder utfylt tekst når panelet tar over skjermen og lukkes igjen', async () => {
        const { rerender } = renderInnhold();

        await userEvent.type(begrunnelsesfelt(), 'Påbegynt tekst');

        settSkjermbredde(800);
        act(() => useSidebarStore.setState({ erÅpenPåSmalSkjerm: true }));
        rerender();

        expect(begrunnelsesfelt()).toHaveValue('Påbegynt tekst');

        act(() => useSidebarStore.setState({ erÅpenPåSmalSkjerm: false }));
        rerender();

        expect(begrunnelsesfelt()).toHaveValue('Påbegynt tekst');
        expect(screen.getByRole('region', { name: 'Behandlingsinnhold' })).toBeVisible();
    });

    test('Skjuler innholdet for skjermleser og tastatur mens panelet tar over', () => {
        settSkjermbredde(800);
        useSidebarStore.setState({ erÅpenPåSmalSkjerm: true });
        renderInnhold();

        expect(
            screen.queryByRole('region', { name: 'Behandlingsinnhold' })
        ).not.toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: 'Begrunnelse' })).not.toBeInTheDocument();
        expect(begrunnelsesfelt()).not.toBeVisible();
    });

    test('Skjuler ikke innholdet når panelet står ved siden av på stor skjerm', () => {
        renderInnhold();

        expect(screen.getByRole('textbox', { name: 'Begrunnelse' })).toBeVisible();
    });
});
