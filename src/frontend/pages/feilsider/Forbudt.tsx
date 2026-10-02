import type { FC } from 'react';

import { BodyShort, Heading, Link, List, Page, VStack } from '@navikt/ds-react';

type Props = {
    feilmelding?: string;
};

export const Forbudt: FC<Props> = ({ feilmelding }: Props) => {
    return (
        <Page.Block width="2xl" gutters className="h-screen pt-20 md:px-40 px-10">
            <VStack gap="space-16">
                <div>
                    <BodyShort textColor="subtle" size="small">
                        403 Forbidden
                    </BodyShort>
                    <Heading size="large">Ingen tilgang til behandlingen</Heading>
                </div>
                {feilmelding && <BodyShort className="max-w-xl">{feilmelding}</BodyShort>}

                <VStack gap="space-8">
                    <BodyShort className="font-semibold">Hva kan du gjøre?</BodyShort>
                    <List size="small">
                        <List.Item>Be nærmeste leder om riktig tilgang</List.Item>
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
            </VStack>
        </Page.Block>
    );
};
