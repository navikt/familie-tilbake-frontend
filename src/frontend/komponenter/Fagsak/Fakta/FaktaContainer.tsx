import * as React from 'react';

import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';
import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { FamilieCheckbox } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk';
import { formatterDatostring, formatCurrencyNoKr } from '../../../utils';
import { Navigering, Spacer20 } from '../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../Felleskomponenter/Skjemaelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import FeilutbetalingFaktaPerioder from './FaktaPeriode/FeilutbetalingFaktaPerioder';
import FaktaRevurdering from './FaktaRevurdering';
import { useFeilutbetalingFakta } from './FeilutbetalingFaktaContext';

const StyledFeilutbetalingFakta = styled.div`
    padding: 10px;

    .typo-undertekst {
        margin-bottom: 10px;
    }

    .redText {
        color: ${navFarger.navRod};
        font-weight: bold;
    }
`;

const HenterContainer = styled(StyledFeilutbetalingFakta)`
    text-align: center;
`;

interface IProps {
    ytelse: Ytelsetype;
}

const FaktaContainer: React.FC<IProps> = ({ ytelse }) => {
    const {
        stegErBehandlet,
        skjemaData,
        feilutbetalingFakta,
        oppdaterBegrunnelse,
        behandlePerioderSamlet,
        settBehandlePerioderSamlet,
        sendInnSkjema,
        visFeilmeldinger,
        feilmeldinger,
        senderInn,
    } = useFeilutbetalingFakta();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    const onChangeBegrunnelse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        oppdaterBegrunnelse(nyVerdi);
    };

    switch (feilutbetalingFakta?.status) {
        case RessursStatus.SUKSESS:
            return (
                <StyledFeilutbetalingFakta>
                    <Undertittel>Fakta om feilutbetaling</Undertittel>
                    <Spacer20 />
                    {(!erLesevisning || stegErBehandlet) && (
                        <>
                            <Steginformasjon
                                behandletSteg={stegErBehandlet}
                                infotekst={'Kontroller at korrekt hendelse er satt'}
                            />
                            <Spacer20 />
                        </>
                    )}
                    <Row>
                        <Column sm="12" md="6">
                            <Row>
                                <Column xs="12">
                                    <Undertittel>Feilutbetaling</Undertittel>
                                </Column>
                            </Row>
                            <Spacer20 />
                            <Row>
                                <Column xs="12" md="4">
                                    <UndertekstBold>Periode med feilutbetaling</UndertekstBold>
                                    <Normaltekst>
                                        {`${formatterDatostring(
                                            feilutbetalingFakta.data.totalFeilutbetaltPeriode.fom
                                        )} - ${formatterDatostring(
                                            feilutbetalingFakta.data.totalFeilutbetaltPeriode.tom
                                        )}`}
                                    </Normaltekst>
                                </Column>
                                <Column xs="12" md="4">
                                    <UndertekstBold>Feilutbetalt beløp totalt</UndertekstBold>
                                    <Normaltekst className={'redText'}>
                                        {`${formatCurrencyNoKr(
                                            feilutbetalingFakta.data.totaltFeilutbetaltBeløp
                                        )}`}
                                    </Normaltekst>
                                </Column>
                                <Column xs="12" md="4">
                                    <UndertekstBold>Tidligere varslet beløp</UndertekstBold>
                                    <Normaltekst>
                                        {feilutbetalingFakta.data.varsletBeløp
                                            ? `${formatCurrencyNoKr(
                                                  feilutbetalingFakta.data.varsletBeløp
                                              )}`
                                            : ''}
                                    </Normaltekst>
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
                                                    settBehandlePerioderSamlet(
                                                        !behandlePerioderSamlet
                                                    )
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
                            <FaktaRevurdering feilutbetalingFakta={feilutbetalingFakta.data} />
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
                                    <Knapp
                                        type={'hoved'}
                                        mini={true}
                                        onClick={sendInnSkjema}
                                        spinner={senderInn}
                                        autoDisableVedSpinner
                                        disabled={erLesevisning && !stegErBehandlet}
                                    >
                                        {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                                    </Knapp>
                                </div>
                            </Navigering>
                        </Column>
                    </Row>
                </StyledFeilutbetalingFakta>
            );
        case RessursStatus.HENTER:
            return (
                <HenterContainer>
                    <Normaltekst>Henting av feilutbetalingen tar litt tid.</Normaltekst>
                    <NavFrontendSpinner type="XXL" />
                </HenterContainer>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <AlertStripe children={feilutbetalingFakta.frontendFeilmelding} type="feil" />;
        default:
            return <div />;
    }
};

export default FaktaContainer;
