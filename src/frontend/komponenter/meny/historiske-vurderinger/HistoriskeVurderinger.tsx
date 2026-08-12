import type { FC } from 'react';

import { ClockDashedIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';

import { useApp } from '@/context/AppContext';
import { useBehandling } from '@/context/BehandlingContext';
import { useFagsak } from '@/context/FagsakContext';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

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
                onSelect={(): void =>
                    sporHendelse(Hendelser.ACTIONMENU_VALG_VALGT, {
                        valgTekst: 'Se historiske vurderinger',
                        komponentId: 'behandlingsmeny',
                        kontekst: Sporingskontekst.Behandling,
                    })
                }
            >
                <span className="ml-1">Se historiske vurderinger</span>
            </ActionMenu.Item>
        )
    );
};
