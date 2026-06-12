import type { FC } from 'react';
import type { RessursByte } from '@/generated';

import { EyeIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import {
    behandlingHentDokumentInfoOptions,
    behandlingHentDokumentOptions,
} from '@/generated-new/@tanstack/react-query.gen';
import { PdfVisningModal } from '@/komponenter/pdf-visning-modal/PdfVisningModal';

export const VisSendtVarselbrev: FC = () => {
    const { behandlingId } = useBehandling();
    const [visModal, setVisModal] = useState(false);

    const dokumentInfoQuery = useQuery({
        ...behandlingHentDokumentInfoOptions({
            path: { behandlingId, dokumentType: 'VARSELBREV' },
        }),
    });

    const sendtDokumentQuery = useQuery({
        ...behandlingHentDokumentOptions({
            path: {
                behandlingId,
                journalpostId: dokumentInfoQuery.data?.journalpostId ?? '',
                dokumentInfoId: dokumentInfoQuery.data?.dokumentId ?? '',
            },
        }),
        enabled: !!dokumentInfoQuery.data?.journalpostId && !!dokumentInfoQuery.data?.dokumentId,
        select: (blob: Blob | File): RessursByte => ({
            data: URL.createObjectURL(new Blob([blob], { type: 'application/pdf' })),
            status: 'SUKSESS',
            melding: 'OK',
        }),
    });

    const seBrevet = (): void => {
        if (sendtDokumentQuery.data) {
            setVisModal(true);
        }
    };

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                icon={<EyeIcon aria-hidden />}
                loading={dokumentInfoQuery.isLoading || sendtDokumentQuery.isLoading}
                onClick={seBrevet}
            >
                Vis brevet
            </Button>
            {visModal && sendtDokumentQuery.data && (
                <PdfVisningModal
                    åpen
                    pdfdata={sendtDokumentQuery.data}
                    onRequestClose={(): void => setVisModal(false)}
                />
            )}
        </>
    );
};
