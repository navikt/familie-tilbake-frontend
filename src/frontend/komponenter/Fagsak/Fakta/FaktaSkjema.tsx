import * as React from 'react';

import { BodyShort, Checkbox, Heading, HGrid, Textarea, VStack } from '@navikt/ds-react';

import { Ytelsetype } from '../../../kodeverk';
import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring, formatCurrencyNoKr } from '../../../utils';
import {
    DetailBold,
    FTButton,
    Navigering,
    Spacer20,
    Spacer8,
} from '../../Felleskomponenter/Flytelementer';
import FeilutbetalingFaktaPerioder from './FaktaPeriode/FeilutbetalingFaktaPerioder';
import FaktaRevurdering from './FaktaRevurdering';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';
import { FaktaSkjemaData } from './typer/feilutbetalingFakta';

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

    const onChangeBegrunnelse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        oppdaterBegrunnelse(nyVerdi);
    };

    return (
        <HGrid columns={2} gap="10">
            <VStack>
                <Heading level="2" size="small">
                    Feilutbetaling
                </Heading>
                <Spacer20 />
                <HGrid columns={3}>
                    <VStack>
                        <DetailBold>Periode med feilutbetaling</DetailBold>
                        <BodyShort size="small">
                            {`${formatterDatostring(
                                feilutbetalingFakta.totalFeilutbetaltPeriode.fom
                            )} - ${formatterDatostring(
                                feilutbetalingFakta.totalFeilutbetaltPeriode.tom
                            )}`}
                        </BodyShort>
                    </VStack>
                    <VStack>
                        <DetailBold>Feilutbetalt beløp totalt</DetailBold>
                        <BodyShort size="small" className={'redText'}>
                            {`${formatCurrencyNoKr(feilutbetalingFakta.totaltFeilutbetaltBeløp)}`}
                        </BodyShort>
                    </VStack>
                    <VStack>
                        <DetailBold>Tidligere varslet beløp</DetailBold>
                        <BodyShort size="small">
                            {feilutbetalingFakta.varsletBeløp
                                ? `${formatCurrencyNoKr(feilutbetalingFakta.varsletBeløp)}`
                                : ''}
                        </BodyShort>
                    </VStack>
                </HGrid>
                <Spacer20 />
                {!erLesevisning && (
                    <>
                        <Checkbox
                            size="small"
                            disabled={erLesevisning}
                            checked={behandlePerioderSamlet === true}
                            onChange={() => settBehandlePerioderSamlet(!behandlePerioderSamlet)}
                        >
                            Behandle alle perioder samlet
                        </Checkbox>
                        <Spacer8 />
                    </>
                )}
                {skjemaData.perioder && (
                    <FeilutbetalingFaktaPerioder
                        ytelse={ytelse}
                        erLesevisning={erLesevisning}
                        perioder={skjemaData.perioder}
                    />
                )}

                <Spacer20 />

                <Textarea
                    name={'begrunnelse'}
                    label={'Forklar årsaken(e) til feilutbetalingen'}
                    readOnly={erLesevisning}
                    value={skjemaData.begrunnelse ? skjemaData.begrunnelse : ''}
                    onChange={event => onChangeBegrunnelse(event)}
                    maxLength={3000}
                    className={erLesevisning ? 'lesevisning' : ''}
                    error={
                        visFeilmeldinger &&
                        feilmeldinger?.find(meld => meld.gjelderBegrunnelse)?.melding
                    }
                />

                <Spacer20 />

                <Navigering>
                    <div>
                        <FTButton
                            variant="primary"
                            onClick={sendInnSkjema}
                            loading={senderInn}
                            disabled={erLesevisning && !stegErBehandlet}
                        >
                            {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                        </FTButton>
                    </div>
                    {behandling.harVerge && (
                        <div>
                            <FTButton variant="secondary" onClick={gåTilForrige}>
                                Forrige
                            </FTButton>
                        </div>
                    )}
                </Navigering>
            </VStack>

            <FaktaRevurdering feilutbetalingFakta={feilutbetalingFakta} />
        </HGrid>
    );
};

export default FaktaSkjema;
