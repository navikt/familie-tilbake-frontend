import type { FC } from 'react';
import type { SchemaEnum2 as Fagsystem } from '@/generated';

import { BodyShort, Heading, Page, VStack } from '@navikt/ds-react';

type Props = {
    fagsystem: Fagsystem;
    fagsakId: string;
};

export const KravgrunnlagetErEndret: FC<Props> = ({ fagsystem, fagsakId }: Props) => (
    <Page.Block width="2xl" gutters className="h-screen pt-20 md:px-40 px-10">
        <VStack gap="space-16">
            <div>
                <Heading size="large">Kravgrunnlaget er endret</Heading>
            </div>
            <BodyShort className="max-w-xl">
                Tilbakekreving kan ikke behandles videre fordi det har kommet endringer i
                feilutbetalingen/perioden fra fagsystemet eller økonomisystemet. Tilbakekrevingen
                har ikke støtte for å håndtere slike endringer enda, men vi jobber med å få dette på
                plass.
            </BodyShort>
            <VStack gap="space-4">
                <BodyShort size="small">Fagsystem: {fagsystem}</BodyShort>
                <BodyShort size="small">Fagsak: {fagsakId}</BodyShort>
            </VStack>
        </VStack>
    </Page.Block>
);
