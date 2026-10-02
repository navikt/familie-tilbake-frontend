import type { FC } from 'react';

import { BodyShort, Heading, List, Page, VStack } from '@navikt/ds-react';

export const IkkeFunnet: FC = () => {
    return (
        <Page.Block width="2xl" gutters className="h-screen pt-20 md:px-40 px-10">
            <VStack gap="space-16">
                <div>
                    <BodyShort textColor="subtle" size="small">
                        404 Not Found
                    </BodyShort>
                    <Heading size="large">Beklager, vi fant ikke siden</Heading>
                </div>
                <BodyShort className="max-w-xl">
                    Denne siden kan være slettet eller flyttet, eller det er en feil i lenken.
                </BodyShort>

                <VStack gap="space-8">
                    <BodyShort className="font-semibold">Hva kan du gjøre?</BodyShort>
                    <List size="small">
                        <List.Item>Prøve en annen lenke</List.Item>
                    </List>
                </VStack>
            </VStack>
        </Page.Block>
    );
};
