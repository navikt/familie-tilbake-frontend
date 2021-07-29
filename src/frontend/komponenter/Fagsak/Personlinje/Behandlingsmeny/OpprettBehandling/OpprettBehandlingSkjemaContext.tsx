import { useFelt, useSkjema } from '@navikt/familie-skjema';

import { Behandlingstype, Behandlingårsak } from '../../../../../typer/behandling';
import { erFeltetEmpty } from '../../../../../utils';

const useOpprettBehandlingSkjema = () => {
    const { skjema, kanSendeSkjema, nullstillSkjema } = useSkjema<
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
            console.log('kan sende inn');
        }
    };

    return { skjema, sendInn, nullstillSkjema };
};

export { useOpprettBehandlingSkjema };
