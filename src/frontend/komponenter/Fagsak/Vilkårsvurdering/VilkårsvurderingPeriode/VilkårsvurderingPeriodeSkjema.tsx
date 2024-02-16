import * as React from 'react';

import { styled } from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Detail, Heading, HelpText, Radio, Select, Textarea } from '@navikt/ds-react';
import { ABorderStrong, ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieRadioGruppe } from '@navikt/familie-form-elements';
import { type ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

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
import { FTButton, Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import PeriodeController from '../../../Felleskomponenter/TilbakeTidslinje/PeriodeController/PeriodeController';
import { useFeilutbetalingVilkårsvurdering } from '../FeilutbetalingVilkårsvurderingContext';
import { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';
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

const StyledContainer = styled.div`
    border: 1px solid ${ABorderStrong};
    padding: ${ASpacing3};
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
            <HelpText
                placement="right"
                aria-label={hjelpetekster[resultat]}
                role="tooltip"
                children={hjelpetekster[resultat]}
            />
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
        lukkValgtPeriode,
        nestePeriode,
        forrigePeriode,
    } = useFeilutbetalingVilkårsvurdering();
    const { skjema, onBekreft } = useVilkårsvurderingPeriodeSkjema(
        (oppdatertPeriode: VilkårsvurderingPeriodeSkjemaData) => {
            oppdaterPeriode(oppdatertPeriode);
        }
    );

    React.useEffect(() => {
        skjema.felter.feilutbetaltBeløpPeriode.onChange(periode.feilutbetaltBeløp);
        skjema.felter.totalbeløpUnder4Rettsgebyr.onChange(erTotalbeløpUnder4Rettsgebyr);
        settSkjemadataFraPeriode(skjema, periode, kanIlleggeRenter);
    }, [periode]);

    const onKopierPeriode = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const valgtPeriodeIndex = event.target.value;
        if (valgtPeriodeIndex !== '-') {
            const per = behandletPerioder.find(per => per.index === valgtPeriodeIndex);
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
        <StyledContainer>
            <Row>
                <Column lg="4" md="7" sm="12">
                    <Heading size="small" level="2">
                        Detaljer for valgt periode
                    </Heading>
                </Column>
                <Column lg="2" md="2" sm="6">
                    {!erLesevisning && !periode.foreldet && (
                        <SplittPeriode
                            behandling={behandling}
                            periode={periode}
                            onBekreft={onSplitPeriode}
                        />
                    )}
                </Column>
                <Column lg="6" md="3" sm="6">
                    <PeriodeController
                        nestePeriode={() => nestePeriode(periode)}
                        forrigePeriode={() => forrigePeriode(periode)}
                    />
                </Column>
            </Row>
            <Row>
                <Column lg="6" md="9" sm="12">
                    <PeriodeOppsummering
                        fom={periode.periode.fom}
                        tom={periode.periode.tom}
                        beløp={periode.feilutbetaltBeløp}
                        hendelsetype={periode.hendelsestype}
                    />
                </Column>
            </Row>
            <Spacer20 />
            <TilbakekrevingAktivitetTabell ytelser={periode.aktiviteter} />
            <Spacer20 />
            {!erLesevisning &&
                !periode.foreldet &&
                behandletPerioder &&
                behandletPerioder.length > 0 && (
                    <>
                        <Row>
                            <Column md="3">
                                <Select
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
                            </Column>
                        </Row>
                        <Spacer20 />
                    </>
                )}
            <Row>
                <Column md={periode.foreldet ? '12' : '6'}>
                    <Row>
                        {periode.foreldet ? (
                            <Column md="12">
                                <Row>
                                    <Column md="6">
                                        <Heading size="xsmall" level="2" spacing>
                                            Varsel
                                        </Heading>
                                        <BodyShort>
                                            {periode.begrunnelse ? periode.begrunnelse : ''}
                                        </BodyShort>
                                    </Column>
                                    <Column md="6">
                                        <Heading size="xsmall" level="2" spacing>
                                            Vurder om perioden er foreldet
                                        </Heading>
                                        <BodyShort size="small">Perioden er foreldet</BodyShort>
                                    </Column>
                                </Row>
                            </Column>
                        ) : (
                            <Column md="10">
                                <Heading size="small" level="2" spacing>
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
                                    onChange={event =>
                                        skjema.felter.vilkårsresultatBegrunnelse.validerOgSettFelt(
                                            event.target.value
                                        )
                                    }
                                />
                                <Spacer20 />
                                <FamilieRadioGruppe
                                    id="valgtVilkarResultatType"
                                    erLesevisning={erLesevisning}
                                    legend={'Er vilkårene for tilbakekreving oppfylt?'}
                                    value={
                                        !erLesevisning
                                            ? skjema.felter.vilkårsresultatvurdering.verdi
                                            : periode.vilkårsvurderingsresultatInfo
                                                    ?.vilkårsvurderingsresultat
                                              ? vilkårsresultater[
                                                    periode.vilkårsvurderingsresultatInfo
                                                        ?.vilkårsvurderingsresultat
                                                ]
                                              : ''
                                    }
                                    error={
                                        ugyldigVilkårsresultatValgt
                                            ? skjema.felter.vilkårsresultatvurdering.feilmelding?.toString()
                                            : ''
                                    }
                                    onChange={(val: Vilkårsresultat) =>
                                        skjema.felter.vilkårsresultatvurdering.validerOgSettFelt(
                                            val
                                        )
                                    }
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
                                </FamilieRadioGruppe>
                            </Column>
                        )}
                    </Row>
                </Column>
                <Column xs="12" md="6">
                    <Row>
                        <Column md="11">
                            {vilkårsresultatVurderingGjort && (
                                <>
                                    {erGodTro ? (
                                        <Heading size="small" level="2" spacing>
                                            Beløpet mottatt i god tro
                                        </Heading>
                                    ) : (
                                        <Heading size="small" level="2" spacing>
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
                                        onChange={event =>
                                            skjema.felter.aktsomhetBegrunnelse.validerOgSettFelt(
                                                event.target.value
                                            )
                                        }
                                        maxLength={3000}
                                    />
                                    <Spacer20 />
                                    {erGodTro ? (
                                        <GodTroSkjema
                                            skjema={skjema}
                                            erLesevisning={erLesevisning}
                                        />
                                    ) : (
                                        <AktsomhetsvurderingSkjema
                                            skjema={skjema}
                                            erLesevisning={erLesevisning}
                                        />
                                    )}
                                </>
                            )}
                        </Column>
                    </Row>
                </Column>
            </Row>
            <Spacer20 />
            {!erLesevisning && (
                <>
                    <Row>
                        <Column xs="12" md="11">
                            <Navigering>
                                <div>
                                    {!periode.foreldet && (
                                        <FTButton
                                            variant="primary"
                                            onClick={() => onBekreft(periode)}
                                        >
                                            Bekreft
                                        </FTButton>
                                    )}
                                </div>
                                <div>
                                    <FTButton variant="secondary" onClick={lukkValgtPeriode}>
                                        Lukk
                                    </FTButton>
                                </div>
                            </Navigering>
                        </Column>
                    </Row>
                </>
            )}
        </StyledContainer>
    ) : null;
};

export default VilkårsvurderingPeriodeSkjema;
