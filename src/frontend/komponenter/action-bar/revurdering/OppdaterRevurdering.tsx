import type { AxiosError } from 'axios';
import type { FC } from 'react';
import type {
    BehandlingOppdaterRevurderingsarsakData,
    BehandlingOppdaterRevurderingsarsakError,
    Options,
    TilbakekrevingRevurderingsarsak,
} from '@/generated-new';

import { PencilIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import { behandlingOppdaterRevurderingsarsakMutation } from '@/generated-new/@tanstack/react-query.gen';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

import { RevurderingModal } from './RevurderingModal';
import { feilmeldingFraRevurdering } from './utils';

type Props = {
    revurderingsarsak: TilbakekrevingRevurderingsarsak;
};

export const OppdaterRevurdering: FC<Props> = ({ revurderingsarsak }: Props) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();

    const oppdater = useMutation<
        unknown,
        AxiosError<BehandlingOppdaterRevurderingsarsakError>,
        Options<BehandlingOppdaterRevurderingsarsakData>
    >({
        ...behandlingOppdaterRevurderingsarsakMutation(),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
            });
            dialogRef.current?.close();
        },
    });

    const feilmelding = oppdater.error
        ? feilmeldingFraRevurdering(
              oppdater.error,
              'Kunne ikke oppdatere revurderingen. Prøv igjen.'
          )
        : undefined;

    return (
        <>
            <Button
                variant="tertiary"
                data-color="neutral"
                size="xsmall"
                aria-label="Rediger revurdering"
                icon={<PencilIcon aria-hidden />}
                onClick={(): void => dialogRef.current?.showModal()}
            />
            <RevurderingModal
                dialogRef={dialogRef}
                heading="Rediger revurdering"
                submitTekst="Lagre"
                defaultValues={revurderingsarsak}
                krevEndring
                isPending={oppdater.isPending}
                feilmelding={feilmelding}
                onNullstill={oppdater.reset}
                onSubmit={(data: TilbakekrevingRevurderingsarsak): void => {
                    sporHendelse(Hendelser.KNAPP_KLIKKET, {
                        tekst: 'Lagre revurdering',
                        kontekst: Sporingskontekst.Sidebar,
                    });
                    oppdater.mutate({
                        path: { behandlingId },
                        body: { revurderingsarsak: data },
                    });
                }}
            />
        </>
    );
};
