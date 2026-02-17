import { BugIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Heading, Link, Page, VStack, List } from '@navikt/ds-react';
import * as React from 'react';

export const IkkeFunnet: React.FC = () => {
    return (
        <Page.Block width="xl" gutters className="h-screen">
            <Box paddingBlock="space-80 space-64" data-aksel-template="404-v2">
                <VStack gap="space-24" align="start">
                    <div>
                        <BodyShort textColor="subtle" size="small">
                            Statuskode 404
                        </BodyShort>
                        <Heading size="large" spacing>
                            Beklager, vi fant ikke siden
                        </Heading>
                        <BodyShort>
                            Denne siden kan være slettet eller flyttet, eller det er en feil i
                            lenken.
                        </BodyShort>
                    </div>
                    <VStack gap="space-8">
                        <BodyShort className="font-semibold">Hva kan du gjøre?</BodyShort>
                        <List>
                            <List.Item>Prøve en annen lenke</List.Item>
                            <List.Item>
                                <Link href="/">Gå til forsiden</Link>
                            </List.Item>
                        </List>
                    </VStack>
                    <Link
                        href="https://jira.adeo.no/plugins/servlet/desk/portal/541/create/6054"
                        target="_blank"
                        className="mt-2"
                    >
                        <BugIcon aria-hidden />
                        Meld gjerne fra om at lenken ikke virker
                    </Link>
                </VStack>
            </Box>
        </Page.Block>
    );
};
