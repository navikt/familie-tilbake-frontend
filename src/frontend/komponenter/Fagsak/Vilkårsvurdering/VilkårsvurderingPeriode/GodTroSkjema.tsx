import type {
    JaNeiOption,
    VilkårsvurderingSkjemaDefinisjon,
} from './VilkårsvurderingPeriodeSkjemaContext';

import { BodyShort, Radio, Textarea, TextField } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { jaNeiOptions, OptionJA } from './VilkårsvurderingPeriodeSkjemaContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import { type Skjema, Valideringsstatus } from '../../../../hooks/skjema';
import ArrowBox from '../../../Felleskomponenter/ArrowBox/ArrowBox';
import { HorisontalRadioGroup } from '../../../Felleskomponenter/Skjemaelementer';

const ArrowBoxContainer = styled.div`
    width: 300px;
`;

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const GodTroSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandling();

    const ugyldigErBeløpetIBeholdValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.erBeløpetIBehold.valideringsstatus === Valideringsstatus.Feil;

    const harVurderBeløpIBehold = skjema.felter.erBeløpetIBehold.verdi !== '';
    const harBeløpetIBehold =
        harVurderBeløpIBehold && skjema.felter.erBeløpetIBehold.verdi === OptionJA;
    return (
        <>
            <HorisontalRadioGroup
                id="erBelopetIBehold"
                readOnly={erLesevisning}
                size="small"
                legend="Er beløpet i behold?"
                marginbottom="0"
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
            <Textarea
                {...skjema.felter.aktsomhetBegrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                name="vurderingBegrunnelse"
                label="Begrunn hvorfor beløpet er i behold"
                readOnly={erLesevisning}
                size="small"
                resize
                className="w-100"
                value={
                    skjema.felter.aktsomhetBegrunnelse
                        ? skjema.felter.aktsomhetBegrunnelse.verdi
                        : ''
                }
                onChange={(event: { target: { value: string } }) => {
                    skjema.felter.aktsomhetBegrunnelse.validerOgSettFelt(event.target.value);
                    settIkkePersistertKomponent('vilkårsvurdering');
                }}
                maxLength={3000}
            />
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
                            size="small"
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
        </>
    );
};

export default GodTroSkjema;
