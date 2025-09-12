import type { IBehandling, IBehandlingsstegstilstand } from '../../../typer/behandling';
import type { Ressurs } from '../../../typer/ressurs';
import type { SynligSteg } from '../../../utils/sider';

import { Stepper } from '@navikt/ds-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router';

import { erStegUtført, useBehandling } from '../../../context/BehandlingContext';
import { useFagsakStore } from '../../../store/fagsak';
import { RessursStatus } from '../../../typer/ressurs';
import { erSidenAktiv, SYNLIGE_STEG, visSide } from '../../../utils/sider';

interface StepperSteg extends SynligSteg {
    erUtført: boolean;
    erAktiv: boolean;
}

const mapStegTilStepperSteg = (
    stegInfo: IBehandlingsstegstilstand[],
    behandling: Ressurs<IBehandling> | undefined
): StepperSteg[] | undefined => {
    if (behandling?.status !== RessursStatus.Suksess) return undefined;

    return Object.values(SYNLIGE_STEG)
        .filter(({ steg }) => visSide(steg, behandling.data))
        .map(synligSteg => {
            const info = stegInfo.find(
                ({ behandlingssteg }) => behandlingssteg === synligSteg.steg
            );

            return {
                steg: synligSteg.steg,
                navn: synligSteg.navn,
                href: synligSteg.href,
                erUtført: info ? erStegUtført(info.behandlingsstegstatus) : false,
                erAktiv: erSidenAktiv(synligSteg, behandling.data),
            };
        });
};

type Props = {
    behandlingsstegInfo: IBehandlingsstegstilstand[];
};

export const Stegflyt: React.FC<Props> = ({ behandlingsstegInfo }) => {
    const { behandling } = useBehandling();
    const location = useLocation();
    const navigate = useNavigate();
    const { fagsakId, fagSystem } = useFagsakStore();

    const stegListe = mapStegTilStepperSteg(behandlingsstegInfo, behandling);
    const aktivtStegIndeks =
        stegListe?.findIndex(steg => location.pathname.includes(steg.href)) ?? -1;
    const aktivtStegNummer = aktivtStegIndeks > -1 ? aktivtStegIndeks + 1 : 0;

    const fagsakPath = (sideHref: string): string | null => {
        if (behandling?.status === RessursStatus.Suksess && fagSystem && fagsakId)
            return `/fagsystem/${fagSystem}/fagsak/${fagsakId}/behandling/${behandling.data.eksternBrukId}/${sideHref}`;
        else return null;
    };

    const gåTilSteg = (stegNummer: number): void => {
        const nyttSteg = stegListe?.[stegNummer - 1];
        if (nyttSteg?.href && aktivtStegNummer !== stegNummer) {
            navigate(`${fagsakPath(nyttSteg.href)}`);
        }
    };

    if (aktivtStegNummer < 1 || !stegListe) return null;

    return (
        <Stepper
            activeStep={aktivtStegNummer}
            onStepChange={gåTilSteg}
            orientation="horizontal"
            className="mx-4"
        >
            {stegListe.map(steg => {
                const ariaLabel = steg.erAktiv
                    ? `Gå til ${steg.navn}`
                    : 'Inaktivt steg, ikke klikkbart';
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
