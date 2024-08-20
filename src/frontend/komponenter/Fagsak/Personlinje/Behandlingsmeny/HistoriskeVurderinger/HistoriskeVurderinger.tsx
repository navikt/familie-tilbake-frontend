import * as React from 'react';

import { useNavigate } from 'react-router-dom';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { ToggleName } from '../../../../../context/toggles';
import { useToggles } from '../../../../../context/TogglesContext';
import { IBehandling } from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import { BehandlingsMenyButton } from '../../../../Felleskomponenter/Flytelementer';
interface IProps {
    behandling: IBehandling;
    fagsak: IFagsak;
    onListElementClick: () => void;
}

const HistoriskeVurderinger: React.FC<IProps> = ({ behandling, fagsak, onListElementClick }) => {
    const { behandlingILesemodus } = useBehandling();
    const navigate = useNavigate();
    const { toggles } = useToggles();
    return (
        toggles[ToggleName.seHistoriskeVurderinger] &&
        behandling.kanEndres &&
        !behandlingILesemodus && (
            <>
                <BehandlingsMenyButton
                    variant="tertiary"
                    onClick={() => {
                        onListElementClick();
                        navigate(
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
