import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { FamilieCheckbox } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring, formatCurrencyNoKr } from '../../../utils';
import { FamilieTilbakeTextArea } from '../../Felleskomponenter/Skjemaelementer';
import FeilutbetalingFaktaPerioder from './FaktaPeriode/FeilutbetalingFaktaPerioder';
import FaktaRevurdering from './FaktaRevurdering';

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

export const RadMedMargin = styled(Row)`
    margin-bottom: 16px;
`;

interface IProps {
    behandling: IBehandling;
    ytelse: Ytelsetype;
}

const FaktaContainer: React.FC<IProps> = ({ behandling, ytelse }) => {
    const [feilutbetalingFakta, settFeilutbetalingFakta] = React.useState<IFeilutbetalingFakta>();
    const [begrunnelse, settBegrunnelse] = React.useState<string>();
    const { hentFeilutbetalingFakta } = useBehandling();
    const erLesevisning = false;

    React.useEffect(() => {
        const fakta = hentFeilutbetalingFakta(behandling.behandlingId);
        if (fakta.status === RessursStatus.SUKSESS) {
            settFeilutbetalingFakta(fakta.data);
            settBegrunnelse(fakta.data?.begrunnelse);
        }
    }, [behandling]);

    const onChangeBegrunnelse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        settBegrunnelse(nyVerdi);
    };

    return feilutbetalingFakta ? (
        <StyledFeilutbetalingFakta>
            <RadMedMargin>
                <Column xs="12" md="6">
                    <RadMedMargin>
                        <Column xs="12">
                            <Undertittel>Feilutbetaling</Undertittel>
                        </Column>
                    </RadMedMargin>
                    <RadMedMargin>
                        <Column xs="12" md="4">
                            <UndertekstBold>Periode med feilutbetaling</UndertekstBold>
                            <Normaltekst>
                                {`${formatterDatostring(
                                    feilutbetalingFakta.totalFeilutbetaltPeriode.fom
                                )} - ${formatterDatostring(
                                    feilutbetalingFakta.totalFeilutbetaltPeriode.tom
                                )}`}
                            </Normaltekst>
                        </Column>
                        <Column xs="12" md="4">
                            <UndertekstBold>Feilutbetalt beløp totalt</UndertekstBold>
                            <Normaltekst className={'redText'}>
                                {`${formatCurrencyNoKr(
                                    feilutbetalingFakta.totaltFeilutbetaltBeløp
                                )}`}
                            </Normaltekst>
                        </Column>
                        <Column xs="12" md="4">
                            <UndertekstBold>Tidligere varslet beløp</UndertekstBold>
                            <Normaltekst>
                                {`${formatCurrencyNoKr(feilutbetalingFakta.varsletBeløp)}`}
                            </Normaltekst>
                        </Column>
                    </RadMedMargin>
                    {!erLesevisning && (
                        <RadMedMargin>
                            <Column xs="11">
                                <FamilieCheckbox
                                    erLesevisning={erLesevisning}
                                    label={'Behandle alle perioder samlet'}
                                />
                            </Column>
                        </RadMedMargin>
                    )}
                    <Row>
                        <Column xs="11">
                            {feilutbetalingFakta.feilutbetaltePerioder && (
                                <FeilutbetalingFaktaPerioder
                                    ytelse={ytelse}
                                    erLesevisning={erLesevisning}
                                    perioder={feilutbetalingFakta.feilutbetaltePerioder}
                                />
                            )}
                        </Column>
                    </Row>
                </Column>
                <Column xs="12" md="6">
                    <FaktaRevurdering feilutbetalingFakta={feilutbetalingFakta} />
                </Column>
            </RadMedMargin>
            <Row>
                <Column md="6">
                    <FamilieTilbakeTextArea
                        name={'begrunnelse'}
                        label={'Forklar årsaken(e) til feilutbetalingen'}
                        erLesevisning={erLesevisning}
                        value={begrunnelse ? begrunnelse : ''}
                        onChange={event => onChangeBegrunnelse(event)}
                        maxLength={1500}
                    />
                </Column>
            </Row>
        </StyledFeilutbetalingFakta>
    ) : null;
};

export default FaktaContainer;
