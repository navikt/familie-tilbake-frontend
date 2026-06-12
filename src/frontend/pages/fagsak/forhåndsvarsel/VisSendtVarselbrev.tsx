import type { FC } from 'react';

import { EyeIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import {
    behandlingHentDokumentInfoOptions,
    behandlingHentDokumentOptions,
} from '@/generated-new/@tanstack/react-query.gen';
import { PdfVisningModal } from '@/komponenter/pdf-visning-modal/PdfVisningModal';
import { byggDataRessurs } from '@/typer/ressurs';
import { lagPdfBlobUrl } from '@/utils/pdfUtils';

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
    });

    const varselbrevUrl = useMemo(() => {
        if (!sendtDokumentQuery.data) return null;
        return lagPdfBlobUrl(sendtDokumentQuery.data);
    }, [sendtDokumentQuery.data]);

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                icon={<EyeIcon aria-hidden />}
                loading={dokumentInfoQuery.isLoading || sendtDokumentQuery.isLoading}
                disabled={!varselbrevUrl}
                onClick={(): void => setVisModal(true)}
            >
                Vis brevet
            </Button>
            {visModal && varselbrevUrl && (
                <PdfVisningModal
                    åpen
                    pdfdata={byggDataRessurs(varselbrevUrl)}
                    onRequestClose={(): void => setVisModal(false)}
                />
            )}
        </>
    );
};
