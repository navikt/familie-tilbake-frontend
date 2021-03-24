import { useState } from 'react';

import { useSkjema, useFelt, FeltState, feil, ok } from '@navikt/familie-skjema';
import { Ressurs, RessursStatus } from '@navikt/familie-typer';

import { IBehandlingsstegstilstand, Venteårsak } from '../../../../typer/behandling';

export const usePåVentBehandling = (
    lukkModal: (suksess: boolean) => void,
    ventegrunn?: IBehandlingsstegstilstand | undefined
) => {
    const [feilmelding, settFeilmelding] = useState<string>();

    const { onSubmit, skjema, nullstillSkjema } = useSkjema<
        {
            tidsfrist: string | '';
            årsak: Venteårsak | '';
        },
        string
    >({
        felter: {
            tidsfrist: useFelt<string | ''>({
                verdi: ventegrunn?.tidsfrist ? ventegrunn.tidsfrist : '',
                valideringsfunksjon: (felt: FeltState<string | ''>) => {
                    return felt.verdi !== '' ? ok(felt) : feil(felt, 'Du må velge en tidsfrist');
                },
            }),
            årsak: useFelt<Venteårsak | ''>({
                verdi: ventegrunn?.venteårsak ? ventegrunn.venteårsak : '',
                valideringsfunksjon: (felt: FeltState<Venteårsak | ''>) =>
                    felt.verdi !== '' ? ok(felt) : feil(felt, 'Du må velge årsak'),
            }),
        },
        skjemanavn: 'påventbehandling',
    });

    const onBekreft = (behandlingId: string) => {
        onSubmit(
            {
                method: 'PUT',
                data: {
                    behandlingId: behandlingId,
                    årsak: skjema.felter.årsak.verdi,
                    tidsfrist: skjema.felter.tidsfrist.verdi,
                },
                url: `/familie-tilbake/api/behandling/vent/v1`,
            },
            (ressurs: Ressurs<string>) => {
                if (ressurs.status === RessursStatus.SUKSESS) {
                    if (ventegrunn) {
                        ventegrunn.tidsfrist = skjema.felter.tidsfrist.verdi;
                        // @ts-ignore
                        ventegrunn.venteårsak = skjema.felter.årsak.verdi;
                    }
                    lukkModal(true);
                } else {
                    console.log('Sett på vent feilet!');
                    if (
                        ressurs.status === RessursStatus.FEILET ||
                        ressurs.status === RessursStatus.FUNKSJONELL_FEIL
                    ) {
                        settFeilmelding(ressurs.frontendFeilmelding);
                    }
                }
            }
        );
    };

    return {
        skjema,
        feilmelding,
        nullstillSkjema,
        onBekreft,
    };
};
