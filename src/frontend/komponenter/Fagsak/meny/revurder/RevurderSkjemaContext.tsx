import type { Skjema } from '../../../../hooks/skjema';
import type { Behandlingårsak } from '../../../../typer/behandling';

import { type RefObject } from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import { useBehandlingState } from '../../../../context/BehandlingStateContext';
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
    sendInn: () => void;
    nullstillSkjema: () => void;
};

const useRevurderSkjema = (dialogRef: RefObject<HTMLDialogElement | null>): RevurderSkjemaHook => {
    const { behandlingId } = useBehandling();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const { fagsystem, eksternFagsakId, ytelsestype } = useFagsak();
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
        if (kanSendeSkjema()) {
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

    return {
        skjema,
        sendInn,
        nullstillSkjema,
    };
};

export { useRevurderSkjema };
