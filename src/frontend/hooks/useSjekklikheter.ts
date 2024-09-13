import { useState, useCallback } from 'react';
import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

const useSjekkLikhetPerioder = (behandlingId: string) => {
    const [erPerioderLike, settErPerioderLike] = useState<boolean>(false);
    const { request } = useHttp();

    const hentSjekkLikhetPerioder = useCallback(() => {
        request<void, boolean>({
            method: 'GET',
            url: `/familie-tilbake/api/dokument/sjekk-likhet-perioder/${behandlingId}`,
        })
            .then((response: Ressurs<boolean>) => {
                if (response.status === RessursStatus.SUKSESS) {
                    settErPerioderLike(response.data);
                } else {
                    settErPerioderLike(false);
                }
            })
            .catch(() => {
                settErPerioderLike(false);
            });
    }, [behandlingId, request]);

    return { erPerioderLike, hentSjekkLikhetPerioder };
};

export default useSjekkLikhetPerioder;
