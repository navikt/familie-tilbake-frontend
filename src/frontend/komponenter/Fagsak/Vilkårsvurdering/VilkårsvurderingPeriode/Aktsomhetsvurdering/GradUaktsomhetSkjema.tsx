import type {
    JaNeiOption,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

import { Alert, Radio } from '@navikt/ds-react';
import * as React from 'react';

import SærligeGrunnerSkjema from './SærligeGrunnerSkjema';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { type Skjema, Valideringsstatus } from '../../../../../hooks/skjema';
import { Aktsomhet } from '../../../../../kodeverk';
import { HorisontalRadioGroup } from '../../../../Felleskomponenter/Skjemaelementer';
import { jaNeiOptions, OptionJA, OptionNEI } from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const GradUaktsomhetSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandling();
    const ugyldifSimpelTilbakekrevBeløpUnder4Rettsgebyr =
        skjema.visFeilmeldinger &&
        skjema.felter.tilbakekrevSmåbeløp.valideringsstatus === Valideringsstatus.Feil;
    const erTotalbeløpUnder4Rettsgebyr = skjema.felter.totalbeløpUnder4Rettsgebyr.verdi === true;
    return (
        <>
            {skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Uaktsomt &&
                erTotalbeløpUnder4Rettsgebyr && (
                    <>
                        <HorisontalRadioGroup
                            id="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                            legend="Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?"
                            readOnly={erLesevisning}
                            size="small"
                            className="w-105"
                            marginbottom="0"
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
                            <Alert variant="warning" className="w-105" size="small">
                                Når 6. ledd anvendes må alle perioder behandles likt
                            </Alert>
                        )}
                    </>
                )}
            {(skjema.felter.aktsomhetVurdering.verdi !== Aktsomhet.Uaktsomt ||
                !erTotalbeløpUnder4Rettsgebyr) && (
                <SærligeGrunnerSkjema skjema={skjema} erLesevisning={erLesevisning} />
            )}
        </>
    );
};

export default GradUaktsomhetSkjema;
