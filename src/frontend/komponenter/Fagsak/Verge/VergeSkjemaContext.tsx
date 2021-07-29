import {
    Avhengigheter,
    FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '@navikt/familie-skjema';

import { Vergetype } from '../../../kodeverk/verge';
import { erFeltetEmpty, isEmpty, validerDatoFelt, validerTekstFelt } from '../../../utils';

const erVergetypeOppfylt = (avhengigheter?: Avhengigheter) =>
    avhengigheter?.vergetype.valideringsstatus === Valideringsstatus.OK;

const erAdvokatValgt = (avhengigheter?: Avhengigheter) =>
    erVergetypeOppfylt(avhengigheter) && avhengigheter?.vergetype.verdi === Vergetype.ADVOKAT;

const useVergeSkjema = () => {
    const vergetype = useFelt<Vergetype | ''>({
        feltId: 'vergetype',
        verdi: '',
        valideringsfunksjon: (felt: FeltState<Vergetype | ''>) => {
            return erFeltetEmpty(felt);
        },
    });

    const { skjema, kanSendeSkjema, hentFeilTilOppsummering } = useSkjema<
        {
            begrunnelse: string | '';
            vergetype: Vergetype | '';
            navn: string | '';
            organisasjonsnummer: string | '';
            fødselsnummer: string | '';
            gyldigFom: string | '';
            gyldigTom: string | '';
        },
        string
    >({
        felter: {
            begrunnelse: useFelt<string | ''>({
                feltId: 'begrunnelse',
                verdi: '',
                valideringsfunksjon: validerTekstFelt,
            }),
            vergetype,
            navn: useFelt<string | ''>({
                feltId: 'navn',
                verdi: '',
                avhengigheter: { vergetype },
                valideringsfunksjon: (
                    felt: FeltState<string | ''>,
                    avhengigheter?: Avhengigheter
                ) => {
                    if (!erVergetypeOppfylt(avhengigheter)) return ok(felt);
                    const gyldig = validerTekstFelt(felt);
                    return gyldig;
                },
            }),
            organisasjonsnummer: useFelt<string | ''>({
                feltId: 'organisasjonsnummer',
                verdi: '',
                avhengigheter: { vergetype },
                valideringsfunksjon: (
                    felt: FeltState<string | ''>,
                    avhengigheter?: Avhengigheter
                ) => {
                    if (!erAdvokatValgt(avhengigheter)) return ok(felt);
                    return validerTekstFelt(felt);
                },
            }),
            fødselsnummer: useFelt<string | ''>({
                feltId: 'fødselsnummer',
                verdi: '',
                avhengigheter: { vergetype },
                valideringsfunksjon: (
                    felt: FeltState<string | ''>,
                    avhengigheter?: Avhengigheter
                ) => {
                    if (!erVergetypeOppfylt(avhengigheter) || erAdvokatValgt(avhengigheter))
                        return ok(felt);
                    return validerTekstFelt(felt);
                },
            }),
            gyldigFom: useFelt<string | ''>({
                feltId: 'gyldigFom',
                verdi: '',
                avhengigheter: { vergetype },
                valideringsfunksjon: (
                    felt: FeltState<string | ''>,
                    avhengigheter?: Avhengigheter
                ) => {
                    if (!erVergetypeOppfylt(avhengigheter)) return ok(felt);
                    return validerDatoFelt(felt);
                },
            }),
            gyldigTom: useFelt<string | ''>({
                feltId: 'gyldigTom',
                verdi: '',
                avhengigheter: { vergetype },
                valideringsfunksjon: (
                    felt: FeltState<string | ''>,
                    avhengigheter?: Avhengigheter
                ) => {
                    if (!erVergetypeOppfylt(avhengigheter) || isEmpty(felt.verdi)) return ok(felt);
                    return validerDatoFelt(felt);
                },
            }),
        },
        skjemanavn: 'vergeskjema',
    });

    const sendInn = () => {
        if (kanSendeSkjema()) {
            console.log('Kan sende inn skjema!');
        } else {
            hentFeilTilOppsummering().map(ff => console.log('Feil: ', ff));
        }
    };

    return { skjema, sendInn };
};

export { useVergeSkjema };
