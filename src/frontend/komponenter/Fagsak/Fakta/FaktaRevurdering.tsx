import * as React from 'react';

import { BodyShort, Detail, Heading, HGrid, VStack } from '@navikt/ds-react';

import { IFeilutbetalingFakta, tilbakekrevingsvalg } from '../../../typer/feilutbetalingtyper';
import { formatterDatostring } from '../../../utils';

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
                        <Detail weight="semibold">Årsak(er) til revurdering</Detail>
                        {feilutbetalingFakta.faktainfo?.revurderingsårsak && (
                            <BodyShort size="small">
                                {feilutbetalingFakta.faktainfo.revurderingsårsak}
                            </BodyShort>
                        )}
                    </div>
                    <div>
                        <Detail weight="semibold">Dato for revurderingsvedtak</Detail>
                        <BodyShort size="small">
                            {formatterDatostring(feilutbetalingFakta.revurderingsvedtaksdato)}
                        </BodyShort>
                    </div>
                </HGrid>
                <HGrid columns={2}>
                    <div>
                        <Detail weight="semibold">Resultat</Detail>
                        {feilutbetalingFakta.faktainfo?.revurderingsresultat && (
                            <BodyShort size="small">
                                {feilutbetalingFakta.faktainfo.revurderingsresultat}
                            </BodyShort>
                        )}
                    </div>
                    <div>
                        <Detail weight="semibold">Konsekvens</Detail>
                        {feilutbetalingFakta.faktainfo?.konsekvensForYtelser && (
                            <BodyShort size="small">
                                {feilutbetalingFakta.faktainfo.konsekvensForYtelser?.join(', ')}
                            </BodyShort>
                        )}
                    </div>
                </HGrid>
                <div>
                    <Detail weight="semibold">Tilbakekrevingsvalg</Detail>
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
