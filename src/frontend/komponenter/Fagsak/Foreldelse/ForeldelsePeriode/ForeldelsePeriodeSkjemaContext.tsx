import type { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';

import {
    type Avhengigheter,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '../../../../hooks/skjema';
import { Foreldelsevurdering } from '../../../../kodeverk';
import { erFeltetEmpty, validerGyldigDato, validerTekstFeltMaksLengde } from '../../../../utils';
import { dateTilIsoDatoStringEllerUndefined } from '../../../../utils/dato';

const avhengigheterOppfyltForeldelsesfrist = (avhengigheter?: Avhengigheter) => {
    return (
        avhengigheter?.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.Ok &&
        (avhengigheter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.Foreldet ||
            avhengigheter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.Tilleggsfrist)
    );
};

const avhengigheterOppfyltOppdagelsesdato = (avhengigheter?: Avhengigheter) => {
    return (
        avhengigheter?.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.Ok &&
        avhengigheter?.foreldelsesvurderingstype?.verdi === Foreldelsevurdering.Tilleggsfrist
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

    const foreldelsesfrist = useFelt<Date | undefined>({
        verdi: undefined,
        avhengigheter: { foreldelsesvurderingstype },
        valideringsfunksjon: (felt: FeltState<Date | undefined>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltForeldelsesfrist(avhengigheter)) return ok(felt);
            return validerGyldigDato(felt);
        },
    });

    const oppdagelsesdato = useFelt<Date | undefined>({
        verdi: undefined,
        avhengigheter: { foreldelsesvurderingstype },
        valideringsfunksjon: (felt: FeltState<Date | undefined>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltOppdagelsesdato(avhengigheter)) return ok(felt);
            return validerGyldigDato(felt);
        },
    });

    const { skjema, kanSendeSkjema, validerAlleSynligeFelter, nullstillSkjema } = useSkjema<
        {
            begrunnelse: string | '';
            foreldelsesvurderingstype: Foreldelsevurdering | '';
            foreldelsesfrist: Date | undefined;
            oppdagelsesdato: Date | undefined;
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
                foreldelsesvurderingstype: skjema.felter.foreldelsesvurderingstype.verdi
                    ? skjema.felter.foreldelsesvurderingstype.verdi
                    : undefined,
                foreldelsesfrist: dateTilIsoDatoStringEllerUndefined(
                    skjema.felter.foreldelsesfrist.verdi
                ),
                oppdagelsesdato: dateTilIsoDatoStringEllerUndefined(
                    skjema.felter.oppdagelsesdato.verdi
                ),
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
