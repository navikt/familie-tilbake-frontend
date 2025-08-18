import type { ISkjema } from '../../../../../hooks/skjema';
import type { Behandlingårsak } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

import { useBehandling } from '../../../../../context/BehandlingContext';
import { useFelt, useSkjema } from '../../../../../hooks/skjema';
import { useRedirectEtterLagring } from '../../../../../hooks/useRedirectEtterLagring';
import { Behandlingstype } from '../../../../../typer/behandling';
import { type Ressurs, RessursStatus } from '../../../../../typer/ressurs';
import { erFeltetEmpty } from '../../../../../utils';

type OpprettBehandlingSkjemaHook = {
    skjema: ISkjema<
        {
            behandlingstype: Behandlingstype;
            behandlingsårsak: Behandlingårsak | '';
        },
        string
    >;
    sendInn: () => void;
    nullstillSkjema: () => void;
};

const useOpprettBehandlingSkjema = (
    fagsak: IFagsak,
    behandlingId: string,
    lukkModal: (_vis: boolean) => void
): OpprettBehandlingSkjemaHook => {
    const { nullstillIkkePersisterteKomponenter } = useBehandling();
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
        if (kanSendeSkjema()) {
            nullstillIkkePersisterteKomponenter();
            onSubmit(
                {
                    method: 'POST',
                    data: {
                        ytelsestype: fagsak.ytelsestype,
                        originalBehandlingId: behandlingId,
                        årsakstype: skjema.felter.behandlingsårsak.verdi,
                    },
                    url: '/familie-tilbake/api/behandling/revurdering/v1',
                },
                (response: Ressurs<string>) => {
                    if (response.status === RessursStatus.Suksess) {
                        lukkModal(false);
                        utførRedirect(
                            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${response.data}`
                        );
                    }
                }
            );
        }
    };

    return { skjema, sendInn, nullstillSkjema };
};

export { useOpprettBehandlingSkjema };
