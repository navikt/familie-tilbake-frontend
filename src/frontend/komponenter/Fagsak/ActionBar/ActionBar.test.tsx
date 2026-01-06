import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { ActionBar } from './ActionBar';
import { FagsakContext } from '../../../context/FagsakContext';
import { lagFagsak } from '../../../testdata/fagsakFactory';

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const renderActionBar = (
    onForrige: () => void,
    onNeste: () => void,
    isLoading: boolean = false
): RenderResult => {
    const fagsakValue = {
        fagsak: lagFagsak(),
    };

    return render(
        <FagsakContext.Provider value={fagsakValue}>
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
        jest.clearAllMocks();
        mockUseBehandling.mockImplementation(() => ({
            erStegBehandlet: jest.fn().mockReturnValue(false),
        }));
    });

    test('Kaller ikke onNeste eller onForrige når isLoading = true', () => {
        const onNeste = jest.fn();
        const onForrige = jest.fn();
        renderActionBar(onForrige, onNeste, true);

        fireEvent.click(
            screen.getByRole('button', { name: /gå videre til vilkårsvurderingssteget/i })
        );
        fireEvent.click(screen.getByRole('button', { name: /gå tilbake til faktasteget/i }));

        expect(onNeste).not.toHaveBeenCalled();
        expect(onForrige).not.toHaveBeenCalled();
    });

    test('Har ikke knapp tilbake til Tilbakekrevingen når ikke på inaktiv side', () => {
        renderActionBar(jest.fn(), jest.fn(), false);
        expect(screen.queryByRole('link', { name: /gå til behandling/i })).not.toBeInTheDocument();
    });
});
