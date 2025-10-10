import type { Behandling } from '../../../../typer/behandling';

import { Dropdown } from '@navikt/ds-react';
import * as React from 'react';

import { useApp } from '../../../../context/AppContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { ToggleName } from '../../../../context/toggles';
import { useToggles } from '../../../../context/TogglesContext';
import { useFagsakStore } from '../../../../stores/fagsakStore';

type Props = {
    behandling: Behandling;
};

export const HistoriskeVurderinger: React.FC<Props> = ({ behandling }) => {
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
            <Dropdown.Menu.List.Item
                onClick={() =>
                    window.open(
                        `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/inaktiv`
                    )
                }
                disabled={!behandling.kanEndres || behandlingILesemodus}
            >
                Se historiske vurderinger
            </Dropdown.Menu.List.Item>
        )
    );
};
