import type { Behandling } from '../typer/behandling';

import { erSidenAktiv, erSidenTilgjengelig, SYNLIGE_STEG, visSide } from './sider';
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
            const result = visSide(stegInfo.behandlingssteg, mockBehandling, {});
            expect(result).toBe(true);
        });
    });

    describe('Brevmottakersteget i ny modell', () => {
        const mockBehandlingNyModell = lagBehandling({
            erNyModell: true,
            behandlingsstegsinfo: [
                lagFaktaSteg(),
                lagForeldelseSteg(),
                lagVilkårsvurderingSteg(),
                lagForeslåVedtakSteg({ status: Behandlingsstegstatus.Startet }),
            ],
        });
        test('Skal vises', () => {
            const resultat = visSide(Behandlingssteg.Brevmottaker, mockBehandlingNyModell, {});
            expect(resultat).toBe(true);
        });

        test('Skal være aktiv', () => {
            const resultat = erSidenAktiv(SYNLIGE_STEG.BREVMOTTAKER, mockBehandlingNyModell);
            expect(resultat).toBe(true);
        });

        test('Skal være tilgjengelig', () => {
            const resultat = erSidenTilgjengelig(
                SYNLIGE_STEG.BREVMOTTAKER.href,
                mockBehandlingNyModell.behandlingsstegsinfo,
                mockBehandlingNyModell.erNyModell
            );
            expect(resultat).toBe(true);
        });
    });
});
