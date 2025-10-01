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
    harVærtPåFatteVedtakSteg: boolean;
    onNeste: () => void;
    onForrige: (() => void) | undefined;
    isLoading?: boolean;
    skjulNeste?: boolean;
    disableNeste?: boolean;
};

const ActionBar: React.FC<Props> = ({
    stegtekst = '',
    nesteTekst,
    forrigeTekst,
    forrigeAriaLabel,
    nesteAriaLabel,
    åpenHøyremeny,
    harVærtPåFatteVedtakSteg,
    onNeste,
    onForrige,
    isLoading = false,
    skjulNeste = false,
    disableNeste = false,
}) => {
    return (
        <>
            {/* For å unngå synlig innhold ved scrolling i mellomrommet under actionbaren */}
            <div
                className={classNames('fixed bottom-0 bg-gray-50 h-5 left-4 right-8 min-w-95', {
                    'right-96': åpenHøyremeny,
                    'right-120': harVærtPåFatteVedtakSteg && åpenHøyremeny,
                })}
            />
            <HStack
                className={classNames(
                    'fixed bottom-2 left-4 bg-white right-8 px-8 py-4 rounded-2xl border-border-divider border-1 justify-end z-10 gap-8 flex-nowrap overflow-auto min-w-95',
                    {
                        'right-96': åpenHøyremeny,
                        'right-120': harVærtPåFatteVedtakSteg && åpenHøyremeny,
                    }
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
                                className="flex gap-0 lg:gap-2 text-nowrap py-2"
                                size="small"
                                onClick={() => {
                                    if (!isLoading) onForrige();
                                }}
                                aria-label={forrigeAriaLabel}
                            >
                                <span className="hidden md:block">{forrigeTekst}</span>
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
        </>
    );
};

export { ActionBar };
// fjern navn før sm
// action bar forskyvninger
