import type { BehandlingDto } from '@/generated';

import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { useSidebarStore } from '@/stores/sidebarStore';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';
import { lagBehandling } from '@/testdata/behandlingFactory';

import { Menysider } from './menysider';
import { SidebarSnarveier } from './SidebarSnarveier';

const renderSnarveier = (behandling: BehandlingDto = lagBehandling()): void => {
    render(
        <TestBehandlingProvider behandling={behandling}>
            <SidebarSnarveier />
        </TestBehandlingProvider>
    );
};

describe('SidebarSnarveier', () => {
    beforeEach(() => {
        useSidebarStore.setState({ erÅpen: false, valgtSide: null });
    });

    test('Viser én snarvei per tilgjengelig side', () => {
        renderSnarveier();

        const snarveier = screen.getByRole('navigation', {
            name: 'Snarveier i informasjonspanelet',
        });
        expect(within(snarveier).getAllByRole('button')).toHaveLength(4);
    });

    test('Åpner panelet på siden det klikkes på', async () => {
        renderSnarveier();

        await userEvent.click(screen.getByRole('button', { name: 'Åpne dokumenter' }));

        expect(useSidebarStore.getState()).toMatchObject({
            erÅpen: true,
            valgtSide: Menysider.Dokumenter,
        });
    });

    test('Markerer aktiv side', () => {
        useSidebarStore.setState({ valgtSide: Menysider.Historikk });
        renderSnarveier();

        expect(screen.getByRole('button', { name: 'Åpne historikk' })).toHaveAttribute(
            'aria-current',
            'true'
        );
        expect(screen.getByRole('button', { name: 'Åpne detaljer' })).not.toHaveAttribute(
            'aria-current'
        );
    });
});
