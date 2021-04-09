import {
    Avhengigheter,
    feil,
    FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '@navikt/familie-skjema';

import { Foreldelsevurdering } from '../../../../kodeverk';
import {
    definerteFeilmeldinger,
    DEFINERT_FEILMELDING,
    hasValidText,
} from '../../../../utils/validering';
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
            return felt.verdi !== ''
                ? ok(felt)
                : feil(felt, definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT]);
        },
    });

    const foreldelsesfrist = useFelt<string | ''>({
        verdi: '',
        avhengigheter: { foreldelsesvurderingstype },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltForeldelsesfrist(avhengigheter)) return ok(felt);
            return felt.verdi !== ''
                ? ok(felt)
                : feil(felt, definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT]);
        },
    });

    const oppdagelsesdato = useFelt<string | ''>({
        verdi: '',
        avhengigheter: { foreldelsesvurderingstype },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltOppdagelsesdato(avhengigheter)) return ok(felt);
            return felt.verdi !== ''
                ? ok(felt)
                : feil(felt, definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT]);
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
                valideringsfunksjon: (felt: FeltState<string | ''>) => {
                    if (felt.verdi !== '') {
                        const feilmelding = hasValidText(felt.verdi);
                        return !feilmelding ? ok(felt) : feil(felt, feilmelding);
                    } else {
                        return feil(
                            felt,
                            definerteFeilmeldinger[DEFINERT_FEILMELDING.OBLIGATORISK_FELT]
                        );
                    }
                },
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
