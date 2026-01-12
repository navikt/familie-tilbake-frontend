import { Checkbox, CheckboxGroup, Radio, Textarea, VStack } from '@navikt/ds-react';
import * as React from 'react';

import {
    jaNeiOptions,
    OptionNEI,
    type JaNeiOption,
    type VilkårsvurderingSkjemaDefinisjon,
} from '../VilkårsvurderingPeriodeSkjemaContext';
import ReduksjonAvBeløpSkjema from './ReduksjonAvBeløpSkjema';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { Valideringsstatus, type Skjema } from '../../../../../hooks/skjema';
import { SærligeGrunner, særligegrunner, særligeGrunnerTyper } from '../../../../../kodeverk';
import { HorisontalRadioGroup } from '../../../../Felleskomponenter/Skjemaelementer';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const SærligeGrunnerSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandling();

    const onChangeSærligeGrunner = (val: SærligeGrunner[]): void => {
        skjema.felter.særligeGrunner.validerOgSettFelt(val);
        if (val.indexOf(SærligeGrunner.Annet) > -1) {
            skjema.felter.særligeGrunnerAnnetBegrunnelse.nullstill();
        }
        settIkkePersistertKomponent(`vilkårsvurdering`);
    };
    const ugyldigHarGrunnertilReduksjonValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.harGrunnerTilReduksjon.valideringsstatus === Valideringsstatus.Feil;
    return (
        <VStack gap="6">
            <CheckboxGroup
                {...skjema.felter.særligeGrunner.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                size="small"
                className="w-100"
                legend="Hvilke særlige grunner kan være aktuelle i denne saken?"
                onChange={(val: SærligeGrunner[]) => onChangeSærligeGrunner(val)}
                value={skjema.felter.særligeGrunner.verdi}
                readOnly={erLesevisning}
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
                    className="w-100"
                    readOnly={erLesevisning}
                    value={skjema.felter.særligeGrunnerAnnetBegrunnelse.verdi}
                    onChange={event => {
                        skjema.felter.særligeGrunnerAnnetBegrunnelse.validerOgSettFelt(
                            event.target.value
                        );
                        settIkkePersistertKomponent(`vilkårsvurdering`);
                    }}
                    data-testid="annetBegrunnelse"
                />
            )}

            <HorisontalRadioGroup
                id="harGrunnerTilReduksjon"
                legend="Skal særlige grunner redusere beløpet?"
                readOnly={erLesevisning}
                size="small"
                className="w-100"
                marginbottom="0"
                value={skjema.felter.harGrunnerTilReduksjon.verdi}
                error={
                    ugyldigHarGrunnertilReduksjonValgt
                        ? skjema.felter.harGrunnerTilReduksjon.feilmelding?.toString()
                        : ''
                }
                onChange={(val: JaNeiOption) => {
                    skjema.felter.grovtUaktsomIlleggeRenter.validerOgSettFelt(OptionNEI);
                    settIkkePersistertKomponent('vilkårsvurdering');
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
            </HorisontalRadioGroup>
            <Textarea
                {...skjema.felter.særligeGrunnerBegrunnelse.hentNavInputProps(
                    skjema.visFeilmeldinger
                )}
                name="sarligGrunnerBegrunnelse"
                label="Begrunn resultatet av vurderingen ovenfor"
                maxLength={3000}
                size="small"
                resize
                className="w-100"
                readOnly={erLesevisning}
                value={skjema.felter.særligeGrunnerBegrunnelse.verdi}
                onChange={event => {
                    skjema.felter.særligeGrunnerBegrunnelse.validerOgSettFelt(event.target.value);
                    settIkkePersistertKomponent(`vilkårsvurdering`);
                }}
            />
            <ReduksjonAvBeløpSkjema skjema={skjema} erLesevisning={erLesevisning} />
        </VStack>
    );
};

export default SærligeGrunnerSkjema;
