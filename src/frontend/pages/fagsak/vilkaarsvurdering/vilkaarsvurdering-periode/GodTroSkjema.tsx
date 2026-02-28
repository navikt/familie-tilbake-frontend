import type {
    JaNeiOption,
    VilkårsvurderingSkjemaDefinisjon,
} from './VilkårsvurderingPeriodeSkjemaContext';
import type { FC } from 'react';

import { Radio, Textarea, TextField, RadioGroup } from '@navikt/ds-react';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { type Skjema, Valideringsstatus } from '~/hooks/skjema';

import { jaNeiOptions, OptionJA } from './VilkårsvurderingPeriodeSkjemaContext';

type Props = {
    skjema: Skjema<VilkårsvurderingSkjemaDefinisjon, string>;
    erLesevisning: boolean;
};

export const GodTroSkjema: FC<Props> = ({ skjema, erLesevisning }) => {
    const { settIkkePersistertKomponent } = useBehandlingState();

    const ugyldigErBeløpetIBeholdValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.erBeløpetIBehold.valideringsstatus === Valideringsstatus.Feil;

    const harVurderBeløpIBehold = skjema.felter.erBeløpetIBehold.verdi !== '';
    const harBeløpetIBehold =
        harVurderBeløpIBehold && skjema.felter.erBeløpetIBehold.verdi === OptionJA;
    return (
        <>
            <RadioGroup
                id="erBelopetIBehold"
                readOnly={erLesevisning}
                size="small"
                aria-live="polite"
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
            </RadioGroup>
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
                    minRows={3}
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
