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

export const VisSendtVarselbrev: FC = () => {
    const { behandlingId } = useBehandling();
    const [visModal, setVisModal] = useState(false);

    const { data: { journalpostId, dokumentId } = {}, isLoading: dokumentInfoLaster } = useQuery({
        ...behandlingHentDokumentInfoOptions({
            path: { behandlingId, dokumentType: 'VARSELBREV' },
        }),
    });

    const { data: sendtDokument, isLoading: sendtDokumentLaster } = useQuery({
        ...behandlingHentDokumentOptions({
            path: {
                behandlingId,
                journalpostId: journalpostId ?? '',
                dokumentInfoId: dokumentId ?? '',
            },
        }),
        enabled: !!journalpostId && !!dokumentId,
    });

    const varselbrevUrl = useMemo(() => {
        if (!sendtDokument) return null;
        return URL.createObjectURL(new Blob([sendtDokument], { type: 'application/pdf' }));
    }, [sendtDokument]);

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                icon={<EyeIcon aria-hidden />}
                loading={dokumentInfoLaster || sendtDokumentLaster}
                disabled={!varselbrevUrl}
                onClick={(): void => setVisModal(true)}
            >
                Vis brevet
            </Button>
            {varselbrevUrl && (
                <PdfVisningModal
                    åpen={visModal}
                    pdfdata={byggDataRessurs(varselbrevUrl)}
                    onRequestClose={(): void => setVisModal(false)}
                />
            )}
        </>
    );
};
