import type { VilkårsvurderingSkjemaDefinisjon } from './VilkårsvurderingPeriodeSkjemaContext';
import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/vilkårsvurdering';
import type { ChangeEvent, FC } from 'react';

import {
    BodyShort,
    Box,
    Button,
    Detail,
    Heading,
    HGrid,
    HStack,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { ATextWidthMax } from '@navikt/ds-tokens/dist/tokens';
import { useQueryClient } from '@tanstack/react-query';
import { differenceInMonths, parseISO } from 'date-fns';
import * as React from 'react';
import { useEffect, useState } from 'react';

import AktsomhetsvurderingSkjema from './Aktsomhetsvurdering/AktsomhetsvurderingSkjema';
import GodTroSkjema from './GodTroSkjema';
import SplittPeriode from './SplittPeriode/SplittPeriode';
import TilbakekrevingAktivitetTabell from './TilbakekrevingAktivitetTabell';
import {
    ANDELER,
    EGENDEFINERT,
    finnJaNeiOption,
    OptionNEI,
    useVilkårsvurderingPeriodeSkjema,
} from './VilkårsvurderingPeriodeSkjemaContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { useBehandlingState } from '../../../../context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '../../../../generated/@tanstack/react-query.gen';
import { type Skjema, Valideringsstatus } from '../../../../hooks/skjema';
import { Aktsomhet, SærligeGrunner, Vilkårsresultat } from '../../../../kodeverk';
import { formatterDatostring, isEmpty } from '../../../../utils';
import { FeilModal } from '../../../Felleskomponenter/Modal/Feil/FeilModal';
import { ModalWrapper } from '../../../Felleskomponenter/Modal/ModalWrapper';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import { ActionBar } from '../../ActionBar/ActionBar';
import { PeriodeHandling } from '../typer/periodeHandling';
import { useVilkårsvurdering } from '../VilkårsvurderingContext';

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
    skjema.felter.tilbakekrevSmåbeløp.onChange(
        erSimpelUaktsomhet ? finnJaNeiOption(vurdering?.aktsomhet?.tilbakekrevSmåbeløp) || '' : ''
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
    erLesevisning: boolean;
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    pendingPeriode: VilkårsvurderingPeriodeSkjemaData | undefined;
    settPendingPeriode: (periode: VilkårsvurderingPeriodeSkjemaData | undefined) => void;
};

const VilkårsvurderingPeriodeSkjema: FC<Props> = ({
    periode,
    behandletPerioder,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
    perioder,
    pendingPeriode,
    settPendingPeriode,
}) => {
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
    } = useVilkårsvurdering();
    const { skjema, validerOgOppdaterFelter } = useVilkårsvurderingPeriodeSkjema(
        (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => {
            oppdaterPeriode(oppdatertPeriode);
        }
    );
    const { behandlingId, behandlingsstegsinfo } = useBehandling();
    const {
        settIkkePersistertKomponent,
        harUlagredeData,
        nullstillIkkePersisterteKomponenter,
        actionBarStegtekst,
    } = useBehandlingState();
    const queryClient = useQueryClient();

    const [visUlagretDataModal, settVisUlagretDataModal] = useState(false);

    // Sjekk om ForeslåVedtak-steget har status tilbakeført
    const erVedtakTilbakeført = behandlingsstegsinfo.some(
        steg =>
            steg.behandlingssteg === 'FORESLÅ_VEDTAK' &&
            steg.behandlingsstegstatus === 'TILBAKEFØRT'
    );

    // Hvis vedtak er tilbakeført, marker vilkårsvurdering som "har ulagrede endringer"
    if (erVedtakTilbakeført && !erLesevisning) {
        settIkkePersistertKomponent('vilkårsvurdering');
    }

    useEffect(() => {
        if (pendingPeriode && harUlagredeData) {
            settVisUlagretDataModal(true);
        } else if (pendingPeriode && !harUlagredeData) {
            settValgtPeriode(pendingPeriode);
            settPendingPeriode(undefined);
        } else {
            settVisUlagretDataModal(false);
        }
    }, [harUlagredeData, pendingPeriode, settValgtPeriode, settPendingPeriode]);

    useEffect(() => {
        skjema.felter.feilutbetaltBeløpPeriode.onChange(periode.feilutbetaltBeløp);
        skjema.felter.totalbeløpUnder4Rettsgebyr.onChange(erTotalbeløpUnder4Rettsgebyr);
        settSkjemadataFraPeriode(skjema, periode, kanIlleggeRenter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode, erTotalbeløpUnder4Rettsgebyr, kanIlleggeRenter]);

    const handleForlatUtenÅLagre = (): void => {
        if (pendingPeriode) {
            nullstillIkkePersisterteKomponenter();
            settValgtPeriode(pendingPeriode);

            skjema.felter.feilutbetaltBeløpPeriode.onChange(pendingPeriode.feilutbetaltBeløp);
            skjema.felter.totalbeløpUnder4Rettsgebyr.onChange(erTotalbeløpUnder4Rettsgebyr);
            settSkjemadataFraPeriode(skjema, pendingPeriode, kanIlleggeRenter);
        }
        settVisUlagretDataModal(false);
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
        settVisUlagretDataModal(false);
        settPendingPeriode(undefined);
    };

    const handleAvbryt = (): void => {
        settVisUlagretDataModal(false);
        settPendingPeriode(undefined);
    };

    const onKopierPeriode = (event: ChangeEvent<HTMLSelectElement>): void => {
        const valgtPeriodeIndex = event.target.value;
        if (valgtPeriodeIndex !== '-') {
            const per = behandletPerioder.find(per => per.index === valgtPeriodeIndex);
            settIkkePersistertKomponent('vilkårsvurdering');
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

    const kanSplittePeriode = (periode: VilkårsvurderingPeriodeSkjemaData): boolean => {
        const fom = parseISO(periode.periode.fom);
        const tom = parseISO(periode.periode.tom);
        return differenceInMonths(tom, fom) >= 1;
    };

    const erSistePeriode = periode.index === perioder[perioder.length - 1].index;

    if (sendInnSkjemaMutation.isPending) {
        return (
            <Box padding="4" className="min-w-[20rem]" aria-live="polite">
                Navigerer...
            </Box>
        );
    }

    if (!periode) return null;

    return (
        <Box padding="4" className="min-w-[20rem]">
            <HGrid columns="1fr 4rem">
                <Stack
                    className="max-w-120 w-full"
                    justify="space-between"
                    align={{ md: 'start', lg: 'center' }}
                    direction={{ md: 'column', lg: 'row' }}
                >
                    <Heading size="small" level="2">
                        Detaljer for valgt periode
                    </Heading>
                    {!erLesevisning && !periode.foreldet && kanSplittePeriode(periode) && (
                        <SplittPeriode periode={periode} onBekreft={onSplitPeriode} />
                    )}
                </Stack>
            </HGrid>
            <VStack gap="6" maxWidth={ATextWidthMax}>
                <PeriodeOppsummering
                    fom={periode.periode.fom}
                    tom={periode.periode.tom}
                    beløp={periode.feilutbetaltBeløp}
                    hendelsetype={periode.hendelsestype}
                />
                <TilbakekrevingAktivitetTabell ytelser={periode.aktiviteter} />
                {!erLesevisning &&
                    !periode.foreldet &&
                    behandletPerioder &&
                    behandletPerioder.length > 0 && (
                        <Select
                            className="w-60"
                            name="perioderForKopi"
                            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
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
                                    )} - ${formatterDatostring(per.periode.tom)}`}
                                </option>
                            ))}
                        </Select>
                    )}
                {periode.foreldet && (
                    <HGrid gap="2">
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
                            onChange={(val: Vilkårsresultat) => {
                                skjema.felter.vilkårsresultatvurdering.validerOgSettFelt(val);
                                settIkkePersistertKomponent('vilkårsvurdering');
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
                            description="Beskriv hvem og hva som forårsaket feilutbetalingen"
                            maxLength={3000}
                            readOnly={erLesevisning}
                            value={skjema.felter.vilkårsresultatBegrunnelse.verdi}
                            onChange={(event: { target: { value: string } }) => {
                                skjema.felter.vilkårsresultatBegrunnelse.validerOgSettFelt(
                                    event.target.value
                                );
                                settIkkePersistertKomponent('vilkårsvurdering');
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
                                    />
                                )}
                            </>
                        )}
                    </>
                )}
            </VStack>
            <HStack className="justify-end gap-4">
                {!erFørstePeriode && (
                    <Button
                        variant="secondary"
                        onClick={() => handleNavigering(PeriodeHandling.ForrigePeriode)}
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
                        onClick={() => handleNavigering(PeriodeHandling.NestePeriode)}
                        loading={sendInnSkjemaMutation.isPending}
                        aria-live="polite"
                        size="small"
                        className="py-2"
                    >
                        Neste periode
                    </Button>
                )}
            </HStack>
            <ActionBar
                stegtekst={actionBarStegtekst('VILKÅRSVURDERING')}
                forrigeAriaLabel="Gå tilbake til foreldelsessteget"
                nesteAriaLabel="Gå videre til vedtakssteget"
                onNeste={() => handleNavigering(PeriodeHandling.GåTilNesteSteg)}
                onForrige={() => handleNavigering(PeriodeHandling.GåTilForrigeSteg)}
                dobbeltNøstet
                // Foreldede perioder blir ikke riktig validert, derfor de disables her. Opprettet bug i trello for dette.
                // https://trello.com/c/CEfUALXj/369-ved-trykk-p%C3%A5-neste-steg-i-vilk%C3%A5rsvurderingen-ved-foreldet-steg-s%C3%A5-er-det-en-feil-i-valideringen-som-sier-at-perioden-mangler-vil
                disableNeste={(!erAllePerioderBehandlet && !erSistePeriode) || periode.foreldet}
            />
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
        </Box>
    );
};

export default VilkårsvurderingPeriodeSkjema;
