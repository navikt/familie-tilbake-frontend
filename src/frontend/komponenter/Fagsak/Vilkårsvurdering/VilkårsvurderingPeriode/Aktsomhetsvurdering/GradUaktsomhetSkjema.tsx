import * as React from 'react';

import { Radio } from 'nav-frontend-skjema';

import { Aktsomhet } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../../Felleskomponenter/Skjemaelementer';
import SærligeGrunnerSkjema from './SærligeGrunnerSkjema';
import { useVilkårsvurderingPeriode } from '../../../../../context/VilkårsvurderingPeriodeContext';

interface IProps {
    erValgtResultatTypeForstoBurdeForstaatt: boolean;
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const GradUaktsomhetSkjema: React.FC<IProps> = ({
    erValgtResultatTypeForstoBurdeForstaatt,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
}) => {
    const { aktsomhetsvurdering, oppdaterAktsomhetsvurdering } = useVilkårsvurderingPeriode();

    const onTilbakekrevesUnder4Rettsgebyr = (tilbakekreves: boolean) => {
        oppdaterAktsomhetsvurdering({
            tilbakekrevSelvOmBeløpErUnder4Rettsgebyr: tilbakekreves,
        });
    };

    const grovUaktsomOffset = erValgtResultatTypeForstoBurdeForstaatt ? 175 : 195;
    const offset =
        aktsomhetsvurdering?.aktsomhet === Aktsomhet.GROVT_UAKTSOM ? grovUaktsomOffset : 20;
    return (
        <ArrowBox alignOffset={erLesevisning ? 5 : offset} marginTop={erLesevisning ? 15 : 0}>
            {aktsomhetsvurdering?.aktsomhet === Aktsomhet.SIMPEL_UAKTSOM &&
                erTotalbeløpUnder4Rettsgebyr && (
                    <>
                        <HorisontalFamilieRadioGruppe
                            id="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                            legend="Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?"
                            erLesevisning={erLesevisning}
                            verdi={
                                aktsomhetsvurdering?.tilbakekrevSelvOmBeløpErUnder4Rettsgebyr
                                    ? 'Ja'
                                    : 'Nei'
                            }
                        >
                            <Radio
                                name="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                                label="Ja"
                                onChange={() => onTilbakekrevesUnder4Rettsgebyr(true)}
                                checked={
                                    aktsomhetsvurdering?.tilbakekrevSelvOmBeløpErUnder4Rettsgebyr ===
                                    true
                                }
                            />
                            <Radio
                                name="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                                label="Nei"
                                value="false"
                                checked={
                                    aktsomhetsvurdering?.tilbakekrevSelvOmBeløpErUnder4Rettsgebyr ===
                                    false
                                }
                                onChange={() => onTilbakekrevesUnder4Rettsgebyr(false)}
                            />
                        </HorisontalFamilieRadioGruppe>
                        {aktsomhetsvurdering?.tilbakekrevSelvOmBeløpErUnder4Rettsgebyr === true && (
                            <SærligeGrunnerSkjema erLesevisning={erLesevisning} />
                        )}
                        {aktsomhetsvurdering?.tilbakekrevSelvOmBeløpErUnder4Rettsgebyr ===
                            false && (
                            <ArrowBox alignOffset={80}>
                                Når 6. ledd anvendes må alle perioder behandles likt
                            </ArrowBox>
                        )}
                    </>
                )}
            {(aktsomhetsvurdering?.aktsomhet !== Aktsomhet.SIMPEL_UAKTSOM ||
                !erTotalbeløpUnder4Rettsgebyr) && (
                <SærligeGrunnerSkjema erLesevisning={erLesevisning} />
            )}
        </ArrowBox>
    );
};

export default GradUaktsomhetSkjema;
