import type { ForhåndsvarselFormData, UttalelseFormData } from './schema';
import type {
    BestillBrevDto,
    BrukeruttalelseDto,
    BestillBrevData,
    Options,
    BestillBrevResponse,
    LagreBrukeruttalelseData,
    LagreBrukeruttalelseResponse,
    UtsettUttalelseFristData,
    UtsettUttalelseFristResponse,
    ForhåndsvisBrevData,
    ForhåndsvisBrevResponse,
    ForhåndsvarselUnntakDto,
    ForhåndsvarselUnntakData,
    ForhåndsvarselUnntakResponse,
} from '@generated';
import type { DefaultError, UseMutationResult } from '@tanstack/react-query';
import type { Ressurs } from '@typer/ressurs';
import type { AxiosError } from 'axios';

import { Feil } from '@api/feil';
import { useBehandling } from '@context/BehandlingContext';
import {
    bestillBrevMutation,
    forhåndsvisBrevMutation,
    lagreBrukeruttalelseMutation,
    utsettUttalelseFristMutation,
    forhåndsvarselUnntakMutation,
    hentBehandlingQueryKey,
} from '@generated/@tanstack/react-query.gen';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useStegNavigering } from '@utils/sider';

import { HarUttaltSeg, SkalSendesForhåndsvarsel } from './schema';

export type UseForhåndsvarselMutationsReturn = {
    readonly sendForhåndsvarselMutation: UseMutationResult<
        BestillBrevResponse,
        AxiosError<DefaultError>,
        Options<BestillBrevData>
    >;
    readonly sendBrukeruttalelseMutation: UseMutationResult<
        LagreBrukeruttalelseResponse,
        AxiosError<DefaultError>,
        Options<LagreBrukeruttalelseData>
    >;
    readonly sendUtsettUttalelseFristMutation: UseMutationResult<
        UtsettUttalelseFristResponse,
        AxiosError<DefaultError>,
        Options<UtsettUttalelseFristData>
    >;
    readonly forhåndsvisning: UseMutationResult<
        ForhåndsvisBrevResponse,
        AxiosError<DefaultError>,
        Options<ForhåndsvisBrevData>
    >;
    readonly sendUnntakMutation: UseMutationResult<
        ForhåndsvarselUnntakResponse,
        AxiosError<DefaultError>,
        Options<ForhåndsvarselUnntakData>
    >;
    readonly sendForhåndsvarsel: (formData: ForhåndsvarselFormData) => void;
    readonly sendBrukeruttalelse: (formData: UttalelseFormData) => void;
    readonly sendUnntak: (formData: ForhåndsvarselFormData) => void;
    readonly sendUtsettUttalelseFrist: (formData: UttalelseFormData) => void;
    readonly seForhåndsvisning: (fritekst: string) => void;
    readonly navigerTilNeste: () => void;
    readonly navigerTilForrige: () => void;
};

const brukerUttalelsePayload = (formData: UttalelseFormData): BrukeruttalelseDto | undefined => {
    if (formData.harUttaltSeg === HarUttaltSeg.Ja && 'uttalelsesDetaljer' in formData) {
        return {
            harBrukerUttaltSeg: 'JA',
            uttalelsesdetaljer: formData.uttalelsesDetaljer,
        };
    }

    if (formData.harUttaltSeg === HarUttaltSeg.Nei && 'kommentar' in formData) {
        return {
            harBrukerUttaltSeg: 'NEI',
            kommentar: formData.kommentar,
        };
    }

    return undefined;
};

export const extractErrorFromMutationError = (error: unknown): Feil => {
    const axiosError = error as AxiosError<Ressurs<unknown>>;
    const responseData = axiosError.response?.data;

    const frontendFeilmelding =
        responseData &&
        'frontendFeilmelding' in responseData &&
        typeof responseData.frontendFeilmelding === 'string'
            ? responseData.frontendFeilmelding
            : (axiosError.message ?? 'Ukjent feil');

    return new Feil(frontendFeilmelding, axiosError.response?.status ?? 500);
};

