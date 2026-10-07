import type { FC } from 'react';
import type { SchemaEnum2 as Fagsystem } from '@/generated';

import { BodyShort, Heading, Page, VStack } from '@navikt/ds-react';

type Props = {
    fagsystem: Fagsystem;
    fagsakId: string;
    tittel: string;
    melding: string;
};

export const KravgrunnlagErSperretEllerBortfalt: FC<Props> = ({
    fagsystem,
    fagsakId,
    tittel,
    melding,
}: Props) => (
    <Page.Block width="2xl" gutters className="h-screen pt-20 md:px-40 px-10">
        <VStack gap="space-16">
            <div>
                <Heading size="large">{tittel}</Heading>
            </div>
            <BodyShort className="max-w-xl">{melding}</BodyShort>
            <VStack gap="space-4">
                <BodyShort size="small">Fagsystem: {fagsystem}</BodyShort>
                <BodyShort size="small">Fagsak: {fagsakId}</BodyShort>
            </VStack>
        </VStack>
    </Page.Block>
);
