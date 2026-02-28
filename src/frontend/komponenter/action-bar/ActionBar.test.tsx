import type { RenderResult } from '@testing-library/react';

import { fireEvent, render, screen } from '@testing-library/react';

import { FagsakContext } from '~/context/FagsakContext';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';

import { ActionBar } from './ActionBar';

const renderActionBar = (
    onForrige: () => void,
    onNeste: () => void,
    isLoading: boolean = false
): RenderResult => {
    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <TestBehandlingProvider>
                <ActionBar
                    stegtekst="Steg 2 av 5"
                    forrigeAriaLabel="gå tilbake til faktasteget"
                    nesteAriaLabel="gå videre til vilkårsvurderingssteget"
                    onNeste={onNeste}
                    isLoading={isLoading}
                    onForrige={onForrige}
                />
            </TestBehandlingProvider>
        </FagsakContext.Provider>
    );
};

describe('ActionBar', () => {
    test('Kaller ikke onNeste eller onForrige når isLoading = true', () => {
        const onNeste = vi.fn();
        const onForrige = vi.fn();
        renderActionBar(onForrige, onNeste, true);

        fireEvent.click(
            screen.getByRole('button', { name: /gå videre til vilkårsvurderingssteget/i })
        );
        fireEvent.click(screen.getByRole('button', { name: /gå tilbake til faktasteget/i }));

        expect(onNeste).not.toHaveBeenCalled();
        expect(onForrige).not.toHaveBeenCalled();
    });

    test('Har ikke knapp tilbake til Tilbakekrevingen når ikke på inaktiv side', () => {
        renderActionBar(vi.fn(), vi.fn(), false);
        expect(screen.queryByRole('link', { name: /gå til behandling/i })).not.toBeInTheDocument();
    });
});
