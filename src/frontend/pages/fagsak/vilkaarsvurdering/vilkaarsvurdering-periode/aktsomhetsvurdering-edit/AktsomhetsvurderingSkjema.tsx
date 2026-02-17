import type { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import * as React from 'react';

import { GradForsettSkjema } from './GradForsettSkjema';
import { GradUaktsomhetSkjema } from './GradUaktsomhetSkjema';
import { useBehandlingState } from '../../../../../context/BehandlingStateContext';
import { type Skjema, Valideringsstatus } from '../../../../../hooks/skjema';
import { Aktsomhet, aktsomheter, Vilkårsresultat } from '../../../../../kodeverk';
import { OptionNEI } from '../VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

export const AktsomhetsvurderingSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandlingState();
    const erForstodBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.ForstoBurdeForstått;
    const ugyldigAktsomhetvurderingValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.aktsomhetVurdering.valideringsstatus === Valideringsstatus.Feil;

    return (
        <>
            <RadioGroup
                id="handletUaktsomhetGrad"
                readOnly={erLesevisning}
                size="small"
                aria-live="polite"
                legend={
                    erForstodBurdeForstått
                        ? 'Vurder mottakers grad av aktsomhet'
                        : 'I hvilken grad har mottaker handlet uaktsomt?'
                }
                value={skjema.felter.aktsomhetVurdering.verdi}
                error={
                    ugyldigAktsomhetvurderingValgt
                        ? skjema.felter.aktsomhetVurdering.feilmelding?.toString()
                        : ''
                }
                onChange={(val: Aktsomhet) => {
                    const skalPreutfylleUtenRenter =
                        val === Aktsomhet.Forsettlig &&
                        skjema.felter.forstoIlleggeRenter.verdi === '' &&
                        skjema.felter.vilkårsresultatvurdering.verdi ===
                            Vilkårsresultat.ForstoBurdeForstått;
                    if (skalPreutfylleUtenRenter) {
                        skjema.felter.forstoIlleggeRenter.validerOgSettFelt(OptionNEI);
                    }
                    settIkkePersistertKomponent(`vilkårsvurdering`);
                    return skjema.felter.aktsomhetVurdering.validerOgSettFelt(val);
                }}
            >
                <Radio
                    name="handletUaktsomhetGrad"
                    key={Aktsomhet.Uaktsomt}
                    value={Aktsomhet.Uaktsomt}
                >
                    {erForstodBurdeForstått ? (
                        <>
                            Mottaker <strong>burde forstått</strong> at utbetalingen skyldtes en
                            feil
                        </>
                    ) : (
                        aktsomheter[Aktsomhet.Uaktsomt]
                    )}
                </Radio>
                <Radio
                    name="handletUaktsomhetGrad"
                    key={Aktsomhet.GrovtUaktsomt}
                    value={Aktsomhet.GrovtUaktsomt}
                >
                    {erForstodBurdeForstått ? (
                        <>
                            Mottaker <strong>må ha forstått</strong> at utbetalingen skyldtes en
                            feil
                        </>
                    ) : (
                        aktsomheter[Aktsomhet.GrovtUaktsomt]
                    )}
                </Radio>
                <Radio
                    name="handletUaktsomhetGrad"
                    key={Aktsomhet.Forsettlig}
                    value={Aktsomhet.Forsettlig}
                >
                    {erForstodBurdeForstått ? (
                        <>
                            Mottaker <strong>forsto</strong> at utbetalingen skyldtes en feil
                        </>
                    ) : (
                        aktsomheter[Aktsomhet.Forsettlig]
                    )}
                </Radio>
            </RadioGroup>
            <Textarea
                {...skjema.felter.aktsomhetBegrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                name="vurderingBegrunnelse"
                aria-live="polite"
                label={
                    erForstodBurdeForstått
                        ? 'Begrunn hvorfor du valgte alternativet ovenfor'
                        : 'Begrunn mottakerens aktsomhetsgrad'
                }
                size="small"
                resize
                minRows={3}
                readOnly={erLesevisning}
                value={
                    skjema.felter.aktsomhetBegrunnelse
                        ? skjema.felter.aktsomhetBegrunnelse.verdi
                        : ''
                }
                onChange={(event: { target: { value: string } }) => {
                    skjema.felter.aktsomhetBegrunnelse.validerOgSettFelt(event.target.value);
                    settIkkePersistertKomponent('vilkårsvurdering');
                }}
                maxLength={3000}
            />
            {skjema.felter.aktsomhetVurdering.verdi !== '' &&
                (skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Forsettlig ? (
                    <GradForsettSkjema skjema={skjema} erLesevisning={erLesevisning} />
                ) : (
                    <GradUaktsomhetSkjema skjema={skjema} erLesevisning={erLesevisning} />
                ))}
        </>
    );
};
