import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack, Tooltip } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

type Props = {
    stegtekst: string | undefined;
    forrigeTekst: string | undefined;
    nesteTekst: string;
    forrigeAriaLabel: string | undefined;
    nesteAriaLabel: string;
    åpenHøyremeny: boolean;
    onNeste: () => void;
    onForrige: (() => void) | undefined;
};

const ActionBar: React.FC<Props> = ({
    stegtekst = '',
    nesteTekst,
    forrigeTekst,
    forrigeAriaLabel,
    nesteAriaLabel,
    åpenHøyremeny,
    onNeste,
    onForrige,
}) => {
    return (
        <>
            {/* For å unngå synlig innhold ved scrolling i mellomrommet under actionbaren */}
            <div
                className={classNames('fixed bottom-0 bg-gray-50 h-5 left-4 right-8', {
                    'right-96': åpenHøyremeny,
                })}
            />
            <HStack
                className={classNames(
                    'fixed bottom-2 left-4 bg-white right-8 px-4 sm:px-6 md:px-8 py-4 rounded-2xl border-border-divider border-1 justify-end z-10 gap-0 sm:gap-8 flex-nowrap overflow-auto',
                    { 'right-96': åpenHøyremeny }
                )}
                aria-label="Behandling handlingsknapper"
            >
                <BodyShort size="large" className="text-text-subtle flex items-center text-nowrap">
                    {stegtekst}
                </BodyShort>
                <HStack gap="4" className="flex-nowrap">
                    {forrigeTekst && forrigeAriaLabel && onForrige && (
                        <Tooltip content={forrigeAriaLabel}>
                            <Button
                                variant="secondary"
                                icon={<ChevronLeftIcon />}
                                className="hidden sm:flex gap-0 lg:gap-2 text-nowrap py-2"
                                size="small"
                                onClick={onForrige}
                                aria-label={forrigeAriaLabel}
                            >
                                <span className="hidden lg:block">{forrigeTekst}</span>
                            </Button>
                        </Tooltip>
                    )}
                    <Tooltip content={nesteAriaLabel}>
                        <Button
                            icon={<ChevronRightIcon title="a11y-title" fontSize="1.5rem" />}
                            iconPosition="right"
                            className="hidden sm:flex gap-0 lg:gap-2 text-nowrap py-2"
                            size="small"
                            onClick={onNeste}
                            aria-label={nesteAriaLabel}
                        >
                            <span className="hidden lg:block">{nesteTekst}</span>
                        </Button>
                    </Tooltip>
                </HStack>
            </HStack>
        </>
    );
};

export { ActionBar };
