import * as React from 'react';

import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { IFeilutbetalingFakta } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring } from '../../../utils/dateUtils';
import { RadMedMargin } from './FaktaContainer';

interface IProps {
    feilutbetalingFakta: IFeilutbetalingFakta;
}

const FaktaRevurdering: React.FC<IProps> = ({ feilutbetalingFakta }) => {
    return feilutbetalingFakta?.behandlingFakta ? (
        <>
            <RadMedMargin>
                <Column xs="12">
                    <Undertittel>Revurdering</Undertittel>
                </Column>
            </RadMedMargin>
            <RadMedMargin>
                <Column xs="6">
                    <UndertekstBold>Årsak(er) til revurdering</UndertekstBold>
                    {feilutbetalingFakta.behandlingFakta.behandlingårsaker && (
                        <Normaltekst>
                            {feilutbetalingFakta.behandlingFakta.behandlingårsaker.join(', ')}
                        </Normaltekst>
                    )}
                </Column>
                <Column xs="6">
                    <UndertekstBold>Dato for revurderingsvedtak</UndertekstBold>
                    <Normaltekst>
                        {formatterDatostring(
                            feilutbetalingFakta.behandlingFakta.datoForRevurderingsvedtak
                        )}
                    </Normaltekst>
                </Column>
            </RadMedMargin>
            <RadMedMargin>
                <Column xs="6">
                    <UndertekstBold>Resultat</UndertekstBold>
                    {feilutbetalingFakta.behandlingFakta.behandlingsresultat && (
                        <Normaltekst>
                            {feilutbetalingFakta.behandlingFakta.behandlingsresultat.resultat}
                        </Normaltekst>
                    )}
                </Column>
                <Column xs="6">
                    <UndertekstBold>Konsekvens</UndertekstBold>
                    {feilutbetalingFakta.behandlingFakta.behandlingsresultat && (
                        <Normaltekst>
                            {feilutbetalingFakta.behandlingFakta.behandlingsresultat.konsekvenserForYtelsen?.join(
                                ', '
                            )}
                        </Normaltekst>
                    )}
                </Column>
            </RadMedMargin>
            <Row>
                <Column xs="6">
                    <UndertekstBold>Tilbakekrevingsvalg</UndertekstBold>
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
