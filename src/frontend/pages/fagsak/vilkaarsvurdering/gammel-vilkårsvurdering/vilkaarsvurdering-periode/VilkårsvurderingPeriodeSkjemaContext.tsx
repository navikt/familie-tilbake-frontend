import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/vilkårsvurdering';
import type { Skjema } from '~/hooks/skjema';
import type { Aktsomhetsvurdering, GodTro, SærligeGrunnerDto } from '~/typer/tilbakekrevingstyper';

import {
    type Avhengigheter,
    feil,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
    Valideringsstatus,
} from '~/hooks/skjema';
import { Aktsomhet, SærligeGrunner, Vilkårsresultat } from '~/kodeverk';
import { SkalUnnlates } from '~/typer/tilbakekrevingstyper';
import {
    parseStringToNumber,
    erFeltetEmpty,
    validerNummerFelt,
    validerTekstFeltMaksLengde,
} from '~/utils';

export const EGENDEFINERT = 'Egendefinert';
export const ANDELER = ['30', '50', '70', EGENDEFINERT];

export type JaNeiOption = {
    verdi: boolean;
    label: string;
};

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

const erVilkårsresultatOppfylt = (
    resultat: Vilkårsresultat,
    avhengigheter?: Avhengigheter
): boolean =>
    avhengigheter?.vilkårsresultatvurdering.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter?.vilkårsresultatvurdering.verdi === resultat;

const avhengigheterOppfyltGodTroFelter = (avhengigheter?: Avhengigheter): boolean =>
    erVilkårsresultatOppfylt(Vilkårsresultat.GodTro, avhengigheter);

const avhengigheterOppfyltGodTroTilbakekrevesBeløp = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheterOppfyltGodTroFelter(avhengigheter) &&
    avhengigheter?.erBeløpetIBehold.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter.erBeløpetIBehold.verdi === OptionJA;

const avhengigheterOppfyltAktsomhetFelter = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheter?.vilkårsresultatvurdering.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter?.vilkårsresultatvurdering.verdi !== Vilkårsresultat.GodTro;

const erAktsomhetsvurderingOppfylt = (
    aktsomhet: Aktsomhet,
    avhengigheter?: Avhengigheter
): boolean =>
    avhengigheterOppfyltAktsomhetFelter(avhengigheter) &&
    avhengigheter?.aktsomhetVurdering.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter?.aktsomhetVurdering.verdi === aktsomhet;

const avhengigheterOppfyltForstoIlleggrenter = (avhengigheter?: Avhengigheter): boolean =>
    erVilkårsresultatOppfylt(Vilkårsresultat.ForstoBurdeForstått, avhengigheter) &&
    erAktsomhetsvurderingOppfylt(Aktsomhet.Forsettlig, avhengigheter);

const erBeløpUnder4RettsgebyrOppfylt = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheter?.totalbeløpUnder4Rettsgebyr.verdi === true;

const avhengigheterOppfyltTilbakekrevesBeløpUnder4Rettsgebyr = (
    avhengigheter?: Avhengigheter
): boolean =>
    erAktsomhetsvurderingOppfylt(Aktsomhet.Uaktsomt, avhengigheter) &&
    erBeløpUnder4RettsgebyrOppfylt(avhengigheter);

const erTilbakekrevBeløpUnder4Rettsgebyr = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheter?.unnlates4Rettsgebyr.valideringsstatus === Valideringsstatus.Ok &&
    [SkalUnnlates.Tilbakekreves, SkalUnnlates.Over4Rettsgebyr].some(
        verdi => avhengigheter?.unnlates4Rettsgebyr.verdi === verdi
    );

const avhengigheterOppfyltSærligeGrunnerFelter = (avhengigheter?: Avhengigheter): boolean =>
    (erAktsomhetsvurderingOppfylt(Aktsomhet.Uaktsomt, avhengigheter) &&
        (!erBeløpUnder4RettsgebyrOppfylt(avhengigheter) ||
            erTilbakekrevBeløpUnder4Rettsgebyr(avhengigheter))) ||
    erAktsomhetsvurderingOppfylt(Aktsomhet.GrovtUaktsomt, avhengigheter);

