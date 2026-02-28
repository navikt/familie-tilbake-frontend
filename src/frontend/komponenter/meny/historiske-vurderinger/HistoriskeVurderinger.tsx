import type { FC } from 'react';

import { ClockDashedIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';

import { useApp } from '~/context/AppContext';
import { useBehandling } from '~/context/BehandlingContext';
import { useFagsak } from '~/context/FagsakContext';

export const HistoriskeVurderinger: FC = () => {
    const { eksternBrukId, ansvarligSaksbehandler } = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();

    const { innloggetSaksbehandler } = useApp();
    const harTilgang =
        innloggetSaksbehandler && ansvarligSaksbehandler === innloggetSaksbehandler.navIdent;
    return (
        harTilgang && (
            <ActionMenu.Item
                className="text-xl cursor-pointer"
                as="a"
                href={`/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${eksternBrukId}/inaktiv`}
                icon={<ClockDashedIcon aria-hidden />}
            >
                <span className="ml-1">Se historiske vurderinger</span>
            </ActionMenu.Item>
        )
    );
};
