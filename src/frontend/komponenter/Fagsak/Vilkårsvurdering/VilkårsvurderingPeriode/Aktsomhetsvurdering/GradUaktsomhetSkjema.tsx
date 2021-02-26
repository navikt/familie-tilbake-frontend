import * as React from 'react';

import { Radio } from 'nav-frontend-skjema';
import { UndertekstBold } from 'nav-frontend-typografi';

import { Aktsomhet } from '../../../../../kodeverk';
import ArrowBox from '../../../../Felleskomponenter/ArrowBox/ArrowBox';
import { Spacer20, Spacer8 } from '../../../../Felleskomponenter/Flytelementer';
import {
    FamilieTilbakeTextArea,
    HorisontalFamilieRadioGruppe,
} from '../../../../Felleskomponenter/Skjemaelementer';
import SærligeGrunnerSkjema from './SærligeGrunnerSkjema';

const særligeGrunnerBegrunnelseDiv = (
    begrunnelse: string,
    erLesevisning: boolean,
    onChange: () => void
) => (
    <div>
        <UndertekstBold>Særlige grunner 4. ledd</UndertekstBold>
        <Spacer8 />
        <FamilieTilbakeTextArea
            id="sarligGrunnerBegrunnelse"
            name="sarligGrunnerBegrunnelse"
            label={'Vurder særlige grunner du har vektlagt for resultatet'}
            maxLength={1500}
            erLesevisning={erLesevisning}
            value={begrunnelse ? begrunnelse : ''}
            onChange={() => onChange}
            placeholder={
                'Begrunn om det foreligger/ ikke foreligger særlige grunner for reduksjon av beløpet som kreves tilbake. Kryss av hvilke særlige grunner som er vektlagt for resultatet'
            }
        />
        <Spacer20 />
    </div>
);

interface IProps {
    uaktsomhetGrad: Aktsomhet;
    erValgtResultatTypeForstoBurdeForstaatt: boolean;
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const GradUaktsomhetSkjema: React.FC<IProps> = ({
    uaktsomhetGrad,
    erValgtResultatTypeForstoBurdeForstaatt,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
}) => {
    const [skalTilbakekreves, settSkalTilbakekreves] = React.useState<boolean>();

    const onTilbakekrevesUnder4Rettsgebyr = (tilbakekreves: boolean) => {
        settSkalTilbakekreves(tilbakekreves);
    };

    const onChange = () => {
        //
    };

    const grovUaktsomOffset = erValgtResultatTypeForstoBurdeForstaatt ? 170 : 195;
    return (
        <ArrowBox alignOffset={uaktsomhetGrad === Aktsomhet.GROVT_UAKTSOM ? grovUaktsomOffset : 20}>
            {uaktsomhetGrad === Aktsomhet.SIMPEL_UAKTSOM && erTotalbeløpUnder4Rettsgebyr && (
                <>
                    <HorisontalFamilieRadioGruppe
                        id="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                        legend="Totalbeløpet er under 4 rettsgebyr (6. ledd). Skal det tilbakekreves?"
                        erLesevisning={erLesevisning}
                    >
                        <Radio
                            name="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                            label="Ja"
                            onChange={() => onTilbakekrevesUnder4Rettsgebyr(true)}
                        />
                        <Radio
                            name="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                            label="Nei"
                            value="false"
                            onChange={() => onTilbakekrevesUnder4Rettsgebyr(false)}
                        />
                    </HorisontalFamilieRadioGruppe>
                    {skalTilbakekreves === true && (
                        <>
                            {særligeGrunnerBegrunnelseDiv('', erLesevisning, onChange)}
                            <SærligeGrunnerSkjema
                                uaktsomhetGrad={uaktsomhetGrad}
                                erLesevisning={erLesevisning}
                            />
                        </>
                    )}
                    {skalTilbakekreves === false && (
                        <ArrowBox alignOffset={80}>
                            Når 6. ledd anvendes må alle perioder behandles likt
                        </ArrowBox>
                    )}
                </>
            )}
            {(uaktsomhetGrad !== Aktsomhet.SIMPEL_UAKTSOM || !erTotalbeløpUnder4Rettsgebyr) && (
                <>
                    {særligeGrunnerBegrunnelseDiv('', erLesevisning, onChange)}
                    <SærligeGrunnerSkjema
                        uaktsomhetGrad={uaktsomhetGrad}
                        erLesevisning={erLesevisning}
                    />
                </>
            )}
        </ArrowBox>
    );
};

export default GradUaktsomhetSkjema;
