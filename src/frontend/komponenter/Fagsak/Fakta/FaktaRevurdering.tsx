import * as React from 'react';

import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { IFeilutbetalingFakta, tilbakekrevingsvalg } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring } from '../../../utils';
import { RadMedMargin } from './FaktaContainer';

interface IProps {
    feilutbetalingFakta: IFeilutbetalingFakta;
}

const FaktaRevurdering: React.FC<IProps> = ({ feilutbetalingFakta }) => {
    return feilutbetalingFakta ? (
        <>
            <RadMedMargin>
                <Column xs="12">
                    <Undertittel>Revurdering</Undertittel>
                </Column>
            </RadMedMargin>
            <RadMedMargin>
                <Column xs="6">
                    <UndertekstBold>Årsak(er) til revurdering</UndertekstBold>
                    {feilutbetalingFakta.faktainfo?.revurderingsårsak && (
                        <Normaltekst>{feilutbetalingFakta.faktainfo.revurderingsårsak}</Normaltekst>
                    )}
                </Column>
                <Column xs="6">
                    <UndertekstBold>Dato for revurderingsvedtak</UndertekstBold>
                    <Normaltekst>
                        {formatterDatostring(feilutbetalingFakta.revurderingsvedtaksdato)}
                    </Normaltekst>
                </Column>
            </RadMedMargin>
            <RadMedMargin>
                <Column xs="6">
                    <UndertekstBold>Resultat</UndertekstBold>
                    {feilutbetalingFakta.faktainfo?.revurderingsresultat && (
                        <Normaltekst>
                            {feilutbetalingFakta.faktainfo.revurderingsresultat}
                        </Normaltekst>
                    )}
                </Column>
                <Column xs="6">
                    <UndertekstBold>Konsekvens</UndertekstBold>
                    {feilutbetalingFakta.faktainfo?.konsekvensForYtelser && (
                        <Normaltekst>
                            {feilutbetalingFakta.faktainfo.konsekvensForYtelser?.join(', ')}
                        </Normaltekst>
                    )}
                </Column>
            </RadMedMargin>
            <Row>
                <Column xs="6">
                    <UndertekstBold>Tilbakekrevingsvalg</UndertekstBold>
                    {feilutbetalingFakta.faktainfo?.tilbakekrevingsvalg && (
                        <Normaltekst>
                            {tilbakekrevingsvalg[feilutbetalingFakta.faktainfo.tilbakekrevingsvalg]}
                        </Normaltekst>
                    )}
                </Column>
            </Row>
        </>
    ) : null;
};

export default FaktaRevurdering;
