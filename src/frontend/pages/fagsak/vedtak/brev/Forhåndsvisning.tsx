import type { FC } from 'react';

import { Button, HStack, InlineMessage, Pagination, Skeleton, VStack } from '@navikt/ds-react';
import { Suspense } from 'react';

type Props = {
    pdfSider: string[];
    gjeldendeSide: number;
    onSideEndring: (side: number) => void;
    erFeil: boolean;
    onLastInnPåNytt: () => void;
};

export const Forhåndsvisning: FC<Props> = ({
    pdfSider,
    gjeldendeSide,
    onSideEndring,
    erFeil,
    onLastInnPåNytt,
}: Props) => (
    <Suspense fallback={<ForhåndsvisningSkjelett />}>
        <section
            className={
                /* Må trekke fra høyden på alt annet enn den hvite boksen for å gi den en korrekt høyde */
                `col-span-1 sticky top-0 self-start border rounded-xl border-ax-border-brand-blue-subtle flex flex-col ${erFeil ? 'h-[calc(100vh-17.8rem)] overflow-hidden' : ''}`
            }
        >
            {pdfSider.length > 0 && !erFeil && (
                <HStack
                    justify="center"
                    align="center"
                    className="p-2 border-t border-ax-border-brand-blue-subtle gap-4 rounded-xl"
                >
                    <Pagination
                        page={gjeldendeSide}
                        count={pdfSider.length}
                        size="small"
                        onPageChange={onSideEndring}
                    />
                </HStack>
            )}
            <div
                className={`flex-1 flex justify-center overflow-auto rounded-b-xl ${erFeil ? 'items-center' : 'items-start'} ${
                    !erFeil ? 'border-t border-ax-border-brand-blue-subtle' : ''
                }`}
            >
                {erFeil && (
                    <VStack
                        gap="space-16"
                        padding="space-16"
                        className="flex justify-center items-center h-full"
                    >
                        <InlineMessage size="small" status="error">
                            Kunne ikke laste inn forhåndsvisningen av vedtaksbrevet. Dette kan være
                            et midlertidig problem. Prøv å laste siden på nytt, eller prøv igjen om
                            litt.
                        </InlineMessage>

                        <Button variant="secondary" size="small" onClick={onLastInnPåNytt}>
                            Last inn på nytt
                        </Button>
                    </VStack>
                )}
                {pdfSider.length > 0 && !erFeil && (
                    <img
                        className="max-w-full max-h-full object-contain"
                        alt={`Forhåndsvisning av vedtaksbrev, side ${gjeldendeSide}`}
                        src={pdfSider[gjeldendeSide - 1]}
                    />
                )}
            </div>
        </section>
    </Suspense>
);

const ForhåndsvisningSkjelett: FC = () => (
    <Skeleton variant="rounded" className="aspect-[1/1.414] w-full max-w-md" height={600} />
);
