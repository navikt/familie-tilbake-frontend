import { useState } from 'react';

import { useHttp } from '@navikt/familie-http';
import { useSkjema, useFelt, type FeltState, feil, ok } from '../../../../hooks/skjema';

import { useBehandling } from '../../../../context/BehandlingContext';
import { IRestSettPåVent } from '../../../../typer/api';
import { IBehandlingsstegstilstand, Venteårsak } from '../../../../typer/behandling';
import { isEmpty, validerGyldigDato } from '../../../../utils';
import { dateTilIsoDatoString, isoStringTilDate } from '../../../../utils/dato';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';

export const usePåVentBehandling = (
    lukkModal: () => void,
    ventegrunn?: IBehandlingsstegstilstand | undefined
) => {
    const [feilmelding, settFeilmelding] = useState<string>();
    const { request } = useHttp();
    const { nullstillIkkePersisterteKomponenter } = useBehandling();

    const { onSubmit, skjema, nullstillSkjema, kanSendeSkjema } = useSkjema<
        {
            tidsfrist: Date | undefined;
            årsak: Venteårsak | '';
        },
        string
    >({
        felter: {
            tidsfrist: useFelt<Date | undefined>({
                verdi: undefined,
                valideringsfunksjon: (felt: FeltState<Date | undefined>) => {
                    return isEmpty(felt.verdi)
                        ? feil(felt, 'Du må velge en tidsfrist')
                        : validerGyldigDato(felt);
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

    const [forrigeVentegrunn, settForrigeVentegrunn] = useState<
        IBehandlingsstegstilstand | undefined
    >();

    if (ventegrunn !== forrigeVentegrunn) {
        settForrigeVentegrunn(ventegrunn);
        skjema.felter.tidsfrist.validerOgSettFelt(
            ventegrunn?.tidsfrist ? isoStringTilDate(ventegrunn.tidsfrist) : undefined
        );
    }

    const tilbakestillFelterTilDefault = () => {
        nullstillSkjema();
        skjema.felter.tidsfrist.validerOgSettFelt(
            ventegrunn?.tidsfrist ? isoStringTilDate(ventegrunn.tidsfrist) : undefined
        );
    };

    const onBekreft = (behandlingId: string) => {
        if (kanSendeSkjema() && skjema.felter.årsak.verdi && skjema.felter.tidsfrist.verdi) {
            nullstillIkkePersisterteKomponenter();
            onSubmit<IRestSettPåVent>(
                {
                    method: 'PUT',
                    data: {
                        venteårsak: skjema.felter.årsak.verdi,
                        tidsfrist: dateTilIsoDatoString(skjema.felter.tidsfrist.verdi),
                    },
                    url: `/familie-tilbake/api/behandling/${behandlingId}/vent/v1`,
                },
                () => {
                    if (ventegrunn) {
                        ventegrunn.tidsfrist = dateTilIsoDatoString(skjema.felter.tidsfrist.verdi);
                        ventegrunn.venteårsak = skjema.felter.årsak.verdi as Venteårsak;
                    }
                    lukkModal();
                },
                (response: Ressurs<string>) => {
                    if (
                        response.status === RessursStatus.FEILET ||
                        response.status === RessursStatus.FUNKSJONELL_FEIL
                    ) {
                        settFeilmelding(response.frontendFeilmelding);
                    }
                }
            );
        }
    };

    const onOkTaAvVent = (behandlingId: string) => {
        nullstillIkkePersisterteKomponenter();
        request<void, string>({
            method: 'PUT',
            url: `/familie-tilbake/api/behandling/${behandlingId}/gjenoppta/v1`,
        }).then((response: Ressurs<string>) => {
            if (response.status === RessursStatus.SUKSESS) {
                lukkModal();
            } else {
                if (
                    response.status === RessursStatus.FEILET ||
                    response.status === RessursStatus.FUNKSJONELL_FEIL
                ) {
                    settFeilmelding(response.frontendFeilmelding);
                }
            }
        });
    };

    return {
        skjema,
        feilmelding,
        nullstillSkjema,
        onBekreft,
        onOkTaAvVent,
        tilbakestillFelterTilDefault,
    };
};
