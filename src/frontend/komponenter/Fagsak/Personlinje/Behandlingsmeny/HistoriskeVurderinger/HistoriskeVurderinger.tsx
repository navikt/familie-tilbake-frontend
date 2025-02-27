import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

import * as React from 'react';

import { useApp } from '../../../../../context/AppContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { ToggleName } from '../../../../../context/toggles';
import { useToggles } from '../../../../../context/TogglesContext';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const HistoriskeVurderinger: React.FC<IProps> = ({ behandling, fagsak, onListElementClick }) => {
    const { behandlingILesemodus } = useBehandling();
    const { innloggetSaksbehandler } = useApp();
    const { toggles } = useToggles();
    const harTilgang =
        behandling.kanEndres &&
        !behandlingILesemodus &&
        innloggetSaksbehandler &&
        behandling.ansvarligSaksbehandler === innloggetSaksbehandler.navIdent;
    return (
        toggles[ToggleName.SeHistoriskeVurderinger] &&
        harTilgang && (
            <>
                <BehandlingsMenyButton
                    variant="tertiary"
                    onClick={() => {
                        onListElementClick();
                        window.open(
                            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/inaktiv`
                        );
                    }}
                    disabled={!behandling.kanEndres || behandlingILesemodus}
                >
                    Se historiske vurderinger
                </BehandlingsMenyButton>
            </>
        )
    );
};

export default HistoriskeVurderinger;
