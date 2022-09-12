import * as React from 'react';

import styled from 'styled-components';

import { BodyShort, Radio } from '@navikt/ds-react';
import { FamilieInput } from '@navikt/familie-form-elements';
import { type ISkjema, Valideringsstatus } from '@navikt/familie-skjema';

import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalFamilieRadioGruppe } from '../../../Felleskomponenter/Skjemaelementer';
import {
    JaNeiOption,
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
                value={
                    !erLesevisning
                        ? skjema.felter.erBeløpetIBehold.verdi
                        : skjema.felter.erBeløpetIBehold.verdi === OptionJA
                        ? 'Ja'
                        : 'Nei'
                }
                error={
                    ugyldigErBeløpetIBeholdValgt
                        ? skjema.felter.erBeløpetIBehold.feilmelding?.toString()
                        : ''
                }
                onChange={(val: JaNeiOption) =>
                    skjema.felter.erBeløpetIBehold.validerOgSettFelt(val)
                }
            >
                {jaNeiOptions.map(opt => (
                    <Radio key={opt.label} name="erBelopetIBehold" value={opt}>
                        {opt.label}
                    </Radio>
                ))}
            </HorisontalFamilieRadioGruppe>
            <ArrowBoxContainer>
                {harVurderBeløpIBehold && harBeløpetIBehold && (
                    <ArrowBox alignOffset={23}>
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
                            style={{ width: '6rem' }}
                        />
                    </ArrowBox>
                )}
                {harVurderBeløpIBehold && !harBeløpetIBehold && (
                    <ArrowBox alignOffset={83}>
                        <BodyShort size="small">Ingen tilbakekreving</BodyShort>
                    </ArrowBox>
                )}
            </ArrowBoxContainer>
        </>
    );
};

export default GodTroSkjema;
