import {
    Avhengigheter,
    feil,
    FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '@navikt/familie-skjema';

import { Aktsomhet, SærligeGrunner, Vilkårsresultat } from '../../../../kodeverk';
import {
    Aktsomhetsvurdering,
    GodTro,
    SærligeGrunnerDto,
} from '../../../../typer/feilutbetalingtyper';
import { parseStringToNumber } from '../../../../utils';
import { validerTekstFelt, erFeltetEmpty, validerNummerFelt } from '../../../../utils/validering';
import { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';

export const EGENDEFINERT = 'Egendefinert';
export const ANDELER = ['30', '50', '70', EGENDEFINERT];

export interface JaNeiOption {
    verdi: boolean;
    label: string;
}

export const OptionJA: JaNeiOption = {
    verdi: true,
    label: 'Ja',
};
export const OptionNEI: JaNeiOption = {
    verdi: false,
    label: 'Nei',
};

export const jaNeiOptions = [OptionJA, OptionNEI];

export const finnJaNeiOption = (verdi?: boolean): JaNeiOption | undefined => {
    return jaNeiOptions.find(opt => opt.verdi === verdi);
};

const erVilkårsresultatOppfylt = (resultat: Vilkårsresultat, avhengigheter?: Avhengigheter) =>
    avhengigheter?.vilkårsresultatvurdering.valideringsstatus === Valideringsstatus.OK &&
    avhengigheter?.vilkårsresultatvurdering.verdi === resultat;

const avhengigheterOppfyltGodTroFelter = (avhengigheter?: Avhengigheter) =>
    erVilkårsresultatOppfylt(Vilkårsresultat.GOD_TRO, avhengigheter);

const avhengigheterOppfyltGodTroTilbakekrevesBeløp = (avhengigheter?: Avhengigheter) =>
    avhengigheterOppfyltGodTroFelter(avhengigheter) &&
    avhengigheter?.erBeløpetIBehold.valideringsstatus === Valideringsstatus.OK &&
    avhengigheter.erBeløpetIBehold.verdi === OptionJA;

const avhengigheterOppfyltAktsomhetFelter = (avhengigheter?: Avhengigheter) =>
    avhengigheter?.vilkårsresultatvurdering.valideringsstatus === Valideringsstatus.OK &&
    avhengigheter?.vilkårsresultatvurdering.verdi !== Vilkårsresultat.GOD_TRO;

const erAktsomhetsvurderingOppfylt = (aktsomhet: Aktsomhet, avhengigheter?: Avhengigheter) =>
    avhengigheterOppfyltAktsomhetFelter(avhengigheter) &&
    avhengigheter?.aktsomhetVurdering.valideringsstatus === Valideringsstatus.OK &&
    avhengigheter?.aktsomhetVurdering.verdi === aktsomhet;

const avhengigheterOppfyltForstoIlleggrenter = (avhengigheter?: Avhengigheter) =>
    erVilkårsresultatOppfylt(Vilkårsresultat.FORSTO_BURDE_FORSTÅTT, avhengigheter) &&
    erAktsomhetsvurderingOppfylt(Aktsomhet.FORSETT, avhengigheter);

const erBeløpUnder4RettsgebyrOppfylt = (avhengigheter?: Avhengigheter) =>
    avhengigheter?.totalbeløpUnder4Rettsgebyr.verdi === true;

const avhengigheterOppfyltTilbakekrevesBeløpUnder4Rettsgebyr = (avhengigheter?: Avhengigheter) =>
    erAktsomhetsvurderingOppfylt(Aktsomhet.SIMPEL_UAKTSOMHET, avhengigheter) &&
    erBeløpUnder4RettsgebyrOppfylt(avhengigheter);

const erTilbakekrevBeløpUnder4Rettsgebyr = (avhengigheter?: Avhengigheter) =>
    avhengigheter?.tilbakekrevSmåbeløp.valideringsstatus === Valideringsstatus.OK &&
    avhengigheter?.tilbakekrevSmåbeløp.verdi === true;

const avhengigheterOppfyltSærligeGrunnerFelter = (avhengigheter?: Avhengigheter) =>
    (erAktsomhetsvurderingOppfylt(Aktsomhet.SIMPEL_UAKTSOMHET, avhengigheter) &&
        (!erBeløpUnder4RettsgebyrOppfylt(avhengigheter) ||
            erTilbakekrevBeløpUnder4Rettsgebyr(avhengigheter))) ||
    erAktsomhetsvurderingOppfylt(Aktsomhet.GROV_UAKTSOMHET, avhengigheter);

const avhengigheterOppfyltSærligGrunnAnnetBegrunnelse = (avhengigheter?: Avhengigheter) =>
    avhengigheterOppfyltSærligeGrunnerFelter(avhengigheter) &&
    avhengigheter?.særligeGrunner.verdi.length > 0 &&
    avhengigheter?.særligeGrunner.verdi.includes(SærligeGrunner.ANNET);

const erHarGrunnerTilReduksjonOppfylt = (valg: JaNeiOption, avhengigheter?: Avhengigheter) =>
    avhengigheter?.harGrunnerTilReduksjon.valideringsstatus === Valideringsstatus.OK &&
    avhengigheter.harGrunnerTilReduksjon.verdi === valg;

const avhengigheterOppfyltGrovtIlleggRenter = (avhengigheter?: Avhengigheter) =>
    erAktsomhetsvurderingOppfylt(Aktsomhet.GROV_UAKTSOMHET, avhengigheter) &&
    erHarGrunnerTilReduksjonOppfylt(OptionNEI, avhengigheter);

const avhengigheterOppfyltGrunnerTilReduksjonFelter = (avhengigheter?: Avhengigheter) =>
    (erAktsomhetsvurderingOppfylt(Aktsomhet.SIMPEL_UAKTSOMHET, avhengigheter) ||
        erAktsomhetsvurderingOppfylt(Aktsomhet.GROV_UAKTSOMHET, avhengigheter)) &&
    erHarGrunnerTilReduksjonOppfylt(OptionJA, avhengigheter);

const avhengigheterOppfyltIkkeMerEnnAktivitetFelter = (avhengigheter?: Avhengigheter) =>
    avhengigheterOppfyltGrunnerTilReduksjonFelter(avhengigheter) &&
    avhengigheter?.harMerEnnEnAktivitet.verdi === false;

const avhengigheterOppfyltMerEnnAktivitetFelter = (avhengigheter?: Avhengigheter) =>
    avhengigheterOppfyltGrunnerTilReduksjonFelter(avhengigheter) &&
    avhengigheter?.harMerEnnEnAktivitet.verdi === true;

const useVilkårsvurderingPeriodeSkjema = (
    oppdaterPeriode: (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => void
) => {
    const feilutbetaltBeløpPeriode = useFelt<number>({
        feltId: 'feilutbetaltBeløpPeriode',
        verdi: 0,
    });

    const vilkårsresultatvurdering = useFelt<Vilkårsresultat | ''>({
        feltId: 'vilkårsresultatvurdering',
        verdi: '',
        valideringsfunksjon: (felt: FeltState<Vilkårsresultat | ''>) => {
            return erFeltetEmpty(felt);
        },
    });

    const aktsomhetBegrunnelse = useFelt<string | ''>({
        feltId: 'aktsomhetBegrunnelse',
        verdi: '',
        avhengigheter: { vilkårsresultatvurdering },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (avhengigheter?.vilkårsresultatvurdering.valideringsstatus !== Valideringsstatus.OK)
                return ok(felt);
            return validerTekstFelt(felt);
        },
    });

    /** GOD_TRO */
    const erBeløpetIBehold = useFelt<JaNeiOption | ''>({
        feltId: 'erBeløpetIBehold',
        verdi: '',
        avhengigheter: { vilkårsresultatvurdering },
        valideringsfunksjon: (felt: FeltState<JaNeiOption | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltGodTroFelter(avhengigheter)) return ok(felt);
            return erFeltetEmpty(felt);
        },
    });

    const godTroTilbakekrevesBeløp = useFelt<string | ''>({
        feltId: 'godTroTilbakekrevesBeløp',
        verdi: '',
        avhengigheter: { vilkårsresultatvurdering, erBeløpetIBehold, feilutbetaltBeløpPeriode },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltGodTroTilbakekrevesBeløp(avhengigheter)) return ok(felt);
            return validerNummerFelt(felt, avhengigheter?.feilutbetaltBeløpPeriode.verdi, 1);
        },
    });

    /** AKTSOMHET */
    const aktsomhetVurdering = useFelt<Aktsomhet | ''>({
        feltId: 'aktsomhetVurdering',
        verdi: '',
        avhengigheter: { vilkårsresultatvurdering },
        valideringsfunksjon: (felt: FeltState<Aktsomhet | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltAktsomhetFelter(avhengigheter)) return ok(felt);
            return erFeltetEmpty(felt);
        },
    });

    /** FORSTO / BURDE FORSTÅTT */
    const forstoIlleggeRenter = useFelt<JaNeiOption | ''>({
        feltId: 'forstoIlleggeRenter',
        verdi: '',
        avhengigheter: { vilkårsresultatvurdering, aktsomhetVurdering },
        valideringsfunksjon: (felt: FeltState<JaNeiOption | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltForstoIlleggrenter(avhengigheter)) return ok(felt);
            return erFeltetEmpty(felt);
        },
    });

    /** under 4 rettsGebyr */
    const totalbeløpUnder4Rettsgebyr = useFelt<boolean>({
        feltId: 'totalbeløpUnder4Rettsgebyr',
        verdi: false,
    });

    const tilbakekrevSmåbeløp = useFelt<JaNeiOption | ''>({
        feltId: 'tilbakekrevSmåbeløp',
        verdi: '',
        avhengigheter: { vilkårsresultatvurdering, aktsomhetVurdering, totalbeløpUnder4Rettsgebyr },
        valideringsfunksjon: (felt: FeltState<JaNeiOption | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltTilbakekrevesBeløpUnder4Rettsgebyr(avhengigheter))
                return ok(felt);
            return erFeltetEmpty(felt);
        },
    });

    /** særlige grunner */
    const særligeGrunnerBegrunnelse = useFelt<string | ''>({
        feltId: 'særligeGrunnerBegrunnelse',
        verdi: '',
        avhengigheter: {
            vilkårsresultatvurdering,
            aktsomhetVurdering,
            totalbeløpUnder4Rettsgebyr,
            tilbakekrevSmåbeløp,
        },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltSærligeGrunnerFelter(avhengigheter)) return ok(felt);
            return validerTekstFelt(felt);
        },
    });

    const særligeGrunner = useFelt<SærligeGrunner[]>({
        feltId: 'særligeGrunner',
        verdi: [],
        avhengigheter: {
            vilkårsresultatvurdering,
            aktsomhetVurdering,
            totalbeløpUnder4Rettsgebyr,
            tilbakekrevSmåbeløp,
        },
        valideringsfunksjon: (felt: FeltState<SærligeGrunner[]>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltSærligeGrunnerFelter(avhengigheter)) return ok(felt);
            if (felt.verdi.length === 0) {
                return feil(felt, 'Du må velge minst en særlig grunn');
            } else {
                return ok(felt);
            }
        },
    });

    const særligeGrunnerAnnetBegrunnelse = useFelt<string | ''>({
        feltId: 'særligeGrunnerAnnetBegrunnelse',
        verdi: '',
        avhengigheter: {
            vilkårsresultatvurdering,
            aktsomhetVurdering,
            totalbeløpUnder4Rettsgebyr,
            tilbakekrevSmåbeløp,
            særligeGrunner,
        },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltSærligGrunnAnnetBegrunnelse(avhengigheter)) return ok(felt);
            return validerTekstFelt(felt);
        },
    });

    /** Reduksjon av beløp */
    const harMerEnnEnAktivitet = useFelt<boolean>({
        feltId: 'harMerEnnEnAktivitet',
        verdi: false,
    });

    const harGrunnerTilReduksjon = useFelt<JaNeiOption | ''>({
        feltId: 'harGrunnerTilReduksjon',
        verdi: '',
        avhengigheter: {
            vilkårsresultatvurdering,
            aktsomhetVurdering,
            totalbeløpUnder4Rettsgebyr,
            tilbakekrevSmåbeløp,
        },
        valideringsfunksjon: (felt: FeltState<JaNeiOption | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltSærligeGrunnerFelter(avhengigheter)) return ok(felt);
            return erFeltetEmpty(felt);
        },
    });

    const uaktsomAndelTilbakekreves = useFelt<string | ''>({
        feltId: 'uaktsomAndelTilbakekreves',
        verdi: '',
        avhengigheter: {
            vilkårsresultatvurdering,
            aktsomhetVurdering,
            harGrunnerTilReduksjon,
            harMerEnnEnAktivitet,
        },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltIkkeMerEnnAktivitetFelter(avhengigheter)) return ok(felt);
            if (felt.verdi === EGENDEFINERT) return ok(felt);
            return validerNummerFelt(felt, 100, 0);
        },
    });

    const uaktsomAndelTilbakekrevesManuelt = useFelt<string | ''>({
        feltId: 'uaktsomAndelTilbakekrevesManuelt',
        verdi: '',
        avhengigheter: {
            vilkårsresultatvurdering,
            aktsomhetVurdering,
            harGrunnerTilReduksjon,
            harMerEnnEnAktivitet,
            uaktsomAndelTilbakekreves,
        },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltIkkeMerEnnAktivitetFelter(avhengigheter)) return ok(felt);
            if (avhengigheter?.uaktsomAndelTilbakekreves.verdi !== EGENDEFINERT) return ok(felt);
            return validerNummerFelt(felt, 100, 0);
        },
    });

    const uaktsomTilbakekrevesBeløp = useFelt<string | ''>({
        feltId: 'uaktsomTilbakekrevesBeløp',
        verdi: '',
        avhengigheter: {
            vilkårsresultatvurdering,
            aktsomhetVurdering,
            harGrunnerTilReduksjon,
            harMerEnnEnAktivitet,
            feilutbetaltBeløpPeriode,
        },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltMerEnnAktivitetFelter(avhengigheter)) return ok(felt);
            if (!erFeltetEmpty(felt) && ANDELER.includes(felt.verdi)) ok(felt);
            return validerNummerFelt(felt, avhengigheter?.feilutbetaltBeløpPeriode.verdi, 1);
        },
    });

    const grovtUaktsomIlleggeRenter = useFelt<JaNeiOption | ''>({
        feltId: 'grovtUaktsomIlleggeRenter',
        verdi: '',
        avhengigheter: { vilkårsresultatvurdering, aktsomhetVurdering, harGrunnerTilReduksjon },
        valideringsfunksjon: (felt: FeltState<JaNeiOption | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltGrovtIlleggRenter(avhengigheter)) return ok(felt);
            return erFeltetEmpty(felt);
        },
    });

    const {
        skjema,
        validerAlleSynligeFelter,
        kanSendeSkjema,
        hentFeilTilOppsummering,
        nullstillSkjema,
    } = useSkjema<VilkårsvurderingSkjemaDefinisjon, string>({
        felter: {
            feilutbetaltBeløpPeriode,
            vilkårsresultatBegrunnelse: useFelt<string | ''>({
                feltId: 'vilkårsresultatBegrunnelse',
                verdi: '',
                valideringsfunksjon: validerTekstFelt,
            }),
            vilkårsresultatvurdering,
            erBeløpetIBehold,
            godTroTilbakekrevesBeløp,
            aktsomhetBegrunnelse,
            aktsomhetVurdering,
            forstoIlleggeRenter,
            totalbeløpUnder4Rettsgebyr,
            tilbakekrevSmåbeløp,
            særligeGrunnerBegrunnelse,
            særligeGrunner,
            særligeGrunnerAnnetBegrunnelse,
            harMerEnnEnAktivitet,
            harGrunnerTilReduksjon,
            uaktsomAndelTilbakekreves,
            uaktsomAndelTilbakekrevesManuelt,
            uaktsomTilbakekrevesBeløp,
            grovtUaktsomIlleggeRenter,
        },
        skjemanavn: 'vilkårsvurderingskjema',
    });

    const byggGodTro = (): GodTro => {
        const erBeløpErIBehold = skjema.felter.erBeløpetIBehold.verdi === OptionJA;
        return {
            begrunnelse: skjema.felter.aktsomhetBegrunnelse.verdi,
            beløpErIBehold: erBeløpErIBehold,
            beløpTilbakekreves: erBeløpErIBehold
                ? parseStringToNumber(skjema.felter.godTroTilbakekrevesBeløp.verdi)
                : undefined,
        };
    };

    const byggAktsomhet = (): Aktsomhetsvurdering => {
        const erEgendefinert = skjema.felter.uaktsomAndelTilbakekreves.verdi === EGENDEFINERT;

        const erForsto =
            skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;
        const erForstoForsett =
            erForsto && skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.FORSETT;
        const erGrovtUaktsomhet =
            skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GROV_UAKTSOMHET;

        const skalVurderereSmåbeløp =
            skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.SIMPEL_UAKTSOMHET &&
            skjema.felter.totalbeløpUnder4Rettsgebyr.verdi === true;
        const skalIkkeVurdereSærligeGrunner =
            skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.FORSETT ||
            (skalVurderereSmåbeløp && skjema.felter.tilbakekrevSmåbeløp.verdi === OptionNEI);

        const harGrunnerTilReduksjon =
            !skalIkkeVurdereSærligeGrunner &&
            skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA;
        const harAndelTilbakekreves =
            harGrunnerTilReduksjon && skjema.felter.harMerEnnEnAktivitet.verdi !== true;

        return {
            begrunnelse: skjema.felter.aktsomhetBegrunnelse.verdi,
            // @ts-ignore - validert i validerAlleSynligeFelter
            aktsomhet: skjema.felter.aktsomhetVurdering.verdi,
            ileggRenter:
                !erForstoForsett && !erGrovtUaktsomhet
                    ? undefined
                    : erForstoForsett
                    ? skjema.felter.forstoIlleggeRenter.verdi === OptionJA
                    : skjema.felter.grovtUaktsomIlleggeRenter.verdi === OptionJA,
            tilbakekrevSmåbeløp: skalVurderereSmåbeløp
                ? skjema.felter.tilbakekrevSmåbeløp.verdi === OptionJA
                : undefined,
            særligeGrunnerBegrunnelse: !skalIkkeVurdereSærligeGrunner
                ? skjema.felter.særligeGrunnerBegrunnelse.verdi
                : undefined,
            særligeGrunner: skalIkkeVurdereSærligeGrunner
                ? undefined
                : skjema.felter.særligeGrunner.verdi.map<SærligeGrunnerDto>(grunn => ({
                      særligGrunn: grunn,
                      begrunnelse:
                          grunn === SærligeGrunner.ANNET
                              ? skjema.felter.særligeGrunnerAnnetBegrunnelse.verdi
                              : undefined,
                  })),
            særligeGrunnerTilReduksjon: !skalIkkeVurdereSærligeGrunner
                ? harGrunnerTilReduksjon
                : undefined,
            andelTilbakekreves: !harAndelTilbakekreves
                ? undefined
                : erEgendefinert
                ? parseStringToNumber(skjema.felter.uaktsomAndelTilbakekrevesManuelt.verdi)
                : parseStringToNumber(skjema.felter.uaktsomAndelTilbakekreves.verdi),
            beløpTilbakekreves:
                !erForstoForsett && !harAndelTilbakekreves && harGrunnerTilReduksjon
                    ? parseStringToNumber(skjema.felter.uaktsomTilbakekrevesBeløp.verdi)
                    : undefined,
        };
    };

    const onBekreft = (periode: VilkårsvurderingPeriodeSkjemaData) => {
        validerAlleSynligeFelter();
        if (kanSendeSkjema()) {
            const erGodTro =
                skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.GOD_TRO;
            oppdaterPeriode({
                ...periode,
                begrunnelse: skjema.felter.vilkårsresultatBegrunnelse.verdi,
                vilkårsvurderingsresultatInfo: {
                    // @ts-ignore - validert i validerAlleSynligeFelter
                    vilkårsvurderingsresultat: skjema.felter.vilkårsresultatvurdering.verdi,
                    godTro: erGodTro ? byggGodTro() : undefined,
                    aktsomhet: !erGodTro ? byggAktsomhet() : undefined,
                },
            });
            nullstillSkjema();
        } else {
            hentFeilTilOppsummering().map(ff => console.log('Feil: ', ff));
        }
    };

    return {
        skjema,
        onBekreft,
    };
};

