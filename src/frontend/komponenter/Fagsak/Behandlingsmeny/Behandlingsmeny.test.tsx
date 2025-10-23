import type { BehandlingHook } from '../../../context/BehandlingContext';
import type { TogglesHook } from '../../../context/TogglesContext';
import type { NavigateFunction } from 'react-router';

import { render } from '@testing-library/react';
import * as React from 'react';

import { Behandlingsmeny } from './Behandlingsmeny';
import { lagBehandling } from '../../../testdata/behandlingFactory';
import { Behandlingstatus } from '../../../typer/behandling';
import { RessursStatus } from '../../../typer/ressurs';

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useNavigate: (): NavigateFunction => jest.fn(),
}));

const mockUseBehandling = jest.fn();
jest.mock('../../../context/BehandlingContext', () => ({
    useBehandling: (): BehandlingHook => mockUseBehandling(),
}));

jest.mock('../../../context/TogglesContext', () => ({
    useToggles: (): TogglesHook => ({
        toggles: {
            'familie-tilbake-frontend.saksbehandler.kan.resette.behandling': false,
        },
        feilmelding: '',
    }),
}));

jest.mock('@tanstack/react-query', () => {
    return {
        useQueryClient: jest.fn(() => ({
            invalidateQueries: jest.fn(),
        })),
    };
});

describe('Behandlingsmeny', () => {
    test('Skal ikke vise LeggtilFjernBrevmottakere for ny modell', () => {
        mockUseBehandling.mockReturnValue({
            behandling: {
                status: RessursStatus.Suksess,
                data: lagBehandling({
                    status: Behandlingstatus.Utredes,
                    erNyModell: true,
                    kanEndres: true,
                    støtterManuelleBrevmottakere: true,
                }),
            },
            erStegBehandlet: jest.fn().mockReturnValue(false),
        });
        const { queryByText } = render(<Behandlingsmeny />);
        expect(queryByText('Fjern brevmottaker(e)')).not.toBeInTheDocument();
        expect(queryByText('Legg til brevmottaker')).not.toBeInTheDocument();
    });
});
