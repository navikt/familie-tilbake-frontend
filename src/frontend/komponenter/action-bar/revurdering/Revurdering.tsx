import type { FC } from 'react';
import type {
    BehandlingOpprettRevurderingData,
    BehandlingOpprettRevurderingResponse,
    Options,
    TilbakekrevingRevurderingsarsak,
} from '@/generated-new';

import { ArrowCirclepathReverseIcon, MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import { ActionMenu, Button } from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { useFagsak } from '@/context/FagsakContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { RevurderingModal } from './RevurderingModal';
import {
    feilmeldingFraRevurdering,
    opprettRevurderingResponseSchema,
    type Revurderingsfeil,
} from './utils';

export const OPPRETT_REVURDERING_MUTATION_KEY = ['opprettRevurdering'] as const;

export const Revurdering: FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { behandlingId } = useBehandling();
    const { fagsystem, tilbakekrevingSakId } = useFagsak();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const queryClient = useQueryClient();
    const revurder = useMutation<
        BehandlingOpprettRevurderingResponse,
        Revurderingsfeil,
        Options<BehandlingOpprettRevurderingData>
    >({
        mutationKey: OPPRETT_REVURDERING_MUTATION_KEY,
        onSuccess: async (response: BehandlingOpprettRevurderingResponse): Promise<void> => {
            const { url } = opprettRevurderingResponseSchema.parse(response);
            await queryClient.invalidateQueries({
                queryKey: ['fagsak', fagsystem, tilbakekrevingSakId],
            });
            // Refetch kan fjerne revurderingsknappen før redirecten rekker å kjøre.
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
                refetchType: 'none',
            });
            nullstillIkkePersisterteKomponenter();
            dialogRef.current?.close();
            window.location.replace(url);
        },
    });

    const feilmelding = revurder.error ? feilmeldingFraRevurdering(revurder.error) : undefined;

    return (
        <>
            <nav
                aria-label="Behandlingsvalg"
                className="flex items-center shrink-0 bg-ax-bg-default px-3 py-2 rounded-2xl border-ax-border-brand-blue-subtle border"
            >
                <ActionMenu>
                    <ActionMenu.Trigger>
                        <Button
                            size="small"
                            variant="tertiary"
                            aria-label="BehandlingsvalgKnapp"
                            icon={<MenuElipsisHorizontalIcon aria-hidden />}
                        />
                    </ActionMenu.Trigger>
                    <ActionMenu.Content>
                        <ActionMenu.Item
                            icon={<ArrowCirclepathReverseIcon aria-hidden />}
                            onSelect={(): void => dialogRef.current?.showModal()}
                        >
                            Revurder tilbakekrevingen
                        </ActionMenu.Item>
                    </ActionMenu.Content>
                </ActionMenu>
            </nav>
            <RevurderingModal
                dialogRef={dialogRef}
                heading="Revurder tilbakekrevingen"
                submitTekst="Revurder"
                isPending={revurder.isPending}
                feilmelding={feilmelding}
                onNullstill={revurder.reset}
                onSubmit={(data: TilbakekrevingRevurderingsarsak): void => {
                    sporHendelse(Hendelser.KNAPP_KLIKKET, {
                        tekst: 'Revurder',
                        kontekst: Sporingskontekst.ActionBar,
                    });
                    revurder.mutate({
                        path: { behandlingId },
                        body: { revurderingsarsak: data },
                    });
                }}
            />
        </>
    );
};
