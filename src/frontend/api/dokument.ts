import type {
    BrevPayload,
    ForhåndsvisHenleggelsesbrevPayload,
    ForhåndsvisVedtaksbrev,
    Fritekstavsnitt,
} from '@typer/api';
import type { Ressurs } from '@typer/ressurs';

import { useHttp } from './http/HttpProvider';

export type DokumentApiHook = {
    bestillBrev: (payload: BrevPayload) => Promise<Ressurs<void>>;
    forhåndsvisBrev: (payload: BrevPayload) => Promise<Ressurs<string>>;
    forhåndsvisVedtaksbrev: (payload: ForhåndsvisVedtaksbrev) => Promise<Ressurs<string>>;
    forhåndsvisHenleggelsesbrev: (
        payload: ForhåndsvisHenleggelsesbrevPayload
    ) => Promise<Ressurs<string>>;
    lagreUtkastVedtaksbrev: (
        behandlingId: string,
        payload: Fritekstavsnitt
    ) => Promise<Ressurs<string>>;
};

const useDokumentApi = (): DokumentApiHook => {
    const dokumentApiPrefix = '/familie-tilbake/api/dokument';
    const { request } = useHttp();

    const bestillBrev = (payload: BrevPayload): Promise<Ressurs<void>> => {
        return request<BrevPayload, void>({
            method: 'POST',
            url: `${dokumentApiPrefix}/bestill`,
            data: payload,
        });
    };

    const forhåndsvisBrev = (payload: BrevPayload): Promise<Ressurs<string>> => {
        return request<BrevPayload, string>({
            method: 'POST',
            url: `${dokumentApiPrefix}/forhandsvis/behandling/${payload.behandlingId}`,
            data: payload,
        });
    };

    const forhåndsvisVedtaksbrev = (payload: ForhåndsvisVedtaksbrev): Promise<Ressurs<string>> => {
        return request<ForhåndsvisVedtaksbrev, string>({
            method: 'POST',
            url: `${dokumentApiPrefix}/forhandsvis-vedtaksbrev`,
            data: payload,
        });
    };

    const forhåndsvisHenleggelsesbrev = (
        payload: ForhåndsvisHenleggelsesbrevPayload
    ): Promise<Ressurs<string>> => {
        return request<ForhåndsvisHenleggelsesbrevPayload, string>({
            method: 'POST',
            url: `${dokumentApiPrefix}/forhandsvis-henleggelsesbrev`,
            data: payload,
        });
    };

    const lagreUtkastVedtaksbrev = (
        behandlingId: string,
        payload: Fritekstavsnitt
    ): Promise<Ressurs<string>> => {
        return request<Fritekstavsnitt, string>({
            method: 'POST',
            url: `${dokumentApiPrefix}/vedtaksbrevtekst/${behandlingId}/utkast`,
            data: payload,
        });
    };

    return {
        bestillBrev,
        forhåndsvisBrev,
        forhåndsvisVedtaksbrev,
        forhåndsvisHenleggelsesbrev,
        lagreUtkastVedtaksbrev,
    };
};

export { useDokumentApi };
