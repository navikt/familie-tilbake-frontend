import type { ForeldelsePeriodeSkjemeData } from '../typer/foreldelse';
import type { ForeldelsesvurderingstypeEnum } from '~/generated/types.gen';
import type { Avhengigheter, FeltState, Skjema } from '~/hooks/skjema';

import { ok, useFelt, useSkjema, Valideringsstatus } from '~/hooks/skjema';
import { erFeltetEmpty, validerGyldigDato, validerTekstFeltMaksLengde } from '~/utils';
import { dateTilIsoDatoStringEllerUndefined } from '~/utils/dato';

const avhengigheterOppfyltForeldelsesfrist = (avhengigheter?: Avhengigheter): boolean => {
    return (
        avhengigheter?.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.Ok &&
        (avhengigheter.foreldelsesvurderingstype.verdi === 'FORELDET' ||
            avhengigheter.foreldelsesvurderingstype.verdi === 'TILLEGGSFRIST')
    );
};

const avhengigheterOppfyltOppdagelsesdato = (avhengigheter?: Avhengigheter): boolean => {
    return (
        avhengigheter?.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.Ok &&
        avhengigheter?.foreldelsesvurderingstype?.verdi === 'TILLEGGSFRIST'
    );
};

type ForeldelsesPeriodeSkjemaHook = {
    skjema: Skjema<
        {
            begrunnelse: string | '';
            foreldelsesvurderingstype: ForeldelsesvurderingstypeEnum | '';
            foreldelsesfrist: Date | undefined;
            oppdagelsesdato: Date | undefined;
        },
        string
    >;
    onBekreft: (periode: ForeldelsePeriodeSkjemeData) => void;
};

const useForeldelsePeriodeSkjema = (
    oppdaterPeriode: (oppdatertPeriode: ForeldelsePeriodeSkjemeData) => void
): ForeldelsesPeriodeSkjemaHook => {
    const foreldelsesvurderingstype = useFelt<ForeldelsesvurderingstypeEnum | ''>({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<ForeldelsesvurderingstypeEnum | ''>) => {
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
            foreldelsesvurderingstype: ForeldelsesvurderingstypeEnum | '';
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

    const onBekreft = (periode: ForeldelsePeriodeSkjemeData): void => {
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
