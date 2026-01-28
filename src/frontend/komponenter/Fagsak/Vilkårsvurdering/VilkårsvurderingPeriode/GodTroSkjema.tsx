import type {
    JaNeiOption,
    VilkårsvurderingSkjemaDefinisjon,
} from './VilkårsvurderingPeriodeSkjemaContext';

import { Radio, Textarea, TextField } from '@navikt/ds-react';
import * as React from 'react';

import { jaNeiOptions, OptionJA } from './VilkårsvurderingPeriodeSkjemaContext';
import { useBehandlingState } from '../../../../context/BehandlingStateContext';
import { type Skjema, Valideringsstatus } from '../../../../hooks/skjema';
import { HorisontalRadioGroup } from '../../../Felleskomponenter/Skjemaelementer';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

const GodTroSkjema: React.FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandlingState();

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
                aria-live="polite"
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
            {harVurderBeløpIBehold && (
                <Textarea
                    {...skjema.felter.aktsomhetBegrunnelse.hentNavInputProps(
                        skjema.visFeilmeldinger
                    )}
                    name="vurderingBegrunnelse"
                    label={
                        harBeløpetIBehold
                            ? 'Begrunn hvorfor beløpet er i behold'
                            : 'Begrunn hvorfor beløpet ikke er i behold'
                    }
                    aria-live="polite"
                    readOnly={erLesevisning}
                    size="small"
                    resize
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
            )}
            {harVurderBeløpIBehold && harBeløpetIBehold && (
                <TextField
                    {...skjema.felter.godTroTilbakekrevesBeløp.hentNavInputProps(
                        skjema.visFeilmeldinger
                    )}
                    id="tilbakekrevdBelop"
                    label="Angi beløp som skal tilbakekreves"
                    readOnly={erLesevisning}
                    aria-live="polite"
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
            )}
            {harVurderBeløpIBehold && !harBeløpetIBehold && (
                <TextField
                    id="ingenTilbakekrevdBelop"
                    label="Beløp som skal tilbakekreves"
                    readOnly
                    aria-live="polite"
                    size="small"
                    value={0}
                    style={{ width: '6rem' }}
                    data-testid="ingenTilbakekrevdBelop"
                />
            )}
        </>
    );
};

export default GodTroSkjema;
