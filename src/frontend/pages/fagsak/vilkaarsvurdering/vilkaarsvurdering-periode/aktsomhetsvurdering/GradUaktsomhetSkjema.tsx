import type { FC } from 'react';
import type { VilkårsvurderingSkjemaDefinisjon } from '~/pages/fagsak/vilkaarsvurdering/vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjemaContext';

import { LocalAlert, Radio, RadioGroup } from '@navikt/ds-react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import { type Skjema, Valideringsstatus } from '~/hooks/skjema';
import { Aktsomhet } from '~/kodeverk';
import { SkalUnnlates } from '~/typer/tilbakekrevingstyper';

import { SærligeGrunnerSkjema } from './SærligeGrunnerSkjema';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

export const GradUaktsomhetSkjema: FC<Props> = ({ skjema, erLesevisning }) => {
    const { setIkkePersistertKomponent } = useBehandlingState();
    const { erNyModell } = useBehandling();
    const ugyldifSimpelTilbakekrevBeløpUnder4Rettsgebyr =
        skjema.visFeilmeldinger &&
        skjema.felter.unnlates4Rettsgebyr.valideringsstatus === Valideringsstatus.Feil;
    const erTotalbeløpUnder4Rettsgebyr = skjema.felter.totalbeløpUnder4Rettsgebyr.verdi === true;
    return (
        <>
            {skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Uaktsomt &&
                erTotalbeløpUnder4Rettsgebyr && (
                    <>
                        <RadioGroup
                            id="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                            legend="Totalbeløpet kan være under 4 ganger rettsgebyret (6. ledd). Skal det tilbakekreves?"
                            readOnly={erLesevisning}
                            aria-live="polite"
                            size="small"
                            value={skjema.felter.unnlates4Rettsgebyr.verdi}
                            error={
                                ugyldifSimpelTilbakekrevBeløpUnder4Rettsgebyr
                                    ? skjema.felter.unnlates4Rettsgebyr.feilmelding?.toString()
                                    : ''
                            }
                            onChange={(val: SkalUnnlates) => {
                                skjema.felter.unnlates4Rettsgebyr.validerOgSettFelt(val);
                                setIkkePersistertKomponent(`vilkårsvurdering`);
                            }}
                        >
                            <Radio
                                key="Unnlates"
                                name="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                                value={SkalUnnlates.Unnlates}
                                data-testid="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Nei"
                            >
                                Nei
                            </Radio>
                            <Radio
                                key="Tilbakekreves"
                                name="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                                value={SkalUnnlates.Tilbakekreves}
                                data-testid="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Ja"
                            >
                                Ja
                            </Radio>
                            {erNyModell && (
                                <Radio
                                    key="Over4Rettsgebyr"
                                    name="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr"
                                    value={SkalUnnlates.Over4Rettsgebyr}
                                    data-testid="tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Over4Rettsgebyr"
                                >
                                    Beløp er over 4 rettsgebyr
                                </Radio>
                            )}
                        </RadioGroup>

                        {[SkalUnnlates.Tilbakekreves, SkalUnnlates.Over4Rettsgebyr].some(
                            value => value === skjema.felter.unnlates4Rettsgebyr.verdi
                        ) && (
                            <SærligeGrunnerSkjema
                                skjema={skjema}
                                erLesevisning={erLesevisning}
                                aria-live="polite"
                            />
                        )}
                        {skjema.felter.unnlates4Rettsgebyr.verdi === SkalUnnlates.Unnlates && (
                            <LocalAlert status="warning" aria-live="polite">
                                <LocalAlert.Header>
                                    <LocalAlert.Title>
                                        Når 6. ledd anvendes må alle perioder behandles likt
                                    </LocalAlert.Title>
                                </LocalAlert.Header>
                            </LocalAlert>
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
