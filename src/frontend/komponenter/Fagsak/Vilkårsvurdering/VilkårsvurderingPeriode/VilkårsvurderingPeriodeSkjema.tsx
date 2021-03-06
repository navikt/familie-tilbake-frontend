import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import Hjelpetekst from 'nav-frontend-hjelpetekst';
import { Knapp } from 'nav-frontend-knapper';
import { PopoverOrientering } from 'nav-frontend-popover';
import { Radio } from 'nav-frontend-skjema';
import { Normaltekst, Undertekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { FamilieRadioGruppe, FamilieSelect } from '@navikt/familie-form-elements';
import { ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import {
    Aktsomhet,
    SærligeGrunner,
    Vilkårsresultat,
    vilkårsresultater,
    vilkårsresultatHjelpetekster,
    vilkårsresultatHjelpeteksterBarnetrygd,
    vilkårsresultatTyper,
    Ytelsetype,
} from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { formatCurrencyNoKr, formatterDatostring, isEmpty } from '../../../../utils';
import {
    Navigering,
    PeriodeKontroll,
    Spacer20,
    Spacer8,
} from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import { FamilieTilbakeTextArea } from '../../../Felleskomponenter/Skjemaelementer';
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
    border: 1px solid ${navFarger.navGra60};
    padding: 10px;
`;

const StyledHjelpetekst = styled(Hjelpetekst)`
    width: 1.3rem;
    height: 1.3rem;
    margin-left: 0.5rem;
    top: 4px;
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
    const hjelpetekster =
        fagsak.ytelsestype === Ytelsetype.BARNETRYGD
            ? vilkårsresultatHjelpeteksterBarnetrygd
            : vilkårsresultatHjelpetekster;
    return (
        <>
            {vilkårsresultater[resultat]}
            <StyledHjelpetekst type={PopoverOrientering.UnderVenstre}>
                {hjelpetekster[resultat]}
            </StyledHjelpetekst>
        </>
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
    const { kanIlleggeRenter, oppdaterPeriode, onSplitPeriode, lukkValgtPeriode } =
        useFeilutbetalingVilkårsvurdering();
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

    const ugyldigVilkårsresultatValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.vilkårsresultatvurdering.valideringsstatus === Valideringsstatus.FEIL;

    return periode ? (
        <StyledContainer>
            <PeriodeKontroll>
                <Row>
                    <Column md="7">
                        <Undertittel>Detaljer for valgt periode</Undertittel>
                    </Column>
                    {!erLesevisning && !periode.foreldet && (
                        <Column md="5">
                            <SplittPeriode
                                behandling={behandling}
                                periode={periode}
                                onBekreft={onSplitPeriode}
                            />
                        </Column>
                    )}
                </Row>
                <Row>
                    <Column md="12">
                        <PeriodeOppsummering
                            fom={periode.periode.fom}
                            tom={periode.periode.tom}
                            beløp={periode.feilutbetaltBeløp}
                            hendelsetype={periode.hendelsestype}
                        />
                    </Column>
                </Row>
            </PeriodeKontroll>
            <Spacer20 />
            {periode.reduserteBeløper?.map((beløp, index) => (
                <React.Fragment key={`rb_${index}_${beløp.belop}`}>
                    <Normaltekst>
                        {beløp.trekk ? (
                            <>
                                Feilutbetalt beløp er redusert med{' '}
                                <b>kr. {formatCurrencyNoKr(beløp.belop)},-</b> på grunn av trekk.
                            </>
                        ) : (
                            <>
                                Feilutbetalt beløp er redusert med{' '}
                                <b>kr. {formatCurrencyNoKr(beløp.belop)},-</b> på grunn av
                                etterbetaling innen samme periode.
                            </>
                        )}
                    </Normaltekst>
                    <Spacer8 />
                </React.Fragment>
            ))}
            <TilbakekrevingAktivitetTabell ytelser={periode.aktiviteter} />
            <Spacer20 />
            {!erLesevisning &&
                !periode.foreldet &&
                behandletPerioder &&
                behandletPerioder.length > 0 && (
                    <>
                        <Row>
                            <Column md="10">
                                <Undertekst>Kopier vilkårsvurdering fra</Undertekst>
                                <FamilieSelect
                                    name="perioderForKopi"
                                    onChange={event => onKopierPeriode(event)}
                                    bredde="m"
                                    label=""
                                    erLesevisning={erLesevisning}
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
                                </FamilieSelect>
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
                                        <UndertekstBold>Varsel</UndertekstBold>
                                        <Spacer8 />
                                        <Normaltekst>
                                            {periode.begrunnelse ? periode.begrunnelse : ''}
                                        </Normaltekst>
                                    </Column>
                                    <Column md="6">
                                        <UndertekstBold>
                                            Vurder om perioden er foreldet
                                        </UndertekstBold>
                                        <Spacer8 />
                                        <Normaltekst>Perioden er foreldet</Normaltekst>
                                    </Column>
                                </Row>
                            </Column>
                        ) : (
                            <Column md="10">
                                <Undertittel>Vilkårene for tilbakekreving</Undertittel>
                                <Spacer8 />
                                <FamilieTilbakeTextArea
                                    {...skjema.felter.vilkårsresultatBegrunnelse.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    name="vilkårsresultatBegrunnelse"
                                    label={'Vilkårene for tilbakekreving'}
                                    placeholder={
                                        'Hvilke hendelser har ført til feilutbetalingen og vurder valg av hjemmel'
                                    }
                                    maxLength={1500}
                                    erLesevisning={erLesevisning}
                                    value={skjema.felter.vilkårsresultatBegrunnelse.verdi}
                                    onChange={event =>
                                        skjema.felter.vilkårsresultatBegrunnelse.validerOgSettFelt(
                                            event.target.value
                                        )
                                    }
                                />
                                <Spacer8 />
                                <FamilieRadioGruppe
                                    id="valgtVilkarResultatType"
                                    erLesevisning={erLesevisning}
                                    legend={'Er vilkårene for tilbakekreving oppfylt?'}
                                    verdi={
                                        periode.vilkårsvurderingsresultatInfo
                                            ?.vilkårsvurderingsresultat
                                            ? vilkårsresultater[
                                                  periode.vilkårsvurderingsresultatInfo
                                                      ?.vilkårsvurderingsresultat
                                              ]
                                            : ''
                                    }
                                    feil={
                                        ugyldigVilkårsresultatValgt
                                            ? skjema.felter.vilkårsresultatvurdering.feilmelding?.toString()
                                            : ''
                                    }
                                >
                                    {vilkårsresultatTyper.map(type => (
                                        <Radio
                                            key={type}
                                            name="valgtVilkarResultatType"
                                            label={lagLabeltekster(fagsak, type)}
                                            value={type}
                                            checked={
                                                skjema.felter.vilkårsresultatvurdering.verdi ===
                                                type
                                            }
                                            onChange={() =>
                                                skjema.felter.vilkårsresultatvurdering.validerOgSettFelt(
                                                    type
                                                )
                                            }
                                        />
                                    ))}
                                </FamilieRadioGruppe>
                            </Column>
                        )}
                    </Row>
                </Column>
                <Column xs="12" md="6">
                    <Row>
                        <Column md="10">
                            {vilkårsresultatVurderingGjort && (
                                <>
                                    {erGodTro ? (
                                        <Undertittel>Beløpet mottatt i god tro</Undertittel>
                                    ) : (
                                        <Undertittel>Aktsomhet</Undertittel>
                                    )}
                                    <Spacer8 />
                                    <FamilieTilbakeTextArea
                                        {...skjema.felter.aktsomhetBegrunnelse.hentNavInputProps(
                                            skjema.visFeilmeldinger
                                        )}
                                        name="vurderingBegrunnelse"
                                        label={
                                            erGodTro
                                                ? 'Vurder om beløpet er i behold'
                                                : 'Vurder i hvilken grad mottaker har handlet uaktsomt'
                                        }
                                        placeholder={
                                            erGodTro
                                                ? 'Begrunn hvorfor beløpet er i behold / er ikke i behold'
                                                : ''
                                        }
                                        erLesevisning={erLesevisning}
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
                                        maxLength={1500}
                                    />
                                    <Spacer8 />
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
                                        <Knapp
                                            type={'hoved'}
                                            mini={true}
                                            onClick={() => onBekreft(periode)}
                                        >
                                            Bekreft
                                        </Knapp>
                                    )}
                                </div>
                                <div>
                                    <Knapp mini={true} onClick={lukkValgtPeriode}>
                                        Lukk
                                    </Knapp>
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
