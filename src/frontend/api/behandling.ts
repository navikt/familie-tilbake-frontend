import { useHttp } from '@navikt/familie-http';
import { Ressurs } from '@navikt/familie-typer';

import {
    FaktaStegPayload,
    ForeldelseStegPayload,
    VilkårdsvurderingStegPayload,
} from '../typer/api';
import {
    IFeilutbetalingFakta,
    IFeilutbetalingForeldelse,
    IFeilutbetalingVilkårsvurdering,
} from '../typer/feilutbetalingtyper';

const useApiKall = () => {
    const behandlingerApiPrefix = '/familie-tilbake/api/behandling';
    const { request } = useHttp();

    const gjerFeilutbetalingFaktaKall = (
        behandlingId: string
    ): Promise<Ressurs<IFeilutbetalingFakta>> => {
        return request<void, IFeilutbetalingFakta>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/fakta/v1`,
        });
    };

    const sendInnFeilutbetalingFakta = (
        behandlingId: string,
        payload: FaktaStegPayload
    ): Promise<Ressurs<string>> => {
        return request<FaktaStegPayload, string>({
            method: 'POST',
            url: `${behandlingerApiPrefix}/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    const gjerFeilutbetalingForeldelseKall = (
        behandlingId: string
    ): Promise<Ressurs<IFeilutbetalingForeldelse>> => {
        return request<void, IFeilutbetalingForeldelse>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/foreldelse/v1`,
        });
    };

    const sendInnFeilutbetalingForeldelse = (
        behandlingId: string,
        payload: ForeldelseStegPayload
    ) => {
        return request<ForeldelseStegPayload, string>({
            method: 'POST',
            url: `${behandlingerApiPrefix}/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    const gjerFeilutbetalingVilkårsvurderingKall = (
        behandlingId: string
    ): Promise<Ressurs<IFeilutbetalingVilkårsvurdering>> => {
        return request<void, IFeilutbetalingVilkårsvurdering>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/vilkarsvurdering/v1`,
        });
    };

    const sendInnFeilutbetalingVilkårsvurdering = (
        behandlingId: string,
        payload: VilkårdsvurderingStegPayload
    ) => {
        return request<VilkårdsvurderingStegPayload, string>({
            method: 'POST',
            url: `${behandlingerApiPrefix}/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    return {
        gjerFeilutbetalingFaktaKall,
        sendInnFeilutbetalingFakta,
        gjerFeilutbetalingForeldelseKall,
        sendInnFeilutbetalingForeldelse,
        gjerFeilutbetalingVilkårsvurderingKall,
        sendInnFeilutbetalingVilkårsvurdering,
    };
};

export { useApiKall };
