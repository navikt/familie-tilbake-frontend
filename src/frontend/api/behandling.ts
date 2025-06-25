import type {
    FaktaStegPayload,
    FatteVedtakStegPayload,
    ForeldelseStegPayload,
    ForeslåVedtakStegPayload,
    HenleggBehandlingPaylod,
    ManuellBrevmottakerResponseDto,
    VergeDto,
    VergeStegPayload,
    VilkårdsvurderingStegPayload,
} from '../typer/api';
import type {
    IFeilutbetalingFakta,
    IFeilutbetalingForeldelse,
    IFeilutbetalingVilkårsvurdering,
} from '../typer/feilutbetalingtyper';
import type { Ressurs } from '../typer/ressurs';
import type { ITotrinnkontroll } from '../typer/totrinnTyper';
import type { IBeregningsresultat, VedtaksbrevAvsnitt } from '../typer/vedtakTyper';

import { useHttp } from './http/HttpProvider';

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

    const gjerFeilutbetalingInaktiveFaktaKall = (
        behandlingId: string
    ): Promise<Ressurs<IFeilutbetalingFakta[]>> => {
        return request<void, IFeilutbetalingFakta[]>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/fakta/inaktiv`,
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

    const gjerFeilutbetalingInaktiveVilkårsvurderingerKall = (
        behandlingId: string
    ): Promise<Ressurs<IFeilutbetalingVilkårsvurdering[]>> => {
        return request<void, IFeilutbetalingVilkårsvurdering[]>({
            method: 'GET',
            url: `${behandlingerApiPrefix}/${behandlingId}/vilkarsvurdering/inaktiv`,
        });
    };

    const sendInnFeilutbetalingVilkårsvurdering = async (
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
    ): Promise<Ressurs<ManuellBrevmottakerResponseDto[]>> => {
        return request<void, ManuellBrevmottakerResponseDto[]>({
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

    const henleggBehandling = (behandlingId: string, payload: HenleggBehandlingPaylod) => {
        return request<HenleggBehandlingPaylod, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/henlegg/v1`,
            data: payload,
        });
    };

    const kallAngreSendTilBeslutter = (behandlingId: string) => {
        return request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/angre-send-til-beslutter`,
        });
    };

    return {
        gjerFeilutbetalingFaktaKall,
        gjerFeilutbetalingInaktiveFaktaKall,
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
        gjerVergeKall,
        sendInnVerge,
        henleggBehandling,
        fjernManuellBrevmottaker,
        hentManuelleBrevmottakere,
        kallAngreSendTilBeslutter,
        gjerFeilutbetalingInaktiveVilkårsvurderingerKall,
    };
};

export { useBehandlingApi };
