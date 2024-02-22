import * as React from 'react';

import { styled } from 'styled-components';

import { BodyShort, Heading, HGrid, VStack } from '@navikt/ds-react';
import { ASpacing4 } from '@navikt/ds-tokens/dist/tokens';

import { IFeilutbetalingFakta, tilbakekrevingsvalg } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring } from '../../../utils';
import { DetailBold, Spacer20 } from '../../Felleskomponenter/Flytelementer';

export const HGridMedMargin = styled(HGrid)`
    margin-bottom: ${ASpacing4};
`;

interface IProps {
    feilutbetalingFakta: IFeilutbetalingFakta;
}

const FaktaRevurdering: React.FC<IProps> = ({ feilutbetalingFakta }) => {
    return feilutbetalingFakta ? (
        <>
            <Heading level="2" size="small">
                Revurdering
            </Heading>
            <Spacer20 />
            <HGridMedMargin columns={2}>
                <VStack>
                    <DetailBold>Årsak(er) til revurdering</DetailBold>
                    {feilutbetalingFakta.faktainfo?.revurderingsårsak && (
                        <BodyShort size="small">
                            {feilutbetalingFakta.faktainfo.revurderingsårsak}
                        </BodyShort>
                    )}
                </VStack>
                <VStack>
                    <DetailBold>Dato for revurderingsvedtak</DetailBold>
                    <BodyShort size="small">
                        {formatterDatostring(feilutbetalingFakta.revurderingsvedtaksdato)}
                    </BodyShort>
                </VStack>
            </HGridMedMargin>
            <HGridMedMargin columns={2}>
                <VStack>
                    <DetailBold>Resultat</DetailBold>
                    {feilutbetalingFakta.faktainfo?.revurderingsresultat && (
                        <BodyShort size="small">
                            {feilutbetalingFakta.faktainfo.revurderingsresultat}
                        </BodyShort>
                    )}
                </VStack>
                <VStack>
                    <DetailBold>Konsekvens</DetailBold>
                    {feilutbetalingFakta.faktainfo?.konsekvensForYtelser && (
                        <BodyShort size="small">
                            {feilutbetalingFakta.faktainfo.konsekvensForYtelser?.join(', ')}
                        </BodyShort>
                    )}
                </VStack>
            </HGridMedMargin>
            <VStack>
                <DetailBold>Tilbakekrevingsvalg</DetailBold>
                {feilutbetalingFakta.faktainfo?.tilbakekrevingsvalg && (
                    <BodyShort size="small">
                        {tilbakekrevingsvalg[feilutbetalingFakta.faktainfo.tilbakekrevingsvalg]}
                    </BodyShort>
                )}
            </VStack>
        </>
    ) : null;
};

export default FaktaRevurdering;
