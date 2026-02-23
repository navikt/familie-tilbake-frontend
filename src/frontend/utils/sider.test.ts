import type { BehandlingDto } from '~/generated';

import {
    lagBehandling,
    lagBrevmottakerSteg,
    lagFaktaSteg,
    lagForeldelseSteg,
    lagForeslåVedtakSteg,
    lagVilkårsvurderingSteg,
} from '~/testdata/behandlingFactory';

import { visSide } from './sider';

const mockBehandling = lagBehandling({
    behandlingsstegsinfo: [
        lagFaktaSteg(),
        lagForeldelseSteg(),
        lagVilkårsvurderingSteg(),
        lagForeslåVedtakSteg({ status: 'KLAR' }),
    ],
});

describe('Sider', () => {
    test('visSide skal ikke vise brevmottaker dersom den informasjonen ikke er på behandlingen', () => {
        const result = visSide('BREVMOTTAKER', mockBehandling);
        expect(result).toBe(false);
    });

    test('visSide skal vise brevmottaker dersom den informasjonen er på behandlingen', () => {
        const mockBehandlingMedBrevmottakerSteg: BehandlingDto = {
            ...mockBehandling,
            behandlingsstegsinfo: [...mockBehandling.behandlingsstegsinfo, lagBrevmottakerSteg()],
        };
        const result = visSide('BREVMOTTAKER', mockBehandlingMedBrevmottakerSteg);
        expect(result).toBe(true);
    });

    test('visSide skal vise de synlige stegene: Fakta, Foreldelse, Vilkårsvurdering, Vedtak', () => {
        mockBehandling.behandlingsstegsinfo?.forEach(stegInfo => {
            const result = visSide(stegInfo.behandlingssteg, mockBehandling);
            expect(result).toBe(true);
        });
    });
});
