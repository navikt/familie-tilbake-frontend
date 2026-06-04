import type { ChangeEvent, FC } from 'react';
import type { VilkårsvurderingSkjemaDefinisjon } from '@/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjemaContext';

import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { type FeltState, type Skjema, Valideringsstatus } from '@/hooks/skjema';
import { Aktsomhet, aktsomheter, Vilkårsresultat } from '@/kodeverk';
import { useVilkårsvurdering } from '@/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/VilkårsvurderingContext';
import {
    OptionJA,
    OptionNEI,
} from '@/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjemaContext';

import { GradForsettSkjema } from './GradForsettSkjema';
import { GradUaktsomhetSkjema } from './GradUaktsomhetSkjema';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
    harFlerePerioder: boolean;
};

export const AktsomhetsvurderingSkjema: FC<Props> = ({
    skjema,
    erLesevisning,
    harFlerePerioder,
}: Props) => {
    const { setIkkePersistertKomponent } = useBehandlingState();
    const { erNyModell } = useBehandling();
    const { kanIlleggeRenter } = useVilkårsvurdering();
    const erForstodBurdeForstått =
        skjema.felter.vilkårsresultatvurdering.verdi === Vilkårsresultat.ForstoBurdeForstått;
    const erFeilaktigEllerMangelfull =
        skjema.felter.vilkårsresultatvurdering.verdi ===
            Vilkårsresultat.FeilOpplysningerFraBruker ||
        skjema.felter.vilkårsresultatvurdering.verdi ===
            Vilkårsresultat.MangelfulleOpplysningerFraBruker;
    const ugyldigAktsomhetvurderingValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.aktsomhetVurdering.valideringsstatus === Valideringsstatus.Feil;
    const skalIkkeVisesNårNyModellOgForstodBurdeForstått = erNyModell && erForstodBurdeForstått;

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
                onChange={(val: Aktsomhet): FeltState<'' | Aktsomhet> => {
                    if (
                        val === Aktsomhet.Forsettlig &&
                        skjema.felter.forstoIlleggeRenter.verdi === ''
                    ) {
                        if (erFeilaktigEllerMangelfull) {
                            skjema.felter.forstoIlleggeRenter.validerOgSettFelt(
                                kanIlleggeRenter ? OptionJA : OptionNEI
                            );
                        } else if (erForstodBurdeForstått) {
                            skjema.felter.forstoIlleggeRenter.validerOgSettFelt(OptionNEI);
                        }
                    }
                    setIkkePersistertKomponent(`vilkårsvurdering`);
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
                onChange={(event: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>): void => {
                    skjema.felter.aktsomhetBegrunnelse.validerOgSettFelt(event.target.value);
                    setIkkePersistertKomponent('vilkårsvurdering');
                }}
                maxLength={3000}
            />
            {skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.Forsettlig && (
                <GradForsettSkjema
                    skjema={skjema}
                    erLesevisning={erLesevisning}
                    skalIkkeViseNårNyModellOgForstodBurdeForstått={
                        skalIkkeVisesNårNyModellOgForstodBurdeForstått
                    }
                />
            )}
            {skjema.felter.aktsomhetVurdering.verdi !== '' &&
                skjema.felter.aktsomhetVurdering.verdi !== Aktsomhet.Forsettlig && (
                    <GradUaktsomhetSkjema
                        skjema={skjema}
                        erLesevisning={erLesevisning}
                        harFlerePerioder={harFlerePerioder}
                    />
                )}
        </>
    );
};
