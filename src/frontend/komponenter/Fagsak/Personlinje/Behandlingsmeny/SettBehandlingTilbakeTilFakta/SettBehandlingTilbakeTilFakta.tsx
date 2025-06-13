import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

import * as React from 'react';
import { useState } from 'react';

import SettBehandlingTilbakeTilFaktaModal from './SettBehandlingTilbakeTilFaktaModal';
import { useSettBehandlingTilbakeTilFakta } from './useSettBehandlingTilbakeTilFakta';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { RessursStatus } from '../../../../../typer/ressurs';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
import { FeilModal } from '../../../../Felleskomponenter/Modal/Feil/FeilModal';

interface Props {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

export const SettBehandlingTilbakeTilFakta: React.FC<Props> = ({
    behandling,
    fagsak,
    onListElementClick,
}) => {
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const [visModal, setVisModal] = useState(false);
    const mutation = useSettBehandlingTilbakeTilFakta();

    const handleResettBehandling = () => {
        nullstillIkkePersisterteKomponenter();
        mutation.mutate(behandling.behandlingId, {
            onSuccess: ressurs => {
                if (ressurs.status === RessursStatus.Suksess) {
                    hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                        utførRedirect(
                            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                        );
                        window.location.reload();
                    });
                }
            },
            onError: () => setVisModal(false),
        });
    };

    return (
        <>
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    setVisModal(true);
                    onListElementClick();
                }}
                disabled={!behandling.kanSetteTilbakeTilFakta}
            >
                Sett behandling tilbake til fakta
            </BehandlingsMenyButton>

            {visModal && (
                <SettBehandlingTilbakeTilFaktaModal
                    onConfirm={handleResettBehandling}
                    onCancel={() => setVisModal(false)}
                />
            )}

            {mutation.isError && (
                <FeilModal
                    feil={mutation.error}
                    lukkFeilModal={mutation.reset}
                    behandlingId={behandling.behandlingId}
                    fagsakId={fagsak.eksternFagsakId}
                />
            )}
        </>
    );
};
