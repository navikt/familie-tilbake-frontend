import type { FC } from 'react';

import { Textarea, VStack } from '@navikt/ds-react';

export const Ingenting: FC = () => {
    return (
        <>
            <Textarea
                label="Begrunn hvorfor ingenting av beløpet er i behold"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <VStack
                gap="space-4"
                className="border border-ax-border-info-subtle rounded-xl bg-ax-bg-info-soft p-4"
            >
                <span className="font-semibold text-ax-text-neutral-subtle">
                    Beløp som skal tilbakekreves
                </span>
                <span className="font-semibold text-xl">0 kroner</span>
            </VStack>
        </>
    );
};
