import { useCallback, useState } from 'react';

import { useHttp } from '../api/http/HttpProvider';
import { type Ressurs, RessursStatus } from '../typer/ressurs';

export const useSammenslåPerioder = (behandlingId: string) => {
    const { request } = useHttp();
    const [erPerioderLike, settErPerioderLike] = useState<boolean>(false);
    const [feilmelding, settFeilmelding] = useState<string>();
    const [laster, settLaster] = useState<boolean>(false);

    const hentErPerioderLike = useCallback(async (): Promise<boolean> => {
        const response: Ressurs<boolean> = await request<void, boolean>({
            method: 'GET',
            url: `/familie-tilbake/api/perioder/sjekk-likhet/${behandlingId}`,
        });

        if (response.status === RessursStatus.SUKSESS) {
            settErPerioderLike(response.data);
            return response.data;
        } else {
            settErPerioderLike(false);
            return false;
        }
    }, [behandlingId, request]);

    const sammenslåPerioder = async () => {
        settLaster(true);
        const response: Ressurs<string> = await request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/perioder/sammensla/${behandlingId}`,
        });

        if (response.status === RessursStatus.SUKSESS) {
            settLaster(false);
            return response.data;
        } else if (
            response.status === RessursStatus.FEILET ||
            response.status === RessursStatus.FUNKSJONELL_FEIL ||
            response.status === RessursStatus.IKKE_TILGANG
        ) {
            settFeilmelding(response.frontendFeilmelding);
            settLaster(false);
            return false;
        }
    };

    const angreSammenslåingAvPerioder = async () => {
        settLaster(true);
        const response: Ressurs<string> = await request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/perioder/angre-sammenslaing/${behandlingId}`,
        });

        if (response.status === RessursStatus.SUKSESS) {
            settLaster(false);
            return response.data;
        } else if (
            response.status === RessursStatus.FEILET ||
            response.status === RessursStatus.FUNKSJONELL_FEIL ||
            response.status === RessursStatus.IKKE_TILGANG
        ) {
            settFeilmelding(response.frontendFeilmelding);
            settLaster(false);
            return false;
        }
    };

    const hentErPerioderSammenslått = useCallback(async (): Promise<boolean> => {
        const response: Ressurs<boolean> = await request<void, boolean>({
            method: 'GET',
            url: `/familie-tilbake/api/perioder/hent-sammenslatt/${behandlingId}`,
        });

        if (response.status === RessursStatus.SUKSESS) {
            return response.data;
        } else {
            return false;
        }
    }, [behandlingId, request]);

    return {
        hentErPerioderLike,
        hentErPerioderSammenslått,
        sammenslåPerioder,
        angreSammenslåingAvPerioder,
        erPerioderLike,
        feilmelding,
        laster,
    };
};
