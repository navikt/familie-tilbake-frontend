import type { IBehandling } from '../../../typer/behandling';

import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, HStack } from '@navikt/ds-react';
import React from 'react';

type Props = {
    behandling: IBehandling;
    nesteTekst?: string;
    forrigeTekst?: string;
    onNeste?: () => void;
    onForrige?: () => void;
};

const ActionBar: React.FC<Props> = ({
    behandling,
    nesteTekst,
    forrigeTekst,
    onNeste,
    onForrige,
}) => {
    console.log('behandling i actionbar', behandling);

    return (
        <HStack className="sticky left-0 right-0 bottom-2 mx-4 sm:px-6 md:px-8 py-4 bg-white rounded-2xl border-border-divider border-1 justify-end z-50 gap-8">
            <BodyShort
                size="large"
                className="text-text-subtle flex items-center text-nowrap shrink-0"
            >
                Steg 2 av 5
            </BodyShort>
            <HStack gap="4" className="shrink-0 flex-nowrap">
                <Button
                    variant="secondary"
                    icon={<ChevronLeftIcon />}
                    className="hidden sm:flex gap-0 lg:gap-2 text-nowrap"
                    onClick={onForrige}
                >
                    <span className="hidden lg:block">{forrigeTekst || 'Forrige'}</span>
                </Button>
                <Button
                    icon={<ChevronRightIcon title="a11y-title" fontSize="1.5rem" />}
                    iconPosition="right"
                    className="hidden sm:flex gap-0 lg:gap-2 text-nowrap"
                    onClick={onNeste}
                >
                    <span className="hidden lg:block">{nesteTekst || 'Neste'}</span>
                </Button>
            </HStack>
        </HStack>
    );
};

export { ActionBar };
