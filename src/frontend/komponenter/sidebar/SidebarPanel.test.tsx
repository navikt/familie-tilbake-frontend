import type { BehandlingDto } from '@/generated';

import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { useSidebarStore } from '@/stores/sidebarStore';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';

import { Menysider } from './menysider';
import { SidebarPanel } from './SidebarPanel';

vi.mock('./SidebarInnhold', () => ({
    SidebarInnhold: ({ valgtMenyside }: { valgtMenyside: Menysider }): React.ReactElement => (
        <div>{`Innhold for ${valgtMenyside}`}</div>
    ),
}));

const renderSidebarPanel = (behandling: BehandlingDto = lagBehandling()): void => {
    render(
        <TestBehandlingProvider behandling={behandling}>
            <SidebarPanel veksleknapp={<button type="button">Veksle</button>} />
        </TestBehandlingProvider>
    );
};

describe('SidebarPanel', () => {
    beforeEach(() => {
        useSidebarStore.setState({ erÅpen: true, valgtSide: null });
    });

    test('Viser fanene som tabs med tilgjengelig navn', () => {
        renderSidebarPanel();

        expect(screen.getByRole('tablist')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Detaljer' })).toHaveAttribute(
            'aria-selected',
            'true'
        );
        expect(screen.getByRole('tab', { name: 'Historikk' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Dokumenter' })).toBeInTheDocument();
    });

    test('Viser innhold for aktiv fane', () => {
        renderSidebarPanel();

        const panel = screen.getByRole('tabpanel', { name: 'Detaljer' });
        expect(within(panel).getByText(`Innhold for ${Menysider.Detaljer}`)).toBeInTheDocument();
    });

    test('Bytter fane og lagrer valget i storen', async () => {
        renderSidebarPanel();

        await userEvent.click(screen.getByRole('tab', { name: 'Historikk' }));

        expect(useSidebarStore.getState().valgtSide).toBe(Menysider.Historikk);
        const panel = screen.getByRole('tabpanel', { name: 'Historikk' });
        expect(within(panel).getByText(`Innhold for ${Menysider.Historikk}`)).toBeInTheDocument();
    });

    test('Viser fatte vedtak-fanen som standard når behandlingen fatter vedtak', () => {
        renderSidebarPanel(lagBehandling({ status: 'FATTER_VEDTAK' }));

        expect(screen.getByRole('tab', { name: 'Fatte vedtak' })).toHaveAttribute(
            'aria-selected',
            'true'
        );
        const panel = screen.getByRole('tabpanel', { name: 'Fatte vedtak' });
        expect(within(panel).getByText(`Innhold for ${Menysider.Totrinn}`)).toBeInTheDocument();
    });

    test('Beholder skjemasiden montert etter fanebytte så utfylt tekst ikke går tapt', async () => {
        renderSidebarPanel();

        await userEvent.click(screen.getByRole('tab', { name: 'Send brev' }));
        await userEvent.click(screen.getByRole('tab', { name: 'Detaljer' }));

        expect(screen.getByText(`Innhold for ${Menysider.SendBrev}`)).toBeInTheDocument();
    });

    test('Avmonterer lesesider etter fanebytte slik at de hentes på nytt', async () => {
        renderSidebarPanel();

        await userEvent.click(screen.getByRole('tab', { name: 'Historikk' }));
        await userEvent.click(screen.getByRole('tab', { name: 'Detaljer' }));

        expect(screen.queryByText(`Innhold for ${Menysider.Historikk}`)).not.toBeInTheDocument();
    });

    test('Skjuler send brev-fanen for ny modell', () => {
        renderSidebarPanel(lagBehandling({ erNyModell: true }));

        expect(screen.queryByRole('tab', { name: 'Send brev' })).not.toBeInTheDocument();
    });
});
