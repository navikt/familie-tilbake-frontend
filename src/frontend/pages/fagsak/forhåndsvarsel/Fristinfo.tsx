import type { FC } from 'react';
import type { ForhåndsvarselDto } from '~/generated';

import { ClockIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, VStack } from '@navikt/ds-react';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { formatterDatostring } from '~/utils';

type Props = {
    forhåndsvarselInfo: ForhåndsvarselDto;
    onUtsettFrist: () => void;
};

export const Fristinfo: FC<Props> = ({ forhåndsvarselInfo, onUtsettFrist }) => {
    const { behandlingILesemodus } = useBehandlingState();
    const opprinneligFrist = forhåndsvarselInfo.varselbrevDto?.opprinneligFristForUttalelse;
    const nyFrist = forhåndsvarselInfo.utsettUttalelseFrist?.nyFrist;

    if (!opprinneligFrist) {
        return null;
    }

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
