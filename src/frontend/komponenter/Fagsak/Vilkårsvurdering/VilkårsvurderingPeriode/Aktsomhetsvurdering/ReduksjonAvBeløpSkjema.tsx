import type { Skjema } from '../../../../../hooks/skjema';
import type { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

import { BodyShort, Label, Select, TextField } from '@navikt/ds-react';
import * as React from 'react';

import TilleggesRenterRadioGroup from './TilleggesRenterRadioGroup';
import { useBehandlingState } from '../../../../../context/BehandlingStateContext';
import { Aktsomhet } from '../../../../../kodeverk';
import { formatCurrencyNoKr, isEmpty, isNumeric } from '../../../../../utils';
import { useVilkårsvurdering } from '../../VilkårsvurderingContext';
import {
    ANDELER,
    EGENDEFINERT,
    OptionJA,
    OptionNEI,
} from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const ReduksjonAvBeløpSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandlingState();
    const { valgtPeriode, kanIlleggeRenter } = useVilkårsvurdering();
    const harMerEnnEnAktivitet = skjema.felter.harMerEnnEnAktivitet.verdi === true;
    const erEgendefinert =
        !isEmpty(skjema.felter.uaktsomAndelTilbakekreves.verdi) &&
        (!ANDELER.includes(skjema.felter.uaktsomAndelTilbakekreves.verdi) ||
            skjema.felter.uaktsomAndelTilbakekreves.verdi === EGENDEFINERT) &&
        skjema.felter.uaktsomAndelTilbakekreves.verdi !== '-';

    const erGrovtUaktsomhet = skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GrovtUaktsomt;

    return (
        <>
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionJA && (
                <>
                    {!harMerEnnEnAktivitet &&
                        (!erEgendefinert ? (
                            <Select
                                {...skjema.felter.uaktsomAndelTilbakekreves.hentNavInputProps(
                                    skjema.visFeilmeldinger
                                )}
                                label="Angi andel som skal tilbakekreves"
                                size="small"
                                aria-live="polite"
                                id="andelSomTilbakekreves"
                                aria-label="Angi andel som skal tilbakekreves"
                                readOnly={erLesevisning}
                                onChange={event => {
                                    skjema.felter.uaktsomAndelTilbakekreves.validerOgSettFelt(
                                        event.target.value
                                    );
                                    settIkkePersistertKomponent('vilkårsvurdering');
                                }}
                                value={skjema.felter.uaktsomAndelTilbakekreves.verdi ?? ''}
                                style={{ width: '100px' }}
                            >
                                <option value="" disabled>
                                    Velg
                                </option>
                                {ANDELER.map(andel => (
                                    <option key={andel} value={andel}>
                                        {andel}
                                        {isNumeric(andel) ? '%' : null}
                                    </option>
                                ))}
                            </Select>
                        ) : (
                            <TextField
                                {...skjema.felter.uaktsomAndelTilbakekrevesManuelt.hentNavInputProps(
                                    skjema.visFeilmeldinger
                                )}
                                label="Angi andel som skal tilbakekreves i prosent"
                                size="small"
                                aria-live="polite"
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
                        ))}

                    {harMerEnnEnAktivitet && (
                        <TextField
                            {...skjema.felter.uaktsomTilbakekrevesBeløp.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            id="belopSomSkalTilbakekreves"
                            label="Angi beløp som skal tilbakekreves"
                            size="small"
                            aria-live="polite"
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
                        <TilleggesRenterRadioGroup
                            kanIlleggeRenter={kanIlleggeRenter}
                            felt={skjema.felter.grovtUaktsomIlleggeRenter}
                            visFeilmeldingerForSkjema={skjema.visFeilmeldinger}
                            readOnly
                        />
                    )}
                </>
            )}
            {skjema.felter.harGrunnerTilReduksjon.verdi === OptionNEI && (
                <>
                    {harMerEnnEnAktivitet ? (
                        <>
                            <Label size="small" aria-live="polite">
                                Beløp som skal tilbakekreves
                            </Label>
                            <BodyShort size="small" aria-live="polite">
                                {formatCurrencyNoKr(valgtPeriode?.feilutbetaltBeløp)}
                            </BodyShort>
                        </>
                    ) : (
                        <Select
                            label="Andel som skal tilbakekreves"
                            size="small"
                            aria-live="polite"
                            readOnly
                            className="w-65"
                        >
                            <option>100%</option>
                        </Select>
                    )}

                    {erGrovtUaktsomhet && (
                        <TilleggesRenterRadioGroup
                            kanIlleggeRenter={kanIlleggeRenter}
                            felt={skjema.felter.grovtUaktsomIlleggeRenter}
                            visFeilmeldingerForSkjema={skjema.visFeilmeldinger}
                            readOnly={erLesevisning}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default ReduksjonAvBeløpSkjema;
