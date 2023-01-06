import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { CheckboxGroup } from '@navikt/ds-react';
import { ASpacing2 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieCheckbox } from '@navikt/familie-form-elements';
import { type ISkjema } from '@navikt/familie-skjema';

import { SærligeGrunner, særligegrunner, særligeGrunnerTyper } from '../../../../../kodeverk';
import { DetailBold, Spacer20 } from '../../../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../../../Felleskomponenter/Skjemaelementer';
import { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';
import ReduksjonAvBeløpSkjema from './ReduksjonAvBeløpSkjema';

const StyledCheckboxGruppe = styled(CheckboxGroup)`
    .lese-felt {
        margin-bottom: ${ASpacing2};
    }
`;

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
            <FamilieTilbakeTextArea
                {...skjema.felter.særligeGrunnerBegrunnelse.hentNavInputProps(
                    skjema.visFeilmeldinger
                )}
                name="sarligGrunnerBegrunnelse"
                label={'Vurder særlige grunner du har vektlagt for resultatet'}
                maxLength={3000}
                erLesevisning={erLesevisning}
                value={skjema.felter.særligeGrunnerBegrunnelse.verdi}
                onChange={event =>
                    skjema.felter.særligeGrunnerBegrunnelse.validerOgSettFelt(event.target.value)
                }
                placeholder={
                    'Begrunn om det foreligger/ ikke foreligger særlige grunner for reduksjon av beløpet som kreves tilbake. Kryss av hvilke særlige grunner som er vektlagt for resultatet'
                }
            />
            <Spacer20 />
            <StyledCheckboxGruppe
                {...skjema.felter.særligeGrunner.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                legend={`Særlige grunner som er vektlagt (4.ledd)`}
                onChange={(val: SærligeGrunner[]) => onChanngeSærligeGrunner2(val)}
                value={skjema.felter.særligeGrunner.verdi}
            >
                {særligeGrunnerTyper.map((type: SærligeGrunner) => (
                    <FamilieCheckbox
                        key={type}
                        erLesevisning={erLesevisning}
                        value={type}
                        checked={skjema.felter.særligeGrunner.verdi.includes(type)}
                    >
                        {særligegrunner[type]}
                    </FamilieCheckbox>
                ))}
            </StyledCheckboxGruppe>
            {skjema.felter.særligeGrunner.verdi.includes(SærligeGrunner.ANNET) && (
                <Row>
                    <Column md="1" />
                    <Column md="10">
                        <FamilieTilbakeTextArea
                            {...skjema.felter.særligeGrunnerAnnetBegrunnelse.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            label={null}
                            name="annetBegrunnelse"
                            aria-label="Begrunnelse: Annet"
                            maxLength={3000}
                            erLesevisning={erLesevisning}
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
