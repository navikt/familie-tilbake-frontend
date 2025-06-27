import type { VilkårsvurderingSkjemaDefinisjon } from './VilkårsvurderingPeriodeSkjemaContext';
import type { IBehandling } from '../../../../typer/behandling';
import type { IFagsak } from '../../../../typer/fagsak';
import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';

import {
    BodyShort,
    Box,
    Button,
    Detail,
    Heading,
    HelpText,
    HGrid,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';
import { styled } from 'styled-components';

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
    vilkårsresultatHjelpeteksterBarnetrygd,
    vilkårsresultatHjelpeteksterKontantstøtte,
    vilkårsresultatTyper,
    Ytelsetype,
} from '../../../../kodeverk';
import { formatterDatostring, isEmpty } from '../../../../utils';
import { Navigering } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import { PeriodeHandling } from '../typer/periodeHandling';
import { useVilkårsvurdering } from '../VilkårsvurderingContext';

const StyledBox = styled(Box)`
    min-width: 20rem;
`;

const StyledStack = styled(Stack)`
    max-width: 30rem;
    width: 100%;
`;

const StyledSelect = styled(Select)`
    width: 15rem;
    padding-bottom: 2rem;
`;

const StyledVilkårsresultatRadio = styled(Radio)`
    .navds-help-text {
        margin-left: 0.3rem;
        display: inline-block;
    }

    .navds-popover {
        min-width: max-content;
    }
`;

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

const lagLabeltekster = (fagsak: IFagsak, resultat: Vilkårsresultat): React.ReactNode => {
    const hjelpetekster = {
        [Ytelsetype.Barnetrygd]: vilkårsresultatHjelpeteksterBarnetrygd,
        [Ytelsetype.Kontantstøtte]: vilkårsresultatHjelpeteksterKontantstøtte,
        [Ytelsetype.Barnetilsyn]: vilkårsresultatHjelpetekster,
        [Ytelsetype.Overgangsstønad]: vilkårsresultatHjelpetekster,
        [Ytelsetype.Skolepenger]: vilkårsresultatHjelpetekster,
        [Ytelsetype.Tilleggsstønad]: vilkårsresultatHjelpetekster,
    }[fagsak.ytelsestype];

    return (
        <div style={{ display: 'inline-flex' }}>
            {vilkårsresultater[resultat]}
            <HelpText placement="right" aria-label={hjelpetekster[resultat]} role="tooltip">
                {hjelpetekster[resultat]}
            </HelpText>
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
}

const VilkårsvurderingPeriodeSkjema: React.FC<IProps> = ({
    behandling,
    periode,
    behandletPerioder,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
    fagsak,
    perioder,
}) => {
    const {
        kanIlleggeRenter,
        oppdaterPeriode,
        onSplitPeriode,
        nestePeriode,
        forrigePeriode,
        gåTilForrigeSteg,
        gåTilNesteSteg,
        senderInn,
        sendInnSkjemaOgNaviger,
    } = useVilkårsvurdering();
    const [navigerer, settNavigerer] = useState(false);
    const { skjema, validerOgOppdaterFelter } = useVilkårsvurderingPeriodeSkjema(
        (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => {
            oppdaterPeriode(oppdatertPeriode);
        }
    );
    const { settIkkePersistertKomponent, harUlagredeData: harEndringer } = useBehandling();

    React.useEffect(() => {
        settNavigerer(false);
        skjema.felter.feilutbetaltBeløpPeriode.onChange(periode.feilutbetaltBeløp);
        skjema.felter.totalbeløpUnder4Rettsgebyr.onChange(erTotalbeløpUnder4Rettsgebyr);
        settSkjemadataFraPeriode(skjema, periode, kanIlleggeRenter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode]);

    const onKopierPeriode = (event: React.ChangeEvent<HTMLSelectElement>) => {
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

    const handleNavigering = async (handling: PeriodeHandling) => {
        if (harEndringer && !validerOgOppdaterFelter(periode)) {
            return;
        }

        settNavigerer(true);
        if (harEndringer) {
            return await sendInnSkjemaOgNaviger(handling);
        }

        switch (handling) {
            case PeriodeHandling.GåTilForrigeSteg:
                return gåTilForrigeSteg();
            case PeriodeHandling.GåTilNesteSteg:
                return gåTilNesteSteg();
            case PeriodeHandling.ForrigePeriode:
                return forrigePeriode(periode);
            case PeriodeHandling.NestePeriode:
                return nestePeriode(periode);
            default:
                break;
        }
    };

    const handleForrigeKnapp = async () => {
        const handling = erFørstePeriode
            ? PeriodeHandling.GåTilForrigeSteg
            : PeriodeHandling.ForrigePeriode;
        return await handleNavigering(handling);
    };

    const handleNesteKnapp = async () => {
        const handling = erSistePeriode
            ? PeriodeHandling.GåTilNesteSteg
            : PeriodeHandling.NestePeriode;
        return await handleNavigering(handling);
    };

    const erFørstePeriode = periode.index === perioder[0].index;
    const hentForrigeKnappTekst = (): string => {
        if (erFørstePeriode) {
            return harEndringer
                ? 'Lagre og gå tilbake til foreldelse'
                : 'Gå tilbake til foreldelse';
        } else {
            return harEndringer
                ? 'Lagre og gå tilbake til forrige periode'
                : 'Gå tilbake til forrige periode';
        }
    };
    const erSistePeriode = periode.index === perioder[perioder.length - 1].index;
    const hentNesteKnappTekst = (): string => {
        if (erSistePeriode) {
            return harEndringer ? 'Lagre og gå videre til vedtak' : 'Gå videre til vedtak';
        } else {
            return harEndringer
                ? 'Lagre og gå videre til neste periode'
                : 'Gå videre til neste periode';
        }
    };

    if (navigerer) {
        return <StyledBox padding="4">Navigerer...</StyledBox>;
    }

    return periode ? (
        <StyledBox padding="4">
            <HGrid columns="1fr 4rem">
                <StyledStack
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
                </StyledStack>
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
                        <StyledSelect
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
                        </StyledSelect>
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
                                    <StyledVilkårsresultatRadio
                                        key={type}
                                        name="valgtVilkarResultatType"
                                        value={type}
                                    >
                                        {lagLabeltekster(fagsak, type)}
                                    </StyledVilkårsresultatRadio>
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
                <Button onClick={handleNesteKnapp} loading={senderInn}>
                    {hentNesteKnappTekst()}
                </Button>
                <Button variant="secondary" onClick={handleForrigeKnapp} loading={senderInn}>
                    {hentForrigeKnappTekst()}
                </Button>
            </Navigering>
        </StyledBox>
    ) : null;
};

export default VilkårsvurderingPeriodeSkjema;
