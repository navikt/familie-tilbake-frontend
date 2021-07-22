import { useHttp } from '@navikt/familie-http';
import { Ressurs } from '@navikt/familie-typer';

import { FaktaStegPayload, ForeldelseStegPayload } from '../typer/api';
import { IFeilutbetalingFakta, IFeilutbetalingForeldelse } from '../typer/feilutbetalingtyper';

const useApiKall = () => {
    const { request } = useHttp();

    const gjerFeilutbetalingFaktaKall = (
        behandlingId: string
    ): Promise<Ressurs<IFeilutbetalingFakta>> => {
        return request<void, IFeilutbetalingFakta>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandlingId}/fakta/v1`,
        });
    };

    const sendInnFeilutbetalingFakta = (
        behandlingId: string,
        payload: FaktaStegPayload
    ): Promise<Ressurs<string>> => {
        return request<FaktaStegPayload, string>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    const gjerFeilutbetalingForeldelseKall = (
        behandlingId: string
    ): Promise<Ressurs<IFeilutbetalingForeldelse>> => {
        return request<void, IFeilutbetalingForeldelse>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandlingId}/foreldelse/v1`,
        });
    };

    const sendInnFeilutbetalingForeldelse = (
        behandlingId: string,
        payload: ForeldelseStegPayload
    ) => {
        return request<ForeldelseStegPayload, string>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    return {
        gjerFeilutbetalingFaktaKall,
        sendInnFeilutbetalingFakta,
        gjerFeilutbetalingForeldelseKall,
        sendInnFeilutbetalingForeldelse,
    };
};

export { useApiKall };
