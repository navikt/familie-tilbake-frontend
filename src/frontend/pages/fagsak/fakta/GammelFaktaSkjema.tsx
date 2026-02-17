import type { FaktaSkjemaData } from './typer/fakta';
import type { FaktaResponse } from '../../../typer/tilbakekrevingstyper';

import {
    Alert,
    BodyShort,
    Checkbox,
    Detail,
    Heading,
    HGrid,
    Radio,
    RadioGroup,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import * as React from 'react';

import { FaktaPerioder } from './fakta-periode/FaktaPerioder';
import { useFakta } from './FaktaContext';
import { FaktaRevurdering } from './FaktaRevurdering';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { HendelseType } from '../../../kodeverk';
import { ActionBar } from '../../../komponenter/action-bar/ActionBar';
import { HarBrukerUttaltSegValg } from '../../../typer/tilbakekrevingstyper';
import { formatCurrencyNoKr, formatterDatostring } from '../../../utils';

type Props = {
    skjemaData: FaktaSkjemaData;
    fakta: FaktaResponse;
};

export const GammelFaktaSkjema: React.FC<Props> = ({ skjemaData, fakta }) => {
    const behandling = useBehandling();
    const {
        oppdaterBegrunnelse,
        oppdaterBeskrivelseBrukerHarUttaltSeg,
        oppdaterBrukerHarUttaltSeg,
        behandlePerioderSamlet,
        settBehandlePerioderSamlet,
        visFeilmeldinger,
        feilmeldinger,
    } = useFakta();
    const { behandlingILesemodus, settIkkePersistertKomponent } = useBehandlingState();
    const erKravgrunnlagKnyttetTilEnEnEldreRevurdering =
        behandling.fagsystemsbehandlingId !== fakta.kravgrunnlagReferanse;

    return (
        <HGrid columns={2} gap="space-40">
            <VStack gap="space-28">
                <Heading level="2" size="small">
                    Feilutbetaling
                </Heading>
                {erKravgrunnlagKnyttetTilEnEnEldreRevurdering && (
                    <div>
                        <Alert variant="warning" size="small">
                            Det finnes flere revurderinger knyttet til denne tilbakekrevingen.
                            <br />
                            Dobbeltsjekk at beløp, perioder og årsak til utbetaling stemmer.
                        </Alert>
                    </div>
                )}
                <HGrid columns={3} gap="space-4">
                    <div>
                        <Detail weight="semibold">Periode med feilutbetaling</Detail>
                        <BodyShort size="small">
                            {`${formatterDatostring(
                                fakta.totalFeilutbetaltPeriode.fom
                            )} - ${formatterDatostring(fakta.totalFeilutbetaltPeriode.tom)}`}
                        </BodyShort>
                    </div>
                    <div>
                        <Detail weight="semibold">Feilutbetalt beløp totalt</Detail>
                        <BodyShort size="small" className="text-ax-text-danger-subtle font-ax-bold">
                            {`${formatCurrencyNoKr(fakta.totaltFeilutbetaltBeløp)}`}
                        </BodyShort>
                    </div>
                    <div>
                        <Detail weight="semibold">Tidligere varslet beløp</Detail>
                        <BodyShort size="small">
                            {fakta.varsletBeløp ? `${formatCurrencyNoKr(fakta.varsletBeløp)}` : ''}
                        </BodyShort>
                    </div>
                </HGrid>
                <VStack gap="space-8">
                    {!behandlingILesemodus && (
                        <Checkbox
                            size="small"
                            checked={behandlePerioderSamlet === true}
                            onChange={() => {
                                settIkkePersistertKomponent('fakta');
                                settBehandlePerioderSamlet(!behandlePerioderSamlet);
                            }}
                        >
                            Velg rettslig grunnlag for periodene samlet
                        </Checkbox>
                    )}
                    {skjemaData.perioder.some(p => p.hendelsestype === HendelseType.Inntekt) && (
                        <Alert variant="warning" size="small">
                            Husk å kontrollere faktisk inntekt den siste måneden i
                            feilutbetalingsperioden
                        </Alert>
                    )}
                    {skjemaData.perioder && <FaktaPerioder perioder={skjemaData.perioder} />}
                </VStack>
                <Textarea
                    name="begrunnelse"
                    label="Årsak til feilutbetalingen"
                    description="Tekst som er her fra før, kommer fra fagsystemet. Legg gjerne til/rediger tekst."
                    readOnly={behandlingILesemodus}
                    value={skjemaData.begrunnelse ? skjemaData.begrunnelse : ''}
                    onChange={e => {
                        settIkkePersistertKomponent('fakta');
                        oppdaterBegrunnelse(e.target.value);
                    }}
                    maxLength={3000}
                    className={behandlingILesemodus ? 'lesevisning' : ''}
                    error={
                        visFeilmeldinger &&
                        feilmeldinger?.find(meld => meld.gjelderBegrunnelse)?.melding
                    }
                />
                <VStack gap="space-8">
                    <RadioGroup
                        id="brukerHarUttaltSeg"
                        readOnly={behandlingILesemodus}
                        legend="Har bruker uttalt seg om feilutbetalingen?"
                        value={skjemaData.vurderingAvBrukersUttalelse?.harBrukerUttaltSeg}
                        error={
                            visFeilmeldinger &&
                            feilmeldinger?.find(meld => meld.gjelderBrukerHarUttaltSeg)?.melding
                        }
                        onChange={(val: HarBrukerUttaltSegValg) => {
                            settIkkePersistertKomponent('fakta');
                            oppdaterBrukerHarUttaltSeg(val);
                        }}
                    >
                        <Radio
                            key={HarBrukerUttaltSegValg.Ja}
                            name="brukerHarUttaltSeg"
                            value={HarBrukerUttaltSegValg.Ja}
                            data-testid="brukerHarUttaltSeg.ja"
                        >
                            Ja
                        </Radio>
                        <Radio
                            key={HarBrukerUttaltSegValg.Nei}
                            name="brukerHarUttaltSeg"
                            value={HarBrukerUttaltSegValg.Nei}
                            data-testid="brukerHarUttaltSeg.nei"
                        >
                            Nei
                        </Radio>
                        <Radio
                            key={HarBrukerUttaltSegValg.IkkeAktuelt}
                            name="brukerHarUttaltSeg"
                            value={HarBrukerUttaltSegValg.IkkeAktuelt}
                            data-testid="brukerHarUttaltSeg.ikke-aktuelt"
                        >
                            Ikke aktuelt
                        </Radio>
                    </RadioGroup>
                    {skjemaData.vurderingAvBrukersUttalelse?.harBrukerUttaltSeg ===
                        HarBrukerUttaltSegValg.Ja && (
                        <Textarea
                            name="beskrivelseBrukersUttalelse"
                            label="Beskriv når og hvor bruker har uttalt seg. Gi også en kort oppsummering av uttalelsen"
                            readOnly={behandlingILesemodus}
                            value={
                                skjemaData.vurderingAvBrukersUttalelse?.beskrivelse
                                    ? skjemaData.vurderingAvBrukersUttalelse?.beskrivelse
                                    : ''
                            }
                            onChange={e => {
                                settIkkePersistertKomponent('fakta');
                                oppdaterBeskrivelseBrukerHarUttaltSeg(e.target.value);
                            }}
                            maxLength={3000}
                            className={behandlingILesemodus ? 'lesevisning' : ''}
                            error={
                                visFeilmeldinger &&
                                feilmeldinger?.find(
                                    meld => meld.gjelderBeskrivelseBrukerHarUttaltSeg
                                )?.melding
                            }
                        />
                    )}
                </VStack>
            </VStack>
            <FaktaRevurdering fakta={fakta} />
        </HGrid>
    );
};
