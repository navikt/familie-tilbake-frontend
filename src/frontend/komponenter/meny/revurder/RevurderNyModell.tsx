import type { FC } from 'react';
import type { TilbakekrevingRevurdering } from '@/generated-new';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, LocalAlert, Modal, Select, VStack } from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { useFagsak } from '@/context/FagsakContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import { behandlingOpprettRevurdering } from '@/generated-new';
import {
    zBehandlingOpprettRevurderingResponse,
    zTilbakekrevingRevurdering,
    zTilbakekrevingRevurderingsarsak,
} from '@/generated-new/zod.gen';
import { useRedirectEtterLagring } from '@/hooks/useRedirectEtterLagring';
import { behandlingsårsaker } from '@/typer/behandling';
import { MODAL_BREDDE } from '@/utils/modalUtils';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

const revurderingSchema = zTilbakekrevingRevurdering.extend({
    revurderingsarsak: z.enum(zTilbakekrevingRevurderingsarsak.options, {
        error: 'Velg årsak til revurderingen',
    }),
});

export const RevurderNyModell: FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { behandlingId } = useBehandling();
    const { fagsystem, tilbakekrevingSakId } = useFagsak();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const { utførRedirect } = useRedirectEtterLagring();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState } = useForm<TilbakekrevingRevurdering>({
        resolver: zodResolver(revurderingSchema),
    });

    const revurder = useMutation({
        mutationFn: async (body: TilbakekrevingRevurdering): Promise<string> => {
            const { data } = await behandlingOpprettRevurdering({
                path: { behandlingId },
                body,
                throwOnError: true,
            });
            return zBehandlingOpprettRevurderingResponse
                .min(1, {
                    error: 'Revurderingen ble opprettet, men svaret mangler URL til behandlingen.',
                })
                .parse(data);
        },
        onSuccess: async (behandlingsUrl: string): Promise<void> => {
            await queryClient.invalidateQueries({
                queryKey: ['fagsak', fagsystem, tilbakekrevingSakId],
            });
            // Refetch kan fjerne revurderingsknappen før redirecten rekker å kjøre.
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
                refetchType: 'none',
            });
            nullstillIkkePersisterteKomponenter();
            utførRedirect(behandlingsUrl);
            dialogRef.current?.close();
        },
    });

    const nullstill = (): void => {
        reset();
        revurder.reset();
    };

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                onClick={(): void => dialogRef.current?.showModal()}
            >
                Revurder
            </Button>
            <Modal
                ref={dialogRef}
                header={{ heading: 'Revurder tilbakekreving' }}
                className={MODAL_BREDDE}
                onClose={nullstill}
                onBeforeClose={(): boolean => !revurder.isPending}
            >
                <form
                    onSubmit={handleSubmit((data: TilbakekrevingRevurdering) => {
                        sporHendelse(Hendelser.KNAPP_KLIKKET, {
                            tekst: 'Revurder',
                            kontekst: Sporingskontekst.ActionBar,
                        });
                        revurder.mutate(data);
                    })}
                >
                    <Modal.Body>
                        <VStack gap="space-16">
                            <Select
                                {...register('revurderingsarsak')}
                                label="Årsak til revurderingen"
                                defaultValue=""
                                disabled={revurder.isPending}
                                error={formState.errors.revurderingsarsak?.message}
                            >
                                <option value="" disabled>
                                    Velg årsak
                                </option>
                                {zTilbakekrevingRevurderingsarsak.options.map(årsak => (
                                    <option key={årsak} value={årsak}>
                                        {behandlingsårsaker[årsak]}
                                    </option>
                                ))}
                            </Select>
                            {revurder.isError && (
                                <LocalAlert status="error">
                                    <LocalAlert.Header>
                                        <LocalAlert.Title>
                                            {revurder.error instanceof z.ZodError
                                                ? revurder.error.issues[0]?.message
                                                : 'Kunne ikke opprette revurderingen. Prøv igjen.'}
                                        </LocalAlert.Title>
                                    </LocalAlert.Header>
                                </LocalAlert>
                            )}
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            type="submit"
                            loading={revurder.isPending}
                            disabled={revurder.isPending || revurder.error instanceof z.ZodError}
                        >
                            Revurder
                        </Button>
                        <Button
                            variant="secondary"
                            disabled={revurder.isPending}
                            onClick={(): void => dialogRef.current?.close()}
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    );
};
