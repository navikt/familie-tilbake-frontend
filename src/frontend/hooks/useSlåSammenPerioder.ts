import { useHttp } from '@navikt/familie-http';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';
import { useState } from 'react';

export const useSlåSammenPerioder = (behandlingId: string, skalSammenslaa: boolean) => {
    const { request } = useHttp();
    const [feilmelding, settFeilmelding] = useState<string>();

    const slåSammenPerioder = async () => {
        const response: Ressurs<boolean> = await request<void, boolean>({
            method: 'POST',
            url: `/familie-tilbake/api/perioder/slaa-sammen-perioder/${behandlingId}?skalSammenslaa=${skalSammenslaa}`,
        });

        if (response.status === RessursStatus.SUKSESS) {
            return response.data;
        } else if (
            response.status === RessursStatus.FEILET ||
            response.status === RessursStatus.FUNKSJONELL_FEIL ||
            response.status === RessursStatus.IKKE_TILGANG
        ) {
            settFeilmelding(response.frontendFeilmelding);
        }
    };

    return { slåSammenPerioder, feilmelding };
};
