import type { VilkårsvurderingSkjemaDefinisjon } from './VilkårsvurderingPeriodeSkjemaContext';
import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';
import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';
import type { ChangeEvent, FC, ReactNode } from 'react';

import {
    BodyShort,
    Box,
    Button,
    Detail,
    Heading,
    HGrid,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Textarea,
    VStack,
} from '@navikt/ds-react';
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
import { type ISkjema, Valideringsstatus } from '../../../../hooks/skjema';
import {
    Aktsomhet,
    SærligeGrunner,
    Vilkårsresultat,
    vilkårsresultater,
    vilkårsresultatHjelpetekster,
    vilkårsresultatTyper,
} from '../../../../kodeverk';
import { formatterDatostring, isEmpty } from '../../../../utils';
import { Navigering } from '../../../Felleskomponenter/Flytelementer';
import { FeilModal } from '../../../Felleskomponenter/Modal/Feil/FeilModal';
import { ModalWrapper } from '../../../Felleskomponenter/Modal/ModalWrapper';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import { PeriodeHandling } from '../typer/periodeHandling';
import { useVilkårsvurdering } from '../VilkårsvurderingContext';

const settSkjemadataFraPeriode = (
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>,
    periode: VilkårsvurderingPeriodeSkjemaData,
    kanIlleggeRenter: boolean
) => {
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
    const erForsett = vurdering?.aktsomhet?.aktsomhet === Aktsomhet.Forsett;
    const erSimpelUaktsomhet = vurdering?.aktsomhet?.aktsomhet === Aktsomhet.SimpelUaktsomhet;
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

const lagLabeltekster = (resultat: Vilkårsresultat): ReactNode => {
    return (
        <div style={{ display: 'inline-flex' }}>
            {`${vilkårsresultater[resultat]} (${vilkårsresultatHjelpetekster[resultat]})`}
        </div>
    );
};

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
    periode: VilkårsvurderingPeriodeSkjemaData;
    behandletPerioder: VilkårsvurderingPeriodeSkjemaData[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
    perioder: VilkårsvurderingPeriodeSkjemaData[];
    pendingPeriode: VilkårsvurderingPeriodeSkjemaData | undefined;
    settPendingPeriode: (periode: VilkårsvurderingPeriodeSkjemaData | undefined) => void;
}

const VilkårsvurderingPeriodeSkjema: FC<IProps> = ({
    behandling,
    periode,
    behandletPerioder,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
    fagsak,
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
        gåTilForrigeSteg,
        gåTilNesteSteg,
        sendInnSkjemaMutation,
        sendInnSkjemaOgNaviger,
        settValgtPeriode,
        hentBehandlingMedBehandlingId,
    } = useVilkårsvurdering();
    const { skjema, validerOgOppdaterFelter } = useVilkårsvurderingPeriodeSkjema(
        (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => {
            oppdaterPeriode(oppdatertPeriode);
        }
    );
    const { settIkkePersistertKomponent, harUlagredeData, nullstillIkkePersisterteKomponenter } =
        useBehandling();

    const [visUlagretDataModal, settVisUlagretDataModal] = useState(false);

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

    const handleForlatUtenÅLagre = () => {
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

    const handleLagreOgByttPeriode = async () => {
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

    const handleAvbryt = () => {
        settVisUlagretDataModal(false);
        settPendingPeriode(undefined);
    };

    const onKopierPeriode = (event: ChangeEvent<HTMLSelectElement>) => {
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
    const erForstodBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.ForstoBurdeForstått;

    const ugyldigVilkårsresultatValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.vilkårsresultatvurdering.valideringsstatus === Valideringsstatus.Feil;

    const handleNavigering = async (handling: PeriodeHandling): Promise<void> => {
        let handlingResult: PeriodeHandling | undefined;

        if (harUlagredeData) {
            if (!validerOgOppdaterFelter(periode)) return;
            handlingResult = await sendInnSkjemaOgNaviger(handling);
        }

        const utførHandling = {
            [PeriodeHandling.GåTilForrigeSteg]: () => gåTilForrigeSteg(),
            [PeriodeHandling.GåTilNesteSteg]: () => gåTilNesteSteg(),
            [PeriodeHandling.ForrigePeriode]: () => forrigePeriode(periode),
            [PeriodeHandling.NestePeriode]: () => nestePeriode(periode),
        }[handling];

        utførHandling?.();

        if (
            handlingResult &&
            (handlingResult === PeriodeHandling.GåTilForrigeSteg ||
                handlingResult === PeriodeHandling.GåTilNesteSteg)
        ) {
            await hentBehandlingMedBehandlingId(behandling.behandlingId);
        }
    };

    const erFørstePeriode = periode.index === perioder[0].index;
    const handleForrigeKnapp = async (): Promise<void> => {
        const handling = erFørstePeriode
            ? PeriodeHandling.GåTilForrigeSteg
            : PeriodeHandling.ForrigePeriode;
        return await handleNavigering(handling);
    };
    const hentForrigeKnappTekst = (): string => {
        if (erFørstePeriode) {
            return harUlagredeData
                ? 'Lagre og gå tilbake til foreldelse'
                : 'Gå tilbake til foreldelse';
        } else {
            return harUlagredeData
                ? 'Lagre og gå tilbake til forrige periode'
                : 'Gå tilbake til forrige periode';
        }
    };

    const erSistePeriode = periode.index === perioder[perioder.length - 1].index;
    const handleNesteKnapp = async (): Promise<void> => {
        const handling = erSistePeriode
            ? PeriodeHandling.GåTilNesteSteg
            : PeriodeHandling.NestePeriode;
        return await handleNavigering(handling);
    };
    const hentNesteKnappTekst = (): string => {
        if (erSistePeriode) {
            return harUlagredeData ? 'Lagre og gå videre til vedtak' : 'Gå videre til vedtak';
        } else {
            return harUlagredeData
                ? 'Lagre og gå videre til neste periode'
                : 'Gå videre til neste periode';
        }
    };

    if (sendInnSkjemaMutation.isPending) {
        return (
            <Box padding="4" className="min-w-[20rem]">
                Navigerer...
            </Box>
        );
    }

    if (!periode) return null;

    return (
        <Box padding="4" className="min-w-[20rem]">
            <HGrid columns="1fr 4rem">
                <Stack
                    className="max-w-[30rem] w-full"
                    justify="space-between"
                    align={{ md: 'start', lg: 'center' }}
                    direction={{ md: 'column', lg: 'row' }}
                >
                    <Heading size="small" level="2">
                        Detaljer for valgt periode
                    </Heading>
                    {!erLesevisning && !periode.foreldet && (
                        <SplittPeriode
                            behandling={behandling}
                            periode={periode}
                            onBekreft={onSplitPeriode}
                        />
                    )}
                </Stack>
            </HGrid>

            <VStack gap="4">
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
                            className="pb-8 w-[15rem]"
                            name="perioderForKopi"
                            onChange={event => onKopierPeriode(event)}
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
                    <HGrid columns={{ lg: 2, md: 1 }} gap="5">
                        <div>
                            <Heading size="xsmall" level="2" spacing>
                                Foreldelse
                            </Heading>
                            <BodyShort size="small">Perioden er foreldet</BodyShort>
                        </div>
                        <div></div>
                    </HGrid>
                )}
                {!periode.foreldet && (
                    <HGrid columns={{ lg: 2, md: 1 }} gap="8">
                        <VStack gap="5">
                            <Heading size="small" level="2">
                                Vilkårene for tilbakekreving
                            </Heading>
                            <Textarea
                                {...skjema.felter.vilkårsresultatBegrunnelse.hentNavInputProps(
                                    skjema.visFeilmeldinger
                                )}
                                name="vilkårsresultatBegrunnelse"
                                label="Vilkårene for tilbakekreving"
                                placeholder="Hvilke hendelser har ført til feilutbetalingen og vurder valg av hjemmel"
                                maxLength={3000}
                                readOnly={erLesevisning}
                                value={skjema.felter.vilkårsresultatBegrunnelse.verdi}
                                onChange={event => {
                                    skjema.felter.vilkårsresultatBegrunnelse.validerOgSettFelt(
                                        event.target.value
                                    );
                                    settIkkePersistertKomponent('vilkårsvurdering');
                                }}
                            />
                            <RadioGroup
                                id="valgtVilkarResultatType"
                                readOnly={erLesevisning}
                                legend="Er vilkårene for tilbakekreving oppfylt?"
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
                                {vilkårsresultatTyper.map(type => (
                                    <Radio key={type} name="valgtVilkarResultatType" value={type}>
                                        {lagLabeltekster(type)}
                                    </Radio>
                                ))}
                            </RadioGroup>
                        </VStack>
                        {vilkårsresultatVurderingGjort && (
                            <VStack gap="5">
                                {erGodTro ? (
                                    <Heading size="small" level="2">
                                        Beløpet mottatt i god tro
                                    </Heading>
                                ) : (
                                    <Heading size="small" level="2">
                                        Aktsomhet
                                    </Heading>
                                )}
                                <Textarea
                                    {...skjema.felter.aktsomhetBegrunnelse.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    name="vurderingBegrunnelse"
                                    label={
                                        erGodTro
                                            ? 'Vurder om beløpet er i behold'
                                            : erForstodBurdeForstått
                                              ? 'Vurder hvorfor mottaker burde forstått, må ha forstått eller forsto at utbetalingen skyldtes en feil'
                                              : 'Vurder i hvilken grad mottaker har handlet uaktsomt'
                                    }
                                    placeholder={
                                        erGodTro
                                            ? 'Begrunn hvorfor beløpet er i behold / er ikke i behold'
                                            : ''
                                    }
                                    readOnly={erLesevisning}
                                    value={
                                        skjema.felter.aktsomhetBegrunnelse
                                            ? skjema.felter.aktsomhetBegrunnelse.verdi
                                            : ''
                                    }
                                    onChange={event => {
                                        skjema.felter.aktsomhetBegrunnelse.validerOgSettFelt(
                                            event.target.value
                                        );
                                        settIkkePersistertKomponent('vilkårsvurdering');
                                    }}
                                    maxLength={3000}
                                />
                                {erGodTro ? (
                                    <GodTroSkjema skjema={skjema} erLesevisning={erLesevisning} />
                                ) : (
                                    <AktsomhetsvurderingSkjema
                                        skjema={skjema}
                                        erLesevisning={erLesevisning}
                                    />
                                )}
                            </VStack>
                        )}
                    </HGrid>
                )}
            </VStack>

            <Navigering>
                <Button onClick={handleNesteKnapp} loading={sendInnSkjemaMutation.isPending}>
                    {hentNesteKnappTekst()}
                </Button>
                <Button
                    variant="secondary"
                    onClick={handleForrigeKnapp}
                    loading={sendInnSkjemaMutation.isPending}
                >
                    {hentForrigeKnappTekst()}
                </Button>
            </Navigering>

            {sendInnSkjemaMutation.isError && (
                <FeilModal
                    feil={sendInnSkjemaMutation.error}
                    lukkFeilModal={sendInnSkjemaMutation.reset}
                    beskjed="Du kunne ikke lagre vilkårsvurderingen"
                    behandlingId={behandling.behandlingId}
                    fagsakId={fagsak.eksternFagsakId}
                />
            )}

            {visUlagretDataModal && (
                <ModalWrapper
                    tittel="Du har ikke lagret dine siste endringer og vil miste disse om du bytter periode"
                    visModal
                    onClose={handleAvbryt}
                    aksjonsknapper={{
                        hovedKnapp: {
                            onClick: handleLagreOgByttPeriode,
                            tekst: 'Lagre og bytt periode',
                        },
                        lukkKnapp: {
                            onClick: handleForlatUtenÅLagre,
                            tekst: 'Bytt uten å lagre',
                        },
                        marginTop: 4,
                    }}
                />
            )}
        </Box>
    );
};

export default VilkårsvurderingPeriodeSkjema;
