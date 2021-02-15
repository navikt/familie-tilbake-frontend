import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { FamilieCheckbox, FamilieTextarea } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring } from '../../../utils/dateUtils';
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

    React.useEffect(() => {
        const fakta = hentFeilutbetalingFakta(behandling.id);
        if (fakta.status === RessursStatus.SUKSESS) {
            settFeilutbetalingFakta(fakta.data);
            settBegrunnelse(fakta.data?.behandlingFakta?.begrunnelse);
        }
    }, [behandling]);

    const onChangeBegrunnelse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        settBegrunnelse(nyVerdi);
    };

    return feilutbetalingFakta ? (
        feilutbetalingFakta.behandlingFakta ? (
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
                                        feilutbetalingFakta.behandlingFakta.totalPeriodeFom
                                    )} - ${formatterDatostring(
                                        feilutbetalingFakta.behandlingFakta.totalPeriodeTom
                                    )}`}
                                </Normaltekst>
                            </Column>
                            <Column xs="12" md="4">
                                <UndertekstBold>Feilutbetalt beløp totalt</UndertekstBold>
                                <Normaltekst className={'redText'}>
                                    {`${feilutbetalingFakta.behandlingFakta.aktuellFeilUtbetaltBeløp}`}
                                </Normaltekst>
                            </Column>
                            <Column xs="12" md="4">
                                <UndertekstBold>Tidligere varslet beløp</UndertekstBold>
                                <Normaltekst>
                                    {`${feilutbetalingFakta.behandlingFakta.tidligereVarsletBeløp}`}
                                </Normaltekst>
                            </Column>
                        </RadMedMargin>
                        <RadMedMargin>
                            <Column xs="11">
                                <FamilieCheckbox
                                    erLesevisning={false}
                                    label={'Behandle alle perioder samlet'}
                                />
                            </Column>
                        </RadMedMargin>
                        <Row>
                            <Column xs="11">
                                {feilutbetalingFakta.behandlingFakta.perioder && (
                                    <FeilutbetalingFaktaPerioder
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
                </RadMedMargin>
                <Row>
                    <Column md="6">
                        <FamilieTextarea
                            name={'begrunnelse'}
                            label={'Forklar årsaken(e) til feilutbetalingen'}
                            erLesevisning={false}
                            value={begrunnelse ? begrunnelse : ''}
                            onChange={event => onChangeBegrunnelse(event)}
                            maxLength={1500}
                        />
                    </Column>
                </Row>
            </StyledFeilutbetalingFakta>
        ) : null
    ) : null;
};

export default FaktaContainer;
