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
import { useVilkårsvurderingPeriodeSkjema } from './VilkårsvurderingPeriodeSkjemaContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { Valideringsstatus } from '../../../../hooks/skjema';
import {
    Vilkårsresultat,
    vilkårsresultater,
    vilkårsresultatHjelpetekster,
    vilkårsresultatHjelpeteksterBarnetrygd,
    vilkårsresultatHjelpeteksterKontantstøtte,
    vilkårsresultatTyper,
    Ytelsetype,
} from '../../../../kodeverk';
import { formatterDatostring } from '../../../../utils';
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
        onSplitPeriode,
        nestePeriode,
        forrigePeriode,
        gåTilForrigeSteg,
        gåTilNesteSteg,
        senderInn,
        sendInnSkjemaOgNaviger,
    } = useVilkårsvurdering();
    const [navigerer, settNavigerer] = useState(false);
    const { skjema, validerOgOppdaterFelter, populerSkjemaFraPeriode } =
        useVilkårsvurderingPeriodeSkjema();
    const { settIkkePersistertKomponent, harUlagredeData } = useBehandling();

    React.useEffect(() => {
        settNavigerer(false);
        populerSkjemaFraPeriode(periode, kanIlleggeRenter);
        skjema.felter.totalbeløpUnder4Rettsgebyr.onChange(erTotalbeløpUnder4Rettsgebyr);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periode, kanIlleggeRenter, erTotalbeløpUnder4Rettsgebyr]);

    const onKopierPeriode = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const valgtPeriodeIndex = event.target.value;
        if (valgtPeriodeIndex !== '-') {
            const per = behandletPerioder.find(per => per.index === valgtPeriodeIndex);
            settIkkePersistertKomponent('vilkårsvurdering');
            if (per) {
                populerSkjemaFraPeriode(per, kanIlleggeRenter);
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
        if (harUlagredeData) {
            if (!validerOgOppdaterFelter(periode)) return;
            settNavigerer(true);
            return await sendInnSkjemaOgNaviger(handling);
        }

        const utførHandling = {
            [PeriodeHandling.GåTilForrigeSteg]: () => gåTilForrigeSteg(),
            [PeriodeHandling.GåTilNesteSteg]: () => gåTilNesteSteg(),
            [PeriodeHandling.ForrigePeriode]: () => forrigePeriode(periode),
            [PeriodeHandling.NestePeriode]: () => nestePeriode(periode),
        }[handling];

        return utførHandling?.();
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
