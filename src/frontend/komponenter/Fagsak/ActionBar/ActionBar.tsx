import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

type Props = {
    nesteTekst?: string;
    forrigeTekst?: string;
    forrigeAriaLabel?: string;
    nesteAriaLabel?: string;
    åpenHøyremeny?: boolean;
    onNeste?: () => void;
    onForrige?: () => void;
};

const ActionBar: React.FC<Props> = ({
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
                className={classNames('fixed bottom-0 mr-8 bg-white h-5 left-0 right-0', {
                    'right-88 mr-4': åpenHøyremeny,
                })}
            />
            <HStack
                className={classNames(
                    'fixed bottom-2 left-0 bg-white right-0 ml-4 mr-8 px-4 sm:px-6 md:px-8 py-4 rounded-2xl border-border-divider border-1 justify-end z-10 gap-0 sm:gap-8 flex-nowrap overflow-auto',
                    { 'right-88 mr-4': åpenHøyremeny }
                )}
                aria-label="Behandling handlingsknapper"
            >
                <BodyShort size="large" className="text-text-subtle flex items-center text-nowrap">
                    Steg 2 av 5
                </BodyShort>
                <HStack gap="4" className="flex-nowrap">
                    <Button
                        variant="secondary"
                        icon={<ChevronLeftIcon />}
                        className="hidden sm:flex gap-0 lg:gap-2 text-nowrap py-2"
                        size="small"
                        onClick={onForrige}
                        aria-label={forrigeAriaLabel}
                    >
                        <span className="hidden lg:block">{forrigeTekst || 'Forrige'}</span>
                    </Button>
                    <Button
                        icon={<ChevronRightIcon title="a11y-title" fontSize="1.5rem" />}
                        iconPosition="right"
                        className="hidden sm:flex gap-0 lg:gap-2 text-nowrap py-2"
                        size="small"
                        onClick={onNeste}
                        aria-label={nesteAriaLabel}
                    >
                        <span className="hidden lg:block">{nesteTekst || 'Neste'}</span>
                    </Button>
                </HStack>
            </HStack>
        </>
    );
};

export { ActionBar };
