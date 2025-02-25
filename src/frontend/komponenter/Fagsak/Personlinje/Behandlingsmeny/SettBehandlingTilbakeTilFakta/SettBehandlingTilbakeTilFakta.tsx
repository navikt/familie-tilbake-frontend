import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

import * as React from 'react';
import { useState } from 'react';

import SettBehandlingTilbakeTilFaktaModal from './SettBehandlingTilbakeTilFaktaModal';
import { useHttp } from '../../../../../api/http/HttpProvider';
import { useApp } from '../../../../../context/AppContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { ToggleName } from '../../../../../context/toggles';
import { useToggles } from '../../../../../context/TogglesContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { type Ressurs, RessursStatus } from '../../../../../typer/ressurs';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
import { AlertType, ToastTyper } from '../../../../Felleskomponenter/Toast/typer';

interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const SettBehandlingTilbakeTilFakta: React.FC<IProps> = ({
    behandling,
    fagsak,
    onListElementClick,
}) => {
    const { request } = useHttp();
    const { settToast } = useApp();
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const [visSettBehandlingTilbakeTilFaktaModal, settVisSettBehandlingTilbakeTilFaktaModal] =
        useState<boolean>(false);
    const lukkSettBehandlingTilbakeTilFaktaModal = () => {
        settVisSettBehandlingTilbakeTilFaktaModal(false);
    };
    const { toggles } = useToggles();
    const settBehandlingTilbakeTilFakta = () => {
        lukkSettBehandlingTilbakeTilFaktaModal();
        nullstillIkkePersisterteKomponenter();

        const resettUrl = toggles[ToggleName.SaksbehanderKanResettebehandling]
            ? `/familie-tilbake/api/behandling/${behandling.behandlingId}/flytt-behandling-til-fakta`
            : `/familie-tilbake/api/forvaltning/behandling/${behandling.behandlingId}/flytt-behandling/v1`;

        request<void, string>({
            method: 'PUT',
            url: resettUrl,
        }).then((respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.Suksess) {
                settToast(ToastTyper.FlyttBehandlingTilFakta, {
                    alertType: AlertType.Info,
                    tekst: 'Flyttet behandling tilbake til fakta',
                });
                hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                    utførRedirect(
                        `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                    );
                    window.location.reload(); // Quick fix for å kunne trykke neste etter at en behandling har blitt tilbakestilt til fakta
                });
            } else if (
                respons.status === RessursStatus.Feilet ||
                respons.status === RessursStatus.FunksjonellFeil ||
                respons.status === RessursStatus.IkkeTilgang
            ) {
                settToast(ToastTyper.FlyttBehandlingTilFakta, {
                    alertType: AlertType.Warning,
                    tekst: 'Flytting av behandling tilbake til fakta feilet',
                });
            }
        });
    };

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    settVisSettBehandlingTilbakeTilFaktaModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanSetteTilbakeTilFakta}
            >
                Sett behandling tilbake til fakta
            </BehandlingsMenyButton>

            <SettBehandlingTilbakeTilFaktaModal
                isOpen={visSettBehandlingTilbakeTilFaktaModal}
                onConfirm={settBehandlingTilbakeTilFakta}
                onCancel={lukkSettBehandlingTilbakeTilFaktaModal}
            />
        </>
    );
};

export default SettBehandlingTilbakeTilFakta;
