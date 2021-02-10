import * as React from 'react';

import classNames from 'classnames';

import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, Undertekst, Undertittel } from 'nav-frontend-typografi';

import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingFakta';
import { formatterDatostring } from '../../../utils/dateUtils';

interface IProps {
    feilutbetalingFakta: IFeilutbetalingFakta;
}

const FaktaRevurdering: React.FC<IProps> = ({ feilutbetalingFakta }) => {
    return feilutbetalingFakta?.behandlingFakta ? (
        <>
            <Row className={classNames('smallMarginBottom')}>
                <Column xs="12">
                    <Undertittel>Revurdering</Undertittel>
                </Column>
            </Row>
            <Row className={classNames('smallMarginBottom')}>
                <Column xs="6">
                    <Undertekst>Årsak(er) til revurdering</Undertekst>
                    {feilutbetalingFakta.behandlingFakta.behandlingÅrsaker && (
                        <Normaltekst>
                            {feilutbetalingFakta.behandlingFakta.behandlingÅrsaker.join(', ')}
                        </Normaltekst>
                    )}
                </Column>
                <Column xs="6">
                    <Undertekst>Dato for revurderingsvedtak</Undertekst>
                    <Normaltekst>
                        {formatterDatostring(
                            feilutbetalingFakta.behandlingFakta.datoForRevurderingsvedtak
                        )}
                    </Normaltekst>
                </Column>
            </Row>
            <Row className={classNames('smallMarginBottom')}>
                <Column xs="6">
                    <Undertekst>Resultat</Undertekst>
                    {feilutbetalingFakta.behandlingFakta.behandlingsresultat && (
                        <Normaltekst>
                            {feilutbetalingFakta.behandlingFakta.behandlingsresultat.resultat}
                        </Normaltekst>
                    )}
                </Column>
                <Column xs="6">
                    <Undertekst>Konsekvens</Undertekst>
                    {feilutbetalingFakta.behandlingFakta.behandlingsresultat && (
                        <Normaltekst>
                            {feilutbetalingFakta.behandlingFakta.behandlingsresultat.konsekvenserForYtelsen?.join(
                                ', '
                            )}
                        </Normaltekst>
                    )}
                </Column>
            </Row>
            <Row>
                <Column xs="6">
                    <Undertekst>Tilbakekrevingsvalg</Undertekst>
                    {feilutbetalingFakta.behandlingFakta.tilbakekrevingValg && (
                        <Normaltekst>
                            {
                                feilutbetalingFakta.behandlingFakta.tilbakekrevingValg
                                    .videreBehandling
                            }
                        </Normaltekst>
                    )}
                </Column>
            </Row>
        </>
    ) : null;
};

export default FaktaRevurdering;
