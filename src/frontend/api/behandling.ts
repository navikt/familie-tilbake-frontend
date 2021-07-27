import { useHttp } from '@navikt/familie-http';
import { Ressurs } from '@navikt/familie-typer';

import {
    FaktaStegPayload,
    FatteVedtakStegPayload,
    ForeldelseStegPayload,
    ForeslåVedtakStegPayload,
    VilkårdsvurderingStegPayload,
} from '../typer/api';
import {
    IFeilutbetalingFakta,
    IFeilutbetalingForeldelse,
    IFeilutbetalingVilkårsvurdering,
} from '../typer/feilutbetalingtyper';
import { ITotrinnkontroll } from '../typer/totrinnTyper';
import { IBeregningsresultat, VedtaksbrevAvsnitt } from '../typer/vedtakTyper';

const useBehandlingApi = () => {
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
    ): Promise<Ressurs<string>> => {
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
    ): Promise<Ressurs<string>> => {
        return request<VilkårdsvurderingStegPayload, string>({
            method: 'POST',
            url: `${behandlingerApiPrefix}/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    const gjerVedtaksbrevteksterKall = (
        behandlingId: string
    ): Promise<Ressurs<VedtaksbrevAvsnitt[]>> => {
        return request<void, VedtaksbrevAvsnitt[]>({
            method: 'GET',
            url: `/familie-tilbake/api/dokument/vedtaksbrevtekst/${behandlingId}`,
        });
    };

    const gjerBeregningsresultatKall = (
        behandlingId: string
    ): Promise<Ressurs<IBeregningsresultat>> => {
        return request<void, IBeregningsresultat>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandlingId}/beregn/resultat/v1`,
        });
    };

    const sendInnForeslåVedtak = (
        behandlingId: string,
        payload: ForeslåVedtakStegPayload
    ): Promise<Ressurs<string>> => {
        return request<ForeslåVedtakStegPayload, string>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    const gjerTotrinnkontrollKall = (behandlingId: string): Promise<Ressurs<ITotrinnkontroll>> => {
        return request<void, ITotrinnkontroll>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/${behandlingId}/totrinn/v1`,
        });
    };

    const sendInnFatteVedtak = (
        behandlingId: string,
        payload: FatteVedtakStegPayload
    ): Promise<Ressurs<string>> => {
        return request<FatteVedtakStegPayload, string>({
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
        gjerFeilutbetalingVilkårsvurderingKall,
        sendInnFeilutbetalingVilkårsvurdering,
        gjerVedtaksbrevteksterKall,
        gjerBeregningsresultatKall,
        sendInnForeslåVedtak,
        gjerTotrinnkontrollKall,
        sendInnFatteVedtak,
    };
};

export { useBehandlingApi };
