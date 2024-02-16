import * as React from 'react';

import { Column, Row } from 'nav-frontend-grid';

import { Checkbox, CheckboxGroup, Textarea } from '@navikt/ds-react';
import { type ISkjema } from '@navikt/familie-skjema';

import { SærligeGrunner, særligegrunner, særligeGrunnerTyper } from '../../../../../kodeverk';
import { DetailBold, Spacer20 } from '../../../../Felleskomponenter/Flytelementer';
import { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';
import ReduksjonAvBeløpSkjema from './ReduksjonAvBeløpSkjema';

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const SærligeGrunnerSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const [nonUsedKey, settNonUsedKey] = React.useState<string>(Date.now().toString());

    React.useEffect(() => {
        // console.log('bør no trigge re-rendring');
    }, [nonUsedKey]);

    const onChanngeSærligeGrunner2 = (val: SærligeGrunner[]) => {
        skjema.felter.særligeGrunner.validerOgSettFelt(val);
        if (val.indexOf(SærligeGrunner.ANNET) > -1) {
            skjema.felter.særligeGrunnerAnnetBegrunnelse.nullstill();
        }
        settNonUsedKey(Date.now().toString());
    };

    return (
        <div>
            <DetailBold spacing>Særlige grunner 4. ledd</DetailBold>
            <Textarea
                {...skjema.felter.særligeGrunnerBegrunnelse.hentNavInputProps(
                    skjema.visFeilmeldinger
                )}
                name="sarligGrunnerBegrunnelse"
                label={'Vurder særlige grunner du har vektlagt for resultatet'}
                maxLength={3000}
                readOnly={erLesevisning}
                value={skjema.felter.særligeGrunnerBegrunnelse.verdi}
                onChange={event =>
                    skjema.felter.særligeGrunnerBegrunnelse.validerOgSettFelt(event.target.value)
                }
                placeholder={
                    'Begrunn om det foreligger/ ikke foreligger særlige grunner for reduksjon av beløpet som kreves tilbake. Kryss av hvilke særlige grunner som er vektlagt for resultatet'
                }
            />
            <Spacer20 />
            <CheckboxGroup
                {...skjema.felter.særligeGrunner.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                legend={`Særlige grunner som er vektlagt (4.ledd)`}
                onChange={(val: SærligeGrunner[]) => onChanngeSærligeGrunner2(val)}
                value={skjema.felter.særligeGrunner.verdi}
                readOnly={erLesevisning}
            >
                {særligeGrunnerTyper.map((type: SærligeGrunner) => (
                    <Checkbox key={type} value={type}>
                        {særligegrunner[type]}
                    </Checkbox>
                ))}
            </CheckboxGroup>
            {skjema.felter.særligeGrunner.verdi.includes(SærligeGrunner.ANNET) && (
                <Row>
                    <Column md="1" />
                    <Column md="10">
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
                            onChange={event =>
                                skjema.felter.særligeGrunnerAnnetBegrunnelse.validerOgSettFelt(
                                    event.target.value
                                )
                            }
                            data-testid={'annetBegrunnelse'}
                        />
                    </Column>
                </Row>
            )}
            <Spacer20 />
            <ReduksjonAvBeløpSkjema skjema={skjema} erLesevisning={erLesevisning} />
        </div>
    );
};

export default SærligeGrunnerSkjema;
