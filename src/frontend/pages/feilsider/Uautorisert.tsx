import type { FC } from 'react';

import { BodyShort, Button, Heading, Page, VStack } from '@navikt/ds-react';

export const Uautorisert: FC = () => {
    return (
        <Page.Block width="2xl" gutters className="h-screen pt-20 md:px-40 px-10">
            <VStack gap="space-16">
                <div>
                    <BodyShort textColor="subtle" size="small">
                        401 Unauthorized
                    </BodyShort>
                    <Heading size="large">Sesjonen din har utløpt</Heading>
                </div>
                <BodyShort className="max-w-xl">
                    Du er ikke lenger innlogget. Last siden på nytt for å logge inn igjen.
                </BodyShort>

                <Button className="w-fit" onClick={(): void => location.reload()}>
                    Last siden på nytt
                </Button>
            </VStack>
        </Page.Block>
    );
};
