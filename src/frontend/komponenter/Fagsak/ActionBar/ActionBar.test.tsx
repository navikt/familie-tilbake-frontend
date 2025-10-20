import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { RenderResult } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { ActionBar } from './ActionBar';

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

const renderActionBar = (isLoading: boolean = false): RenderResult =>
    render(
        <ActionBar
            stegtekst="Steg 2 av 5"
            forrigeAriaLabel="gå tilbake til faktasteget"
            nesteAriaLabel="gå videre til vilkårsvurderingssteget"
            onNeste={jest.fn()}
            isLoading={isLoading}
            onForrige={undefined}
        />
    );

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
        render(
            <ActionBar
                stegtekst="Steg 2 av 5"
                forrigeAriaLabel="Gå tilbake til faktasteget"
                nesteAriaLabel="Gå videre til vilkårsvurderingssteget"
                onNeste={onNeste}
                onForrige={onForrige}
                isLoading
            />
        );

        fireEvent.click(
            screen.getByRole('button', { name: /gå videre til vilkårsvurderingssteget/i })
        );
        fireEvent.click(screen.getByRole('button', { name: /gå tilbake til faktasteget/i }));

        expect(onNeste).not.toHaveBeenCalled();
        expect(onForrige).not.toHaveBeenCalled();
    });

    test('Har ikke knapp tilbake til Tilbakekrevingen når ikke på inaktiv side', () => {
        renderActionBar(false);
        expect(screen.queryByRole('link', { name: /gå til behandling/i })).not.toBeInTheDocument();
    });
});
