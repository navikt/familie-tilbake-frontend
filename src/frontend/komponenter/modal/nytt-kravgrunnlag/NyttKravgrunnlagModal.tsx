import type { AxiosError } from 'axios';
import type { FC, KeyboardEvent } from 'react';
import type { EndretKravgrunnlag } from '@/generated';
import type {
    BehandlingBenyttNyesteKravgrunnlagError,
    BehandlingFaktaError,
    KravgrunnlagForskjell,
} from '@/generated-new';

import { BodyLong, Button, Modal, VStack } from '@navikt/ds-react';
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
import { FeilVarsel } from './FeilVarsel';
import { PeriodeKort } from './PeriodeKort';
import { hentModalTekst, hentUendredePerioder } from './utils';

type Props = {
    endretKravgrunnlag: Omit<EndretKravgrunnlag, 'endringer'> & {
        endringer: EndretKravgrunnlag['endringer'] | KravgrunnlagForskjell[];
    };
    lukkModal: () => void;
};

export const NyttKravgrunnlagModal: FC<Props> = ({ endretKravgrunnlag, lukkModal }: Props) => {
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

    const hentOppdatertFakta = useMutation<void, AxiosError<BehandlingFaktaError>>({
        mutationFn: async () => {
            await queryClient.invalidateQueries(
                { queryKey: behandlingFaktaQueryKey({ path: { behandlingId } }) },
                { throwOnError: true }
            );
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
            });
        },
        onSuccess: lukkModal,
    });

    const benyttNyesteKravgrunnlag = useMutation<
        unknown,
        AxiosError<BehandlingBenyttNyesteKravgrunnlagError>,
        { path: { behandlingId: string } }
    >({
        ...behandlingBenyttNyesteKravgrunnlagMutation(),
        onSuccess: () => hentOppdatertFakta.mutate(),
    });

    const startVurdering = (): void => {
        if (benyttNyesteKravgrunnlag.isSuccess) {
            hentOppdatertFakta.mutate();
        } else {
            benyttNyesteKravgrunnlag.mutate({ path: { behandlingId } });
        }
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
                    {fakta.isError && !benyttNyesteKravgrunnlag.isSuccess && (
                        <FeilVarsel
                            feil={fakta.error}
                            standardTittel="Kunne ikke hente øvrige perioder i kravgrunnlaget"
                            standardMelding="Perioder uten endringer kan ikke vises. Du kan fortsatt starte vurderingen."
                        />
                    )}
                    {uendredePerioder && uendredePerioder.length > 0 && (
                        <PeriodeKort perioder={uendredePerioder} type="uendret" />
                    )}
                    {benyttNyesteKravgrunnlag.isError && (
                        <FeilVarsel
                            feil={benyttNyesteKravgrunnlag.error}
                            standardTittel="Kunne ikke ta i bruk det nye kravgrunnlaget"
                            standardMelding="Prøv å starte vurderingen på nytt."
                        />
                    )}
                    {hentOppdatertFakta.isError && (
                        <FeilVarsel
                            feil={hentOppdatertFakta.error}
                            standardTittel="Kunne ikke hente oppdatert fakta"
                            standardMelding="Det nye kravgrunnlaget er tatt i bruk, men fakta om feilutbetalingen kunne ikke hentes. Prøv igjen."
                        />
                    )}
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    size="small"
                    onClick={startVurdering}
                    loading={
                        benyttNyesteKravgrunnlag.isPending ||
                        hentOppdatertFakta.isPending ||
                        fakta.isLoading
                    }
                >
                    Start vurderingen
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
