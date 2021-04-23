import * as React from 'react';

import styled from 'styled-components';

import { Radio } from 'nav-frontend-skjema';
import { Normaltekst } from 'nav-frontend-typografi';

import { FamilieInput } from '@navikt/familie-form-elements';
import { ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../Felleskomponenter/Skjemaelementer';
import {
    jaNeiOptions,
    OptionJA,
    VilkårsvurderingSkjemaDefinisjon,
} from './VilkårsvurderingPeriodeSkjemaContext';

const ArrowBoxContainer = styled.div`
    width: 300px;
`;

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const GodTroSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const ugyldigErBeløpetIBeholdValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.erBeløpetIBehold.valideringsstatus === Valideringsstatus.FEIL;

    const harVurderBeløpIBehold = skjema.felter.erBeløpetIBehold.verdi !== '';
    const harBeløpetIBehold =
        harVurderBeløpIBehold && skjema.felter.erBeløpetIBehold.verdi === OptionJA;
    return (
        <>
            <HorisontalFamilieRadioGruppe
                id="erBelopetIBehold"
                erLesevisning={erLesevisning}
                legend={'Er beløpet i behold?'}
                // @ts-ignore
                verdi={skjema.felter.erBeløpetIBehold.verdi === OptionJA ? 'Ja' : 'Nei'}
                feil={
                    ugyldigErBeløpetIBeholdValgt
                        ? skjema.felter.erBeløpetIBehold.feilmelding?.toString()
                        : ''
                }
            >
                {jaNeiOptions.map(opt => (
                    <Radio
                        key={opt.label}
                        name="erBelopetIBehold"
                        label={opt.label}
                        checked={skjema.felter.erBeløpetIBehold.verdi === opt}
                        onChange={() => skjema.felter.erBeløpetIBehold.validerOgSettFelt(opt)}
                    />
                ))}
            </HorisontalFamilieRadioGruppe>
            <ArrowBoxContainer>
                {harVurderBeløpIBehold && harBeløpetIBehold && (
                    <ArrowBox alignOffset={20}>
                        <FamilieInput
                            {...skjema.felter.godTroTilbakekrevesBeløp.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            id="tilbakekrevdBelop"
                            label={'Angi beløp som skal tilbakekreves'}
                            erLesevisning={erLesevisning}
                            onChange={event =>
                                skjema.felter.godTroTilbakekrevesBeløp.validerOgSettFelt(
                                    event.target.value
                                )
                            }
                            value={skjema.felter.godTroTilbakekrevesBeløp.verdi}
                            bredde="S"
                        />
                    </ArrowBox>
                )}
                {harVurderBeløpIBehold && !harBeløpetIBehold && (
                    <ArrowBox alignOffset={80}>
                        <Normaltekst>Ingen tilbakekreving</Normaltekst>
                    </ArrowBox>
                )}
            </ArrowBoxContainer>
        </>
    );
};

export default GodTroSkjema;
