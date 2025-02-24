import * as React from 'react';

import { styled } from 'styled-components';

import { BodyShort, Radio, TextField, VStack } from '@navikt/ds-react';
import { type ISkjema, Valideringsstatus } from '../../../../hooks/skjema';

import {
    JaNeiOption,
    jaNeiOptions,
    OptionJA,
    VilkårsvurderingSkjemaDefinisjon,
} from './VilkårsvurderingPeriodeSkjemaContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalRadioGroup } from '../../../Felleskomponenter/Skjemaelementer';

const ArrowBoxContainer = styled.div`
    width: 300px;
`;

interface IProps {
    skjema: ISkjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
}

const GodTroSkjema: React.FC<IProps> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandling();

    const ugyldigErBeløpetIBeholdValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.erBeløpetIBehold.valideringsstatus === Valideringsstatus.FEIL;

    const harVurderBeløpIBehold = skjema.felter.erBeløpetIBehold.verdi !== '';
    const harBeløpetIBehold =
        harVurderBeløpIBehold && skjema.felter.erBeløpetIBehold.verdi === OptionJA;
    return (
        <VStack gap="1">
            <HorisontalRadioGroup
                id="erBelopetIBehold"
                readOnly={erLesevisning}
                legend="Er beløpet i behold?"
                value={skjema.felter.erBeløpetIBehold.verdi}
                error={
                    ugyldigErBeløpetIBeholdValgt
                        ? skjema.felter.erBeløpetIBehold.feilmelding?.toString()
                        : ''
                }
                onChange={(val: JaNeiOption) => {
                    skjema.felter.erBeløpetIBehold.validerOgSettFelt(val);
                    settIkkePersistertKomponent(`vilkårsvurdering`);
                }}
            >
                {jaNeiOptions.map(opt => (
                    <Radio key={opt.label} name="erBelopetIBehold" value={opt}>
                        {opt.label}
                    </Radio>
                ))}
            </HorisontalRadioGroup>
            <ArrowBoxContainer>
                {harVurderBeløpIBehold && harBeløpetIBehold && (
                    <ArrowBox alignOffset={23}>
                        <TextField
                            {...skjema.felter.godTroTilbakekrevesBeløp.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            id="tilbakekrevdBelop"
                            label="Angi beløp som skal tilbakekreves"
                            readOnly={erLesevisning}
                            onChange={event => {
                                skjema.felter.godTroTilbakekrevesBeløp.validerOgSettFelt(
                                    event.target.value
                                );
                                settIkkePersistertKomponent(`vilkårsvurdering`);
                            }}
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
        </VStack>
    );
};

export default GodTroSkjema;
