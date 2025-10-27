import type { Behandling } from '../../../../typer/behandling';

import { ClockDashedIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import * as React from 'react';

import { useApp } from '../../../../context/AppContext';
import { useFagsakStore } from '../../../../stores/fagsakStore';

type Props = {
    behandling: Behandling;
};

export const HistoriskeVurderinger: React.FC<Props> = ({ behandling }) => {
    const { fagsystem, eksternFagsakId } = useFagsakStore();

    const { innloggetSaksbehandler } = useApp();
    const harTilgang =
        innloggetSaksbehandler &&
        behandling.ansvarligSaksbehandler === innloggetSaksbehandler.navIdent;
    return (
        harTilgang &&
        fagsystem &&
        eksternFagsakId && (
            <ActionMenu.Item
                className="text-xl"
                as="a"
                href={`/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}/inaktiv`}
                icon={<ClockDashedIcon aria-hidden />}
            >
                Se historiske vurderinger
            </ActionMenu.Item>
        )
    );
};
