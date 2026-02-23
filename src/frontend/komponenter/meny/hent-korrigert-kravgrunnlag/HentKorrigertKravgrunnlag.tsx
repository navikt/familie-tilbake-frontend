import { HddUpIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { useApp } from '~/context/AppContext';
import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import { AlertType, ToastTyper } from '~/komponenter/toast/typer';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';
import { useStegNavigering } from '~/utils/sider';

export const HentKorrigertKravgrunnlag: React.FC = () => {
    const { behandlingId } = useBehandling();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const { request } = useHttp();
    const { settToast } = useApp();
    const queryClient = useQueryClient();
    const navigerTilBehandling = useStegNavigering();
    const hentKorrigertKravgrunnlag = (): void => {
        nullstillIkkePersisterteKomponenter();
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/forvaltning/behandling/${behandlingId}/kravgrunnlag/v1`,
        }).then(async (respons: Ressurs<string>) => {
            if (respons.status === RessursStatus.Suksess) {
                settToast(ToastTyper.KravgrunnlaHentet, {
                    alertType: AlertType.Info,
                    tekst: 'Hentet korrigert kravgrunnlag',
                });

                await queryClient.invalidateQueries({
                    queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandlingId } }),
                });
                navigerTilBehandling();
            } else if (
                respons.status === RessursStatus.Feilet ||
                respons.status === RessursStatus.FunksjonellFeil ||
                respons.status === RessursStatus.IkkeTilgang
            ) {
                settToast(ToastTyper.KravgrunnlaHentet, {
                    alertType: AlertType.Warning,
                    tekst: 'Henting av korrigert kravgrunnlag feilet',
                });
            }
        });
    };

    return (
        <ActionMenu.Item
            onSelect={hentKorrigertKravgrunnlag}
            className="text-xl cursor-pointer"
            icon={<HddUpIcon aria-hidden />}
        >
            <span className="ml-1">Hent korrigert kravgrunnlag</span>
        </ActionMenu.Item>
    );
};
