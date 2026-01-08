import type { Skjema } from '../../../../hooks/skjema';
import type { Behandling, Behandlingårsak } from '../../../../typer/behandling';

import { useState, type RefObject } from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import { useFagsak } from '../../../../context/FagsakContext';
import { useFelt, useSkjema } from '../../../../hooks/skjema';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { Behandlingstype } from '../../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import { erFeltetEmpty } from '../../../../utils';

type RevurderSkjemaHook = {
    skjema: Skjema<
        {
            behandlingstype: Behandlingstype;
            behandlingsårsak: Behandlingårsak | undefined;
        },
        string
    >;
    feilmelding: string | undefined;
    setFeilmelding: (feilmelding: string | undefined) => void;
    sendInn: () => void;
    nullstillSkjema: () => void;
};

const useRevurderSkjema = (
    behandlingId: Behandling['behandlingId'],
    dialogRef: RefObject<HTMLDialogElement | null>
): RevurderSkjemaHook => {
    const { nullstillIkkePersisterteKomponenter } = useBehandling();
    const { fagsystem, eksternFagsakId, ytelsestype } = useFagsak();
    const { utførRedirect } = useRedirectEtterLagring();
    const [feilmelding, setFeilmelding] = useState<string | undefined>(undefined);

    const { skjema, kanSendeSkjema, onSubmit, nullstillSkjema } = useSkjema<
        {
            behandlingstype: Behandlingstype;
            behandlingsårsak: Behandlingårsak | undefined;
        },
        string
    >({
        felter: {
            behandlingstype: useFelt<Behandlingstype>({
                verdi: Behandlingstype.RevurderingTilbakekreving,
            }),
            behandlingsårsak: useFelt<Behandlingårsak | undefined>({
                feltId: 'behandlingsårsak',
                verdi: undefined,
                valideringsfunksjon: erFeltetEmpty,
            }),
        },
        skjemanavn: 'opprettRevurdering',
    });

    const sendInn = (): void => {
        if (kanSendeSkjema() && ytelsestype) {
            nullstillIkkePersisterteKomponenter();
            setFeilmelding(undefined);
            onSubmit(
                {
                    method: 'POST',
                    data: {
                        ytelsestype: ytelsestype,
                        originalBehandlingId: behandlingId,
                        årsakstype: skjema.felter.behandlingsårsak.verdi,
                    },
                    url: '/familie-tilbake/api/behandling/revurdering/v1',
                },
                (response: Ressurs<string>) => {
                    if (response.status === RessursStatus.Suksess && fagsystem && eksternFagsakId) {
                        utførRedirect(
                            `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${response.data}`
                        );
                        dialogRef.current?.close();
                    } else if (
                        response.status === RessursStatus.Suksess &&
                        (!fagsystem || !eksternFagsakId)
                    ) {
                        setFeilmelding(
                            `Mangler ${!fagsystem ? 'fagsystemtype' : ''}${!eksternFagsakId ? 'eksternFagsakId' : ''} for å navigere til den nye opprettede behandlingen.`
                        );
                    }
                }
            );
        } else if (!ytelsestype) {
            setFeilmelding('Kan ikke opprette revurdering uten ytelsestype');
        }
    };

    return {
        skjema,
        sendInn,
        nullstillSkjema,
        feilmelding,
        setFeilmelding,
    };
};

export { useRevurderSkjema };