type VilkårsvurderingSkjemaDefinisjon = {
    feilutbetaltBeløpPeriode: number;
    vilkårsresultatBegrunnelse: string | '';
    vilkårsresultatvurdering: Vilkårsresultat | '';
    erBeløpetIBehold: JaNeiOption | '';
    godTroTilbakekrevesBeløp: string | '';
    aktsomhetBegrunnelse: string | '';
    aktsomhetVurdering: Aktsomhet | '';
    forstoIlleggeRenter: JaNeiOption | '';
    totalbeløpUnder4Rettsgebyr: boolean;
    tilbakekrevSmåbeløp: JaNeiOption | '';
    særligeGrunnerBegrunnelse: string | '';
    særligeGrunner: SærligeGrunner[];
    særligeGrunnerAnnetBegrunnelse: string | '';
    harMerEnnEnAktivitet: boolean;
    harGrunnerTilReduksjon: JaNeiOption | '';
    uaktsomAndelTilbakekreves: string | '';
    uaktsomAndelTilbakekrevesManuelt: string | '';
    uaktsomTilbakekrevesBeløp: string | '';
    grovtUaktsomIlleggeRenter: JaNeiOption | '';
};

export { useVilkårsvurderingPeriodeSkjema, VilkårsvurderingSkjemaDefinisjon };
