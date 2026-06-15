import type { ChangeEvent, FC } from 'react';
import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/vilkårsvurdering';
import type { VilkårsvurderingSkjemaDefinisjon } from './VilkårsvurderingPeriodeSkjemaContext';

import {
    BodyShort,
    Button,
    Detail,
    Heading,
    HGrid,
    HStack,
    Radio,
    RadioGroup,
    Select,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { differenceInMonths, parseISO } from 'date-fns';
import { useEffect, useMemo } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import { behandlingVilkaarsvurderingsperioderOptions } from '@/generated-new/@tanstack/react-query.gen';
import { type Skjema, Valideringsstatus } from '@/hooks/skjema';
import { useActionBar } from '@/hooks/useActionBar';
import { Aktsomhet, SærligeGrunner, Vilkårsresultat } from '@/kodeverk';
import { FeilModal } from '@/komponenter/modal/feil/FeilModal';
import { ModalWrapper } from '@/komponenter/modal/ModalWrapper';
import { PeriodeOppsummering } from '@/komponenter/periodeinformasjon/PeriodeOppsummering';
import { useVilkårsvurdering } from '@/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/VilkårsvurderingContext';
import { formatterDatostring, isEmpty } from '@/utils';

import { DelPeriode } from '../../del-periode/DelPeriode';
import { kanSplitte } from '../../del-periode/utils';
import { PeriodeHandling } from '../typer/periodeHandling';
import { AktsomhetsvurderingSkjema } from './aktsomhetsvurdering/AktsomhetsvurderingSkjema';
import { GodTroSkjema } from './GodTroSkjema';
import { SplittPeriode } from './splitt-periode/SplittPeriode';
import { TilbakekrevingAktivitetTabell } from './TilbakekrevingAktivitetTabell';
import {
    ANDELER,
    EGENDEFINERT,
    finnJaNeiOption,
    OptionNEI,
    useVilkårsvurderingPeriodeSkjema,
} from './VilkårsvurderingPeriodeSkjemaContext';

const settSkjemadataFraPeriode = (
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>,
    periode: VilkårsvurderingPeriodeSkjemaData,
    kanIlleggeRenter: boolean
): void => {
    const { vilkårsvurderingsresultatInfo: vurdering } = periode || {};
    skjema.felter.vilkårsresultatBegrunnelse.onChange(periode?.begrunnelse || '');
    skjema.felter.vilkårsresultatvurdering.onChange(vurdering?.vilkårsvurderingsresultat || '');
    skjema.felter.aktsomhetBegrunnelse.onChange(
        (vurdering?.godTro ? vurdering?.godTro?.begrunnelse : vurdering?.aktsomhet?.begrunnelse) ||
            ''
    );
    skjema.felter.erBeløpetIBehold.onChange(
        finnJaNeiOption(vurdering?.godTro?.beløpErIBehold) || ''
    );
    skjema.felter.godTroTilbakekrevesBeløp.onChange(
        vurdering?.godTro?.beløpTilbakekreves?.toString() || ''
    );
    const erForsett = vurdering?.aktsomhet?.aktsomhet === Aktsomhet.Forsettlig;
    const erSimpelUaktsomhet = vurdering?.aktsomhet?.aktsomhet === Aktsomhet.Uaktsomt;
    skjema.felter.aktsomhetVurdering.onChange(vurdering?.aktsomhet?.aktsomhet || '');
    skjema.felter.forstoIlleggeRenter.onChange(
        !kanIlleggeRenter ? OptionNEI : finnJaNeiOption(vurdering?.aktsomhet?.ileggRenter) || ''
    );
    skjema.felter.unnlates4Rettsgebyr.onChange(
        erSimpelUaktsomhet ? vurdering?.aktsomhet?.unnlates4Rettsgebyr || '' : ''
    );
    skjema.felter.særligeGrunnerBegrunnelse.onChange(
        !erForsett ? vurdering?.aktsomhet?.særligeGrunnerBegrunnelse || '' : ''
    );
    skjema.felter.særligeGrunner.onChange(
        vurdering?.aktsomhet?.særligeGrunner?.map(dto => dto.særligGrunn) || []
    );
    const annetSærligGrunn = vurdering?.aktsomhet?.særligeGrunner?.find(
        dto => dto.særligGrunn === SærligeGrunner.Annet
    );
    skjema.felter.særligeGrunnerAnnetBegrunnelse.onChange(annetSærligGrunn?.begrunnelse || '');

    skjema.felter.harMerEnnEnAktivitet.onChange(
        !!periode?.aktiviteter && periode.aktiviteter.length > 1
    );
    skjema.felter.harGrunnerTilReduksjon.onChange(
        !erForsett ? finnJaNeiOption(vurdering?.aktsomhet?.særligeGrunnerTilReduksjon) || '' : ''
    );

    const andelTilbakekreves = vurdering?.aktsomhet?.andelTilbakekreves?.toString() || '';
    const erEgendefinert = !isEmpty(andelTilbakekreves) && !ANDELER.includes(andelTilbakekreves);
    skjema.felter.uaktsomAndelTilbakekreves.onChange(
        erEgendefinert ? EGENDEFINERT : andelTilbakekreves
    );
    skjema.felter.uaktsomAndelTilbakekrevesManuelt.onChange(
        erEgendefinert ? andelTilbakekreves : ''
    );

    skjema.felter.uaktsomTilbakekrevesBeløp.onChange(
        vurdering?.aktsomhet?.beløpTilbakekreves?.toString() || ''
    );
    skjema.felter.grovtUaktsomIlleggeRenter.onChange(
        !kanIlleggeRenter ? OptionNEI : finnJaNeiOption(vurdering?.aktsomhet?.ileggRenter) || ''
    );
};

type Props = {
    periode: VilkårsvurderingPeriodeSkjemaData;
    behandletPerioder: VilkårsvurderingPeriodeSkjemaData[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    pendingPeriode: VilkårsvurderingPeriodeSkjemaData | undefined;
    settPendingPeriode: (periode: VilkårsvurderingPeriodeSkjemaData | undefined) => void;
};

export const VilkårsvurderingPeriodeSkjema: FC<Props> = ({
    periode,
    behandletPerioder,
    erTotalbeløpUnder4Rettsgebyr,
    perioder,
    pendingPeriode,
    settPendingPeriode,
}: Props) => {
    const {
        kanIlleggeRenter,
        oppdaterPeriode,
        onSplitPeriode,
        nestePeriode,
        forrigePeriode,
        navigerTilForrige,
        navigerTilNeste,
        sendInnSkjemaMutation,
        sendInnSkjemaOgNaviger,
        settValgtPeriode,
        erAllePerioderBehandlet,
        erAutoutført,
        hentVilkårsvurdering,
    } = useVilkårsvurdering();
    const { behandlingILesemodus } = useBehandlingState();
    const erLesevisning = behandlingILesemodus || !!erAutoutført;
    const { skjema, validerOgOppdaterFelter } = useVilkårsvurderingPeriodeSkjema(
        (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => {
            oppdaterPeriode(oppdatertPeriode);
        }
    );
    const { behandlingId, behandlingsstegsinfo, erNyModell } = useBehandling();
    const {
        setIkkePersistertKomponent,
        harUlagredeData,
        nullstillIkkePersisterteKomponenter,
        actionBarStegtekst,
    } = useBehandlingState();
    const queryClient = useQueryClient();

    const { data: vilkårsvurderingsperioder } = useQuery({
        ...behandlingVilkaarsvurderingsperioderOptions({ path: { behandlingId } }),
        enabled: erNyModell,
    });

    const visUlagretDataModal = !!pendingPeriode && harUlagredeData;

    // Sjekk om ForeslåVedtak-steget har status tilbakeført
    const erVedtakTilbakeført = behandlingsstegsinfo.some(
        steg =>
            steg.behandlingssteg === 'FORESLÅ_VEDTAK' &&
            steg.behandlingsstegstatus === 'TILBAKEFØRT'
    );

    // Hvis vedtak er tilbakeført, marker vilkårsvurdering som "har ulagrede endringer"
    if (erVedtakTilbakeført && !erLesevisning) {
        setIkkePersistertKomponent('vilkårsvurdering');
    }

    useEffect(() => {
        if (pendingPeriode && !harUlagredeData) {
            settValgtPeriode(pendingPeriode);
            settPendingPeriode(undefined);
        }
    }, [harUlagredeData, pendingPeriode, settValgtPeriode, settPendingPeriode]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    useEffect(() => {
        skjema.felter.feilutbetaltBeløpPeriode.onChange(periode.feilutbetaltBeløp);
        skjema.felter.totalbeløpUnder4Rettsgebyr.onChange(erTotalbeløpUnder4Rettsgebyr);
        settSkjemadataFraPeriode(skjema, periode, kanIlleggeRenter);
    }, [periode, erTotalbeløpUnder4Rettsgebyr, kanIlleggeRenter]);

    const handleForlatUtenÅLagre = (): void => {
        if (pendingPeriode) {
            nullstillIkkePersisterteKomponenter();
            settValgtPeriode(pendingPeriode);

            skjema.felter.feilutbetaltBeløpPeriode.onChange(pendingPeriode.feilutbetaltBeløp);
            skjema.felter.totalbeløpUnder4Rettsgebyr.onChange(erTotalbeløpUnder4Rettsgebyr);
            settSkjemadataFraPeriode(skjema, pendingPeriode, kanIlleggeRenter);
        }
        settPendingPeriode(undefined);
    };

    const handleLagreOgByttPeriode = async (): Promise<void> => {
        if (!pendingPeriode) return;
        const valideringOK = validerOgOppdaterFelter(periode);
        if (!valideringOK) {
            return;
        }

        await sendInnSkjemaOgNaviger(PeriodeHandling.NestePeriode);

        settValgtPeriode(pendingPeriode);
        settPendingPeriode(undefined);
    };

    const handleAvbryt = (): void => {
        settPendingPeriode(undefined);
    };

    const onKopierPeriode = (event: ChangeEvent<HTMLSelectElement>): void => {
        const valgtPeriodeIndex = event.target.value;
        if (valgtPeriodeIndex !== '-') {
            const per = behandletPerioder.find(per => per.index === valgtPeriodeIndex);
            setIkkePersistertKomponent('vilkårsvurdering');
            if (per) {
                settSkjemadataFraPeriode(skjema, per, kanIlleggeRenter);
                event.target.value = '-';
            }
        }
    };

    const vilkårsresultatVurderingGjort = skjema.felter.vilkårsresultatvurdering.verdi !== '';
    const erGodTro = skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.GodTro;

    const ugyldigVilkårsresultatValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.vilkårsresultatvurdering.valideringsstatus === Valideringsstatus.Feil;

    const handleNavigering = async (handling: PeriodeHandling): Promise<(() => void) | void> => {
        let handlingResult: PeriodeHandling | undefined;

        // Alltid valider når man går til vedtak, eller når det er ulagrede data
        const skalValidere = handling === PeriodeHandling.GåTilNesteSteg || harUlagredeData;

        if (skalValidere && !validerOgOppdaterFelter(periode)) {
            return;
        }

        // Lagre data hvis det er ulagrede endringer
        if (harUlagredeData) {
            handlingResult = await sendInnSkjemaOgNaviger(handling);
        }

        const utførHandling = {
            [PeriodeHandling.GåTilForrigeSteg]: (): Promise<void> | void => navigerTilForrige(),
            [PeriodeHandling.GåTilNesteSteg]: (): Promise<void> | void => navigerTilNeste(),
            [PeriodeHandling.ForrigePeriode]: (): void => forrigePeriode(periode),
            [PeriodeHandling.NestePeriode]: (): void => nestePeriode(periode),
        }[handling];

        utførHandling?.();

        if (
            handlingResult &&
            (handlingResult === PeriodeHandling.GåTilForrigeSteg ||
                handlingResult === PeriodeHandling.GåTilNesteSteg)
        ) {
            nullstillIkkePersisterteKomponenter();
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
            });
            if (handlingResult === PeriodeHandling.GåTilForrigeSteg) {
                navigerTilForrige();
            } else {
                navigerTilNeste();
            }
        }
    };

    const erFørstePeriode = periode.index === perioder[0].index;

    const kanSplittePeriode = useMemo(
        () =>
            (periode: VilkårsvurderingPeriodeSkjemaData, erLesevisning: boolean): boolean => {
                const kanSplittePeriodeINyModell = vilkårsvurderingsperioder
                    ? kanSplitte(
                          periode.periode,
                          vilkårsvurderingsperioder.map(({ periode }) => periode)
                      )
                    : false;
                const kanPeriodenSplittes = erNyModell
                    ? kanSplittePeriodeINyModell
                    : differenceInMonths(
                          parseISO(periode.periode.tom),
                          parseISO(periode.periode.fom)
                      ) >= 1;
                return !erLesevisning && !periode.foreldet && kanPeriodenSplittes;
            },
        [vilkårsvurderingsperioder, erNyModell]
    );

    const erSistePeriode = periode.index === perioder[perioder.length - 1].index;

    useActionBar({
        stegtekst: actionBarStegtekst('VILKÅRSVURDERING'),
        forrigeTekst: harUlagredeData ? 'Lagre og gå til forrige' : 'Forrige',
        nesteTekst: harUlagredeData ? 'Lagre og gå til neste' : 'Neste',
        forrigeAriaLabel: `${harUlagredeData ? 'Lagre og gå' : 'Gå'} tilbake til foreldelsessteget`,
        nesteAriaLabel: `${harUlagredeData ? 'Lagre og gå' : 'Gå'} videre til vedtakssteget`,
        onForrige: () => handleNavigering(PeriodeHandling.GåTilForrigeSteg),
        onNeste: () => handleNavigering(PeriodeHandling.GåTilNesteSteg),
        disableNeste: (!erAllePerioderBehandlet && !erSistePeriode) || periode.foreldet,
    });

    if (sendInnSkjemaMutation.isPending) {
        return (
            <div className="min-w-[20rem]" aria-live="polite">
                Navigerer...
            </div>
        );
    }

    if (!periode) return null;

    return (
        <>
            <VStack gap="space-24">
                <HStack justify="space-between">
                    <Heading size="small" level="2">
                        Detaljer for valgt periode
                    </Heading>
                    {kanSplittePeriode(periode, erLesevisning) &&
                        (erNyModell ? (
                            <DelPeriode
                                periode={periode.periode}
                                // Vil aldri være undefined siden kanSplittePeriode vil returnere false hvis vilkårsvurderingsperioder er undefined
                                vilkårsperioder={vilkårsvurderingsperioder ?? []}
                                erVurdert={
                                    !!periode.vilkårsvurderingsresultatInfo
                                        ?.vilkårsvurderingsresultat &&
                                    periode.vilkårsvurderingsresultatInfo
                                        .vilkårsvurderingsresultat !== Vilkårsresultat.Udefinert
                                }
                                hentVilkårsvurdering={hentVilkårsvurdering}
                            />
                        ) : (
                            <SplittPeriode periode={periode} onBekreft={onSplitPeriode} />
                        ))}
                </HStack>
                <PeriodeOppsummering
                    fom={periode.periode.fom}
                    tom={periode.periode.tom}
                    beløp={periode.feilutbetaltBeløp}
                    hendelsetype={periode.hendelsestype}
                />
            </VStack>
            <VStack gap="space-24" className="max-w-xl">
                <TilbakekrevingAktivitetTabell ytelser={periode.aktiviteter} />
                {!erLesevisning &&
                    !periode.foreldet &&
                    behandletPerioder.length > 0 &&
                    perioder.length > 1 && (
                        <Select
                            className="w-60"
                            name="perioderForKopi"
                            onChange={(event: ChangeEvent<HTMLSelectElement>): void =>
                                onKopierPeriode(event)
                            }
                            label={<Detail>Kopier vilkårsvurdering fra</Detail>}
                            readOnly={erLesevisning}
                            size="small"
                        >
                            <option value="-">-</option>
                            {behandletPerioder.map(per => (
                                <option
                                    key={`${per.periode.fom}_${per.periode.tom}`}
                                    value={per.index}
                                >
                                    {`${formatterDatostring(
                                        per.periode.fom
                                    )}–${formatterDatostring(per.periode.tom)}`}
                                </option>
                            ))}
                        </Select>
                    )}
                {periode.foreldet && (
                    <HGrid gap="space-8">
                        <Heading size="xsmall" level="2">
                            Foreldelse
                        </Heading>
                        <BodyShort size="small">Perioden er foreldet</BodyShort>
                    </HGrid>
                )}
                {!periode.foreldet && (
                    <>
                        <RadioGroup
                            id="valgtVilkarResultatType"
                            size="small"
                            readOnly={erLesevisning}
                            legend="Velg det vilkåret i folketrygdloven §22-15 som gjelder for perioden "
                            value={skjema.felter.vilkårsresultatvurdering.verdi}
                            error={
                                ugyldigVilkårsresultatValgt
                                    ? skjema.felter.vilkårsresultatvurdering.feilmelding?.toString()
                                    : ''
                            }
                            onChange={(val: Vilkårsresultat): void => {
                                skjema.felter.vilkårsresultatvurdering.validerOgSettFelt(val);
                                setIkkePersistertKomponent('vilkårsvurdering');
                            }}
                        >
                            <Radio
                                name="valgtVilkarResultatType"
                                value={Vilkårsresultat.ForstoBurdeForstått}
                            >
                                Mottaker <strong>forsto eller burde forstått</strong> at
                                utbetalingen skyldtes en feil (1. ledd, 1. punktum)
                            </Radio>
                            <Radio
                                name="valgtVilkarResultatType"
                                value={Vilkårsresultat.FeilOpplysningerFraBruker}
                            >
                                Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt
                                gitt <strong>feilaktige</strong> opplysninger (1. ledd, 2. punkt)
                            </Radio>
                            <Radio
                                name="valgtVilkarResultatType"
                                value={Vilkårsresultat.MangelfulleOpplysningerFraBruker}
                            >
                                Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt
                                gitt <strong>mangelfulle</strong> opplysninger (1. ledd, 2. punkt)
                            </Radio>
                            <Radio name="valgtVilkarResultatType" value={Vilkårsresultat.GodTro}>
                                Mottaker har mottatt beløpet i <strong>aktsom god tro</strong> (1.
                                ledd)
                            </Radio>
                        </RadioGroup>
                        <Textarea
                            {...skjema.felter.vilkårsresultatBegrunnelse.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            name="vilkårsresultatBegrunnelse"
                            label="Begrunn hvorfor du valgte vilkåret ovenfor"
                            size="small"
                            resize
                            minRows={3}
                            description="Beskriv hvem og hva som forårsaket feilutbetalingen"
                            maxLength={3000}
                            readOnly={erLesevisning}
                            value={skjema.felter.vilkårsresultatBegrunnelse.verdi}
                            onChange={(
                                event: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>
                            ): void => {
                                skjema.felter.vilkårsresultatBegrunnelse.validerOgSettFelt(
                                    event.target.value
                                );
                                setIkkePersistertKomponent('vilkårsvurdering');
                            }}
                        />
                        {vilkårsresultatVurderingGjort && (
                            <>
                                {erGodTro ? (
                                    <GodTroSkjema skjema={skjema} erLesevisning={erLesevisning} />
                                ) : (
                                    <AktsomhetsvurderingSkjema
                                        skjema={skjema}
                                        erLesevisning={erLesevisning}
                                        harFlerePerioder={perioder.length > 1}
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
                <HStack className="justify-end gap-4">
                    {!erFørstePeriode && (
                        <Button
                            variant="secondary"
                            onClick={(): Promise<void | (() => void)> =>
                                handleNavigering(PeriodeHandling.ForrigePeriode)
                            }
                            loading={sendInnSkjemaMutation.isPending}
                            aria-live="polite"
                            size="small"
                            className="py-2"
                        >
                            Forrige periode
                        </Button>
                    )}
                    {!erSistePeriode && (
                        <Button
                            onClick={(): Promise<void | (() => void)> =>
                                handleNavigering(PeriodeHandling.NestePeriode)
                            }
                            loading={sendInnSkjemaMutation.isPending}
                            aria-live="polite"
                            size="small"
                            className="py-2"
                        >
                            Neste periode
                        </Button>
                    )}
                </HStack>
                {sendInnSkjemaMutation.isError && (
                    <FeilModal
                        feil={sendInnSkjemaMutation.error}
                        lukkFeilModal={sendInnSkjemaMutation.reset}
                        beskjed="Du kunne ikke lagre vilkårsvurderingen"
                    />
                )}
                {visUlagretDataModal && (
                    <ModalWrapper
                        tittel="Du har ulagrede endringer"
                        visModal
                        onClose={handleAvbryt}
                        aksjonsknapper={{
                            hovedKnapp: {
                                onClick: handleLagreOgByttPeriode,
                                tekst: 'Lagre og bytt periode',
                            },
                            lukkKnapp: {
                                onClick: handleForlatUtenÅLagre,
                                tekst: 'Fortsett uten å lagre',
                            },
                        }}
                    >
                        Hvis du bytter periode nå, mister du endringene dine. Vil du lagre før du
                        fortsetter?
                    </ModalWrapper>
                )}
            </VStack>
        </>
    );
};
