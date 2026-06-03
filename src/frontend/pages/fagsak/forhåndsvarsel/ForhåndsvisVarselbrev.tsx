import type { FC } from 'react';
import type { BestillBrevDto, RessursByte } from '@/generated';
import type { IkkeVurdertFormData } from './schema';

import { EyeIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { useBehandling } from '@/context/BehandlingContext';
import { forhåndsvisBrevMutation } from '@/generated/@tanstack/react-query.gen';
import { PdfVisningModal } from '@/komponenter/pdf-visning-modal/PdfVisningModal';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';

const lagForhåndsvisningBody = (behandlingId: string, fritekst: string): BestillBrevDto => ({
    behandlingId,
    brevmalkode: 'VARSEL',
    fritekst,
});

export const ForhåndsvisVarselbrev: FC = () => {
    const { behandlingId } = useBehandling();
    const { getValues } = useFormContext<IkkeVurdertFormData>();
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();
    const [visModal, setVisModal] = useState(false);

    const forhåndsvisning = useMutation({
        ...forhåndsvisBrevMutation(),
    });

    const forhåndsvis = (): void => {
        const fritekst = getValues('tekstFraSaksbehandler') ?? '';
        const queryKey = ['forhaandsvisBrev', behandlingId, 'VARSEL', fritekst];
        const cachedData = queryClient.getQueryData<RessursByte>(queryKey);

        if (cachedData) {
            setVisModal(true);
            return;
        }

        forhåndsvisning.mutate(
            {
                path: { behandlingId },
                body: lagForhåndsvisningBody(behandlingId, fritekst),
            },
            {
                onSuccess: data => {
                    queryClient.setQueryData(queryKey, data);
                    setVisModal(true);
                },
                onError: error => {
                    visGlobalAlert({
                        title: 'Kunne ikke forhåndsvise forhåndsvarsel',
                        message: error.message,
                        status: 'error',
                    });
                },
            }
        );
    };

    const pdfData = forhåndsvisning.data;

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                icon={<EyeIcon aria-hidden />}
                loading={forhåndsvisning.isPending}
                onClick={forhåndsvis}
            >
                Vis brevet
            </Button>
            {visModal && pdfData && (
                <PdfVisningModal åpen pdfdata={pdfData} onRequestClose={() => setVisModal(false)} />
            )}
        </>
    );
};
