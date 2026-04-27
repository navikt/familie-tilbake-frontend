import type { ForhåndsvarselDto } from '~/generated';
import type { FC } from 'react';

import { ClockIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Heading, VStack } from '@navikt/ds-react';

import { formatterDatostring } from '~/utils';

type Props = {
    forhåndsvarselInfo: ForhåndsvarselDto;
    onUtsettFrist: () => void;
};

export const Fristinfo: FC<Props> = ({ forhåndsvarselInfo, onUtsettFrist }) => {
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
            className="w-72 shrink-0"
        >
            <VStack gap="space-16" align="start">
                <div>
                    <BodyShort size="small" weight="semibold">
                        {nyFrist ? 'Opprinnelig frist' : 'Frist for uttalelse'}
                    </BodyShort>
                    <Heading size="medium" level="3" className="text-ax-text-info">
                        {formatterDatostring(opprinneligFrist)}
                    </Heading>
                </div>
                {nyFrist && (
                    <div>
                        <BodyShort size="small" weight="semibold">
                            Ny frist for uttalelse
                        </BodyShort>
                        <Heading size="medium" level="3" className="text-ax-text-info">
                            {formatterDatostring(nyFrist)}
                        </Heading>
                    </div>
                )}
                <Button
                    variant="tertiary"
                    size="small"
                    icon={<ClockIcon aria-hidden />}
                    onClick={onUtsettFrist}
                >
                    Utsett frist
                </Button>
            </VStack>
        </Box>
    );
};
