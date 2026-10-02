import type { FC } from 'react';

import { BodyShort, Button, Heading, Link, List, Page, VStack } from '@navikt/ds-react';

export const InternServerFeil: FC = () => {
    return (
        <Page.Block width="2xl" gutters className="h-screen pt-20 md:px-40 px-10">
            <VStack gap="space-16">
                <div>
                    <BodyShort textColor="subtle" size="small">
                        500 Internal Server Error
                    </BodyShort>
                    <Heading size="large">Oi, dette fungerte visst ikke</Heading>
                </div>
                <BodyShort className="max-w-xl">
                    Dette er ikke din skyld, det er en feil vi ikke håndterer. Den kan være
                    midlertidig, men meld gjerne fra hva som gikk galt.
                </BodyShort>

                <VStack gap="space-8">
                    <BodyShort className="font-semibold">Hva kan du gjøre?</BodyShort>
                    <List size="small">
                        <List.Item>Last siden på nytt</List.Item>
                        <List.Item>Vent et par minutter og prøv en gang til</List.Item>
                        <List.Item>
                            <Link
                                href="https://jira.adeo.no/plugins/servlet/desk/portal/541/create/6054"
                                target="_blank"
                            >
                                Meld feilen i porten
                            </Link>
                        </List.Item>
                    </List>
                </VStack>
                <Button className="w-fit" onClick={(): void => location.reload()}>
                    Last siden på nytt
                </Button>
            </VStack>
        </Page.Block>
    );
};
