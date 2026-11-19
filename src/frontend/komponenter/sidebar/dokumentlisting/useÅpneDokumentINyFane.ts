import { useMutation } from '@tanstack/react-query';

import { useBehandling } from '@/context/BehandlingContext';
import { hentDokument } from '@/generated/sdk.gen';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { base64ToArrayBuffer } from '@/utils';
import { ApiStatusError, hentFeilmelding } from '@/utils/httpUtils';

type Dokumentreferanse = {
    journalpostId: string;
    dokumentInfoId: string;
};

type HentDokumentVariabler = Dokumentreferanse & {
    nyFane: Window;
};

export const useÅpneDokumentINyFane = (): ((dokument: Dokumentreferanse) => void) => {
    const { behandlingId } = useBehandling();
    const visGlobalAlert = useVisGlobalAlert();

    const { mutate } = useMutation({
        mutationFn: async ({
            journalpostId,
            dokumentInfoId,
        }: HentDokumentVariabler): Promise<string> => {
            const { data } = await hentDokument({
                path: { behandlingId, journalpostId, dokumentInfoId },
                throwOnError: true,
            });
            if (!data.data) {
                const feilmelding = data.frontendFeilmelding ?? data.melding;
                throw new ApiStatusError(data.status === 'IKKE_TILGANG' ? 403 : 500, feilmelding);
            }
            return data.data;
        },
        onSuccess: (base64: string, { nyFane }: HentDokumentVariabler): void => {
            if (nyFane.closed) return;
            const pdf = new Blob([base64ToArrayBuffer(base64)], { type: 'application/pdf' });
            nyFane.location.href = URL.createObjectURL(pdf);
        },
        onError: (error: Error, { nyFane }: HentDokumentVariabler): void => {
            nyFane.close();
            visGlobalAlert({
                title: 'Kunne ikke åpne dokumentet',
                message: hentFeilmelding(error) ?? 'Prøv igjen senere.',
                status: 'error',
            });
        },
    });

    return (dokument: Dokumentreferanse): void => {
        const nyFane = window.open('', '_blank');
        if (!nyFane) {
            visGlobalAlert({
                title: 'Kunne ikke åpne dokumentet i ny fane',
                message: 'Sjekk at nettleseren tillater popup-vinduer for denne siden.',
                status: 'error',
            });
            return;
        }
        mutate({ ...dokument, nyFane });
    };
};
