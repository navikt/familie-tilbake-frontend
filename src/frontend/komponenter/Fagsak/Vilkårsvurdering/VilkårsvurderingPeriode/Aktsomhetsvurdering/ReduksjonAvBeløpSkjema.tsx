import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Radio } from 'nav-frontend-skjema';
import { Normaltekst, UndertekstBold } from 'nav-frontend-typografi';

import { FamilieInput, FamilieSelect } from '@navikt/familie-form-elements';

import { Aktsomhet } from '../../../../../kodeverk';
import { formatCurrencyNoKr, isNumeric } from '../../../../../utils';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import { useVilkårsvurderingPeriode } from '../VilkårsvurderingPeriodeContext';

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

const Feilmelding = styled(Normaltekst)`
    color: red;
`;

export const EGENDEFINERT = 'Egendefinert';
export const ANDELER = ['30', '50', '70', EGENDEFINERT];

interface IProps {
    uaktsomhetGrad: Aktsomhet;
    harMerEnnEnAktivitet: boolean;
    erLesevisning: boolean;
}

const ReduksjonAvBeløpSkjema: React.FC<IProps> = ({
    uaktsomhetGrad,
    harMerEnnEnAktivitet,
    erLesevisning,
}) => {
    const {
        vilkårsvurderingPeriode,
        aktsomhetsvurdering,
        oppdaterAktsomhetsvurdering,
    } = useVilkårsvurderingPeriode();
    const [feilIBeløp, settFeilIBeløp] = React.useState<boolean>(false);
    const [erEgendefinert, settErEgendefinert] = React.useState<boolean>(false);
    const [feilIAndelManuell, settFeilIAndelManuell] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (aktsomhetsvurdering?.andelTilbakekreves && !erEgendefinert) {
            settErEgendefinert(
                !ANDELER.includes(aktsomhetsvurdering.andelTilbakekreves.toString())
            );
        }
    }, [aktsomhetsvurdering]);

    const onChangeHarGrunner = (harGrunn: boolean) => {
        oppdaterAktsomhetsvurdering({ harGrunnerTilReduksjon: harGrunn });
    };

    const onChangeAndelSelectTilbakekreves = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === EGENDEFINERT) {
            settErEgendefinert(true);
            oppdaterAktsomhetsvurdering({ andelTilbakekreves: undefined });
        } else {
            const andel = Number.parseInt(val);
            oppdaterAktsomhetsvurdering({ andelTilbakekreves: andel });
        }
    };

    const onChangeAndelManuell = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.length === 0) {
            oppdaterAktsomhetsvurdering({ andelTilbakekreves: undefined });
            return;
        }

        if (isNumeric(val)) {
            const nyVerdi = Number(val);
            oppdaterAktsomhetsvurdering({ andelTilbakekreves: nyVerdi });
            settFeilIAndelManuell(false);
        } else {
            settFeilIAndelManuell(true);
        }
    };

    const onChangeTilbakekrevdBeløp = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.length === 0) {
            oppdaterAktsomhetsvurdering({ tilbakekrevesBelop: undefined });
            return;
        }

        if (isNumeric(val)) {
            const nyVerdi = Number(val);
            oppdaterAktsomhetsvurdering({ tilbakekrevesBelop: nyVerdi });
            settFeilIBeløp(false);
        } else {
            settFeilIBeløp(true);
        }
    };

    const onChangeRenter = (verdi: boolean) => {
        oppdaterAktsomhetsvurdering({ ileggRenter: verdi });
    };

    return (
        <>
            <Row>
                <Column md="12">
                    <HorisontalFamilieRadioGruppe
                        id="harGrunnerTilReduksjon"
                        legend={'Skal særlige grunner gi reduksjon av beløpet?'}
                        erLesevisning={erLesevisning}
                    >
                        <Radio
                            name="harGrunnerTilReduksjon"
                            label="Ja"
                            checked={aktsomhetsvurdering?.harGrunnerTilReduksjon === true}
                            onChange={() => onChangeHarGrunner(true)}
                        />
                        <Radio
                            name="harGrunnerTilReduksjon"
                            label="Nei"
                            value="false"
                            checked={aktsomhetsvurdering?.harGrunnerTilReduksjon === false}
                            onChange={() => onChangeHarGrunner(false)}
                        />
                    </HorisontalFamilieRadioGruppe>
                </Column>
            </Row>
            {aktsomhetsvurdering?.harGrunnerTilReduksjon === true && (
                <ArrowBox alignOffset={20}>
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
                                                id="andelSomTilbakekreves"
                                                label=""
                                                erLesevisning={erLesevisning}
                                                onChange={event =>
                                                    onChangeAndelSelectTilbakekreves(event)
                                                }
                                                bredde="xs"
                                                value={aktsomhetsvurdering?.andelTilbakekreves}
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
                                                id="andelSomTilbakekrevesManuell"
                                                erLesevisning={erLesevisning}
                                                onChange={event => onChangeAndelManuell(event)}
                                                value={aktsomhetsvurdering.andelTilbakekreves}
                                                bredde="XS"
                                            />
                                        </FlexColumn>
                                        <FlexColumn className="percentage">
                                            <Normaltekst>%</Normaltekst>
                                        </FlexColumn>
                                    </FlexRow>
                                    {feilIAndelManuell && (
                                        <Feilmelding>Ikke en gyldig andel</Feilmelding>
                                    )}
                                </>
                            )}
                            {harMerEnnEnAktivitet && (
                                <FamilieInput
                                    id="belopSomSkalTilbakekreves"
                                    label={'Angi beløp som skal tilbakekreves'}
                                    erLesevisning={erLesevisning}
                                    onChange={event => onChangeTilbakekrevdBeløp(event)}
                                    value={aktsomhetsvurdering.tilbakekrevesBelop}
                                    feil={feilIBeløp ? 'Ikke et gyldig beløp' : null}
                                    bredde="S"
                                />
                            )}
                        </Column>
                        {uaktsomhetGrad === Aktsomhet.GROVT_UAKTSOM && (
                            <Column md="6">
                                <UndertekstBold>Skal det tillegges renter?</UndertekstBold>
                                <StyledNormaltekst>Nei</StyledNormaltekst>
                            </Column>
                        )}
                    </Row>
                </ArrowBox>
            )}
            {aktsomhetsvurdering?.harGrunnerTilReduksjon === false && (
                <ArrowBox alignOffset={80}>
                    <Row>
                        <Column md="6">
                            <UndertekstBold>
                                {harMerEnnEnAktivitet
                                    ? 'Beløp som skal tilbakekreves'
                                    : 'Andel som skal tilbakekreves'}
                            </UndertekstBold>
                            <StyledNormaltekst>
                                {harMerEnnEnAktivitet
                                    ? formatCurrencyNoKr(vilkårsvurderingPeriode?.feilutbetaltBeløp)
                                    : '100 %'}
                            </StyledNormaltekst>
                        </Column>
                        {uaktsomhetGrad === Aktsomhet.GROVT_UAKTSOM && (
                            <HorisontalFamilieRadioGruppe
                                id="skalDetTilleggesRenter"
                                legend={'Skal det tillegges renter?'}
                                erLesevisning={erLesevisning}
                            >
                                <Radio
                                    name="skalDetTilleggesRenter"
                                    label="Ja"
                                    checked={aktsomhetsvurdering?.ileggRenter === true}
                                    onChange={() => onChangeRenter(true)}
                                />
                                <Radio
                                    name="skalDetTilleggesRenter"
                                    label="Nei"
                                    value="false"
                                    checked={aktsomhetsvurdering?.ileggRenter === false}
                                    onChange={() => onChangeRenter(false)}
                                />
                            </HorisontalFamilieRadioGruppe>
                        )}
                    </Row>
                </ArrowBox>
            )}
        </>
    );
};

export default ReduksjonAvBeløpSkjema;
