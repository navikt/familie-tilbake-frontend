import type { FC } from 'react';
import type {
    BehandlingOpprettRevurderingData,
    BehandlingOpprettRevurderingResponse,
    Options,
    TilbakekrevingRevurderingsarsak,
} from '@/generated-new';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowCirclepathReverseIcon, MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import {
    ActionMenu,
    Button,
    LocalAlert,
    Modal,
    Radio,
    RadioGroup,
    Select,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { get, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { useFagsak } from '@/context/FagsakContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import { useRedirectEtterLagring } from '@/hooks/useRedirectEtterLagring';
import { MODAL_BREDDE } from '@/utils/modalUtils';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { instansvalg, opprettRevurderingResponseSchema, revurderingSchema, årsaker } from './utils';

export const OPPRETT_REVURDERING_MUTATION_KEY = ['opprettRevurdering'] as const;

export const Revurdering: FC = () => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { behandlingId } = useBehandling();
    const { fagsystem, tilbakekrevingSakId } = useFagsak();
    const { nullstillIkkePersisterteKomponenter } = useBehandlingState();
    const { utførRedirect } = useRedirectEtterLagring();
    const queryClient = useQueryClient();
    const { control, register, handleSubmit, reset, formState } =
        useForm<TilbakekrevingRevurderingsarsak>({
            resolver: zodResolver(revurderingSchema),
            shouldUnregister: true,
        });
    const valgtÅrsak = useWatch({ control, name: 'revurderingsarsak' });
    const instansvalgForÅrsak = valgtÅrsak ? instansvalg[valgtÅrsak] : [];
    const { name: instansName, ...instansProps } = register('instans');

    const revurder = useMutation<
        BehandlingOpprettRevurderingResponse,
        Error,
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
            utførRedirect(url);
            dialogRef.current?.close();
        },
    });

    const nullstill = (): void => {
        reset();
        revurder.reset();
    };

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
            <Modal
                ref={dialogRef}
                header={{ heading: 'Revurder tilbakekrevingen' }}
                className={MODAL_BREDDE}
                onClose={nullstill}
                onBeforeClose={(): boolean => !revurder.isPending}
            >
                <form
                    onSubmit={handleSubmit((data: TilbakekrevingRevurderingsarsak): void => {
                        sporHendelse(Hendelser.KNAPP_KLIKKET, {
                            tekst: 'Revurder',
                            kontekst: Sporingskontekst.ActionBar,
                        });
                        revurder.mutate({
                            path: { behandlingId },
                            body: { revurderingsarsak: data },
                        });
                    })}
                >
                    <Modal.Body className="pt-0">
                        <VStack gap="space-16">
                            <Select
                                {...register('revurderingsarsak')}
                                label="Hva er årsaken til revurderingen?"
                                defaultValue=""
                                size="small"
                                disabled={revurder.isPending}
                                error={formState.errors.revurderingsarsak?.message}
                            >
                                <option value="" disabled>
                                    Velg årsak
                                </option>
                                {Object.entries(årsaker).map(([verdi, tekst]) => (
                                    <option key={verdi} value={verdi}>
                                        {tekst}
                                    </option>
                                ))}
                            </Select>
                            {instansvalgForÅrsak.length > 0 && (
                                <RadioGroup
                                    name={instansName}
                                    legend="Hvilken instans har omgjort vedtaket?"
                                    size="small"
                                    disabled={revurder.isPending}
                                    error={get(formState.errors, 'instans.message')}
                                >
                                    {instansvalgForÅrsak.map(instans => (
                                        <Radio key={instans} value={instans} {...instansProps}>
                                            {instans}
                                        </Radio>
                                    ))}
                                </RadioGroup>
                            )}
                            {valgtÅrsak && (
                                <Textarea
                                    {...register('begrunnelse')}
                                    label="Beskriv kort årsaken til revurderingen"
                                    maxLength={1000}
                                    minRows={3}
                                    size="small"
                                    resize
                                    disabled={revurder.isPending}
                                    error={formState.errors.begrunnelse?.message}
                                />
                            )}
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
                            size="small"
                            loading={revurder.isPending}
                            disabled={revurder.isPending || revurder.error instanceof z.ZodError}
                        >
                            Revurder
                        </Button>
                        <Button
                            type="button"
                            size="small"
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
