import type { Behandling } from '../typer/behandling';

import { visSide } from './sider';
import {
    lagBehandling,
    lagBrevmottakerSteg,
    lagFaktaSteg,
    lagForeldelseSteg,
    lagForeslåVedtakSteg,
    lagVilkårsvurderingSteg,
} from '../testdata/behandlingFactory';
import { Behandlingssteg, Behandlingsstegstatus } from '../typer/behandling';

const mockBehandling = lagBehandling({
    behandlingsstegsinfo: [
        lagFaktaSteg(),
        lagForeldelseSteg(),
        lagVilkårsvurderingSteg(),
        lagForeslåVedtakSteg({ status: Behandlingsstegstatus.Startet }),
    ],
});

describe('Sider', () => {
    test('visSide skal ikke vise brevmottaker dersom den informasjonen ikke er på behandlingen', () => {
        const result = visSide(Behandlingssteg.Brevmottaker, mockBehandling, {});
        expect(result).toBe(false);
    });

    test('visSide skal vise brevmottaker dersom den informasjonen er på behandlingen', () => {
        const mockBehandlingMedBrevmottakerSteg: Behandling = {
            ...mockBehandling,
            behandlingsstegsinfo: [...mockBehandling.behandlingsstegsinfo, lagBrevmottakerSteg()],
        };
        const result = visSide(Behandlingssteg.Brevmottaker, mockBehandlingMedBrevmottakerSteg, {});
        expect(result).toBe(true);
    });

    test('visSide skal vise de synlige stegene: Fakta, Foreldelse, Vilkårsvurdering, Vedtak', () => {
        mockBehandling.behandlingsstegsinfo?.forEach(stegInfo => {
            const result = visSide(stegInfo.behandlingssteg, mockBehandling as Behandling, {});
            expect(result).toBe(true);
        });
    });
});
