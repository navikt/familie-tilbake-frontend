import type { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';

import { Checkbox, CheckboxGroup, Textarea, VStack } from '@navikt/ds-react';
import * as React from 'react';

import ReduksjonAvBeløpSkjema from './ReduksjonAvBeløpSkjema';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { type Skjema } from '../../../../../hooks/skjema';
import { SærligeGrunner, særligegrunner, særligeGrunnerTyper } from '../../../../../kodeverk';

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

    return (
        <VStack gap="6">
            <VStack gap="1">
                <CheckboxGroup
                    {...skjema.felter.særligeGrunner.hentNavBaseSkjemaProps(
                        skjema.visFeilmeldinger
                    )}
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
                        label={null}
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
            </VStack>
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
