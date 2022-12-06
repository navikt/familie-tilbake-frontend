import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Label, Radio } from '@navikt/ds-react';
import { FamilieInput, FamilieSelect } from '@navikt/familie-form-elements';
import { type ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import { Aktsomhet, Vilkårsresultat } from '../../../../../kodeverk';
import { formatCurrencyNoKr, isEmpty } from '../../../../../utils';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import { useFeilutbetalingVilkårsvurdering } from '../../FeilutbetalingVilkårsvurderingContext';
import {
    ANDELER,
    EGENDEFINERT,
    JaNeiOption,
    jaNeiOptions,
    OptionJA,
    OptionNEI,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

const StyledNormaltekst = styled(BodyShort)`
    padding-top: 15px;
`;

const FlexRow = styled.div`
    display: flex;
    flex: 0 0 100%;
    flex-flow: row nowrap;
    align-items: center;
`;

const FlexColumn = styled.div`
    flex: 0 1 auto;
    padding-right: 8px;
`;

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const ReduksjonAvBeløpSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const { valgtPeriode, kanIlleggeRenter } = useFeilutbetalingVilkårsvurdering();
    const harMerEnnEnAktivitet = skjema.felter.harMerEnnEnAktivitet.verdi === true;
    const erEgendefinert =
        !isEmpty(skjema.felter.uaktsomAndelTilbakekreves.verdi) &&
        (!ANDELER.includes(skjema.felter.uaktsomAndelTilbakekreves.verdi) ||
            skjema.felter.uaktsomAndelTilbakekreves.verdi === EGENDEFINERT) &&
        skjema.felter.uaktsomAndelTilbakekreves.verdi !== '-';

    const ugyldigHarGrunnertilReduksjonValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.harGrunnerTilReduksjon.valideringsstatus === Valideringsstatus.FEIL;

    const ugyldigIlleggRenterValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.grovtUaktsomIlleggeRenter.valideringsstatus === Valideringsstatus.FEIL;

    const beskjedTilbakekreves = harMerEnnEnAktivitet
        ? formatCurrencyNoKr(valgtPeriode?.feilutbetaltBeløp)
        : '100 %';

    const erGrovtUaktsomhet = skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GROV_UAKTSOMHET;

    return (
        <>
            <HorisontalFamilieRadioGruppe
                id="harGrunnerTilReduksjon"
                legend={'Skal særlige grunner gi reduksjon av beløpet?'}
                erLesevisning={erLesevisning}
                value={
                    !erLesevisning
                        ? skjema.felter.harGrunnerTilReduksjon.verdi
                        : skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA
                        ? 'Ja'
                        : 'Nei'
                }
                error={
                    ugyldigHarGrunnertilReduksjonValgt
                        ? skjema.felter.harGrunnerTilReduksjon.feilmelding?.toString()
                        : ''
                }
                onChange={(val: JaNeiOption) => {
                    const skalPreutfylleUtenRenter =
                        val === OptionNEI &&
                        skjema.felter.grovtUaktsomIlleggeRenter.verdi === '' &&
                        skjema.felter.vilkårsresultatvurdering.verdi ===
                            Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;
                    if (skalPreutfylleUtenRenter) {
                        skjema.felter.grovtUaktsomIlleggeRenter.validerOgSettFelt(OptionNEI);
                    }
                    return skjema.felter.harGrunnerTilReduksjon.validerOgSettFelt(val);
                }}
            >
                {jaNeiOptions.map(opt => (
                    <Radio
                        key={opt.label}
                        name="harGrunnerTilReduksjon"
                        data-testid={`harGrunnerTilReduksjon_${opt.label}`}
                        value={opt}
                    >
                        {opt.label}
                    </Radio>
                ))}
            </HorisontalFamilieRadioGruppe>
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA && (
                <ArrowBox alignOffset={erLesevisning ? 5 : 20}>
                    <Row>
                        <Column md={!erGrovtUaktsomhet ? '12' : '6'}>
                            {!harMerEnnEnAktivitet && !erEgendefinert && (
                                <>
                                    <Label>Angi andel som skal tilbakekreves</Label>
                                    <FlexRow>
                                        <FlexColumn>
                                            <FamilieSelect
                                                {...skjema.felter.uaktsomAndelTilbakekreves.hentNavInputProps(
                                                    skjema.visFeilmeldinger
                                                )}
                                                label={null}
                                                id="andelSomTilbakekreves"
                                                aria-label="Angi andel som skal tilbakekreves"
                                                erLesevisning={erLesevisning}
                                                onChange={event =>
                                                    skjema.felter.uaktsomAndelTilbakekreves.validerOgSettFelt(
                                                        event.target.value
                                                    )
                                                }
                                                value={
                                                    skjema.felter.uaktsomAndelTilbakekreves.verdi
                                                }
                                                style={{ width: '100px' }}
                                            >
                                                <option>-</option>
                                                {ANDELER.map(andel => (
                                                    <option key={andel} value={andel}>
                                                        {andel}
                                                    </option>
                                                ))}
                                            </FamilieSelect>
                                        </FlexColumn>
                                        <FlexColumn>
                                            <BodyShort as="span" style={{ marginTop: '5px' }}>
                                                %
                                            </BodyShort>
                                        </FlexColumn>
                                    </FlexRow>
                                </>
                            )}
                            {!harMerEnnEnAktivitet && erEgendefinert && (
                                <>
                                    <Label>Angi andel som skal tilbakekreves</Label>
                                    <FlexRow>
                                        <FlexColumn>
                                            <FamilieInput
                                                {...skjema.felter.uaktsomAndelTilbakekrevesManuelt.hentNavInputProps(
                                                    skjema.visFeilmeldinger
                                                )}
                                                label={null}
                                                id="andelSomTilbakekrevesManuell"
                                                aria-label="Angi andel som skal tilbakekreves - fritekst"
                                                erLesevisning={erLesevisning}
                                                onChange={event =>
                                                    skjema.felter.uaktsomAndelTilbakekrevesManuelt.validerOgSettFelt(
                                                        event.target.value
                                                    )
                                                }
                                                value={
                                                    skjema.felter.uaktsomAndelTilbakekrevesManuelt
                                                        .verdi
                                                }
                                                data-testid="andelSomTilbakekrevesManuell"
                                                style={{ width: '100px' }}
                                            />
                                        </FlexColumn>
                                        <FlexColumn
                                            className="percentage"
                                            style={{ paddingTop: '5px' }}
                                        >
                                            %
                                        </FlexColumn>
                                    </FlexRow>
                                </>
                            )}
                            {harMerEnnEnAktivitet && (
                                <FamilieInput
                                    {...skjema.felter.uaktsomTilbakekrevesBeløp.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    id="belopSomSkalTilbakekreves"
                                    label={'Angi beløp som skal tilbakekreves'}
                                    erLesevisning={erLesevisning}
                                    value={skjema.felter.uaktsomTilbakekrevesBeløp.verdi}
                                    onChange={event =>
                                        skjema.felter.uaktsomTilbakekrevesBeløp.validerOgSettFelt(
                                            event.target.value
                                        )
                                    }
                                    style={{ width: '100px' }}
                                />
                            )}
                        </Column>
                        {erGrovtUaktsomhet && (
                            <Column md="6">
                                <Label>Skal det tillegges renter?</Label>
                                <StyledNormaltekst>Nei</StyledNormaltekst>
                            </Column>
                        )}
                    </Row>
                </ArrowBox>
            )}
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionNEI && (
                <ArrowBox alignOffset={erLesevisning ? 5 : 80}>
                    <Row>
                        <Column md={!erGrovtUaktsomhet ? '12' : '6'}>
                            <Label spacing={harMerEnnEnAktivitet}>
                                {harMerEnnEnAktivitet
                                    ? 'Beløp som skal tilbakekreves'
                                    : 'Andel som skal tilbakekreves'}
                            </Label>
                            {kanIlleggeRenter ? (
                                <StyledNormaltekst>{beskjedTilbakekreves}</StyledNormaltekst>
                            ) : (
                                <BodyShort>{beskjedTilbakekreves}</BodyShort>
                            )}
                        </Column>
                        {erGrovtUaktsomhet && (
                            <HorisontalFamilieRadioGruppe
                                id="skalDetTilleggesRenter"
                                legend={'Skal det tillegges renter?'}
                                erLesevisning={erLesevisning || !kanIlleggeRenter}
                                value={
                                    !erLesevisning && kanIlleggeRenter
                                        ? skjema.felter.grovtUaktsomIlleggeRenter.verdi
                                        : skjema.felter.grovtUaktsomIlleggeRenter.verdi === OptionJA
                                        ? 'Ja'
                                        : 'Nei'
                                }
                                error={
                                    ugyldigIlleggRenterValgt
                                        ? skjema.felter.grovtUaktsomIlleggeRenter.feilmelding?.toString()
                                        : ''
                                }
                                margin-bottom="none"
                                onChange={(val: JaNeiOption) =>
                                    skjema.felter.grovtUaktsomIlleggeRenter.validerOgSettFelt(val)
                                }
                            >
                                {jaNeiOptions.map(opt => (
                                    <Radio
                                        key={opt.label}
                                        name="skalDetTilleggesRenter"
                                        data-testid={`skalDetTilleggesRenter_${opt.label}`}
                                        value={opt}
                                    >
                                        {opt.label}
                                    </Radio>
                                ))}
                            </HorisontalFamilieRadioGruppe>
                        )}
                    </Row>
                </ArrowBox>
            )}
        </>
    );
};

export default ReduksjonAvBeløpSkjema;
