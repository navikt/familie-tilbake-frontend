import type { FC } from 'react';
import type { ActionBarVariant } from './useActionBarVariant';

import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import { Button, HStack, Skeleton } from '@navikt/ds-react';
import { Fragment } from 'react';

export type ActionBarSkeletonVariant = ActionBarVariant | 'ukjent';

type Props = {
    variant?: ActionBarSkeletonVariant;
};

const ANTALL_STEG = 5;

const StegflytSkeleton: FC = () => (
    <HStack gap="space-8" align="center" wrap={false}>
        {Array.from({ length: ANTALL_STEG }).map((_, indeks) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: statisk plassholder uten identitet
            <Fragment key={indeks}>
                {indeks > 0 && (
                    <span aria-hidden className="h-px w-1 bg-ax-border-neutral-subtle" />
                )}
                <Skeleton variant="circle" width={25} height={25} />
            </Fragment>
        ))}
    </HStack>
);

export const ActionBarSkeleton: FC<Props> = ({ variant = 'ukjent' }: Props) => {
    const visMeny = variant === 'meny';
    const visStegflyt = variant === 'stegflyt';
    const visStegtekst = visMeny || variant === 'stegtekst';

    return (
        <div
            className={`flex flex-row bg-ax-bg-default px-6 py-3 rounded-2xl border-ax-border-brand-blue-subtle border flex-nowrap min-w-80 gap-4 ${
                visMeny || visStegflyt ? 'justify-between' : 'justify-end'
            }`}
        >
            {visMeny && (
                <Button
                    variant="tertiary"
                    size="small"
                    icon={<MenuElipsisHorizontalIcon fontSize="1.5rem" aria-hidden />}
                >
                    Meny
                </Button>
            )}
            {visStegflyt && <StegflytSkeleton />}

            <HStack gap="space-32" align="center" wrap={false}>
                {visStegtekst && <Skeleton width={80} variant="rounded" />}
                <HStack gap="space-16" className="flex-nowrap">
                    <Skeleton width={100} height={40} variant="rounded" />
                    <Skeleton width={100} height={40} variant="rounded" />
                </HStack>
            </HStack>
        </div>
    );
};
