import type { AxiosError } from 'axios';
import type { Error as KontraktError } from '@/generated-new';
import type { SammenslåbarPeriode } from './utils';

import { BodyShort, Box, Button, Modal } from '@navikt/ds-react';
import { useMutation } from '@tanstack/react-query';
import { type FC, useMemo, useRef } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { behandlingSlaaSammenPerioderMutation } from '@/generated-new/@tanstack/react-query.gen';
import { MODAL_BREDDE } from '@/komponenter/meny/utils';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { hentFeilmeldingFraError } from '@/typer/ressurs';
import { formatterDatostring } from '@/utils';

import { finnSammenslåingsforslag } from './utils';

type Props = {
    vilkårsvurderingId: string;
    vilkårsperioder: SammenslåbarPeriode[];
    hentVilkårsvurdering: () => void;
};

export const SlåSammen: FC<Props> = ({
    vilkårsvurderingId,
    vilkårsperioder,
    hentVilkårsvurdering,
}: Props) => {
    const slåSammenPeriodeRef = useRef<HTMLDialogElement>(null);
    const { behandlingId } = useBehandling();
    const visGlobalAlert = useVisGlobalAlert();

    const forslag = useMemo(
        () => finnSammenslåingsforslag(vilkårsperioder, vilkårsvurderingId),
        [vilkårsperioder, vilkårsvurderingId]
    );

    const lukkModal = (): void => slåSammenPeriodeRef.current?.close();

    const slåSammen = useMutation({
        ...behandlingSlaaSammenPerioderMutation(),
        onSuccess: () => {
            hentVilkårsvurdering();
            visGlobalAlert({
                title: 'Periodene er slått sammen',
                status: 'success',
            });
            lukkModal();
        },
        onError: (error: AxiosError<KontraktError>) => {
            visGlobalAlert({
                title: error.response?.data.tittel ?? 'Kunne ikke slå sammen periodene',
                message: error.response?.data.melding ?? hentFeilmeldingFraError(error),
                status: 'error',
            });
        },
    });

    const slåSammenPerioder = (): void => {
        if (!forslag) {
            return;
        }
        slåSammen.mutate({
            path: { behandlingId },
            body: forslag.sammenslaaing,
        });
    };

    if (!forslag) {
        return null;
    }

    const { forrigePeriode } = forslag;

    return (
        <>
            <Button
                onClick={(): void => slåSammenPeriodeRef.current?.showModal()}
                size="xsmall"
                variant="tertiary"
            >
                Slå sammen
            </Button>

            <Modal
                ref={slåSammenPeriodeRef}
                header={{ heading: 'Slå sammen' }}
                className={MODAL_BREDDE}
                closeOnBackdropClick
            >
                <Modal.Body className="flex flex-col gap-8">
                    <BodyShort>
                        Når du slår sammen to perioder, vil den nyeste perioden bestemme
                        vilkårsvurderingen for den sammenslåtte perioden.
                    </BodyShort>
                    <Box className="bg-ax-bg-info-moderate p-4 rounded-xl border border-ax-bg-info-strong flex flex-col gap-2">
                        Denne perioden slås sammen med den forrige perioden:
                        <span className="font-semibold">
                            {`${formatterDatostring(forrigePeriode.periode.fom)}–${formatterDatostring(forrigePeriode.periode.tom)}`}
                        </span>
                    </Box>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        size="small"
                        onClick={slåSammenPerioder}
                        loading={slåSammen.isPending}
                        disabled={slåSammen.isPending}
                    >
                        Slå sammen
                    </Button>
                    <Button variant="secondary" size="small" onClick={lukkModal}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
