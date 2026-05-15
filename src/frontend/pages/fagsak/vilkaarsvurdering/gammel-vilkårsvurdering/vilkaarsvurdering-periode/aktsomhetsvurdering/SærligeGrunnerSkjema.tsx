import type { FC } from 'react';
import type { Skjema } from '~/hooks/skjema';

import { Checkbox, CheckboxGroup, Radio, Textarea, RadioGroup } from '@navikt/ds-react';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { Valideringsstatus } from '~/hooks/skjema';
import {
    Aktsomhet,
    SærligeGrunner,
    særligegrunner,
    særligeGrunnerTyper,
    Vilkårsresultat,
} from '~/kodeverk';
import {
    jaNeiOptions,
    OptionJA,
    OptionNEI,
    type JaNeiOption,
    type VilkårsvurderingSkjemaDefinisjon,
} from '~/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/vilkaarsvurdering-periode/VilkårsvurderingPeriodeSkjemaContext';
import { useVilkårsvurdering } from '~/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/VilkårsvurderingContext';

import { ReduksjonAvBeløpSkjema } from './ReduksjonAvBeløpSkjema';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

export const SærligeGrunnerSkjema: FC<Props> = ({ skjema, erLesevisning }) => {
    const { setIkkePersistertKomponent } = useBehandlingState();
    const { kanIlleggeRenter } = useVilkårsvurdering();

    const erFeilaktigEllerMangelfull =
        skjema.felter.vilkårsresultatvurdering.verdi ===
            Vilkårsresultat.FeilOpplysningerFraBruker ||
        skjema.felter.vilkårsresultatvurdering.verdi ===
            Vilkårsresultat.MangelfulleOpplysningerFraBruker;

    const erGrovtUaktsomt = skjema.felter.aktsomhetVurdering.verdi === Aktsomhet.GrovtUaktsomt;

    const utledGrovtUaktsomIlleggeRenterVerdi = (): JaNeiOption => {
        if (erFeilaktigEllerMangelfull && erGrovtUaktsomt) {
            return kanIlleggeRenter ? OptionJA : OptionNEI;
        }
        return OptionNEI;
    };

    const onChangeSærligeGrunner = (val: SærligeGrunner[]): void => {
        skjema.felter.særligeGrunner.validerOgSettFelt(val);
        if (val.indexOf(SærligeGrunner.Annet) > -1) {
            skjema.felter.særligeGrunnerAnnetBegrunnelse.nullstill();
        }
        setIkkePersistertKomponent(`vilkårsvurdering`);
    };
    const ugyldigHarGrunnertilReduksjonValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.harGrunnerTilReduksjon.valideringsstatus === Valideringsstatus.Feil;
    return (
        <>
            <CheckboxGroup
                {...skjema.felter.særligeGrunner.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                size="small"
                legend="Hvilke særlige grunner kan være aktuelle i denne saken?"
                onChange={(val: SærligeGrunner[]) => onChangeSærligeGrunner(val)}
                value={skjema.felter.særligeGrunner.verdi}
                readOnly={erLesevisning}
                aria-live="polite"
            >
                {særligeGrunnerTyper.map((type: SærligeGrunner) => (
                    <Checkbox key={type} value={type}>
                        {særligegrunner[type]}
                    </Checkbox>
                ))}
            </CheckboxGroup>
            {skjema.felter.særligeGrunner.verdi.includes(SærligeGrunner.Annet) && (
                <Textarea
                    {...skjema.felter.særligeGrunnerAnnetBegrunnelse.hentNavInputProps(
                        skjema.visFeilmeldinger
                    )}
                    label='Beskriv "Annet"'
                    name="annetBegrunnelse"
                    aria-label="Begrunnelse: Annet"
                    maxLength={3000}
                    size="small"
                    resize
                    minRows={3}
                    aria-live="polite"
                    readOnly={erLesevisning}
                    value={skjema.felter.særligeGrunnerAnnetBegrunnelse.verdi}
                    onChange={event => {
                        skjema.felter.særligeGrunnerAnnetBegrunnelse.validerOgSettFelt(
                            event.target.value
                        );
                        setIkkePersistertKomponent(`vilkårsvurdering`);
                    }}
                    data-testid="annetBegrunnelse"
                />
            )}

            <RadioGroup
                id="harGrunnerTilReduksjon"
                legend="Skal særlige grunner redusere beløpet?"
                readOnly={erLesevisning}
                size="small"
                aria-live="polite"
                value={skjema.felter.harGrunnerTilReduksjon.verdi}
                error={
                    ugyldigHarGrunnertilReduksjonValgt
                        ? skjema.felter.harGrunnerTilReduksjon.feilmelding?.toString()
                        : ''
                }
                onChange={(val: JaNeiOption) => {
                    skjema.felter.grovtUaktsomIlleggeRenter.validerOgSettFelt(
                        utledGrovtUaktsomIlleggeRenterVerdi()
                    );
                    setIkkePersistertKomponent('vilkårsvurdering');
                    return skjema.felter.harGrunnerTilReduksjon.validerOgSettFelt(val);
                }}
            >
                {jaNeiOptions.map(opt => (
                    <Radio
                        key={opt.label}
                        name="harGrunnerTilReduksjon"
                        data-testid={`harGrunnerTilReduksjon_${opt.label}`}
                        value={opt}
                    >
                        {opt.label}
                    </Radio>
                ))}
            </RadioGroup>
            <Textarea
                {...skjema.felter.særligeGrunnerBegrunnelse.hentNavInputProps(
                    skjema.visFeilmeldinger
                )}
                name="sarligGrunnerBegrunnelse"
                label="Begrunn resultatet av vurderingen ovenfor"
                maxLength={3000}
                aria-live="polite"
                size="small"
                resize
                readOnly={erLesevisning}
                value={skjema.felter.særligeGrunnerBegrunnelse.verdi}
                onChange={event => {
                    skjema.felter.særligeGrunnerBegrunnelse.validerOgSettFelt(event.target.value);
                    setIkkePersistertKomponent(`vilkårsvurdering`);
                }}
                minRows={3}
            />
            <ReduksjonAvBeløpSkjema skjema={skjema} erLesevisning={erLesevisning} />
        </>
    );
};
