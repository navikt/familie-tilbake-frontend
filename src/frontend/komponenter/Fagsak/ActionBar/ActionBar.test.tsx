import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ActionBar } from './ActionBar';
import { FagsakContext } from '../../../context/FagsakContext';
import { lagFagsak } from '../../../testdata/fagsakFactory';

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): NavigateFunction => vi.fn(),
    };
});

const mockUseBehandling = vi.fn();
vi.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const renderActionBar = (
    onForrige: () => void,
    onNeste: () => void,
    isLoading: boolean = false
): RenderResult => {
    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <ActionBar
                stegtekst="Steg 2 av 5"
                forrigeAriaLabel="gå tilbake til faktasteget"
                nesteAriaLabel="gå videre til vilkårsvurderingssteget"
                onNeste={onNeste}
                isLoading={isLoading}
                onForrige={onForrige}
            />
        </FagsakContext.Provider>
    );
};

describe('ActionBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseBehandling.mockImplementation(() => ({
            erStegBehandlet: vi.fn().mockReturnValue(false),
        }));
    });

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
