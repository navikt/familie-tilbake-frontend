import type {
    JaNeiOption,
    VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';

import { Alert, Radio, RadioGroup } from '@navikt/ds-react';
import * as React from 'react';

import { SærligeGrunnerSkjema } from './SærligeGrunnerSkjema';
import { useBehandlingState } from '../../../../../context/BehandlingStateContext';
import { type Skjema, Valideringsstatus } from '../../../../../hooks/skjema';
import { Aktsomhet } from '../../../../../kodeverk';
import { jaNeiOptions, OptionJA, OptionNEI } from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

export const GradUaktsomhetSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandlingState();
    const ugyldifSimpelTilbakekrevBeløpUnder4Rettsgebyr =
        skjema.visFeilmeldinger &&
        skjema.felter.tilbakekrevSmåbeløp.valideringsstatus === Valideringsstatus.Feil;
    const erTotalbeløpUnder4Rettsgebyr = skjema.felter.totalbeløpUnder4Rettsgebyr.verdi === true;
    return (
        <>
            {skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Uaktsomt &&
                erTotalbeløpUnder4Rettsgebyr && (
                    <>
                        <RadioGroup
                            id="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                            legend="Totalbeløpet er under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?"
                            readOnly={erLesevisning}
                            aria-live="polite"
                            size="small"
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
                        </RadioGroup>

                        {skjema.felter.tilbakekrevSmåbeløp.verdi === OptionJA && (
                            <SærligeGrunnerSkjema
                                skjema={skjema}
                                erLesevisning={erLesevisning}
                                aria-live="polite"
                            />
                        )}
                        {skjema.felter.tilbakekrevSmåbeløp.verdi === OptionNEI && (
                            <Alert variant="warning" size="small" aria-live="polite">
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
