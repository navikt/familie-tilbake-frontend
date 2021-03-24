import * as React from 'react';

import styled from 'styled-components';

import { Radio } from 'nav-frontend-skjema';
import { Undertekst } from 'nav-frontend-typografi';

import { FamilieInput } from '@navikt/familie-form-elements';

import { useVilkårsvurderingPeriode } from '../../../../context/VilkårsvurderingPeriodeContext';
import { isNumeric } from '../../../../utils';
import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../Felleskomponenter/Skjemaelementer';

const ArrowBoxContainer = styled.div`
    width: 300px;
`;

interface IProps {
    erLesevisning: boolean;
}

const AktsomhetGodTro: React.FC<IProps> = ({ erLesevisning }) => {
    const { vilkårsresultat, oppdaterVilkårsresultat } = useVilkårsvurderingPeriode();
    const [feilIBeløp, settFeilIBeløp] = React.useState<boolean>(false);

    const onChangeErBeløpetIBehold = (valg: boolean) => {
        oppdaterVilkårsresultat({ erBeløpetIBehold: valg });
    };

    const onChangeTilbakekrevdBeløp = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.length === 0) {
            oppdaterVilkårsresultat({ tilbakekrevesBelop: undefined });
            return;
        }

        if (isNumeric(val)) {
            const nyVerdi = Number(val);
            oppdaterVilkårsresultat({ tilbakekrevesBelop: nyVerdi });
            settFeilIBeløp(false);
        } else {
            settFeilIBeløp(true);
        }
    };

    return (
        <>
            <HorisontalFamilieRadioGruppe
                id="erBelopetIBehold"
                erLesevisning={erLesevisning}
                legend={'Er beløpet i behold?'}
                verdi={vilkårsresultat?.erBeløpetIBehold ? 'Ja' : 'Nei'}
            >
                <Radio
                    name="erBelopetIBehold"
                    label={'Ja'}
                    checked={vilkårsresultat?.erBeløpetIBehold === true}
                    onChange={() => onChangeErBeløpetIBehold(true)}
                />
                <Radio
                    name="erBelopetIBehold"
                    label={'Nei'}
                    checked={vilkårsresultat?.erBeløpetIBehold === false}
                    value="false"
                    onChange={() => onChangeErBeløpetIBehold(false)}
                />
            </HorisontalFamilieRadioGruppe>
            <ArrowBoxContainer>
                {vilkårsresultat?.erBeløpetIBehold && (
                    <ArrowBox alignOffset={20}>
                        <FamilieInput
                            id="tilbakekrevdBelop"
                            label={'Angi beløp som skal tilbakekreves'}
                            erLesevisning={erLesevisning}
                            onChange={event => onChangeTilbakekrevdBeløp(event)}
                            value={vilkårsresultat.tilbakekrevesBelop}
                            bredde="S"
                            feil={feilIBeløp ? 'Ikke et gyldig beløp' : null}
                        />
                    </ArrowBox>
                )}
                {vilkårsresultat?.erBeløpetIBehold === false && (
                    <ArrowBox alignOffset={80}>
                        <Undertekst>Ingen tilbakekreving</Undertekst>
                    </ArrowBox>
                )}
            </ArrowBoxContainer>
        </>
    );
};

export default AktsomhetGodTro;
