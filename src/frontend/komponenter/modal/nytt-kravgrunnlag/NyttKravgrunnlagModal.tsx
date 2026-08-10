import type { FC } from 'react';
import type { EndretKravgrunnlag } from '@/generated';

import {
    Alert,
    BodyLong,
    BodyShort,
    Box,
    Button,
    Heading,
    HStack,
    Modal,
    VStack,
} from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import {
    behandlingBenyttNyesteKravgrunnlagMutation,
    behandlingFaktaQueryKey,
} from '@/generated-new/@tanstack/react-query.gen';
import { formatCurrencyNoKr, formatterDatostring, hentPeriodelengde } from '@/utils';

type Props = {
    endretKravgrunnlag: EndretKravgrunnlag;
    onFullført: () => void;
};

export const NyttKravgrunnlagModal: FC<Props> = ({ endretKravgrunnlag, onFullført }: Props) => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();
    const { nyPeriode, nyttBeløp } = endretKravgrunnlag;
    const periodelengde = hentPeriodelengde(nyPeriode.fom, nyPeriode.tom);

    // Chrome fyrer ikke alltid dialogens cancel-event, så vi blokkerer selve Escape-lukkingen
    useEffect(() => {
        const blokkerEscape = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                event.preventDefault();
            }
        };
        document.addEventListener('keydown', blokkerEscape, true);
        return (): void => document.removeEventListener('keydown', blokkerEscape, true);
    }, []);

    const benyttNyesteKravgrunnlag = useMutation({
        ...behandlingBenyttNyesteKravgrunnlagMutation(),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
            });
            await queryClient.invalidateQueries({
                queryKey: behandlingFaktaQueryKey({ path: { behandlingId } }),
            });
            onFullført();
        },
    });

    const startVurdering = (): void => {
        benyttNyesteKravgrunnlag.mutate({ path: { behandlingId } });
    };

    return (
        <Modal
            open
            onClose={(): void => undefined}
            onBeforeClose={(): boolean => false}
            header={{ heading: 'Ny periode må vurderes', size: 'medium', closeButton: false }}
            width="medium"
            portal
        >
            <Modal.Body>
                <VStack gap="space-16">
                    <BodyLong>
                        Det er registrert en endring i kravgrunnlaget som må vurderes.
                    </BodyLong>
                    <Box borderColor="success" borderWidth="1" borderRadius="12" overflow="hidden">
                        <Box
                            background="success-moderate"
                            borderColor="success"
                            borderWidth="0 0 1 0"
                            paddingInline="space-16"
                            paddingBlock="space-6"
                        >
                            <Heading level="2" size="xsmall" className="text-ax-text-success">
                                Detaljer om perioden
                            </Heading>
                        </Box>
                        <HStack
                            gap="space-32"
                            paddingInline="space-16"
                            paddingBlock="space-8 space-12"
                            className="bg-ax-bg-default"
                        >
                            <VStack gap="space-1">
                                <BodyShort weight="semibold">Periode</BodyShort>
                                <BodyShort>
                                    {formatterDatostring(nyPeriode.fom)}–
                                    {formatterDatostring(nyPeriode.tom)}
                                </BodyShort>
                                {periodelengde && (
                                    <BodyShort size="small">{periodelengde}</BodyShort>
                                )}
                            </VStack>
                            <VStack gap="space-1">
                                <BodyShort weight="semibold">Feilutbetalt</BodyShort>
                                <BodyShort className="text-ax-text-brand-magenta">
                                    {formatCurrencyNoKr(nyttBeløp)}
                                </BodyShort>
                            </VStack>
                        </HStack>
                    </Box>
                    {benyttNyesteKravgrunnlag.isError && (
                        <Alert variant="error" size="small">
                            Kunne ikke ta i bruk det nye kravgrunnlaget. Prøv igjen.
                        </Alert>
                    )}
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    size="small"
                    onClick={startVurdering}
                    loading={benyttNyesteKravgrunnlag.isPending}
                >
                    Start vurderingen
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