const avhengigheterOppfyltSærligGrunnAnnetBegrunnelse = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheterOppfyltSærligeGrunnerFelter(avhengigheter) &&
    avhengigheter?.særligeGrunner.verdi.length > 0 &&
    avhengigheter?.særligeGrunner.verdi.includes(SærligeGrunner.Annet);

const erHarGrunnerTilReduksjonOppfylt = (
    valg: JaNeiOption,
    avhengigheter?: Avhengigheter
): boolean =>
    avhengigheter?.harGrunnerTilReduksjon.valideringsstatus === Valideringsstatus.Ok &&
    avhengigheter.harGrunnerTilReduksjon.verdi === valg;

const avhengigheterOppfyltGrovtIlleggRenter = (avhengigheter?: Avhengigheter): boolean =>
    erAktsomhetsvurderingOppfylt(Aktsomhet.GrovtUaktsomt, avhengigheter) &&
    erHarGrunnerTilReduksjonOppfylt(OptionNEI, avhengigheter);

const avhengigheterOppfyltGrunnerTilReduksjonFelter = (avhengigheter?: Avhengigheter): boolean =>
    (erAktsomhetsvurderingOppfylt(Aktsomhet.Uaktsomt, avhengigheter) ||
        erAktsomhetsvurderingOppfylt(Aktsomhet.GrovtUaktsomt, avhengigheter)) &&
    erHarGrunnerTilReduksjonOppfylt(OptionJA, avhengigheter);

const avhengigheterOppfyltIkkeMerEnnAktivitetFelter = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheterOppfyltGrunnerTilReduksjonFelter(avhengigheter) &&
    avhengigheter?.harMerEnnEnAktivitet.verdi === false;

const avhengigheterOppfyltMerEnnAktivitetFelter = (avhengigheter?: Avhengigheter): boolean =>
    avhengigheterOppfyltGrunnerTilReduksjonFelter(avhengigheter) &&
    avhengigheter?.harMerEnnEnAktivitet.verdi === true;

type VilkårsvurderingPeriodeSkjemaContext = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    validerOgOppdaterFelter: (periode: VilkårsvurderingPeriodeSkjemaData) => boolean;
};

