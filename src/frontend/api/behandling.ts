import type { ManuellBrevmottakerResponsDto } from '../generated';
import type {
    FaktaStegPayload,
    FatteVedtakStegPayload,
    ForeldelseStegPayload,
    ForeslåVedtakStegPayload,
    HenleggBehandlingPaylod,
    VergeDto,
    VergeStegPayload,
    VilkårdsvurderingStegPayload,
} from '../typer/api';
import type { Ressurs } from '../typer/ressurs';
import type {
    FaktaResponse,
    ForeldelseResponse,
    VilkårsvurderingResponse,
} from '../typer/tilbakekrevingstyper';
import type { Totrinnkontroll } from '../typer/totrinnTyper';
import type { Beregningsresultat, VedtaksbrevAvsnitt } from '../typer/vedtakTyper';

import { useHttp } from './http/HttpProvider';

export type BehandlingApiHook = {
    gjerFaktaKall: (behandlingId: string) => Promise<Ressurs<FaktaResponse>>;
    gjerInaktiveFaktaKall: (behandlingId: string) => Promise<Ressurs<FaktaResponse[]>>;
    sendInnFakta: (behandlingId: string, payload: FaktaStegPayload) => Promise<Ressurs<string>>;
    gjerForeldelseKall: (behandlingId: string) => Promise<Ressurs<ForeldelseResponse>>;
    sendInnForeldelse: (
        behandlingId: string,
        payload: ForeldelseStegPayload
    ) => Promise<Ressurs<string>>;
    gjerVilkårsvurderingKall: (behandlingId: string) => Promise<Ressurs<VilkårsvurderingResponse>>;
    sendInnVilkårsvurdering: (
        behandlingId: string,
        payload: VilkårdsvurderingStegPayload
    ) => Promise<Ressurs<string>>;
    gjerVedtaksbrevteksterKall: (behandlingId: string) => Promise<Ressurs<VedtaksbrevAvsnitt[]>>;
    gjerBeregningsresultatKall: (behandlingId: string) => Promise<Ressurs<Beregningsresultat>>;
    sendInnForeslåVedtak: (
        behandlingId: string,
        payload: ForeslåVedtakStegPayload
    ) => Promise<Ressurs<string>>;
    gjerTotrinnkontrollKall: (behandlingId: string) => Promise<Ressurs<Totrinnkontroll>>;
    sendInnFatteVedtak: (
        behandlingId: string,
        payload: FatteVedtakStegPayload
    ) => Promise<Ressurs<string>>;
    gjerVergeKall: (behandlingId: string) => Promise<Ressurs<VergeDto>>;
    sendInnVerge: (behandlingId: string, payload: VergeStegPayload) => Promise<Ressurs<string>>;
    henleggBehandling: (
        behandlingId: string,
        payload: HenleggBehandlingPaylod
    ) => Promise<Ressurs<string>>;
    fjernManuellBrevmottaker: (
        behandlingId: string,
        brevmottakerId: string
    ) => Promise<Ressurs<string>>;
    hentManuelleBrevmottakere: (
        behandlingId: string
    ) => Promise<Ressurs<ManuellBrevmottakerResponsDto[]>>;
    kallAngreSendTilBeslutter: (behandlingId: string) => Promise<Ressurs<string>>;
    gjerInaktiveVilkårsvurderingerKall: (
        behandlingId: string
    ) => Promise<Ressurs<VilkårsvurderingResponse[]>>;
};

