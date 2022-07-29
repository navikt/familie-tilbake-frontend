import * as React from 'react';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Heading } from '@navikt/ds-react';
import { FamilieCheckbox } from '@navikt/familie-form-elements';

import { Ytelsetype } from '../../../kodeverk';
import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring, formatCurrencyNoKr } from '../../../utils';
import { DetailBold, FTButton, Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../Felleskomponenter/Skjemaelementer';
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
        <>
            <Row>
                <Column sm="12" md="6">
                    <Row>
                        <Column xs="12">
                            <Heading level="2" size="small">
                                Feilutbetaling
                            </Heading>
                        </Column>
                    </Row>
                    <Spacer20 />
                    <Row>
                        <Column xs="12" md="4">
                            <DetailBold size="small">Periode med feilutbetaling</DetailBold>
                            <BodyShort size="small">
                                {`${formatterDatostring(
                                    feilutbetalingFakta.totalFeilutbetaltPeriode.fom
                                )} - ${formatterDatostring(
                                    feilutbetalingFakta.totalFeilutbetaltPeriode.tom
                                )}`}
                            </BodyShort>
                        </Column>
                        <Column xs="12" md="4">
                            <DetailBold size="small">Feilutbetalt beløp totalt</DetailBold>
                            <BodyShort size="small" className={'redText'}>
                                {`${formatCurrencyNoKr(
                                    feilutbetalingFakta.totaltFeilutbetaltBeløp
                                )}`}
                            </BodyShort>
                        </Column>
                        <Column xs="12" md="4">
                            <DetailBold size="small">Tidligere varslet beløp</DetailBold>
                            <BodyShort size="small">
                                {feilutbetalingFakta.varsletBeløp
                                    ? `${formatCurrencyNoKr(feilutbetalingFakta.varsletBeløp)}`
                                    : ''}
                            </BodyShort>
                        </Column>
                    </Row>
                    <Spacer20 />
                    {!erLesevisning && (
                        <>
                            <Row>
                                <Column xs="11">
                                    <FamilieCheckbox
                                        erLesevisning={erLesevisning}
                                        label={'Behandle alle perioder samlet'}
                                        checked={behandlePerioderSamlet === true}
                                        onChange={() =>
                                            settBehandlePerioderSamlet(!behandlePerioderSamlet)
                                        }
                                    />
                                </Column>
                            </Row>
                            <Spacer20 />
                        </>
                    )}
                    <Row>
                        <Column xs="11">
                            {skjemaData.perioder && (
                                <FeilutbetalingFaktaPerioder
                                    ytelse={ytelse}
                                    erLesevisning={erLesevisning}
                                    perioder={skjemaData.perioder}
                                />
                            )}
                        </Column>
                    </Row>
                </Column>
                <Column sm="12" md="6">
                    <FaktaRevurdering feilutbetalingFakta={feilutbetalingFakta} />
                </Column>
            </Row>
            <Spacer20 />
            <Row>
                <Column sm="12" md="6">
                    <FamilieTilbakeTextArea
                        name={'begrunnelse'}
                        label={'Forklar årsaken(e) til feilutbetalingen'}
                        erLesevisning={erLesevisning}
                        value={skjemaData.begrunnelse ? skjemaData.begrunnelse : ''}
                        onChange={event => onChangeBegrunnelse(event)}
                        maxLength={1500}
                        className={erLesevisning ? 'lesevisning' : ''}
                        feil={
                            visFeilmeldinger &&
                            feilmeldinger?.find(meld => meld.gjelderBegrunnelse)?.melding
                        }
                    />
                </Column>
            </Row>
            <Spacer20 />
            <Row>
                <Column xs="12" md="6">
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
                </Column>
            </Row>
        </>
    );
};

export default FaktaSkjema;
