import type { Behandling } from '../../../../typer/behandling';

import { ClockDashedIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import * as React from 'react';

import { useApp } from '../../../../context/AppContext';
import { useFagsak } from '../../../../context/FagsakContext';

type Props = {
    behandling: Behandling;
};

export const HistoriskeVurderinger: React.FC<Props> = ({ behandling }) => {
    const { fagsystem, eksternFagsakId } = useFagsak();

    const { innloggetSaksbehandler } = useApp();
    const harTilgang =
        innloggetSaksbehandler &&
        behandling.ansvarligSaksbehandler === innloggetSaksbehandler.navIdent;
    return (
        harTilgang &&
        fagsystem &&
        eksternFagsakId && (
            <ActionMenu.Item
                className="text-xl cursor-pointer"
                as="a"
                href={`/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/inaktiv`}
                icon={<ClockDashedIcon aria-hidden />}
            >
                <span className="ml-1">Se historiske vurderinger</span>
            </ActionMenu.Item>
        )
    );
};