const useBehandlingApi = (): BehandlingApiHook => {
    const behandlingerApiPrefix = '/familie-tilbake/api/behandling';
    const { request } = useHttp();

    const gjerFaktaKall = (behandlingId: string): Promise<Ressurs<FaktaResponse>> => {
        return request<void, FaktaResponse>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/fakta/v1`,
        });
    };

    const gjerInaktiveFaktaKall = (behandlingId: string): Promise<Ressurs<FaktaResponse[]>> => {
        return request<void, FaktaResponse[]>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/fakta/inaktiv`,
        });
    };

    const sendInnFakta = (
        behandlingId: string,
        payload: FaktaStegPayload
    ): Promise<Ressurs<string>> => {
        return request<FaktaStegPayload, string>({
            method: 'POST',
            url: `${behandlingerApiPrefix}/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    const gjerForeldelseKall = (behandlingId: string): Promise<Ressurs<ForeldelseResponse>> => {
        return request<void, ForeldelseResponse>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/foreldelse/v1`,
        });
    };

    const sendInnForeldelse = (
        behandlingId: string,
        payload: ForeldelseStegPayload
    ): Promise<Ressurs<string>> => {
        return request<ForeldelseStegPayload, string>({
            method: 'POST',
            url: `${behandlingerApiPrefix}/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    const gjerVilkårsvurderingKall = (
        behandlingId: string
    ): Promise<Ressurs<VilkårsvurderingResponse>> => {
        return request<void, VilkårsvurderingResponse>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/vilkarsvurdering/v1`,
        });
    };

    const gjerInaktiveVilkårsvurderingerKall = (
        behandlingId: string
    ): Promise<Ressurs<VilkårsvurderingResponse[]>> => {
        return request<void, VilkårsvurderingResponse[]>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/vilkarsvurdering/inaktiv`,
        });
    };

    const sendInnVilkårsvurdering = async (
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
    ): Promise<Ressurs<Beregningsresultat>> => {
        return request<void, Beregningsresultat>({
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

    const gjerTotrinnkontrollKall = (behandlingId: string): Promise<Ressurs<Totrinnkontroll>> => {
        return request<void, Totrinnkontroll>({
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

    const gjerVergeKall = (behandlingId: string): Promise<Ressurs<VergeDto>> => {
        return request<void, VergeDto>({
            method: 'GET',
            url: `/familie-tilbake/api/behandling/v1/${behandlingId}/verge`,
        });
    };

    const fjernManuellBrevmottaker = (
        behandlingId: string,
        brevmottakerId: string
    ): Promise<Ressurs<string>> => {
        return request<void, string>({
            method: 'DELETE',
            url: `/familie-tilbake/api/brevmottaker/manuell/${behandlingId}/${brevmottakerId}`,
        });
    };

    const hentManuelleBrevmottakere = (
        behandlingId: string
    ): Promise<Ressurs<ManuellBrevmottakerResponsDto[]>> => {
        return request<void, ManuellBrevmottakerResponsDto[]>({
            method: 'GET',
            url: `/familie-tilbake/api/brevmottaker/manuell/${behandlingId}`,
        });
    };

    const sendInnVerge = (
        behandlingId: string,
        payload: VergeStegPayload
    ): Promise<Ressurs<string>> => {
        return request<VergeStegPayload, string>({
            method: 'POST',
            url: `/familie-tilbake/api/behandling/${behandlingId}/steg/v1`,
            data: payload,
        });
    };

    const henleggBehandling = (
        behandlingId: string,
        payload: HenleggBehandlingPaylod
    ): Promise<Ressurs<string>> => {
        return request<HenleggBehandlingPaylod, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/henlegg/v1`,
            data: payload,
        });
    };

    const kallAngreSendTilBeslutter = (behandlingId: string): Promise<Ressurs<string>> => {
        return request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/angre-send-til-beslutter`,
        });
    };

    return {
        gjerFaktaKall,
        gjerInaktiveFaktaKall,
        sendInnFakta,
        gjerForeldelseKall,
        sendInnForeldelse,
        gjerVilkårsvurderingKall,
        sendInnVilkårsvurdering,
        gjerVedtaksbrevteksterKall,
        gjerBeregningsresultatKall,
        sendInnForeslåVedtak,
        gjerTotrinnkontrollKall,
        sendInnFatteVedtak,
        gjerVergeKall,
        sendInnVerge,
        henleggBehandling,
        fjernManuellBrevmottaker,
        hentManuelleBrevmottakere,
        kallAngreSendTilBeslutter,
        gjerInaktiveVilkårsvurderingerKall,
    };
};

export { useBehandlingApi };
