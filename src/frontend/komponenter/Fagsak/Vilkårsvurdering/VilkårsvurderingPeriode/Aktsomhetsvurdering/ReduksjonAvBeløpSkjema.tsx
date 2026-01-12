import type { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

import { BodyShort, HGrid, HStack, Label, Select, TextField, VStack } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import TilleggesRenterRadioGroup from './TilleggesRenterRadioGroup';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { type Skjema } from '../../../../../hooks/skjema';
import { Aktsomhet } from '../../../../../kodeverk';
import { formatCurrencyNoKr, isEmpty } from '../../../../../utils';
import { useVilkårsvurdering } from '../../VilkårsvurderingContext';
import {
    ANDELER,
    EGENDEFINERT,
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

    const beskjedTilbakekreves = harMerEnnEnAktivitet
        ? formatCurrencyNoKr(valgtPeriode?.feilutbetaltBeløp)
        : '100 %';

    const erGrovtUaktsomhet = skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GrovtUaktsomt;
    const skalTilleggesRenterVerdi =
        skjema.felter.grovtUaktsomIlleggeRenter.verdi &&
        skjema.felter.grovtUaktsomIlleggeRenter.verdi.label;
    return (
        <VStack gap="1">
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA && (
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
                                    size="small"
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
            )}
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionNEI && (
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
            )}
        </VStack>
    );
};

export default ReduksjonAvBeløpSkjema;
