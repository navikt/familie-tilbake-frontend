import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { CheckboxGruppe } from 'nav-frontend-skjema';
import { UndertekstBold } from 'nav-frontend-typografi';

import { FamilieCheckbox } from '@navikt/familie-form-elements';
import { type ISkjema } from '@navikt/familie-skjema';

import { SærligeGrunner, særligegrunner, særligeGrunnerTyper } from '../../../../../kodeverk';
import { Spacer20, Spacer8 } from '../../../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../../../Felleskomponenter/Skjemaelementer';
import { VilkårsvurderingSkjemaDefinisjon } from '../VilkårsvurderingPeriodeSkjemaContext';
import ReduksjonAvBeløpSkjema from './ReduksjonAvBeløpSkjema';

const StyledCheckboxGruppe = styled(CheckboxGruppe)`
    &.skjemagruppe {
        &.checkboxgruppe {
            .skjemaelement {
                margin-bottom: 8px;
            }
        }
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

    const onChangeSærligeGrunner = (type: SærligeGrunner) => {
        const grunner = skjema.felter.særligeGrunner.verdi;
        let nyeGrunner;
        if (skjema.felter.særligeGrunner.verdi.includes(type)) {
            const index = skjema.felter.særligeGrunner.verdi.indexOf(type);
            grunner.splice(index, 1);
            nyeGrunner = grunner;
            if (type === SærligeGrunner.ANNET) {
                skjema.felter.særligeGrunnerAnnetBegrunnelse.nullstill();
            }
        } else {
            nyeGrunner = grunner.concat([type]);
        }
        skjema.felter.særligeGrunner.validerOgSettFelt(nyeGrunner);
        settNonUsedKey(Date.now().toString());
    };

    return (
        <div>
            <UndertekstBold>Særlige grunner 4. ledd</UndertekstBold>
            <Spacer8 />
            <FamilieTilbakeTextArea
                {...skjema.felter.særligeGrunnerBegrunnelse.hentNavInputProps(
                    skjema.visFeilmeldinger
                )}
                name="sarligGrunnerBegrunnelse"
                label={'Vurder særlige grunner du har vektlagt for resultatet'}
                maxLength={1500}
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
            >
                {særligeGrunnerTyper.map((type: SærligeGrunner) => (
                    <FamilieCheckbox
                        key={type}
                        label={særligegrunner[type]}
                        erLesevisning={erLesevisning}
                        checked={skjema.felter.særligeGrunner.verdi.includes(type)}
                        onChange={() => onChangeSærligeGrunner(type)}
                    />
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
                            name="annetBegrunnelse"
                            aria-label="Begrunnelse: Annet"
                            maxLength={1500}
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
