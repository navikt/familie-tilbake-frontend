import {
    type Avhengigheter,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '@navikt/familie-skjema';

import { Foreldelsevurdering } from '../../../../kodeverk';
import { erFeltetEmpty, validerDatoFelt, validerTekstFeltMaksLengde } from '../../../../utils';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';

const avhengigheterOppfyltForeldelsesfrist = (avhengigheter?: Avhengigheter) => {
    return (
        avhengigheter?.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.OK &&
        (avhengigheter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.FORELDET ||
            avhengigheter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.TILLEGGSFRIST)
    );
};

const avhengigheterOppfyltOppdagelsesdato = (avhengigheter?: Avhengigheter) => {
    return (
        avhengigheter?.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.OK &&
        avhengigheter?.foreldelsesvurderingstype?.verdi === Foreldelsevurdering.TILLEGGSFRIST
    );
};

const useForeldelsePeriodeSkjema = (
    oppdaterPeriode: (oppdatertPeriode: ForeldelsePeriodeSkjemeData) => void
) => {
    const foreldelsesvurderingstype = useFelt<Foreldelsevurdering | ''>({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<Foreldelsevurdering | ''>) => {
            return erFeltetEmpty(felt);
        },
    });

    const foreldelsesfrist = useFelt<string | ''>({
        verdi: '',
        avhengigheter: { foreldelsesvurderingstype },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltForeldelsesfrist(avhengigheter)) return ok(felt);
            return validerDatoFelt(felt);
        },
    });

    const oppdagelsesdato = useFelt<string | ''>({
        verdi: '',
        avhengigheter: { foreldelsesvurderingstype },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltOppdagelsesdato(avhengigheter)) return ok(felt);
            return validerDatoFelt(felt);
        },
    });

    const { skjema, kanSendeSkjema, validerAlleSynligeFelter, nullstillSkjema } = useSkjema<
        {
            begrunnelse: string | '';
            foreldelsesvurderingstype: Foreldelsevurdering | '';
            foreldelsesfrist: string | '';
            oppdagelsesdato: string | '';
        },
        string
    >({
        felter: {
            begrunnelse: useFelt<string | ''>({
                verdi: '',
                valideringsfunksjon: (felt: FeltState<string | ''>) =>
                    validerTekstFeltMaksLengde(3000, felt),
            }),
            foreldelsesvurderingstype,
            foreldelsesfrist,
            oppdagelsesdato,
        },
        skjemanavn: 'foreldelseperiodeskjema',
    });

    const onBekreft = (periode: ForeldelsePeriodeSkjemeData) => {
        validerAlleSynligeFelter();
        if (kanSendeSkjema()) {
            oppdaterPeriode({
                ...periode,
                begrunnelse: skjema.felter.begrunnelse.verdi,
                //@ts-ignore
                foreldelsesvurderingstype: skjema.felter.foreldelsesvurderingstype.verdi,
                foreldelsesfrist: skjema.felter.foreldelsesfrist.verdi,
                oppdagelsesdato: skjema.felter.oppdagelsesdato.verdi,
            });
            nullstillSkjema();
        }
    };

    return {
        skjema,
        onBekreft,
    };
};

export { useForeldelsePeriodeSkjema };
