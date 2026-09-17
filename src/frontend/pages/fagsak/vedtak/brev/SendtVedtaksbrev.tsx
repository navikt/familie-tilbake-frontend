import type { FC } from 'react';

import { BodyShort, InlineMessage, Link, Skeleton, VStack } from '@navikt/ds-react';

type Props = {
    sendtBrevUrl: string | null;
    feilmelding: string | undefined;
    erFeil: boolean;
};

export const SendtVedtaksbrev: FC<Props> = ({ sendtBrevUrl, feilmelding, erFeil }: Props) => (
    <section className="sticky top-0 w-full border rounded-xl border-ax-border-brand-blue-subtle h-[calc(100vh-17.8rem)] overflow-hidden">
        {erFeil ? (
            <div className="h-full flex justify-center items-center p-4">
                <InlineMessage size="small" status="error">
                    <VStack gap="space-8">
                        <BodyShort size="small" weight="semibold">
                            Kunne ikke hente det sendte vedtaksbrevet
                        </BodyShort>
                        {feilmelding && <BodyShort size="small">{feilmelding}</BodyShort>}
                    </VStack>
                </InlineMessage>
            </div>
        ) : sendtBrevUrl ? (
            <object
                className="h-full w-full rounded-xl"
                data={sendtBrevUrl}
                type="application/pdf"
                aria-label="Sendt vedtaksbrev"
            >
                <VStack
                    gap="space-16"
                    padding="space-16"
                    align="center"
                    justify="center"
                    className="h-full"
                >
                    <BodyShort>Kunne ikke vise vedtaksbrevet her.</BodyShort>
                    <Link href={sendtBrevUrl} target="_blank" rel="noopener noreferrer">
                        Åpne vedtaksbrevet i ny fane
                    </Link>
                </VStack>
            </object>
        ) : (
            <Skeleton variant="rounded" className="h-full w-full" />
        )}
    </section>
);
