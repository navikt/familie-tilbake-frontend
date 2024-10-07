import { useCallback, useState } from 'react';
import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

export const useSjekkLikhetPerioder = (behandlingId: string) => {
    const [erPerioderLike, settErPerioderLike] = useState<boolean>(false);
    const { request } = useHttp();

    const hentSjekkLikhetPerioder = useCallback(async (): Promise<boolean> => {
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

    return { erPerioderLike, hentSjekkLikhetPerioder };
};
