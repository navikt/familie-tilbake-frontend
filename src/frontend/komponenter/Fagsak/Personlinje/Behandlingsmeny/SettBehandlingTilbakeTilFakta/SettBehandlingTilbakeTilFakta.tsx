import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

import * as React from 'react';
import { useState } from 'react';

import { FeilModal } from './FeilModal';
import SettBehandlingTilbakeTilFaktaModal from './SettBehandlingTilbakeTilFaktaModal';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { useSettBehandlingTilbakeTilFakta } from '../../../../../hooks/useSettBehandlingTilbakeTilFakta';
import { RessursStatus } from '../../../../../typer/ressurs';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';

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
    const [visFeilModal, setVisFeilModal] = useState(false);
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
            onError: () => {
                setVisModal(false);
                setVisFeilModal(true);
            },
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

            <SettBehandlingTilbakeTilFaktaModal
                isOpen={visModal}
                onConfirm={handleResettBehandling}
                onCancel={() => setVisModal(false)}
            />

            <FeilModal
                setVisFeilModal={setVisFeilModal}
                erSynlig={visFeilModal}
                feilmelding={mutation.error?.message}
                httpStatusCode={
                    mutation.error &&
                    'status' in mutation.error &&
                    mutation.error.status &&
                    typeof mutation.error.status === 'number'
                        ? mutation.error.status
                        : 500
                }
                behandlingId={behandling.behandlingId}
                fagsakId={fagsak.eksternFagsakId}
            />
        </>
    );
};
