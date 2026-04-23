import { useCallback, useState } from 'react';

import { useHttp } from '~/api/http/HttpProvider';
import { useBehandling } from '~/context/BehandlingContext';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';

export type SammenslåttPeriodeHook = {
    hentErPerioderLike: () => Promise<boolean>;
    hentErPerioderSammenslått: () => Promise<boolean>;
    sammenslåPerioder: () => Promise<string | false | undefined>;
    angreSammenslåingAvPerioder: () => Promise<string | false | undefined>;
    erPerioderLike: boolean;
    feilmelding: string | undefined;
    laster: boolean;
};

export const useSammenslåPerioder = (): SammenslåttPeriodeHook => {
    const { request } = useHttp();
    const { behandlingId } = useBehandling();
    const [erPerioderLike, setErPerioderLike] = useState<boolean>(false);
    const [feilmelding, setFeilmelding] = useState<string>();
    const [laster, setLaster] = useState<boolean>(false);

    const hentErPerioderLike = useCallback(async (): Promise<boolean> => {
        const response: Ressurs<boolean> = await request<void, boolean>({
            method: 'GET',
            url: `/familie-tilbake/api/perioder/sjekk-likhet/${behandlingId}`,
        });

        if (response.status === RessursStatus.Suksess) {
            setErPerioderLike(response.data);
            return response.data;
        } else {
            setErPerioderLike(false);
            return false;
        }
    }, [behandlingId, request]);

    const sammenslåPerioder = async (): Promise<string | false | undefined> => {
        setLaster(true);
        const response: Ressurs<string> = await request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/perioder/sammensla/${behandlingId}`,
        });

        if (response.status === RessursStatus.Suksess) {
            setLaster(false);
            return response.data;
        } else if (
            response.status === RessursStatus.Feilet ||
            response.status === RessursStatus.FunksjonellFeil ||
            response.status === RessursStatus.IkkeTilgang
        ) {
            setFeilmelding(response.frontendFeilmelding);
            setLaster(false);
            return false;
        }
    };

    const angreSammenslåingAvPerioder = async (): Promise<string | false | undefined> => {
        setLaster(true);
        const response: Ressurs<string> = await request<void, string>({
            method: 'POST',
            url: `/familie-tilbake/api/perioder/angre-sammenslaing/${behandlingId}`,
        });

        if (response.status === RessursStatus.Suksess) {
            setLaster(false);
            return response.data;
        } else if (
            response.status === RessursStatus.Feilet ||
            response.status === RessursStatus.FunksjonellFeil ||
            response.status === RessursStatus.IkkeTilgang
        ) {
            setFeilmelding(response.frontendFeilmelding);
            setLaster(false);
            return false;
        }
    };

    const hentErPerioderSammenslått = useCallback(async (): Promise<boolean> => {
        const response: Ressurs<boolean> = await request<void, boolean>({
            method: 'GET',
            url: `/familie-tilbake/api/perioder/hent-sammenslatt/${behandlingId}`,
        });

        if (response.status === RessursStatus.Suksess) {
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
