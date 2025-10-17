import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack, Tooltip } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { Behandlingsmeny } from '../Behandlingsmeny/Behandlingsmeny';

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
        <HStack
            /* Hacker plasseringen til pga at den ikke er på behandlingcontainer nivå men nede i stegcontainerene som styrer hvor startposisjon er */
            className={classNames(
                'fixed bottom-4 bg-white px-8 py-4 rounded-2xl border-border-divider border-1 justify-between z-10 flex-nowrap lg:w-[calc((100vw*2/3)-34px)] w-[calc(100vw-32px)]',
                {
                    '-ml-6': !dobbeltNøstet,
                    '-ml-10': dobbeltNøstet,
                }
            )}
            aria-label="Behandling handlingsknapper"
        >
            <Behandlingsmeny />

            <HStack gap="8">
                <BodyShort size="large" className="text-text-subtle flex items-center text-nowrap">
                    {stegtekst}
                </BodyShort>
                <HStack gap="4" className="flex-nowrap">
                    {forrigeAriaLabel && onForrige && (
                        <Tooltip content={forrigeAriaLabel}>
                            <Button
                                variant="secondary"
                                icon={<ChevronLeftIcon />}
                                className="flex gap-0 lg:gap-2 text-nowrap py-2"
                                size="small"
                                onClick={() => {
                                    if (!isLoading) onForrige();
                                }}
                                aria-label={forrigeAriaLabel}
                            >
                                <span className="hidden md:block">Forrige</span>
                            </Button>
                        </Tooltip>
                    )}
                    {!skjulNeste && (
                        <Tooltip content={nesteAriaLabel} aria-disabled={disableNeste}>
                            <Button
                                icon={<ChevronRightIcon title="a11y-title" fontSize="1.5rem" />}
                                iconPosition="right"
                                className="flex gap-0 lg:gap-2 text-nowrap py-2"
                                size="small"
                                onClick={() => {
                                    if (!isLoading) onNeste();
                                }}
                                aria-label={nesteAriaLabel}
                                disabled={disableNeste}
                            >
                                <span className="hidden md:block">{nesteTekst}</span>
                            </Button>
                        </Tooltip>
                    )}
                </HStack>
            </HStack>
        </HStack>
    );
};

export { ActionBar };
