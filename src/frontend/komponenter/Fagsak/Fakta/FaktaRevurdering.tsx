import * as React from 'react';

import { BodyShort, Heading, HGrid, VStack } from '@navikt/ds-react';

import { IFeilutbetalingFakta, tilbakekrevingsvalg } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring } from '../../../utils';
import { DetailBold } from '../../Felleskomponenter/Flytelementer';

interface IProps {
    feilutbetalingFakta: IFeilutbetalingFakta;
}

const FaktaRevurdering: React.FC<IProps> = ({ feilutbetalingFakta }) => {
    return feilutbetalingFakta ? (
        <VStack gap="5">
            <Heading level="2" size="small">
                Revurdering
            </Heading>
            <VStack gap="4">
                <HGrid columns={2}>
                    <div>
                        <DetailBold>Årsak(er) til revurdering</DetailBold>
                        {feilutbetalingFakta.faktainfo?.revurderingsårsak && (
                            <BodyShort size="small">
                                {feilutbetalingFakta.faktainfo.revurderingsårsak}
                            </BodyShort>
                        )}
                    </div>
                    <div>
                        <DetailBold>Dato for revurderingsvedtak</DetailBold>
                        <BodyShort size="small">
                            {formatterDatostring(feilutbetalingFakta.revurderingsvedtaksdato)}
                        </BodyShort>
                    </div>
                </HGrid>
                <HGrid columns={2}>
                    <div>
                        <DetailBold>Resultat</DetailBold>
                        {feilutbetalingFakta.faktainfo?.revurderingsresultat && (
                            <BodyShort size="small">
                                {feilutbetalingFakta.faktainfo.revurderingsresultat}
                            </BodyShort>
                        )}
                    </div>
                    <div>
                        <DetailBold>Konsekvens</DetailBold>
                        {feilutbetalingFakta.faktainfo?.konsekvensForYtelser && (
                            <BodyShort size="small">
                                {feilutbetalingFakta.faktainfo.konsekvensForYtelser?.join(', ')}
                            </BodyShort>
                        )}
                    </div>
                </HGrid>
                <div>
                    <DetailBold>Tilbakekrevingsvalg</DetailBold>
                    {feilutbetalingFakta.faktainfo?.tilbakekrevingsvalg && (
                        <BodyShort size="small">
                            {tilbakekrevingsvalg[feilutbetalingFakta.faktainfo.tilbakekrevingsvalg]}
                        </BodyShort>
                    )}
                </div>
            </VStack>
        </VStack>
    ) : null;
};

export default FaktaRevurdering;
