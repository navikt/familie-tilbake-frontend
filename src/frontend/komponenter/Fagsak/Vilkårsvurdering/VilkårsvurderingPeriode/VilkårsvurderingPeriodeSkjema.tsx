import * as React from 'react';

import { styled } from 'styled-components';

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
import { type ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

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
    VilkårsvurderingSkjemaDefinisjon,
} from './VilkårsvurderingPeriodeSkjemaContext';
import { useBehandling } from '../../../../context/BehandlingContext';
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
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { formatterDatostring, isEmpty } from '../../../../utils';
import { Navigering } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import PeriodeController from '../../../Felleskomponenter/TilbakeTidslinje/PeriodeController/PeriodeController';
import { useFeilutbetalingVilkårsvurdering } from '../FeilutbetalingVilkårsvurderingContext';
import { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';

const StyledBox = styled(Box)`
    min-width: 20rem;
`;

const StyledStack = styled(Stack)`
    max-width: 30rem;
    width: 100%;
`;

const StyledSelect = styled(Select)`
    width: 15rem;
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
    skjema.felter.vilkårsresultatBegrunnelse.onChange(periode?.begrunnelse || '');
    skjema.felter.vilkårsresultatvurdering.onChange(
        periode?.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat || ''
    );
    const erGodTro = periode.vilkårsvurderingsresultatInfo?.godTro;
    skjema.felter.aktsomhetBegrunnelse.onChange(
        (erGodTro
            ? periode.vilkårsvurderingsresultatInfo?.godTro?.begrunnelse
            : periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.begrunnelse) || ''
    );
    skjema.felter.erBeløpetIBehold.onChange(
        finnJaNeiOption(periode?.vilkårsvurderingsresultatInfo?.godTro?.beløpErIBehold) || ''
    );
    skjema.felter.godTroTilbakekrevesBeløp.onChange(
        periode?.vilkårsvurderingsresultatInfo?.godTro?.beløpTilbakekreves?.toString() || ''
    );
    const erForsett =
        periode.vilkårsvurderingsresultatInfo?.aktsomhet?.aktsomhet === Aktsomhet.FORSETT;
    const erSimpelUaktsomhet =
        periode.vilkårsvurderingsresultatInfo?.aktsomhet?.aktsomhet === Aktsomhet.SIMPEL_UAKTSOMHET;
    skjema.felter.aktsomhetVurdering.onChange(
        periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.aktsomhet || ''
    );
    skjema.felter.forstoIlleggeRenter.onChange(
        !kanIlleggeRenter
            ? OptionNEI
            : finnJaNeiOption(periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.ileggRenter) || ''
    );
    skjema.felter.tilbakekrevSmåbeløp.onChange(
        erSimpelUaktsomhet
            ? finnJaNeiOption(
                  periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.tilbakekrevSmåbeløp
              ) || ''
            : ''
    );
    skjema.felter.særligeGrunnerBegrunnelse.onChange(
        !erForsett
            ? periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.særligeGrunnerBegrunnelse || ''
            : ''
    );
    skjema.felter.særligeGrunner.onChange(
        periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.særligeGrunner?.map(
            dto => dto.særligGrunn
        ) || []
    );
    const annetSærligGrunn =
        periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.særligeGrunner?.find(
            dto => dto.særligGrunn === SærligeGrunner.ANNET
        );
    skjema.felter.særligeGrunnerAnnetBegrunnelse.onChange(annetSærligGrunn?.begrunnelse || '');

    skjema.felter.harMerEnnEnAktivitet.onChange(
        !!periode?.aktiviteter && periode.aktiviteter.length > 1
    );
    skjema.felter.harGrunnerTilReduksjon.onChange(
        !erForsett
            ? finnJaNeiOption(
                  periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.særligeGrunnerTilReduksjon
              ) || ''
            : ''
    );

    const andelTilbakekreves =
        periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.andelTilbakekreves?.toString() || '';
    const erEgendefinert = !isEmpty(andelTilbakekreves) && !ANDELER.includes(andelTilbakekreves);
    skjema.felter.uaktsomAndelTilbakekreves.onChange(
        erEgendefinert ? EGENDEFINERT : andelTilbakekreves
    );
    skjema.felter.uaktsomAndelTilbakekrevesManuelt.onChange(
        erEgendefinert ? andelTilbakekreves : ''
    );

    skjema.felter.uaktsomTilbakekrevesBeløp.onChange(
        periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.beløpTilbakekreves?.toString() || ''
    );
    skjema.felter.grovtUaktsomIlleggeRenter.onChange(
        !kanIlleggeRenter
            ? OptionNEI
            : finnJaNeiOption(periode?.vilkårsvurderingsresultatInfo?.aktsomhet?.ileggRenter) || ''
    );
};

const lagLabeltekster = (fagsak: IFagsak, resultat: Vilkårsresultat): React.ReactNode => {
    const hjelpetekster = {
        [Ytelsetype.BARNETRYGD]: vilkårsresultatHjelpeteksterBarnetrygd,
        [Ytelsetype.KONTANTSTØTTE]: vilkårsresultatHjelpeteksterKontantstøtte,
        [Ytelsetype.BARNETILSYN]: vilkårsresultatHjelpetekster,
        [Ytelsetype.OVERGANGSSTØNAD]: vilkårsresultatHjelpetekster,
        [Ytelsetype.SKOLEPENGER]: vilkårsresultatHjelpetekster,
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
}

const VilkårsvurderingPeriodeSkjema: React.FC<IProps> = ({
    behandling,
    periode,
    behandletPerioder,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
    fagsak,
}) => {
    const {
        kanIlleggeRenter,
        oppdaterPeriode,
        onSplitPeriode,
        nestePeriode,
        forrigePeriode,
        settValgtPeriode,
    } = useFeilutbetalingVilkårsvurdering();
    const { skjema, onBekreft } = useVilkårsvurderingPeriodeSkjema(
        (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => {
            oppdaterPeriode(oppdatertPeriode);
        }
    );
    const { settIkkePersistertKomponent } = useBehandling();

    React.useEffect(() => {
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
    const erGodTro = skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.GOD_TRO;
    const erForstodBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;

    const ugyldigVilkårsresultatValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.vilkårsresultatvurdering.valideringsstatus === Valideringsstatus.FEIL;

    return periode ? (
        <StyledBox padding="4" borderColor="border-strong" borderWidth="1">
            <HGrid columns={'1fr 4rem'}>
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
                <PeriodeController
                    nestePeriode={() => nestePeriode(periode)}
                    forrigePeriode={() => forrigePeriode(periode)}
                />
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
                                Varsel
                            </Heading>
                            <BodyShort>{periode.begrunnelse ? periode.begrunnelse : ''}</BodyShort>
                        </div>
                        <div>
                            <Heading size="xsmall" level="2" spacing>
                                Vurder om perioden er foreldet
                            </Heading>
                            <BodyShort size="small">Perioden er foreldet</BodyShort>
                        </div>
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
                                label={'Vilkårene for tilbakekreving'}
                                placeholder={
                                    'Hvilke hendelser har ført til feilutbetalingen og vurder valg av hjemmel'
                                }
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
                                legend={'Er vilkårene for tilbakekreving oppfylt?'}
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
                {!periode.foreldet && !erLesevisning && (
                    <Button variant="primary" onClick={() => onBekreft(periode)}>
                        Bekreft
                    </Button>
                )}
                <Button variant="secondary" onClick={() => settValgtPeriode(undefined)}>
                    Lukk
                </Button>
            </Navigering>
        </StyledBox>
    ) : null;
};

export default VilkårsvurderingPeriodeSkjema;
