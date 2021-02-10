import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, Undertekst, Undertittel } from 'nav-frontend-typografi';

import { FamilieCheckbox, FamilieTextarea } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk/ytelsetype';
import { IBehandling } from '../../../typer/behandling';
import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingFakta';
import FaktaRevurdering from './FaktaRevurdering';
import FeilutbetalingPerioder from './periode/FeilutbetalingPerioder';

const StyledFeilutbetalingFakta = styled.div`
    padding: 10px;

    .smallMarginBottom {
        margin-bottom: 16px;
    }

    .typo-undertekst {
        margin-bottom: 10px;
    }

    .redText {
        color: ${navFarger.navRod};
        font-weight: bold;
    }

    table {
        width: 100%;

        td {
            margin-left: 0px;
            margin-right: 0px;
            vertical-align: top;
            padding: 5px;
        }

        th {
            border-bottom: 1px solid black;
            text-align: left;
        }

        .beløp {
            text-align: right;
        }

        .skjemaelement {
            margin: 5px;
        }
    }
`;

interface IProps {
    behandling: IBehandling;
    ytelse: Ytelsetype;
}

const FaktaContainer: React.FC<IProps> = ({ behandling, ytelse }) => {
    const [feilutbetalingFakta, settFeilutbetalingFakta] = React.useState<IFeilutbetalingFakta>();
    const { hentFeilutbetalingFakta } = useBehandling();

    const onChange = () => {
        // virker dette?
    };

    React.useEffect(() => {
        const fakta = hentFeilutbetalingFakta(behandling.id);
        if (fakta.status === RessursStatus.SUKSESS) {
            settFeilutbetalingFakta(fakta.data);
        }
    });

    return feilutbetalingFakta ? (
        feilutbetalingFakta.behandlingFakta ? (
            <StyledFeilutbetalingFakta>
                <Row className={'smallMarginBottom'}>
                    <Column xs="12" md="6">
                        <Row className={'smallMarginBottom'}>
                            <Column xs="12">
                                <Undertittel>Feilutbetaling</Undertittel>
                            </Column>
                        </Row>
                        <Row className={'smallMarginBottom'}>
                            <Column xs="12" md="4">
                                <Undertekst>Periode med feilutbetaling</Undertekst>
                                <Normaltekst>
                                    {`${feilutbetalingFakta.behandlingFakta.totalPeriodeFom} - ${feilutbetalingFakta.behandlingFakta.totalPeriodeTom}`}
                                </Normaltekst>
                            </Column>
                            <Column xs="12" md="4">
                                <Undertekst>Feilutbetalt beløp totalt</Undertekst>
                                <Normaltekst className={'redText'}>
                                    {`${feilutbetalingFakta.behandlingFakta.aktuellFeilUtbetaltBeløp}`}
                                </Normaltekst>
                            </Column>
                            <Column xs="12" md="4">
                                <Undertekst>Tidligere varslet beløp</Undertekst>
                                <Normaltekst>
                                    {`${feilutbetalingFakta.behandlingFakta.tidligereVarsletBeløp}`}
                                </Normaltekst>
                            </Column>
                        </Row>
                        <Row className={'smallMarginBottom'}>
                            <Column xs="11">
                                <FamilieCheckbox
                                    erLesevisning={false}
                                    label={'Behandle alle perioder samlet'}
                                />
                            </Column>
                        </Row>
                        <Row>
                            <Column xs="11">
                                {feilutbetalingFakta.behandlingFakta.perioder && (
                                    <FeilutbetalingPerioder
                                        ytelse={ytelse}
                                        perioder={feilutbetalingFakta.behandlingFakta.perioder}
                                    />
                                )}
                            </Column>
                        </Row>
                    </Column>
                    <Column xs="12" md="6">
                        <FaktaRevurdering feilutbetalingFakta={feilutbetalingFakta} />
                    </Column>
                </Row>
                <Row>
                    <Column md="6">
                        <FamilieTextarea
                            name={'begrunnelse'}
                            label={'Forklar årsaken(e) til feilutbetalingen'}
                            erLesevisning={false}
                            value={
                                feilutbetalingFakta?.behandlingFakta?.begrunnelse
                                    ? feilutbetalingFakta?.behandlingFakta?.begrunnelse
                                    : ''
                            }
                            onChange={onChange}
                            maxLength={1500}
                        />
                    </Column>
                </Row>
            </StyledFeilutbetalingFakta>
        ) : null
    ) : null;
};

export default FaktaContainer;
