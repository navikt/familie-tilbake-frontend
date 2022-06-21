import { useHttp } from '@navikt/familie-http';
import { Ressurs } from '@navikt/familie-typer';

import {
    BrevPayload,
    ForhåndsvisHenleggelsesbrevPayload,
    ForhåndsvisVedtaksbrev,
    Fritekstavsnitt,
} from '../typer/api';

const useDokumentApi = () => {
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
            url: `${dokumentApiPrefix}/forhandsvis`,
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