const useVilkårsvurderingPeriodeSkjema = (
    oppdaterPeriode: (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => void
): VilkårsvurderingPeriodeSkjemaContext => {
    const feilutbetaltBeløpPeriode = useFelt<number>({
        feltId: 'feilutbetaltBeløpPeriode',
        verdi: 0,
    });
    const vilkårsresultatBegrunnelse = useFelt<string | ''>({
        feltId: 'vilkårsresultatBegrunnelse',
        verdi: '',
        valideringsfunksjon: (felt: FeltState<string | ''>) =>
            validerTekstFeltMaksLengde(3000, felt),
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
            if (avhengigheter?.vilkårsresultatvurdering.valideringsstatus !== Valideringsstatus.Ok)
                return ok(felt);
            return validerTekstFeltMaksLengde(3000, felt);
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

    const unnlates4Rettsgebyr = useFelt<SkalUnnlates | ''>({
        feltId: 'unnlates4Rettsgebyr',
        verdi: '',
        avhengigheter: { vilkårsresultatvurdering, aktsomhetVurdering, totalbeløpUnder4Rettsgebyr },
        valideringsfunksjon: (
            felt: FeltState<SkalUnnlates | ''>,
            avhengigheter?: Avhengigheter
        ) => {
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
            unnlates4Rettsgebyr,
        },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltSærligeGrunnerFelter(avhengigheter)) return ok(felt);
            return validerTekstFeltMaksLengde(3000, felt);
        },
    });

    const særligeGrunner = useFelt<SærligeGrunner[]>({
        feltId: 'særligeGrunner',
        verdi: [],
        avhengigheter: {
            vilkårsresultatvurdering,
            aktsomhetVurdering,
            totalbeløpUnder4Rettsgebyr,
            unnlates4Rettsgebyr,
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
            unnlates4Rettsgebyr,
            særligeGrunner,
        },
        valideringsfunksjon: (felt: FeltState<string | ''>, avhengigheter?: Avhengigheter) => {
            if (!avhengigheterOppfyltSærligGrunnAnnetBegrunnelse(avhengigheter)) return ok(felt);
            return validerTekstFeltMaksLengde(3000, felt);
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
            unnlates4Rettsgebyr,
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
            return validerNummerFelt(felt, avhengigheter?.feilutbetaltBeløpPeriode.verdi, 0);
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

    const { skjema, kanSendeSkjema, nullstillSkjema } = useSkjema<
        VilkårsvurderingSkjemaDefinisjon,
        string
    >({
        felter: {
            feilutbetaltBeløpPeriode,
            vilkårsresultatBegrunnelse,
            vilkårsresultatvurdering,
            erBeløpetIBehold,
            godTroTilbakekrevesBeløp,
            aktsomhetBegrunnelse,
            aktsomhetVurdering,
            forstoIlleggeRenter,
            totalbeløpUnder4Rettsgebyr,
            unnlates4Rettsgebyr,
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
            skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.ForstoBurdeForstått;
        const erForstoForsett =
            erForsto && skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Forsettlig;
        const erGrovtUaktsomhet =
            skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GrovtUaktsomt;

        const skalVurderereSmåbeløp =
            skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Uaktsomt &&
            skjema.felter.totalbeløpUnder4Rettsgebyr.verdi === true;
        const skalIkkeVurdereSærligeGrunner =
            skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Forsettlig ||
            (skalVurderereSmåbeløp &&
                skjema.felter.unnlates4Rettsgebyr.verdi === SkalUnnlates.Unnlates);

        const harGrunnerTilReduksjon =
            !skalIkkeVurdereSærligeGrunner &&
            skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA;
        const harAndelTilbakekreves =
            harGrunnerTilReduksjon && skjema.felter.harMerEnnEnAktivitet.verdi !== true;

        return {
            begrunnelse: skjema.felter.aktsomhetBegrunnelse.verdi,
            aktsomhet: skjema.felter.aktsomhetVurdering.verdi as Aktsomhet,
            ileggRenter:
                !erForstoForsett && !erGrovtUaktsomhet
                    ? undefined
                    : erForstoForsett
                      ? skjema.felter.forstoIlleggeRenter.verdi === OptionJA
                      : skjema.felter.grovtUaktsomIlleggeRenter.verdi === OptionJA,
            unnlates4Rettsgebyr: skalVurderereSmåbeløp
                ? skjema.felter.unnlates4Rettsgebyr.verdi || undefined
                : undefined,
            særligeGrunnerBegrunnelse: !skalIkkeVurdereSærligeGrunner
                ? skjema.felter.særligeGrunnerBegrunnelse.verdi
                : undefined,
            særligeGrunner: skalIkkeVurdereSærligeGrunner
                ? undefined
                : skjema.felter.særligeGrunner.verdi.map<SærligeGrunnerDto>(grunn => ({
                      særligGrunn: grunn,
                      begrunnelse:
                          grunn === SærligeGrunner.Annet
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

    const validerOgOppdaterFelter = (periode: VilkårsvurderingPeriodeSkjemaData): boolean => {
        if (!kanSendeSkjema()) {
            return false;
        }
        const erGodTro = skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.GodTro;
        oppdaterPeriode({
            ...periode,
            begrunnelse: skjema.felter.vilkårsresultatBegrunnelse.verdi,
            vilkårsvurderingsresultatInfo: {
                vilkårsvurderingsresultat: skjema.felter.vilkårsresultatvurdering
                    .verdi as Vilkårsresultat,
                godTro: erGodTro ? byggGodTro() : undefined,
                aktsomhet: !erGodTro ? byggAktsomhet() : undefined,
            },
        });
        nullstillSkjema();
        return true;
    };

    return {
        skjema,
        validerOgOppdaterFelter,
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
    unnlates4Rettsgebyr: SkalUnnlates | '';
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

export { useVilkårsvurderingPeriodeSkjema };
export type { VilkårsvurderingSkjemaDefinisjon };
