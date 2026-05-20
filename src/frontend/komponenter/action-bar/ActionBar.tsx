import type { FC } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack, Tooltip } from '@navikt/ds-react';

import { Behandlingsmeny } from '~/komponenter/meny/Meny';

type BaseProps = {
    stegtekst: string | undefined;
    forrigeAriaLabel: string | undefined;
    nesteAriaLabel: string;
    onForrige: (() => void) | undefined;
    nesteTekst?: string;
    forrigeTekst?: string;
    isLoading?: boolean;
    skjulNeste?: boolean;
    disableNeste?: boolean;
};

type ButtonProps = BaseProps & {
    type?: 'button';
    formId?: never;
    onNeste: () => void;
};

type SubmitProps = BaseProps & {
    type: 'submit';
    formId: string;
    onNeste?: never;
};

const ActionBar: FC<ButtonProps | SubmitProps> = ({
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
}) => {
    return (
        <nav
            className="flex flex-row bg-ax-bg-default px-6 py-3 rounded-2xl border-ax-border-neutral-subtle border justify-between flex-nowrap min-w-96"
            aria-label="Meny og behandlingens steg"
        >
            <Behandlingsmeny />

            <HStack gap="space-32">
                <BodyShort
                    size="small"
                    className="text-ax-text-neutral-subtle font-ax-bold flex items-center text-nowrap"
                >
                    {stegtekst}
                </BodyShort>
                <HStack gap="space-16" className="flex-nowrap">
                    {forrigeAriaLabel && onForrige && (
                        <Tooltip content={forrigeAriaLabel} aria-disabled={isLoading}>
                            <Button
                                variant="secondary"
                                icon={<ChevronLeftIcon />}
                                className="flex gap-0 ax-lg:gap-2 text-nowrap py-2"
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
                        <Tooltip content={nesteAriaLabel} aria-disabled={isLoading || disableNeste}>
                            <Button
                                icon={<ChevronRightIcon aria-hidden fontSize="1.5rem" />}
                                iconPosition="right"
                                className="flex gap-0 ax-lg:gap-2 text-nowrap py-2"
                                type={type}
                                size="small"
                                form={formId}
                                loading={isLoading}
                                onClick={() => {
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

export { ActionBar };
