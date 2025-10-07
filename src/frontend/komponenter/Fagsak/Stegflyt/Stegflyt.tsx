import type { Ressurs } from '../../../typer/ressurs';
import type { SynligSteg } from '../../../utils/sider';

import { Stepper } from '@navikt/ds-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';

import { erStegUtført, useBehandling } from '../../../context/BehandlingContext';
import { useToggles } from '../../../context/TogglesContext';
import { useFagsakStore } from '../../../store/fagsak';
import { type Behandling, type Behandlingsstegstilstand } from '../../../typer/behandling';
import { RessursStatus } from '../../../typer/ressurs';
import { erSidenAktiv, SYNLIGE_STEG, visSide } from '../../../utils/sider';

interface StepperSteg extends SynligSteg {
    erUtført: boolean;
    erAktiv: boolean;
}

const mapStegTilStepperSteg = (
    stegsinfo: Behandlingsstegstilstand[],
    behandling: Ressurs<Behandling> | undefined,
    aktiveToggles: Record<string, boolean>
): StepperSteg[] | undefined => {
    if (behandling?.status !== RessursStatus.Suksess) return undefined;
    return Object.values(SYNLIGE_STEG)
        .filter(({ steg }) => visSide(steg, behandling.data, aktiveToggles))
        .map(synligSteg => {
            const { behandlingsstegstatus } =
                stegsinfo.find(({ behandlingssteg }) => behandlingssteg === synligSteg.steg) || {};

            return {
                steg: synligSteg.steg,
                navn: synligSteg.navn,
                href: synligSteg.href,
                erUtført: behandlingsstegstatus ? erStegUtført(behandlingsstegstatus) : false,
                erAktiv: erSidenAktiv(synligSteg, behandling.data),
            };
        });
};

export const Stegflyt: React.FC = () => {
    const { behandling } = useBehandling();
    const location = useLocation();
    const navigate = useNavigate();
    const { fagsakId, fagSystem } = useFagsakStore();
    const { toggles: aktiveToggles } = useToggles();

    const stegsinfo = mapStegTilStepperSteg(
        behandling?.status === RessursStatus.Suksess ? behandling.data.behandlingsstegsinfo : [],
        behandling,
        aktiveToggles
    );

    console.log('stegsinfo', stegsinfo);

    const aktivStegindeks =
        stegsinfo?.findIndex(steg => location.pathname.includes(steg.href)) ?? -1;
    const aktivStegnummer = aktivStegindeks > -1 ? aktivStegindeks + 1 : 0;

    const fagsakPath = (sideHref: string): string | null => {
        if (behandling?.status === RessursStatus.Suksess && fagSystem && fagsakId)
            return `/fagsystem/${fagSystem}/fagsak/${fagsakId}/behandling/${behandling.data.eksternBrukId}/${sideHref}`;
        else return null;
    };

    const gåTilSteg = (stegNummer: number): void => {
        const nyttSteg = stegsinfo?.[stegNummer - 1];
        if (nyttSteg?.href && aktivStegnummer !== stegNummer) {
            navigate(`${fagsakPath(nyttSteg.href)}`);
        }
    };

    if (aktivStegnummer < 1 || !stegsinfo) return null;

    return (
        <Stepper
            activeStep={aktivStegnummer}
            onStepChange={gåTilSteg}
            orientation="horizontal"
            className="mx-4"
            aria-label="Behandlingssteg"
        >
            {stegsinfo.map(steg => {
                const ariaLabel = steg.erAktiv
                    ? `Gå til ${steg.navn}`
                    : `Inaktivt steg, ${steg.navn}, ikke klikkbar`;
                return (
                    <Stepper.Step
                        key={steg.steg}
                        completed={steg.erUtført}
                        interactive={steg.erAktiv}
                        aria-label={ariaLabel}
                    >
                        {steg.navn}
                    </Stepper.Step>
                );
            })}
        </Stepper>
    );
};
