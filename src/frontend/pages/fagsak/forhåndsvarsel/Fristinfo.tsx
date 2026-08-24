import type { FC } from 'react';
import type { Uttalelsesfrist } from '@/generated-new';

import { CalendarIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, HStack, VStack } from '@navikt/ds-react';

import { useBehandlingState } from '@/context/BehandlingStateContext';
import { formatterDatostring } from '@/utils';

type Props = {
    uttalelsesfrist: Uttalelsesfrist;
    onUtsettFrist: () => void;
};

export const Fristinfo: FC<Props> = ({ uttalelsesfrist, onUtsettFrist }: Props) => {
    const { behandlingILesemodus } = useBehandlingState();
    const { opprinneligFrist, nyFrist } = uttalelsesfrist;
    const gjeldendeFrist = nyFrist ?? opprinneligFrist;

    return (
        <Box
            background="info-soft"
            borderColor="info-subtle"
            borderWidth="1"
            borderRadius="12"
            paddingInline="space-12"
            paddingBlock="space-8"
        >
            <HStack align="center" gap="space-8" wrap={false}>
                <HStack align="center" gap="space-16" wrap={false} className="min-w-0 grow">
                    <CalendarIcon
                        fontSize="2.25rem"
                        aria-hidden
                        className="shrink-0 text-ax-text-info-subtle"
                    />
                    <VStack className="min-w-0">
                        <BodyShort
                            size="small"
                            weight="semibold"
                            className="text-ax-text-info-subtle"
                        >
                            Frist for uttalelse
                        </BodyShort>
                        <BodyShort
                            as="div"
                            size="medium"
                            weight="semibold"
                            className="text-ax-text-info"
                        >
                            <time dateTime={gjeldendeFrist}>
                                {formatterDatostring(gjeldendeFrist)}
                            </time>
                        </BodyShort>
                    </VStack>
                </HStack>
                {!behandlingILesemodus && (
                    <Button
                        data-color="neutral"
                        variant="secondary"
                        size="small"
                        onClick={onUtsettFrist}
                    >
                        Utsett frist
                    </Button>
                )}
            </HStack>
        </Box>
    );
};
