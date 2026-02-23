import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack, Tooltip } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { Behandlingsmeny } from '~/komponenter/meny/Meny';

type BaseProps = {
    stegtekst: string | undefined;
    forrigeAriaLabel: string | undefined;
    nesteAriaLabel: string;
    onForrige: (() => void) | undefined;
    dobbeltNøstet?: boolean;
    nesteTekst?: string;
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

const ActionBar: React.FC<ButtonProps | SubmitProps> = ({
    stegtekst = '',
    forrigeAriaLabel,
    nesteAriaLabel,
    onNeste,
    onForrige,
    formId,
    dobbeltNøstet = false,
    nesteTekst = 'Neste',
    isLoading = false,
    skjulNeste = false,
    disableNeste = false,
    type = 'button',
}) => {
    return (
        <nav
            /* Hacker plasseringen til pga at den ikke er på behandlingcontainer nivå men nede i stegcontainerene som styrer hvor startposisjon er */
            className={classNames(
                'flex flex-row fixed bottom-4 bg-ax-bg-default px-6 py-3 rounded-2xl border-ax-border-neutral-subtle border justify-between z-10 flex-nowrap ax-lg:w-[calc((100vw*2/3)-34px)] w-[calc(100vw-32px)] min-w-96',
                {
                    '-ml-6': !dobbeltNøstet,
                    '-ml-10': dobbeltNøstet,
                }
            )}
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
                                <span className="hidden ax-md:block">Forrige</span>
                            </Button>
                        </Tooltip>
                    )}
                    {!skjulNeste && (
                        <Tooltip content={nesteAriaLabel} aria-disabled={isLoading || disableNeste}>
                            <Button
                                icon={<ChevronRightIcon title="a11y-title" fontSize="1.5rem" />}
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
