import type { Skjema } from '../../../../hooks/skjema';
import type { Behandlingårsak } from '../../../../typer/behandling';

import { useBehandling } from '../../../../context/BehandlingContext';
import { useFelt, useSkjema } from '../../../../hooks/skjema';
import { useRedirectEtterLagring } from '../../../../hooks/useRedirectEtterLagring';
import { useFagsakStore } from '../../../../stores/fagsakStore';
import { Behandlingstype } from '../../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import { erFeltetEmpty } from '../../../../utils';

type OpprettBehandlingSkjemaHook = {
    skjema: Skjema<
        {
            behandlingstype: Behandlingstype;
            behandlingsårsak: Behandlingårsak | '';
        },
        string
    >;
    sendInn: () => void;
    nullstillSkjema: () => void;
};

const useOpprettBehandlingSkjema = (behandlingId: string): OpprettBehandlingSkjemaHook => {
    const { nullstillIkkePersisterteKomponenter } = useBehandling();
    const { ytelsestype, eksternFagsakId, fagsystem } = useFagsakStore();
    const { utførRedirect } = useRedirectEtterLagring();
    const { skjema, kanSendeSkjema, onSubmit, nullstillSkjema } = useSkjema<
        {
            behandlingstype: Behandlingstype;
            behandlingsårsak: Behandlingårsak | '';
        },
        string
    >({
        felter: {
            behandlingstype: useFelt<Behandlingstype>({
                verdi: Behandlingstype.RevurderingTilbakekreving,
            }),
            behandlingsårsak: useFelt<Behandlingårsak | ''>({
                feltId: 'behandlingsårsak',
                verdi: '',
                valideringsfunksjon: erFeltetEmpty,
            }),
        },
        skjemanavn: 'opprettBehandling',
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
                    }
                }
            );
        }
    };

    return { skjema, sendInn, nullstillSkjema };
};

export { useOpprettBehandlingSkjema };
