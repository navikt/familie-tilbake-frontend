import type { FC } from 'react';
import type { ActionBarConfig } from '@/stores/actionBarStore';

import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack, Tooltip } from '@navikt/ds-react';

import { Behandlingsmeny } from '@/komponenter/meny/Meny';

export const ActionBar: FC<ActionBarConfig> = ({
    stegtekst = '',
    forrigeAriaLabel,
    nesteAriaLabel,
    onNeste,
    onForrige,
    formId,
    nesteTekst = 'Neste',
    forrigeTekst = 'Forrige',
    isLoading = false,
    skjulNeste = false,
    disableNeste = false,
    type = 'button',
}: ActionBarConfig) => {
    return (
        <nav
            className="flex bg-ax-bg-default px-6 py-3 rounded-2xl border-ax-border-neutral-subtle border justify-between min-w-96"
            aria-label="Meny og behandlingens steg"
        >
            <Behandlingsmeny />

            <HStack gap="space-32">
                <BodyShort
                    size="small"
                    className="text-ax-text-neutral-subtle font-ax-bold flex items-center"
                >
                    {stegtekst}
                </BodyShort>
                <HStack gap="space-16">
                    {forrigeAriaLabel && onForrige && (
                        <Tooltip content={forrigeAriaLabel} aria-disabled={isLoading}>
                            <Button
                                variant="secondary"
                                icon={<ChevronLeftIcon aria-hidden />}
                                className="flex gap-0 ax-lg:gap-2 py-2"
                                size="small"
                                loading={isLoading}
                                disabled={isLoading}
                                onClick={onForrige}
                                aria-label={forrigeAriaLabel}
                            >
                                <span className="hidden ax-md:block">{forrigeTekst}</span>
                            </Button>
                        </Tooltip>
                    )}
                    {!skjulNeste && (
                        <Tooltip
                            content={nesteAriaLabel ?? nesteTekst}
                            aria-disabled={isLoading || disableNeste}
                        >
                            <Button
                                icon={<ChevronRightIcon aria-hidden />}
                                iconPosition="right"
                                className="flex gap-0 ax-lg:gap-2 py-2"
                                type={type}
                                size="small"
                                form={formId}
                                loading={isLoading}
                                onClick={(): void => {
                                    if (onNeste && type !== 'submit') onNeste();
                                }}
                                aria-label={nesteAriaLabel}
                                disabled={isLoading || disableNeste}
                            >
                                <span className="hidden ax-md:block">{nesteTekst}</span>
                            </Button>
                        </Tooltip>
                    )}
                </HStack>
            </HStack>
        </nav>
    );
};
