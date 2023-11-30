import * as React from 'react';

import { Radio } from '@navikt/ds-react';
import { type ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import { Aktsomhet, Vilkårsresultat } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import {
    JaNeiOption,
    jaNeiOptions,
    OptionJA,
    OptionNEI,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';
import SærligeGrunnerSkjema from './SærligeGrunnerSkjema';

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const GradUaktsomhetSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const erValgtResultatTypeForstoBurdeForstaatt =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.FORSTO_BURDE_FORSTÅTT;
    const ugyldifSimpelTilbakekrevBeløpUnder4Rettsgebyr =
        skjema.visFeilmeldinger &&
        skjema.felter.tilbakekrevSmåbeløp.valideringsstatus === Valideringsstatus.FEIL;
    const erTotalbeløpUnder4Rettsgebyr = skjema.felter.totalbeløpUnder4Rettsgebyr.verdi === true;

    const grovUaktsomOffset = erValgtResultatTypeForstoBurdeForstaatt ? 193 : 213;
    const offset =
        skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GROV_UAKTSOMHET
            ? grovUaktsomOffset
            : 20;
    return (
        <ArrowBox alignOffset={erLesevisning ? 5 : offset} marginTop={erLesevisning ? 15 : 0}>
            {skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.SIMPEL_UAKTSOMHET &&
                erTotalbeløpUnder4Rettsgebyr && (
                    <>
                        <HorisontalFamilieRadioGruppe
                            id="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                            legend="Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?"
                            erLesevisning={erLesevisning}
                            value={
                                !erLesevisning
                                    ? skjema.felter.tilbakekrevSmåbeløp.verdi
                                    : skjema.felter.tilbakekrevSmåbeløp.verdi === OptionJA
                                      ? 'Ja'
                                      : 'Nei'
                            }
                            error={
                                ugyldifSimpelTilbakekrevBeløpUnder4Rettsgebyr
                                    ? skjema.felter.tilbakekrevSmåbeløp.feilmelding?.toString()
                                    : ''
                            }
                            onChange={(val: JaNeiOption) =>
                                skjema.felter.tilbakekrevSmåbeløp.validerOgSettFelt(val)
                            }
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
                        </HorisontalFamilieRadioGruppe>
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
            {(skjema.felter.aktsomhetVurdering.verdi !== Aktsomhet.SIMPEL_UAKTSOMHET ||
                !erTotalbeløpUnder4Rettsgebyr) && (
                <SærligeGrunnerSkjema skjema={skjema} erLesevisning={erLesevisning} />
            )}
        </ArrowBox>
    );
};

export default GradUaktsomhetSkjema;
