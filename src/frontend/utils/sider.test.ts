import type { Behandling } from '../typer/behandling';

import { visSide } from './sider';
import { Behandlingssteg, Behandlingsstegstatus } from '../typer/behandling';

const mockBehandlingsstegsinfo = [
    {
        behandlingssteg: Behandlingssteg.Fakta,
        behandlingsstegstatus: Behandlingsstegstatus.Utført,
        venteårsak: undefined,
        tidsfrist: undefined,
    },
    {
        behandlingssteg: Behandlingssteg.Foreldelse,
        behandlingsstegstatus: Behandlingsstegstatus.Utført,
        venteårsak: undefined,
        tidsfrist: undefined,
    },
    {
        behandlingssteg: Behandlingssteg.Vilkårsvurdering,
        behandlingsstegstatus: Behandlingsstegstatus.Klar,
        venteårsak: undefined,
        tidsfrist: undefined,
    },
    {
        behandlingssteg: Behandlingssteg.ForeslåVedtak,
        behandlingsstegstatus: Behandlingsstegstatus.Startet,
        venteårsak: undefined,
        tidsfrist: undefined,
    },
];

const mockBehandling: Partial<Behandling> = {
    behandlingsstegsinfo: mockBehandlingsstegsinfo,
};

describe('Sider', () => {
    test('visSide skal ikke vise brevmottaker dersom den informasjonen ikke er på behandlingen', () => {
        const result = visSide(Behandlingssteg.Brevmottaker, mockBehandling as Behandling, {});
        expect(result).toBe(false);
    });

    test('visSide skal vise brevmottaker dersom den informasjonen er på behandlingen', () => {
        const mockBehandling = {
            behandlingsstegsinfo: [
                ...mockBehandlingsstegsinfo,
                {
                    behandlingssteg: Behandlingssteg.Brevmottaker,
                    behandlingsstegstatus: Behandlingsstegstatus.Klar,
                    venteårsak: undefined,
                    tidsfrist: undefined,
                },
            ],
        } as Behandling;
        const result = visSide(Behandlingssteg.Brevmottaker, mockBehandling, {});
        expect(result).toBe(true);
    });

    test('visSide skal vise de synlige stegene: Fakta, Foreldelse, Vilkårsvurdering, Vedtak', () => {
        mockBehandling.behandlingsstegsinfo?.forEach(stegInfo => {
            const result = visSide(stegInfo.behandlingssteg, mockBehandling as Behandling, {});
            expect(result).toBe(true);
        });
    });
});
