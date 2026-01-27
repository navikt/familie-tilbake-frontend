import type { FeltState, Skjema } from '../../../../hooks/skjema';

import { useQueryClient } from '@tanstack/react-query';

import { useBehandling } from '../../../../context/BehandlingContext';
import { useBehandlingState } from '../../../../context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '../../../../generated/@tanstack/react-query.gen';
import { useFelt, useSkjema } from '../../../../hooks/skjema';
import { type Ressurs, RessursStatus } from '../../../../typer/ressurs';
import { erFeltetEmpty, validerTekstFeltMaksLengde } from '../../../../utils';

type EndreEnhetHook = {
    skjema: Skjema<
        {
            enhet: string | '';
            begrunnelse: string | '';
        },
        string
    >;
    sendInn: () => void;
    nullstillSkjema: () => void;
};

const useEndreEnhet = (lukkModal: () => void): EndreEnhetHook => {
    const { behandlingId } = useBehandling();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const queryClient = useQueryClient();

    const { skjema, kanSendeSkjema, onSubmit, nullstillSkjema } = useSkjema<
        {
            enhet: string | '';
            begrunnelse: string | '';
        },
        string
    >({
        felter: {
            enhet: useFelt<string | ''>({
                feltId: 'enhet',
                verdi: '',
                valideringsfunksjon: erFeltetEmpty,
            }),
            begrunnelse: useFelt<string | ''>({
                feltId: 'begrunnelse',
                verdi: '',
                valideringsfunksjon: (felt: FeltState<string | ''>) => {
                    return validerTekstFeltMaksLengde(400, felt);
                },
            }),
        },
        skjemanavn: 'endreEnhet',
    });

    const sendInn = (): void => {
        if (kanSendeSkjema()) {
            nullstillIkkePersisterteKomponenter();
            onSubmit(
                {
                    method: 'PUT',
                    data: {
                        enhet: skjema.felter.enhet.verdi,
                        begrunnelse: skjema.felter.begrunnelse.verdi,
                    },
                    url: `/familie-tilbake/api/behandling/${behandlingId}/bytt-enhet/v1`,
                },
                async (response: Ressurs<string>) => {
                    if (response.status === RessursStatus.Suksess) {
                        lukkModal();
                        await queryClient.invalidateQueries({
                            queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
                        });
                    }
                }
            );
        }
    };

    return { skjema, sendInn, nullstillSkjema };
};

export { useEndreEnhet };
