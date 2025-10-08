import type { Behandling } from '../../../../../typer/behandling';

import { Dropdown } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import SettBehandlingTilbakeTilFaktaModal from './SettBehandlingTilbakeTilFaktaModal';
import { useSettBehandlingTilbakeTilFakta } from './useSettBehandlingTilbakeTilFakta';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { useFagsakStore } from '../../../../../stores/fagsakStore';
import { RessursStatus } from '../../../../../typer/ressurs';
import { FeilModal } from '../../../../Felleskomponenter/Modal/Feil/FeilModal';

type Props = {
    behandling: Behandling;
};

export const SettBehandlingTilbakeTilFakta: React.FC<Props> = ({ behandling }) => {
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();
    const { utførRedirect } = useRedirectEtterLagring();
    const { fagsystem, eksternFagsakId } = useFagsakStore();
    const [visModal, setVisModal] = useState(false);
    const mutation = useSettBehandlingTilbakeTilFakta();

    const handleResettBehandling = (): void => {
        nullstillIkkePersisterteKomponenter();
        mutation.mutate(behandling.behandlingId, {
            onSuccess: ressurs => {
                if (ressurs.status === RessursStatus.Suksess && fagsystem && eksternFagsakId) {
                    hentBehandlingMedBehandlingId(behandling.behandlingId).then(() => {
                        utførRedirect(
                            `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`
                        );
                        window.location.reload();
                    });
                }
            },
            onError: () => setVisModal(false),
        });
    };

    return (
        <Dropdown.Menu.List.Item
            onClick={() => setVisModal(true)}
            disabled={!behandling.kanSetteTilbakeTilFakta}
        >
            Sett behandling tilbake til fakta
            {visModal && (
                <SettBehandlingTilbakeTilFaktaModal
                    onConfirm={handleResettBehandling}
                    onCancel={() => setVisModal(false)}
                />
            )}
            {mutation.isError && eksternFagsakId && (
                <FeilModal
                    feil={mutation.error}
                    lukkFeilModal={mutation.reset}
                    behandlingId={behandling.behandlingId}
                    fagsakId={eksternFagsakId}
                />
            )}
        </Dropdown.Menu.List.Item>
    );
};
