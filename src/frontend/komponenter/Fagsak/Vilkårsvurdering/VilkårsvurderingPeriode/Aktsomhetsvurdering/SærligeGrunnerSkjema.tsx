import type { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

import { Checkbox, CheckboxGroup, Detail, Textarea, VStack } from '@navikt/ds-react';
import * as React from 'react';

import ReduksjonAvBeløpSkjema from './ReduksjonAvBeløpSkjema';
import { useBehandlingState } from '../../../../../context/BehandlingStateContext';
import { type Skjema } from '../../../../../hooks/skjema';
import { SærligeGrunner, særligegrunner, særligeGrunnerTyper } from '../../../../../kodeverk';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const SærligeGrunnerSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandlingState();

    const onChangeSærligeGrunner = (val: SærligeGrunner[]): void => {
        skjema.felter.særligeGrunner.validerOgSettFelt(val);
        if (val.indexOf(SærligeGrunner.Annet) > -1) {
            skjema.felter.særligeGrunnerAnnetBegrunnelse.nullstill();
        }
        settIkkePersistertKomponent(`vilkårsvurdering`);
    };

    return (
        <VStack gap="5">
            <Detail weight="semibold">Særlige grunner 4. ledd</Detail>
            <Textarea
                {...skjema.felter.særligeGrunnerBegrunnelse.hentNavInputProps(
                    skjema.visFeilmeldinger
                )}
                name="sarligGrunnerBegrunnelse"
                label="Vurder særlige grunner du har vektlagt for resultatet"
                maxLength={3000}
                readOnly={erLesevisning}
                value={skjema.felter.særligeGrunnerBegrunnelse.verdi}
                onChange={event => {
                    skjema.felter.særligeGrunnerBegrunnelse.validerOgSettFelt(event.target.value);
                    settIkkePersistertKomponent(`vilkårsvurdering`);
                }}
                placeholder="Begrunn om det foreligger/ ikke foreligger særlige grunner for reduksjon av beløpet som kreves tilbake. Kryss av hvilke særlige grunner som er vektlagt for resultatet"
            />
            <VStack gap="1">
                <CheckboxGroup
                    {...skjema.felter.særligeGrunner.hentNavBaseSkjemaProps(
                        skjema.visFeilmeldinger
                    )}
                    legend="Særlige grunner som er vektlagt (4.ledd)"
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
                        label={null}
                        name="annetBegrunnelse"
                        aria-label="Begrunnelse: Annet"
                        maxLength={3000}
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
            </VStack>
            <ReduksjonAvBeløpSkjema skjema={skjema} erLesevisning={erLesevisning} />
        </VStack>
    );
};

export default SærligeGrunnerSkjema;
