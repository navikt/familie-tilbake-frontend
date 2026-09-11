import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { useSidebarStore } from '@/stores/sidebarStore';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';

import { Menysider } from './menysider';
import { Sidebar } from './Sidebar';

vi.mock('./SidebarInnhold', () => ({
    SidebarInnhold: ({ valgtMenyside }: { valgtMenyside: Menysider }): React.ReactElement => (
        <label>
            {`Notat ${valgtMenyside}`}
            <input type="text" />
        </label>
    ),
}));

const settSkjermbredde = (bredde: number): void => {
    window.innerWidth = bredde;
};

const renderSidebar = (): { rerender: () => void } => {
    const { rerender } = render(
        <TestBehandlingProvider behandling={lagBehandling()}>
            <Sidebar />
        </TestBehandlingProvider>
    );
    return {
        rerender: (): void =>
            rerender(
                <TestBehandlingProvider behandling={lagBehandling()}>
                    <Sidebar />
                </TestBehandlingProvider>
            ),
    };
};

const notatfelt = (side: Menysider): HTMLElement =>
    screen.getByRole('textbox', { name: `Notat ${side}` });

describe('Sidebar', () => {
    beforeEach(() => {
        settSkjermbredde(1440);
        useSidebarStore.setState({ erÅpen: true, erÅpenPåSmalSkjerm: false, valgtSide: null });
    });

    test('Beholder utfylt tekst når panelet lukkes og åpnes igjen', async () => {
        renderSidebar();

        await userEvent.click(screen.getByRole('tab', { name: 'Send brev' }));
        await userEvent.type(notatfelt(Menysider.SendBrev), 'Påbegynt vurdering');

        await userEvent.click(screen.getByRole('button', { name: 'Lukk informasjonspanelet' }));
        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Åpne informasjonspanelet' }));

        expect(notatfelt(Menysider.SendBrev)).toHaveValue('Påbegynt vurdering');
    });

    test('Lukker panelet når skjermen blir smal, og beholder utfylt tekst', async () => {
        const { rerender } = renderSidebar();

        await userEvent.click(screen.getByRole('tab', { name: 'Send brev' }));
        await userEvent.type(notatfelt(Menysider.SendBrev), 'Påbegynt vurdering');

        settSkjermbredde(800);
        rerender();

        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
        expect(
            screen.getByRole('navigation', { name: 'Snarveier i informasjonspanelet' })
        ).toBeInTheDocument();

        settSkjermbredde(1440);
        rerender();

        expect(notatfelt(Menysider.SendBrev)).toHaveValue('Påbegynt vurdering');
    });

    test('Lar brukeren åpne panelet manuelt på smal skjerm', async () => {
        settSkjermbredde(800);
        renderSidebar();

        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Åpne informasjonspanelet' }));

        expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    test('Lukker panelet med Escape når det dekker behandlingen, og beholder utfylt tekst', async () => {
        settSkjermbredde(800);
        renderSidebar();

        await userEvent.click(screen.getByRole('button', { name: 'Åpne informasjonspanelet' }));
        await userEvent.click(screen.getByRole('tab', { name: 'Send brev' }));
        await userEvent.type(notatfelt(Menysider.SendBrev), 'Påbegynt vurdering');

        await userEvent.keyboard('{Escape}');

        expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'Åpne informasjonspanelet' }));

        expect(notatfelt(Menysider.SendBrev)).toHaveValue('Påbegynt vurdering');
    });

    test('Lukker ikke panelet med Escape når det står ved siden av behandlingen', async () => {
        renderSidebar();

        await userEvent.click(screen.getByRole('tab', { name: 'Send brev' }));
        await userEvent.keyboard('{Escape}');

        expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    test('Viser snarveier i kompaktvisningen når panelet er lukket', async () => {
        renderSidebar();

        await userEvent.click(screen.getByRole('button', { name: 'Lukk informasjonspanelet' }));

        expect(
            screen.getByRole('navigation', { name: 'Snarveier i informasjonspanelet' })
        ).toBeInTheDocument();
    });
});
