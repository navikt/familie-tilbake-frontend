import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack, Tooltip } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { Behandlingsmeny } from '../meny/Meny';

type Props = {
    stegtekst: string | undefined;
    forrigeAriaLabel: string | undefined;
    nesteAriaLabel: string;
    onNeste: () => void;
    onForrige: (() => void) | undefined;
    dobbeltNøstet?: boolean;
    nesteTekst?: string;
    isLoading?: boolean;
    skjulNeste?: boolean;
    disableNeste?: boolean;
};

const ActionBar: React.FC<Props> = ({
    stegtekst = '',
    forrigeAriaLabel,
    nesteAriaLabel,
    onNeste,
    onForrige,
    dobbeltNøstet = false,
    nesteTekst = 'Neste',
    isLoading = false,
    skjulNeste = false,
    disableNeste = false,
}) => {
    return (
        <nav
            /* Hacker plasseringen til pga at den ikke er på behandlingcontainer nivå men nede i stegcontainerene som styrer hvor startposisjon er */
            className={classNames(
                'flex flex-row fixed bottom-4 bg-ax-bg-default px-8 py-4 rounded-2xl border-ax-border-neutral-subtle border justify-between z-10 flex-nowrap ax-lg:w-[calc((100vw*2/3)-34px)] w-[calc(100vw-32px)] min-w-96',
                {
                    '-ml-6': !dobbeltNøstet,
                    '-ml-10': dobbeltNøstet,
                }
            )}
            aria-label="Meny og behandlingens steg"
        >
            <Behandlingsmeny />

            <HStack gap="8">
                <BodyShort
                    size="large"
                    className="text-ax-text-neutral-subtle flex items-center text-nowrap"
                >
                    {stegtekst}
                </BodyShort>
                <HStack gap="4" className="flex-nowrap">
                    {forrigeAriaLabel && onForrige && (
                        <Tooltip content={forrigeAriaLabel}>
                            <Button
                                variant="secondary"
                                icon={<ChevronLeftIcon />}
                                className="flex gap-0 ax-lg:gap-2 text-nowrap py-2"
                                size="small"
                                onClick={() => {
                                    if (!isLoading) onForrige();
                                }}
                                aria-label={forrigeAriaLabel}
                            >
                                <span className="hidden ax-md:block">Forrige</span>
                            </Button>
                        </Tooltip>
                    )}
                    {!skjulNeste && (
                        <Tooltip content={nesteAriaLabel} aria-disabled={disableNeste}>
                            <Button
                                icon={<ChevronRightIcon title="a11y-title" fontSize="1.5rem" />}
                                iconPosition="right"
                                className="flex gap-0 ax-lg:gap-2 text-nowrap py-2"
                                size="small"
                                onClick={() => {
                                    if (!isLoading) onNeste();
                                }}
                                aria-label={nesteAriaLabel}
                                disabled={disableNeste}
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
