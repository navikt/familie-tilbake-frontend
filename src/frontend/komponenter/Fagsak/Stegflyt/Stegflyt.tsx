import type { Ressurs } from '../../../typer/ressurs';
import type { SynligSteg } from '../../../utils/sider';

import { Stepper } from '@navikt/ds-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';

import { erStegUtført, useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { useToggles } from '../../../context/TogglesContext';
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
    const { fagsak } = useFagsak();
    const eksternFagsakId = fagsak.eksternFagsakId;
    const fagsystem = fagsak.fagsystem;
    const { toggles: aktiveToggles } = useToggles();

    const stegsinfo = mapStegTilStepperSteg(
        behandling?.status === RessursStatus.Suksess ? behandling.data.behandlingsstegsinfo : [],
        behandling,
        aktiveToggles
    );

    const aktivStegindeks =
        stegsinfo?.findIndex(steg => location.pathname.includes(steg.href)) ?? -1;
    const aktivStegnummer = aktivStegindeks > -1 ? aktivStegindeks + 1 : 0;

    const fagsakPath = (sideHref: string): string | null => {
        if (behandling?.status === RessursStatus.Suksess && fagsystem && eksternFagsakId)
            return `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.data.eksternBrukId}/${sideHref}`;
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
        <nav aria-label="Stegflyt" className="md:px-0 px-4 w-full">
            <Stepper
                activeStep={aktivStegnummer}
                onStepChange={gåTilSteg}
                orientation="horizontal"
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
        </nav>
    );
};
