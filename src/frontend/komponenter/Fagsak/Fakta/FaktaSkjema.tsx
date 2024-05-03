import * as React from 'react';

import { BodyShort, Checkbox, Heading, HGrid, Textarea, VStack } from '@navikt/ds-react';

import FeilutbetalingFaktaPerioder from './FaktaPeriode/FeilutbetalingFaktaPerioder';
import FaktaRevurdering from './FaktaRevurdering';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';
import { FaktaSkjemaData } from './typer/feilutbetalingFakta';
import { Ytelsetype } from '../../../kodeverk';
import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring, formatCurrencyNoKr } from '../../../utils';
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
        behandlePerioderSamlet,
        settBehandlePerioderSamlet,
        sendInnSkjema,
        visFeilmeldinger,
        feilmeldinger,
        senderInn,
        gåTilForrige,
    } = useFeilutbetalingFakta();

    return (
        <HGrid columns={2} gap="10">
            <VStack gap="5">
                <Heading level="2" size="small">
                    Feilutbetaling
                </Heading>
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
                    onChange={e => oppdaterBegrunnelse(e.target.value)}
                    maxLength={3000}
                    className={erLesevisning ? 'lesevisning' : ''}
                    error={
                        visFeilmeldinger &&
                        feilmeldinger?.find(meld => meld.gjelderBegrunnelse)?.melding
                    }
                />
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
