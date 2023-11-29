import * as React from 'react';

import { styled } from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyShort, Heading } from '@navikt/ds-react';
import { ASpacing4 } from '@navikt/ds-tokens/dist/tokens';

import { IFeilutbetalingFakta, tilbakekrevingsvalg } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring } from '../../../utils';
import { DetailBold, Spacer20 } from '../../Felleskomponenter/Flytelementer';

export const RadMedMargin = styled(Row)`
    margin-bottom: ${ASpacing4};
`;

interface IProps {
    feilutbetalingFakta: IFeilutbetalingFakta;
}

const FaktaRevurdering: React.FC<IProps> = ({ feilutbetalingFakta }) => {
    return feilutbetalingFakta ? (
        <>
            <Row>
                <Column xs="12">
                    <Heading level="2" size="small">
                        Revurdering
                    </Heading>
                </Column>
            </Row>
            <Spacer20 />
            <RadMedMargin>
                <Column xs="6">
                    <DetailBold size="small">Årsak(er) til revurdering</DetailBold>
                    {feilutbetalingFakta.faktainfo?.revurderingsårsak && (
                        <BodyShort size="small">
                            {feilutbetalingFakta.faktainfo.revurderingsårsak}
                        </BodyShort>
                    )}
                </Column>
                <Column xs="6">
                    <DetailBold size="small">Dato for revurderingsvedtak</DetailBold>
                    <BodyShort size="small">
                        {formatterDatostring(feilutbetalingFakta.revurderingsvedtaksdato)}
                    </BodyShort>
                </Column>
            </RadMedMargin>
            <RadMedMargin>
                <Column xs="6">
                    <DetailBold size="small">Resultat</DetailBold>
                    {feilutbetalingFakta.faktainfo?.revurderingsresultat && (
                        <BodyShort size="small">
                            {feilutbetalingFakta.faktainfo.revurderingsresultat}
                        </BodyShort>
                    )}
                </Column>
                <Column xs="6">
                    <DetailBold size="small">Konsekvens</DetailBold>
                    {feilutbetalingFakta.faktainfo?.konsekvensForYtelser && (
                        <BodyShort size="small">
                            {feilutbetalingFakta.faktainfo.konsekvensForYtelser?.join(', ')}
                        </BodyShort>
                    )}
                </Column>
            </RadMedMargin>
            <Row>
                <Column xs="6">
                    <DetailBold size="small">Tilbakekrevingsvalg</DetailBold>
                    {feilutbetalingFakta.faktainfo?.tilbakekrevingsvalg && (
                        <BodyShort size="small">
                            {tilbakekrevingsvalg[feilutbetalingFakta.faktainfo.tilbakekrevingsvalg]}
                        </BodyShort>
                    )}
                </Column>
            </Row>
        </>
    ) : null;
};

export default FaktaRevurdering;
