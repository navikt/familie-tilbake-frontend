import type { Behandling } from '../../../../../typer/behandling';

import * as React from 'react';

import { useApp } from '../../../../../context/AppContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { ToggleName } from '../../../../../context/toggles';
import { useToggles } from '../../../../../context/TogglesContext';
import { useFagsakStore } from '../../../../../stores/fagsakStore';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';

type Props = {
    behandling: Behandling;
    onListElementClick: () => void;
};

const HistoriskeVurderinger: React.FC<Props> = ({ behandling, onListElementClick }) => {
    const { behandlingILesemodus } = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsakStore();

    const { innloggetSaksbehandler } = useApp();
    const { toggles } = useToggles();
    const harTilgang =
        behandling.kanEndres &&
        !behandlingILesemodus &&
        innloggetSaksbehandler &&
        behandling.ansvarligSaksbehandler === innloggetSaksbehandler.navIdent;
    return (
        toggles[ToggleName.SeHistoriskeVurderinger] &&
        harTilgang &&
        fagsystem &&
        eksternFagsakId && (
            <BehandlingsMenyButton
                variant="tertiary"
                onClick={() => {
                    onListElementClick();
                    window.open(
                        `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/inaktiv`
                    );
                }}
                disabled={!behandling.kanEndres || behandlingILesemodus}
            >
                Se historiske vurderinger
            </BehandlingsMenyButton>
        )
    );
};

export default HistoriskeVurderinger;
