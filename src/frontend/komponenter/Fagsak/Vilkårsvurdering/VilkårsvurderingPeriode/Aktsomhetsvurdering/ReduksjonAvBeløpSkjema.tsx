import type {
    JaNeiOption,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

import {
    BodyShort,
    HGrid,
    HStack,
    Label,
    Radio,
    Select,
    TextField,
    VStack,
} from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import TilleggesRenterRadioGroup from './TilleggesRenterRadioGroup';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { type Skjema, Valideringsstatus } from '../../../../../hooks/skjema';
import { Aktsomhet } from '../../../../../kodeverk';
import { formatCurrencyNoKr, isEmpty } from '../../../../../utils';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalRadioGroup } from '../../../../Felleskomponenter/Skjemaelementer';
import { useVilkårsvurdering } from '../../VilkårsvurderingContext';
import {
    ANDELER,
    EGENDEFINERT,
    jaNeiOptions,
    OptionJA,
    OptionNEI,
} from '../VilkårsvurderingPeriodeSkjemaContext';

const StyledNormaltekst = styled(BodyShort)`
    padding-top: 15px;
`;

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const ReduksjonAvBeløpSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandling();
    const { valgtPeriode, kanIlleggeRenter } = useVilkårsvurdering();
    const harMerEnnEnAktivitet = skjema.felter.harMerEnnEnAktivitet.verdi === true;
    const erEgendefinert =
        !isEmpty(skjema.felter.uaktsomAndelTilbakekreves.verdi) &&
        (!ANDELER.includes(skjema.felter.uaktsomAndelTilbakekreves.verdi) ||
            skjema.felter.uaktsomAndelTilbakekreves.verdi === EGENDEFINERT) &&
        skjema.felter.uaktsomAndelTilbakekreves.verdi !== '-';

    const ugyldigHarGrunnertilReduksjonValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.harGrunnerTilReduksjon.valideringsstatus === Valideringsstatus.Feil;

    const beskjedTilbakekreves = harMerEnnEnAktivitet
        ? formatCurrencyNoKr(valgtPeriode?.feilutbetaltBeløp)
        : '100 %';

    const erGrovtUaktsomhet = skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GrovtUaktsomt;
    const skalTilleggesRenterVerdi =
        skjema.felter.grovtUaktsomIlleggeRenter.verdi &&
        skjema.felter.grovtUaktsomIlleggeRenter.verdi.label;
    return (
        <VStack gap="1">
            <HorisontalRadioGroup
                id="harGrunnerTilReduksjon"
                legend="Skal særlige grunner gi reduksjon av beløpet?"
                readOnly={erLesevisning}
                value={skjema.felter.harGrunnerTilReduksjon.verdi}
                error={
                    ugyldigHarGrunnertilReduksjonValgt
                        ? skjema.felter.harGrunnerTilReduksjon.feilmelding?.toString()
                        : ''
                }
                onChange={(val: JaNeiOption) => {
                    skjema.felter.grovtUaktsomIlleggeRenter.validerOgSettFelt(OptionNEI);
                    settIkkePersistertKomponent('vilkårsvurdering');
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
            </HorisontalRadioGroup>
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA && (
                <ArrowBox alignOffset={erLesevisning ? 5 : 20}>
                    <HGrid columns={2}>
                        {!harMerEnnEnAktivitet && !erEgendefinert && (
                            <VStack gap="2">
                                <Label>Angi andel som skal tilbakekreves</Label>
                                <HStack align="center" gap="1">
                                    <Select
                                        {...skjema.felter.uaktsomAndelTilbakekreves.hentNavInputProps(
                                            skjema.visFeilmeldinger
                                        )}
                                        label={null}
                                        hideLabel
                                        id="andelSomTilbakekreves"
                                        aria-label="Angi andel som skal tilbakekreves"
                                        readOnly={erLesevisning}
                                        onChange={event => {
                                            skjema.felter.uaktsomAndelTilbakekreves.validerOgSettFelt(
                                                event.target.value
                                            );
                                            settIkkePersistertKomponent('vilkårsvurdering');
                                        }}
                                        value={skjema.felter.uaktsomAndelTilbakekreves.verdi}
                                        style={{ width: '100px' }}
                                    >
                                        <option>-</option>
                                        {ANDELER.map(andel => (
                                            <option key={andel} value={andel}>
                                                {andel}
                                            </option>
                                        ))}
                                    </Select>
                                    %
                                </HStack>
                            </VStack>
                        )}
                        {!harMerEnnEnAktivitet && erEgendefinert && (
                            <VStack gap="2">
                                <Label>Angi andel som skal tilbakekreves</Label>
                                <HStack align="center" gap="1">
                                    <TextField
                                        {...skjema.felter.uaktsomAndelTilbakekrevesManuelt.hentNavInputProps(
                                            skjema.visFeilmeldinger
                                        )}
                                        label={null}
                                        hideLabel
                                        id="andelSomTilbakekrevesManuell"
                                        aria-label="Angi andel som skal tilbakekreves - fritekst"
                                        readOnly={erLesevisning}
                                        onChange={event => {
                                            skjema.felter.uaktsomAndelTilbakekrevesManuelt.validerOgSettFelt(
                                                event.target.value
                                            );
                                            settIkkePersistertKomponent('vilkårsvurdering');
                                        }}
                                        value={skjema.felter.uaktsomAndelTilbakekrevesManuelt.verdi}
                                        data-testid="andelSomTilbakekrevesManuell"
                                        style={{ width: '100px' }}
                                    />
                                    %
                                </HStack>
                            </VStack>
                        )}
                        {harMerEnnEnAktivitet && (
                            <TextField
                                {...skjema.felter.uaktsomTilbakekrevesBeløp.hentNavInputProps(
                                    skjema.visFeilmeldinger
                                )}
                                id="belopSomSkalTilbakekreves"
                                label="Angi beløp som skal tilbakekreves"
                                readOnly={erLesevisning}
                                value={skjema.felter.uaktsomTilbakekrevesBeløp.verdi}
                                onChange={event => {
                                    skjema.felter.uaktsomTilbakekrevesBeløp.validerOgSettFelt(
                                        event.target.value
                                    );
                                    settIkkePersistertKomponent('vilkårsvurdering');
                                }}
                                style={{ width: '100px' }}
                            />
                        )}
                        {erGrovtUaktsomhet && (
                            <div>
                                <Label>Skal det tillegges renter?</Label>
                                <StyledNormaltekst>{skalTilleggesRenterVerdi}</StyledNormaltekst>
                            </div>
                        )}
                    </HGrid>
                </ArrowBox>
            )}
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionNEI && (
                <ArrowBox alignOffset={erLesevisning ? 5 : 80}>
                    <HGrid columns={2}>
                        <div>
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
                        </div>
                        {erGrovtUaktsomhet && (
                            <TilleggesRenterRadioGroup
                                erLesevisning={erLesevisning}
                                kanIlleggeRenter={kanIlleggeRenter}
                                felt={skjema.felter.grovtUaktsomIlleggeRenter}
                                visFeilmeldingerForSkjema={skjema.visFeilmeldinger}
                            />
                        )}
                    </HGrid>
                </ArrowBox>
            )}
        </VStack>
    );
};

export default ReduksjonAvBeløpSkjema;
