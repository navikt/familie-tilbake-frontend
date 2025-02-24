import type { FaktaSkjemaData } from './typer/feilutbetalingFakta';
import type { Ytelsetype } from '../../../kodeverk';
import type { IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';

import {
    Alert,
    BodyShort,
    Button,
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

import FeilutbetalingFaktaPerioder from './FaktaPeriode/FeilutbetalingFaktaPerioder';
import FaktaRevurdering from './FaktaRevurdering';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';
import { useBehandling } from '../../../context/BehandlingContext';
import { HendelseType } from '../../../kodeverk';
import { HarBrukerUttaltSegValg } from '../../../typer/feilutbetalingtyper';
import { formatCurrencyNoKr, formatterDatostring } from '../../../utils';
import { Navigering } from '../../Felleskomponenter/Flytelementer';

interface IProps {
    ytelse: Ytelsetype;
    erLesevisning: boolean;
    skjemaData: FaktaSkjemaData;
    feilutbetalingFakta: IFeilutbetalingFakta;
}

const FaktaSkjema: React.FC<IProps> = ({
    skjemaData,
    feilutbetalingFakta,
    ytelse,
    erLesevisning,
}) => {
    const {
        behandling,
        stegErBehandlet,
        oppdaterBegrunnelse,
        oppdaterBeskrivelseBrukerHarUttaltSeg,
        oppdaterBrukerHarUttaltSeg,
        behandlePerioderSamlet,
        settBehandlePerioderSamlet,
        sendInnSkjema,
        visFeilmeldinger,
        feilmeldinger,
        senderInn,
        gåTilForrige,
    } = useFeilutbetalingFakta();
    const { settIkkePersistertKomponent, harUlagredeData } = useBehandling();
    const erKravgrunnlagKnyttetTilEnEnEldreRevurdering =
        behandling.fagsystemsbehandlingId !== feilutbetalingFakta.kravgrunnlagReferanse;

    return (
        <HGrid columns={2} gap="10">
            <VStack gap="5">
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
                <HGrid columns={3} gap="1">
                    <div>
                        <Detail weight="semibold">Periode med feilutbetaling</Detail>
                        <BodyShort size="small">
                            {`${formatterDatostring(
                                feilutbetalingFakta.totalFeilutbetaltPeriode.fom
                            )} - ${formatterDatostring(
                                feilutbetalingFakta.totalFeilutbetaltPeriode.tom
                            )}`}
                        </BodyShort>
                    </div>
                    <div>
                        <Detail weight="semibold">Feilutbetalt beløp totalt</Detail>
                        <BodyShort size="small" className="redText">
                            {`${formatCurrencyNoKr(feilutbetalingFakta.totaltFeilutbetaltBeløp)}`}
                        </BodyShort>
                    </div>
                    <div>
                        <Detail weight="semibold">Tidligere varslet beløp</Detail>
                        <BodyShort size="small">
                            {feilutbetalingFakta.varsletBeløp
                                ? `${formatCurrencyNoKr(feilutbetalingFakta.varsletBeløp)}`
                                : ''}
                        </BodyShort>
                    </div>
                </HGrid>
                <VStack gap="2">
                    {!erLesevisning && (
                        <Checkbox
                            size="small"
                            checked={behandlePerioderSamlet === true}
                            onChange={() => {
                                settIkkePersistertKomponent('fakta');
                                settBehandlePerioderSamlet(!behandlePerioderSamlet);
                            }}
                        >
                            Behandle alle perioder samlet
                        </Checkbox>
                    )}
                    {skjemaData.perioder.some(p => p.hendelsestype === HendelseType.INNTEKT) && (
                        <Alert variant="warning" size="small">
                            Husk å kontrollere faktisk inntekt den siste måneden i
                            feilutbetalingsperioden
                        </Alert>
                    )}
                    {skjemaData.perioder && (
                        <FeilutbetalingFaktaPerioder
                            ytelse={ytelse}
                            erLesevisning={erLesevisning}
                            perioder={skjemaData.perioder}
                        />
                    )}
                </VStack>
                <Textarea
                    name="begrunnelse"
                    label="Forklar årsaken(e) til feilutbetalingen"
                    readOnly={erLesevisning}
                    value={skjemaData.begrunnelse ? skjemaData.begrunnelse : ''}
                    onChange={e => {
                        settIkkePersistertKomponent('fakta');
                        oppdaterBegrunnelse(e.target.value);
                    }}
                    maxLength={3000}
                    className={erLesevisning ? 'lesevisning' : ''}
                    error={
                        visFeilmeldinger &&
                        feilmeldinger?.find(meld => meld.gjelderBegrunnelse)?.melding
                    }
                />
                <VStack gap="2">
                    <RadioGroup
                        id="brukerHarUttaltSeg"
                        readOnly={erLesevisning}
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
                            key={HarBrukerUttaltSegValg.JA}
                            name="brukerHarUttaltSeg"
                            value={HarBrukerUttaltSegValg.JA}
                            data-testid="brukerHarUttaltSeg.ja"
                        >
                            Ja
                        </Radio>
                        <Radio
                            key={HarBrukerUttaltSegValg.NEI}
                            name="brukerHarUttaltSeg"
                            value={HarBrukerUttaltSegValg.NEI}
                            data-testid="brukerHarUttaltSeg.nei"
                        >
                            Nei
                        </Radio>
                        <Radio
                            key={HarBrukerUttaltSegValg.IKKE_AKTUELT}
                            name="brukerHarUttaltSeg"
                            value={HarBrukerUttaltSegValg.IKKE_AKTUELT}
                            data-testid="brukerHarUttaltSeg.ikke-aktuelt"
                        >
                            Ikke aktuelt
                        </Radio>
                    </RadioGroup>
                    {skjemaData.vurderingAvBrukersUttalelse?.harBrukerUttaltSeg ===
                        HarBrukerUttaltSegValg.JA && (
                        <Textarea
                            name="beskrivelseBrukersUttalelse"
                            label="Beskriv når og hvor bruker har uttalt seg. Gi også en kort oppsummering av uttalelsen"
                            readOnly={erLesevisning}
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
                            className={erLesevisning ? 'lesevisning' : ''}
                            error={
                                visFeilmeldinger &&
                                feilmeldinger?.find(
                                    meld => meld.gjelderBeskrivelseBrukerHarUttaltSeg
                                )?.melding
                            }
                        />
                    )}
                </VStack>
                <Navigering>
                    <Button
                        variant="primary"
                        onClick={sendInnSkjema}
                        loading={senderInn}
                        disabled={erLesevisning && !stegErBehandlet}
                    >
                        {!stegErBehandlet || harUlagredeData ? 'Bekreft og fortsett' : 'Neste'}
                    </Button>
                    {behandling.harVerge && (
                        <Button variant="secondary" onClick={gåTilForrige}>
                            Forrige
                        </Button>
                    )}
                </Navigering>
            </VStack>

            <FaktaRevurdering feilutbetalingFakta={feilutbetalingFakta} />
        </HGrid>
    );
};

export default FaktaSkjema;