export const useForhåndsvarselMutations = (
    onForhåndsvarselSent?: () => void
): UseForhåndsvarselMutationsReturn => {
    const { behandlingId } = useBehandling();

    const navigerTilNeste = useStegNavigering('FORELDELSE');
    const navigerTilForrige = useStegNavigering('FAKTA');

    const queryClient = useQueryClient();
    const invalidateQueries = async (): Promise<void> => {
        await queryClient.invalidateQueries({
            queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
        });
        await queryClient.invalidateQueries({
            queryKey: ['hentForhåndsvarselInfo', behandlingId],
        });
    };

    const sendForhåndsvarselMutation = useMutation({
        ...bestillBrevMutation(),
        onSuccess: async () => {
            await invalidateQueries();
            if (onForhåndsvarselSent) {
                onForhåndsvarselSent();
            }
        },
    });

    const sendBrukeruttalelseMutation = useMutation({
        ...lagreBrukeruttalelseMutation(),
        onSuccess: async () => {
            await invalidateQueries();
            navigerTilNeste();
        },
    });

    const sendUtsettUttalelseFristMutation = useMutation({
        ...utsettUttalelseFristMutation(),
        onSuccess: async () => {
            await invalidateQueries();
            navigerTilNeste();
        },
    });

    const seForhåndsvisningMutation = useMutation({
        ...forhåndsvisBrevMutation(),
    });

    const sendUnntakMutation = useMutation({
        ...forhåndsvarselUnntakMutation(),
        onSuccess: async () => {
            await invalidateQueries();
            navigerTilNeste();
        },
    });

    return {
        sendForhåndsvarselMutation,
        sendBrukeruttalelseMutation,
        sendUtsettUttalelseFristMutation,
        sendUnntakMutation,
        forhåndsvisning: seForhåndsvisningMutation,

        sendForhåndsvarsel: (formData: ForhåndsvarselFormData): void => {
            if (formData.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.Ja) return;

            const payload: BestillBrevDto = {
                behandlingId: behandlingId,
                brevmalkode: 'VARSEL',
                fritekst: formData.fritekst,
            };

            sendForhåndsvarselMutation.mutate({
                body: payload,
            });
        },
        sendBrukeruttalelse: (formData: UttalelseFormData): void => {
            const payload = brukerUttalelsePayload(formData);
            if (!payload) return;
            sendBrukeruttalelseMutation.mutate({
                path: {
                    behandlingId: behandlingId,
                },
                body: payload,
            });
        },
        sendUnntak: (formData: ForhåndsvarselFormData): void => {
            if (
                formData.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.Nei ||
                formData.begrunnelseForUnntak === undefined
            )
                return;

            const payload: ForhåndsvarselUnntakDto = {
                begrunnelseForUnntak: formData.begrunnelseForUnntak,
                beskrivelse: formData.beskrivelse,
            };

            sendUnntakMutation.mutate({
                path: {
                    behandlingId: behandlingId,
                },
                body: payload,
            });
        },
        sendUtsettUttalelseFrist: (/* formData: ForhåndsvarselFormData */): void => {
            // if (
            //     formData.skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Sendt &&
            //     formData.harBrukerUttaltSeg.harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist
            // ) {
            //     const payload: FristUtsettelseDto = {
            //         nyFrist: formData.harBrukerUttaltSeg.utsettUttalelseFrist.nyFrist,
            //         begrunnelse: formData.harBrukerUttaltSeg.utsettUttalelseFrist.begrunnelse,
            //     };
            //     sendUtsettUttalelseFristMutation.mutate({
            //         path: { behandlingId: behandlingId },
            //         body: payload,
            //     });
            // }
        },
        seForhåndsvisning: (fritekst: string): void => {
            seForhåndsvisningMutation.mutate({
                path: {
                    behandlingId: behandlingId,
                },
                body: {
                    behandlingId: behandlingId,
                    brevmalkode: 'VARSEL',
                    fritekst: fritekst || '',
                },
            });
        },
        navigerTilNeste,
        navigerTilForrige,
    };
};
