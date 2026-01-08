import type { BehandlingDto } from '../../../generated';
import type { SynligSteg } from '../../../utils/sider';

import { Stepper } from '@navikt/ds-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';

import { erStegUtført, useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { type Behandlingsstegstilstand } from '../../../typer/behandling';
import { erSidenAktiv, SYNLIGE_STEG, visSide } from '../../../utils/sider';

interface StepperSteg extends SynligSteg {
    erUtført: boolean;
    erAktiv: boolean;
}

const mapStegTilStepperSteg = (
    stegsinfo: Behandlingsstegstilstand[],
    behandling: BehandlingDto | undefined
): StepperSteg[] | undefined => {
    if (!behandling) return undefined;
    return Object.values(SYNLIGE_STEG)
        .filter(({ steg }) => visSide(steg, behandling))
        .map(synligSteg => {
            const { behandlingsstegstatus } =
                stegsinfo.find(({ behandlingssteg }) => behandlingssteg === synligSteg.steg) || {};

            return {
                steg: synligSteg.steg,
                navn: synligSteg.navn,
                href: synligSteg.href,
                erUtført: behandlingsstegstatus ? erStegUtført(behandlingsstegstatus) : false,
                erAktiv: erSidenAktiv(synligSteg, behandling),
            };
        });
};

export const Stegflyt: React.FC = () => {
    const { behandling } = useBehandling();
    const location = useLocation();
    const navigate = useNavigate();
    const { fagsystem, eksternFagsakId } = useFagsak();

    const stegsinfo = mapStegTilStepperSteg(
        (behandling?.behandlingsstegsinfo as Behandlingsstegstilstand[]) || [],
        behandling
    );

    const aktivStegindeks =
        stegsinfo?.findIndex(steg => location.pathname.includes(steg.href)) ?? -1;
    const aktivStegnummer = aktivStegindeks > -1 ? aktivStegindeks + 1 : 0;

    const fagsakPath = (sideHref: string): string | null => {
        if (behandling && fagsystem && eksternFagsakId)
            return `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/${sideHref}`;
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
