import * as React from 'react';

import {
    Alert,
    BodyShort,
    Checkbox,
    Heading,
    HGrid,
    Radio,
    RadioGroup,
    Textarea,
    VStack,
} from '@navikt/ds-react';

import FeilutbetalingFaktaPerioder from './FaktaPeriode/FeilutbetalingFaktaPerioder';
import FaktaRevurdering from './FaktaRevurdering';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';
import { FaktaSkjemaData } from './typer/feilutbetalingFakta';
import { useBehandling } from '../../../context/BehandlingContext';
import { ToggleName } from '../../../context/toggles';
import { useToggles } from '../../../context/TogglesContext';
import { Ytelsetype } from '../../../kodeverk';
import { HarBrukerUttaltSegValg, IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import { formatCurrencyNoKr, formatterDatostring } from '../../../utils';
import { DetailBold, FTButton, Navigering } from '../../Felleskomponenter/Flytelementer';

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
    const { settIkkePersistertKomponent } = useBehandling();
    const { toggles } = useToggles();
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
                        <Alert variant={'warning'} size={'small'}>
                            Det finnes flere revurderinger knyttet til denne tilbakekrevingen.
                            <br />
                            Dobbeltsjekk at beløp, perioder og årsak til utbetaling stemmer.
                        </Alert>
                    </div>
                )}
                <HGrid columns={3} gap="1">
                    <div>
                        <DetailBold>Periode med feilutbetaling</DetailBold>
                        <BodyShort size="small">
                            {`${formatterDatostring(
                                feilutbetalingFakta.totalFeilutbetaltPeriode.fom
                            )} - ${formatterDatostring(
                                feilutbetalingFakta.totalFeilutbetaltPeriode.tom
                            )}`}
                        </BodyShort>
                    </div>
                    <div>
                        <DetailBold>Feilutbetalt beløp totalt</DetailBold>
                        <BodyShort size="small" className={'redText'}>
                            {`${formatCurrencyNoKr(feilutbetalingFakta.totaltFeilutbetaltBeløp)}`}
                        </BodyShort>
                    </div>
                    <div>
                        <DetailBold>Tidligere varslet beløp</DetailBold>
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
                            onChange={() => settBehandlePerioderSamlet(!behandlePerioderSamlet)}
                        >
                            Behandle alle perioder samlet
                        </Checkbox>
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
                    name={'begrunnelse'}
                    label={'Forklar årsaken(e) til feilutbetalingen'}
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
                {toggles[ToggleName.vurderBrukersUttalelse] && (
                    <VStack gap="2">
                        <RadioGroup
                            id="brukerHarUttaltSeg"
                            readOnly={erLesevisning}
                            legend="Har bruker uttalt seg?"
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
                                data-testid={`brukerHarUttaltSeg.ja`}
                            >
                                Ja
                            </Radio>
                            <Radio
                                key={HarBrukerUttaltSegValg.NEI}
                                name="brukerHarUttaltSeg"
                                value={HarBrukerUttaltSegValg.NEI}
                                data-testid={`brukerHarUttaltSeg.nei`}
                            >
                                Nei
                            </Radio>
                        </RadioGroup>
                        {skjemaData.vurderingAvBrukersUttalelse?.harBrukerUttaltSeg ===
                            HarBrukerUttaltSegValg.JA && (
                            <Textarea
                                name={'beskrivelseBrukersUttalelse'}
                                label={
                                    'Beskriv når og hvor bruker har uttalt seg. Gi også en kort oppsummering av uttalelsen'
                                }
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
                )}
                <Navigering>
                    <FTButton
                        variant="primary"
                        onClick={sendInnSkjema}
                        loading={senderInn}
                        disabled={erLesevisning && !stegErBehandlet}
                    >
                        {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                    </FTButton>
                    {behandling.harVerge && (
                        <FTButton variant="secondary" onClick={gåTilForrige}>
                            Forrige
                        </FTButton>
                    )}
                </Navigering>
            </VStack>

            <FaktaRevurdering feilutbetalingFakta={feilutbetalingFakta} />
        </HGrid>
    );
};

export default FaktaSkjema;
