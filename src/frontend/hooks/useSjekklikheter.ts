import { useState, useCallback } from 'react';
import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

const useSjekkLikhetPerioder = (behandlingId: string) => {
    const [result, setResult] = useState<Ressurs<boolean>>({ status: RessursStatus.IKKE_HENTET });
    const { request } = useHttp();

    const hentSjekkLikhetPerioder = useCallback(() => {
        setResult({ status: RessursStatus.HENTER });

        request<void, boolean>({
            method: 'GET',
            url: `/familie-tilbake/api/dokument/sjekk-likhet-perioder/${behandlingId}`,
        })
            .then((response: Ressurs<boolean>) => {
                setResult(response);
            })
            .catch((error: Error) => {
                setResult({
                    status: RessursStatus.FEILET,
                    frontendFeilmelding: error.message,
                });
            });
    }, [behandlingId, request]);

    return { result, hentSjekkLikhetPerioder };
};

export default useSjekkLikhetPerioder;
