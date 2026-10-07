import type { FC, KeyboardEvent } from 'react';
import type { EndretKravgrunnlag } from '@/generated';
import type { KravgrunnlagForskjell } from '@/generated-new';

import { Alert, BodyLong, Button, Loader, Modal, VStack } from '@navikt/ds-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useBehandling } from '@/context/BehandlingContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import {
    behandlingBenyttNyesteKravgrunnlagMutation,
    behandlingFaktaOptions,
    behandlingFaktaQueryKey,
} from '@/generated-new/@tanstack/react-query.gen';
import { MODAL_BREDDE } from '@/utils/modalUtils';

import { EndretPeriodeKort } from './EndretPeriodeKort';
import { PeriodeKort } from './PeriodeKort';
import { hentModalTekst, hentUendredePerioder } from './utils';

type Props = {
    endretKravgrunnlag: Omit<EndretKravgrunnlag, 'endringer'> & {
        endringer: EndretKravgrunnlag['endringer'] | KravgrunnlagForskjell[];
    };
    onFullført: () => void;
};

export const NyttKravgrunnlagModal: FC<Props> = ({ endretKravgrunnlag, onFullført }: Props) => {
    const { behandlingId, erNyModell } = useBehandling();
    const queryClient = useQueryClient();
    const fakta = useQuery({
        ...behandlingFaktaOptions({ path: { behandlingId } }),
        enabled: erNyModell,
    });

    const endringer = endretKravgrunnlag.endringer;
    const fjernedePerioder = endringer.filter(endring => endring.type === 'fjernet_periode');
    const nyePerioder = endringer.filter(endring => endring.type === 'ny_periode');
    const endretPerioder = endringer.filter(endring => endring.type === 'endret_periode');
    const uendredePerioder = fakta.data
        ? hentUendredePerioder(fakta.data.perioder, endringer)
        : undefined;

    const { tittel, beskrivelse } = hentModalTekst(
        nyePerioder.length,
        endretPerioder.length,
        fjernedePerioder.length
    );

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
            onKeyDownCapture={(event: KeyboardEvent<HTMLDialogElement>): void => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                }
            }}
            header={{
                heading: tittel,
                size: 'medium',
                closeButton: false,
            }}
            portal
            className={MODAL_BREDDE}
        >
            <Modal.Body>
                <VStack gap="space-16">
                    <BodyLong>{beskrivelse}</BodyLong>
                    {fjernedePerioder.length > 0 && (
                        <PeriodeKort perioder={fjernedePerioder} type="fjernet" />
                    )}
                    {nyePerioder.length > 0 && (
                        <PeriodeKort perioder={nyePerioder} type="lagtTil" />
                    )}
                    {endretPerioder.map(periode => (
                        <EndretPeriodeKort
                            key={`${periode.fom}-${periode.tom}`}
                            periode={periode}
                        />
                    ))}
                    {fakta.isError && (
                        <Alert variant="error" size="small">
                            Kunne ikke hente øvrige perioder i kravgrunnlaget.
                        </Alert>
                    )}
                    {uendredePerioder && uendredePerioder.length > 0 && (
                        <PeriodeKort perioder={uendredePerioder} type="uendret" />
                    )}
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
                    loading={benyttNyesteKravgrunnlag.isPending || fakta.isPending}
                >
                    Start vurderingen
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
