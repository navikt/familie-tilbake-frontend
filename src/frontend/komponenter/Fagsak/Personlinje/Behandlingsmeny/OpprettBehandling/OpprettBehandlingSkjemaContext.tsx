import { useFelt, useSkjema } from '@navikt/familie-skjema';
import { Ressurs, RessursStatus } from '@navikt/familie-typer';

import { Behandlingstype, Behandlingårsak } from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import { erFeltetEmpty } from '../../../../../utils';

const useOpprettBehandlingSkjema = (
    fagsak: IFagsak,
    behandlingId: string,
    lukkModal: (_vis: boolean) => void
) => {
    const { skjema, kanSendeSkjema, onSubmit, nullstillSkjema } = useSkjema<
        {
            behandlingstype: Behandlingstype;
            behandlingsårsak: Behandlingårsak | '';
        },
        string
    >({
        felter: {
            behandlingstype: useFelt<Behandlingstype>({
                verdi: Behandlingstype.REVURDERING_TILBAKEKREVING,
            }),
            behandlingsårsak: useFelt<Behandlingårsak | ''>({
                feltId: 'behandlingsårsak',
                verdi: '',
                valideringsfunksjon: erFeltetEmpty,
            }),
        },
        skjemanavn: 'opprettBehandling',
    });

    const sendInn = () => {
        if (kanSendeSkjema()) {
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
                    if (response.status === RessursStatus.SUKSESS) {
                        lukkModal(false);
                        window.location.href = `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${response.data}`;
                    }
                }
            );
        }
    };

    return { skjema, sendInn, nullstillSkjema };
};

export { useOpprettBehandlingSkjema };
