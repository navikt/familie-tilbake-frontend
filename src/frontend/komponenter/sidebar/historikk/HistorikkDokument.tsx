import type { FC } from 'react';

import { InlineMessage, Loader, Modal } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { behandlingHentDokumentQueryKey } from '@/generated-new/@tanstack/react-query.gen';
import { behandlingHentDokument } from '@/generated-new/sdk.gen';
import { lesFeilmeldingFraBlob } from '@/utils/blobFeilmelding';

type Props = {
    journalpostId: string;
    dokumentId: string;
    onClose: () => void;
};

export const HistorikkDokument: FC<Props> = ({ journalpostId, dokumentId, onClose }: Props) => {
    const { behandlingId } = useBehandling();
    const options = { path: { behandlingId, journalpostId, dokumentInfoId: dokumentId } };

    const { data: dokument, error } = useQuery({
        queryKey: behandlingHentDokumentQueryKey(options),
        queryFn: async ({ signal }: { signal: AbortSignal }): Promise<Blob> => {
            const resultat = await behandlingHentDokument({ ...options, signal });
            if (resultat.data) {
                return new Blob([resultat.data], { type: 'application/pdf' });
            }
            const feil = await lesFeilmeldingFraBlob(resultat);
            throw new Error(feil?.melding ?? 'Kunne ikke hente dokumentet.');
        },
        retry: false,
    });

    const dokumentUrl = useMemo(
        () => (dokument ? URL.createObjectURL(dokument) : null),
        [dokument]
    );

    useEffect(() => {
        return (): void => {
            if (dokumentUrl) URL.revokeObjectURL(dokumentUrl);
        };
    }, [dokumentUrl]);

    return (
        <Modal
            open
            onClose={onClose}
            header={{ heading: 'Dokument', closeButton: true }}
            width="100rem"
            className="h-full"
        >
            <Modal.Body className="h-full">
                {error && <InlineMessage status="error">{error.message}</InlineMessage>}
                {!error && !dokumentUrl && <Loader size="2xlarge" title="Henter dokument" />}
                {dokumentUrl && (
                    <iframe className="h-full w-full" title="Dokument" src={dokumentUrl} />
                )}
            </Modal.Body>
        </Modal>
    );
};
