import type {
    JaNeiOption,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

import { Radio } from '@navikt/ds-react';
import * as React from 'react';

import SærligeGrunnerSkjema from './SærligeGrunnerSkjema';
import { useBehandlingState } from '../../../../../context/BehandlingStateContext';
import { type Skjema, Valideringsstatus } from '../../../../../hooks/skjema';
import { Aktsomhet, Vilkårsresultat } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalRadioGroup } from '../../../../Felleskomponenter/Skjemaelementer';
import { jaNeiOptions, OptionJA, OptionNEI } from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const GradUaktsomhetSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandlingState();
    const erValgtResultatTypeForstoBurdeForstaatt =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.ForstoBurdeForstått;
    const ugyldifSimpelTilbakekrevBeløpUnder4Rettsgebyr =
        skjema.visFeilmeldinger &&
        skjema.felter.tilbakekrevSmåbeløp.valideringsstatus === Valideringsstatus.Feil;
    const erTotalbeløpUnder4Rettsgebyr = skjema.felter.totalbeløpUnder4Rettsgebyr.verdi === true;

    const grovUaktsomOffset = erValgtResultatTypeForstoBurdeForstaatt ? 193 : 213;
    const offset =
        skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GrovUaktsomhet
            ? grovUaktsomOffset
            : 20;
    return (
        <ArrowBox alignOffset={erLesevisning ? 5 : offset} marginTop={erLesevisning ? 15 : 0}>
            {skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.SimpelUaktsomhet &&
                erTotalbeløpUnder4Rettsgebyr && (
                    <>
                        <HorisontalRadioGroup
                            id="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                            legend="Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?"
                            readOnly={erLesevisning}
                            value={skjema.felter.tilbakekrevSmåbeløp.verdi}
                            error={
                                ugyldifSimpelTilbakekrevBeløpUnder4Rettsgebyr
                                    ? skjema.felter.tilbakekrevSmåbeløp.feilmelding?.toString()
                                    : ''
                            }
                            onChange={(val: JaNeiOption) => {
                                skjema.felter.tilbakekrevSmåbeløp.validerOgSettFelt(val);
                                settIkkePersistertKomponent(`vilkårsvurdering`);
                            }}
                        >
                            {jaNeiOptions.map(opt => (
                                <Radio
                                    key={opt.label}
                                    name="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                                    value={opt}
                                    data-testid={`tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_${opt.label}`}
                                >
                                    {opt.label}
                                </Radio>
                            ))}
                        </HorisontalRadioGroup>
                        {skjema.felter.tilbakekrevSmåbeløp.verdi === OptionJA && (
                            <SærligeGrunnerSkjema skjema={skjema} erLesevisning={erLesevisning} />
                        )}
                        {skjema.felter.tilbakekrevSmåbeløp.verdi === OptionNEI && (
                            <ArrowBox alignOffset={80}>
                                Når 6. ledd anvendes må alle perioder behandles likt
                            </ArrowBox>
                        )}
                    </>
                )}
            {(skjema.felter.aktsomhetVurdering.verdi !== Aktsomhet.SimpelUaktsomhet ||
                !erTotalbeløpUnder4Rettsgebyr) && (
                <SærligeGrunnerSkjema skjema={skjema} erLesevisning={erLesevisning} />
            )}
        </ArrowBox>
    );
};

export default GradUaktsomhetSkjema;
