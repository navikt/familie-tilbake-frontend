import type { FC } from 'react';
import type { Uttalelsesfrist } from '@/generated-new';

import { ClockIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, VStack } from '@navikt/ds-react';

import { useBehandlingState } from '@/context/BehandlingStateContext';
import { formatterDatostring } from '@/utils';

type Props = {
    uttalelsesfrist: Uttalelsesfrist;
    onUtsettFrist: () => void;
};

export const Fristinfo: FC<Props> = ({ uttalelsesfrist, onUtsettFrist }: Props) => {
    const { behandlingILesemodus } = useBehandlingState();
    const { opprinneligFrist, nyFrist } = uttalelsesfrist;

    return (
        <Box
            padding="space-16"
            borderRadius="12"
            borderWidth="1"
            borderColor="info"
            background="info-soft"
            className="w-72"
        >
            <VStack gap="space-16" align="start">
                <div>
                    <BodyShort size="small" weight="semibold">
                        {nyFrist ? 'Opprinnelig frist' : 'Frist for uttalelse'}
                    </BodyShort>
                    <time
                        dateTime={opprinneligFrist}
                        className="font-ax-bold text-ax-heading-medium text-ax-text-info"
                    >
                        {formatterDatostring(opprinneligFrist)}
                    </time>
                </div>
                {nyFrist && (
                    <div>
                        <BodyShort size="small" weight="semibold">
                            Ny frist for uttalelse
                        </BodyShort>
                        <time
                            dateTime={nyFrist}
                            className="font-ax-bold text-ax-heading-medium text-ax-text-info"
                        >
                            {formatterDatostring(nyFrist)}
                        </time>
                    </div>
                )}
                {!behandlingILesemodus && (
                    <Button
                        variant="secondary"
                        size="small"
                        icon={<ClockIcon aria-hidden />}
                        onClick={onUtsettFrist}
                    >
                        Utsett frist
                    </Button>
                )}
            </VStack>
        </Box>
    );
};
