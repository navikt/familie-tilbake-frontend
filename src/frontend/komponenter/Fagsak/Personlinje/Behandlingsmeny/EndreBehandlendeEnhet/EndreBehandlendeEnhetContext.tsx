import { useBehandling } from '../../../../../context/BehandlingContext';
import { type FeltState, useFelt, useSkjema } from '../../../../../hooks/skjema';
import { type Ressurs, RessursStatus } from '../../../../../typer/ressurs';
import { erFeltetEmpty, validerTekstFeltMaksLengde } from '../../../../../utils';

const useEndreBehandlendeEnhet = (behandlingId: string, lukkModal: (_vis: boolean) => void) => {
    const { hentBehandlingMedBehandlingId, nullstillIkkePersisterteKomponenter } = useBehandling();

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
        skjemanavn: 'endreEnhetBehandling',
    });

    const sendInn = () => {
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
                (response: Ressurs<string>) => {
                    if (response.status === RessursStatus.Suksess) {
                        lukkModal(true);
                        hentBehandlingMedBehandlingId(behandlingId);
                    }
                }
            );
        }
    };

    return { skjema, sendInn, nullstillSkjema };
};

export { useEndreBehandlendeEnhet };
