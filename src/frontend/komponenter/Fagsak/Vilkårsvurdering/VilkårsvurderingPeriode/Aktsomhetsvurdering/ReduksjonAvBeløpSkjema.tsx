import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Radio } from 'nav-frontend-skjema';
import { Normaltekst, UndertekstBold } from 'nav-frontend-typografi';

import { FamilieInput, FamilieSelect } from '@navikt/familie-form-elements';
import { ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import { Aktsomhet } from '../../../../../kodeverk';
import { formatCurrencyNoKr, isEmpty } from '../../../../../utils';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import { useFeilutbetalingVilkårsvurdering } from '../../FeilutbetalingVilkårsvurderingContext';
import {
    ANDELER,
    EGENDEFINERT,
    jaNeiOptions,
    OptionJA,
    OptionNEI,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

const StyledLabel = styled(UndertekstBold)`
    line-height: 1.375rem;
    font-size: 1rem;
`;

const StyledNormaltekst = styled(Normaltekst)`
    padding-top: 15px;
`;

const FlexRow = styled.div`
    margin-top: 5px;
    display: flex;
    flex: 0 0 100%;
    flex-flow: row nowrap;
`;

const FlexColumn = styled.div`
    flex: 0 1 auto;
    padding-left: 8px;
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

    return (
        <>
            <HorisontalFamilieRadioGruppe
                id="harGrunnerTilReduksjon"
                legend={'Skal særlige grunner gi reduksjon av beløpet?'}
                erLesevisning={erLesevisning}
                verdi={skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA ? 'Ja' : 'Nei'}
                feil={
                    ugyldigHarGrunnertilReduksjonValgt
                        ? skjema.felter.harGrunnerTilReduksjon.feilmelding?.toString()
                        : ''
                }
            >
                {jaNeiOptions.map(opt => (
                    <Radio
                        key={opt.label}
                        name="harGrunnerTilReduksjon"
                        label={opt.label}
                        checked={skjema.felter.harGrunnerTilReduksjon.verdi === opt}
                        onChange={() => skjema.felter.harGrunnerTilReduksjon.validerOgSettFelt(opt)}
                        data-testid={`harGrunnerTilReduksjon_${opt.label}`}
                    />
                ))}
            </HorisontalFamilieRadioGruppe>
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA && (
                <ArrowBox alignOffset={erLesevisning ? 5 : 20}>
                    <Row>
                        <Column md="6">
                            {!harMerEnnEnAktivitet && !erEgendefinert && (
                                <>
                                    <UndertekstBold>
                                        Angi andel som skal tilbakekreves
                                    </UndertekstBold>
                                    <FlexRow>
                                        <FlexColumn>
                                            <FamilieSelect
                                                {...skjema.felter.uaktsomAndelTilbakekreves.hentNavInputProps(
                                                    skjema.visFeilmeldinger
                                                )}
                                                id="andelSomTilbakekreves"
                                                label=""
                                                erLesevisning={erLesevisning}
                                                onChange={event =>
                                                    skjema.felter.uaktsomAndelTilbakekreves.validerOgSettFelt(
                                                        event.target.value
                                                    )
                                                }
                                                bredde="xs"
                                                value={
                                                    skjema.felter.uaktsomAndelTilbakekreves.verdi
                                                }
                                            >
                                                <option>-</option>
                                                {ANDELER.map(andel => (
                                                    <option key={andel} value={andel}>
                                                        {andel}
                                                    </option>
                                                ))}
                                            </FamilieSelect>
                                        </FlexColumn>
                                        <FlexColumn>%</FlexColumn>
                                    </FlexRow>
                                </>
                            )}
                            {!harMerEnnEnAktivitet && erEgendefinert && (
                                <>
                                    <UndertekstBold>
                                        Angi andel som skal tilbakekreves
                                    </UndertekstBold>
                                    <FlexRow>
                                        <FlexColumn>
                                            <FamilieInput
                                                {...skjema.felter.uaktsomAndelTilbakekrevesManuelt.hentNavInputProps(
                                                    skjema.visFeilmeldinger
                                                )}
                                                id="andelSomTilbakekrevesManuell"
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
                                                bredde="XS"
                                            />
                                        </FlexColumn>
                                        <FlexColumn className="percentage">
                                            <Normaltekst>%</Normaltekst>
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
                                    bredde="S"
                                />
                            )}
                        </Column>
                        {skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GROV_UAKTSOMHET && (
                            <Column md="6">
                                <UndertekstBold>Skal det tillegges renter?</UndertekstBold>
                                <StyledNormaltekst>Nei</StyledNormaltekst>
                            </Column>
                        )}
                    </Row>
                </ArrowBox>
            )}
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionNEI && (
                <ArrowBox alignOffset={erLesevisning ? 5 : 80}>
                    <Row>
                        <Column md="6">
                            <StyledLabel>
                                {harMerEnnEnAktivitet
                                    ? 'Beløp som skal tilbakekreves'
                                    : 'Andel som skal tilbakekreves'}
                            </StyledLabel>
                            {kanIlleggeRenter ? (
                                <StyledNormaltekst>{beskjedTilbakekreves}</StyledNormaltekst>
                            ) : (
                                <Normaltekst>{beskjedTilbakekreves}</Normaltekst>
                            )}
                        </Column>
                        {skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GROV_UAKTSOMHET && (
                            <HorisontalFamilieRadioGruppe
                                id="skalDetTilleggesRenter"
                                legend={'Skal det tillegges renter?'}
                                erLesevisning={erLesevisning || !kanIlleggeRenter}
                                verdi={
                                    skjema.felter.grovtUaktsomIlleggeRenter.verdi === OptionJA
                                        ? 'Ja'
                                        : 'Nei'
                                }
                                feil={
                                    ugyldigIlleggRenterValgt
                                        ? skjema.felter.grovtUaktsomIlleggeRenter.feilmelding?.toString()
                                        : ''
                                }
                            >
                                {jaNeiOptions.map(opt => (
                                    <Radio
                                        key={opt.label}
                                        name="skalDetTilleggesRenter"
                                        label={opt.label}
                                        checked={
                                            skjema.felter.grovtUaktsomIlleggeRenter.verdi === opt
                                        }
                                        onChange={() =>
                                            skjema.felter.grovtUaktsomIlleggeRenter.validerOgSettFelt(
                                                opt
                                            )
                                        }
                                        data-testid={`skalDetTilleggesRenter_${opt.label}`}
                                    />
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
