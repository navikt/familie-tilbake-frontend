import type { FaktaResponse } from '../../../typer/tilbakekrevingstyper';

import { BodyShort, Detail, Heading, HGrid, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { tilbakekrevingsvalg } from '../../../typer/tilbakekrevingstyper';
import { formatterDatostring } from '../../../utils';

type Props = {
    fakta: FaktaResponse;
};

export const FaktaRevurdering: React.FC<Props> = ({ fakta }) => {
    return fakta ? (
        <VStack gap="space-20">
            <Heading level="2" size="small">
                Revurdering
            </Heading>
            <VStack gap="space-16">
                <HGrid columns={2}>
                    <div>
                        <Detail weight="semibold">Årsak(er) til revurdering</Detail>
                        {fakta.faktainfo?.revurderingsårsak && (
                            <BodyShort size="small">{fakta.faktainfo.revurderingsårsak}</BodyShort>
                        )}
                    </div>
                    <div>
                        <Detail weight="semibold">Dato for revurderingsvedtak</Detail>
                        <BodyShort size="small">
                            {formatterDatostring(fakta.revurderingsvedtaksdato)}
                        </BodyShort>
                    </div>
                </HGrid>
                <HGrid columns={2}>
                    <div>
                        <Detail weight="semibold">Resultat</Detail>
                        {fakta.faktainfo?.revurderingsresultat && (
                            <BodyShort size="small">
                                {fakta.faktainfo.revurderingsresultat}
                            </BodyShort>
                        )}
                    </div>
                    <div>
                        <Detail weight="semibold">Konsekvens</Detail>
                        {fakta.faktainfo?.konsekvensForYtelser && (
                            <BodyShort size="small">
                                {fakta.faktainfo.konsekvensForYtelser?.join(', ')}
                            </BodyShort>
                        )}
                    </div>
                </HGrid>
                <div>
                    <Detail weight="semibold">Tilbakekrevingsvalg</Detail>
                    {fakta.faktainfo?.tilbakekrevingsvalg && (
                        <BodyShort size="small">
                            {tilbakekrevingsvalg[fakta.faktainfo.tilbakekrevingsvalg]}
                        </BodyShort>
                    )}
                </div>
            </VStack>
        </VStack>
    ) : null;
};
