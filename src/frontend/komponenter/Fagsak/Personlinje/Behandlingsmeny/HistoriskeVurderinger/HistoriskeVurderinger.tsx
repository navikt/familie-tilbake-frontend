import * as React from 'react';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { ToggleName } from '../../../../../context/toggles';
import { useToggles } from '../../../../../context/TogglesContext';
import { IBehandling } from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
import { useApp } from '../../../../../context/AppContext';
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
        toggles[ToggleName.seHistoriskeVurderinger] &&
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
