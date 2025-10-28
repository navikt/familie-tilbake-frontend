import type { Skjema } from '../../../../hooks/skjema';
import type { Behandling, Behandlingårsak } from '../../../../typer/behandling';
import type { RefObject } from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import { useFelt, useSkjema } from '../../../../hooks/skjema';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { useFagsakStore } from '../../../../stores/fagsakStore';
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
    sendInn: () => void;
    nullstillSkjema: () => void;
};

const useRevurderSkjema = (
    behandlingId: Behandling['behandlingId'],
    dialogRef: RefObject<HTMLDialogElement | null>
): RevurderSkjemaHook => {
    const { nullstillIkkePersisterteKomponenter } = useBehandling();
    const { ytelsestype, eksternFagsakId, fagsystem } = useFagsakStore();
    const { utførRedirect } = useRedirectEtterLagring();

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
        if (kanSendeSkjema() && fagsystem && eksternFagsakId && ytelsestype) {
            nullstillIkkePersisterteKomponenter();
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
                    if (response.status === RessursStatus.Suksess) {
                        utførRedirect(
                            `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${response.data}`
                        );
                        dialogRef.current?.close();
                    }
                }
            );
        }
    };

    return { skjema, sendInn, nullstillSkjema };
};

export { useRevurderSkjema };
