import type { ForhåndsvarselFormData } from './forhåndsvarselSchema';
import type {
    BehandlingDto,
    FagsakDto,
    BestillBrevDto,
    BrukeruttalelseDto,
    FristUtsettelseDto,
    BestillBrevData,
    Options,
    BestillBrevResponse,
    LagreBrukeruttalelseData,
    LagreBrukeruttalelseResponse,
    UtsettUttalelseFristData,
    UtsettUttalelseFristResponse,
    ForhåndsvisBrevData,
    ForhåndsvisBrevResponse,
} from '../../../generated';
import type { Ressurs } from '../../../typer/ressurs';
import type { DefaultError, UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { HarBrukerUttaltSeg, SkalSendesForhåndsvarsel } from './forhåndsvarselSchema';
import { Feil } from '../../../api/feil';
import { BrevmalkodeEnum, HarBrukerUttaltSegEnum } from '../../../generated';
import {
    bestillBrevMutation,
    forhåndsvisBrevMutation,
    lagreBrukeruttalelseMutation,
    utsettUttalelseFristMutation,
} from '../../../generated/@tanstack/react-query.gen';
import { SYNLIGE_STEG } from '../../../utils/sider';

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
    readonly sendForhåndsvarsel: (formData: ForhåndsvarselFormData) => void;
    readonly sendBrukeruttalelse: (formData: ForhåndsvarselFormData) => void;
    readonly sendUtsettUttalelseFrist: (formData: ForhåndsvarselFormData) => void;
    readonly seForhåndsvisning: (fritekst: string) => void;
    readonly gåTilNeste: () => void;
};

const HarBrukerUttaltSegTilApiDto = {
    [HarBrukerUttaltSeg.Ja]: HarBrukerUttaltSegEnum.JA,
    [HarBrukerUttaltSeg.Nei]: HarBrukerUttaltSegEnum.NEI,
} as const;

const HarBrukerUttaltSegFraApiDto = {
    [HarBrukerUttaltSegEnum.JA]: HarBrukerUttaltSeg.Ja,
    [HarBrukerUttaltSegEnum.NEI]: HarBrukerUttaltSeg.Nei,
} as const;

export const mapHarBrukerUttaltSegFraApiDto = (
    backendVerdi: string | undefined
): HarBrukerUttaltSeg => {
    if (!backendVerdi || !(backendVerdi in HarBrukerUttaltSegFraApiDto)) {
        return HarBrukerUttaltSeg.IkkeValgt;
    }
    return HarBrukerUttaltSegFraApiDto[backendVerdi as keyof typeof HarBrukerUttaltSegFraApiDto];
};

const mapHarBrukerUttaltSegTilApiDto = (
    frontendVerdi: string | undefined
): HarBrukerUttaltSegEnum => {
    return HarBrukerUttaltSegTilApiDto[frontendVerdi as keyof typeof HarBrukerUttaltSegTilApiDto];
};

const brukerUttalelsePayload = (
    formData: ForhåndsvarselFormData
): BrukeruttalelseDto | undefined => {
    if (formData.skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Sendt) {
        const { harBrukerUttaltSeg } = formData.harBrukerUttaltSeg;

        const brukeruttalelseDto: BrukeruttalelseDto = {
            harBrukerUttaltSeg: mapHarBrukerUttaltSegTilApiDto(harBrukerUttaltSeg),
        };

        if (
            harBrukerUttaltSeg === HarBrukerUttaltSeg.Ja &&
            'uttalelsesDetaljer' in formData.harBrukerUttaltSeg
        ) {
            brukeruttalelseDto.uttalelsesdetaljer = formData.harBrukerUttaltSeg.uttalelsesDetaljer;
        }

        if (
            harBrukerUttaltSeg === HarBrukerUttaltSeg.Nei &&
            'kommentar' in formData.harBrukerUttaltSeg
        ) {
            brukeruttalelseDto.kommentar = formData.harBrukerUttaltSeg.kommentar;
        }

        return brukeruttalelseDto;
    }
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
    behandling: BehandlingDto,
    fagsak: FagsakDto,
    onForhåndsvarselSent?: () => void
): UseForhåndsvarselMutationsReturn => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const invalidateQueries = (): void => {
        queryClient.invalidateQueries({
            queryKey: ['hentBehandling', behandling.behandlingId],
        });
        queryClient.invalidateQueries({
            queryKey: ['hentForhåndsvarselInfo', behandling.behandlingId],
        });
    };

    const gåTilNeste = (): void => {
        navigate(
            `/fagsystem/${fagsak.fagsystem}/fagsak/${fagsak.eksternFagsakId}/behandling/${behandling.eksternBrukId}/${SYNLIGE_STEG.FORELDELSE.href}`
        );
    };

    const sendForhåndsvarselMutation = useMutation({
        ...bestillBrevMutation(),
        onSuccess: () => {
            invalidateQueries();
            if (onForhåndsvarselSent) {
                onForhåndsvarselSent();
            }
        },
    });

    const sendBrukeruttalelseMutation = useMutation({
        ...lagreBrukeruttalelseMutation(),
        onSuccess: () => {
            invalidateQueries();
            gåTilNeste();
        },
    });

    const sendUtsettUttalelseFristMutation = useMutation({
        ...utsettUttalelseFristMutation(),
        onSuccess: () => {
            invalidateQueries();
            gåTilNeste();
        },
    });

    const seForhåndsvisningMutation = useMutation({
        ...forhåndsvisBrevMutation(),
    });

    return {
        sendForhåndsvarselMutation,
        sendBrukeruttalelseMutation,
        sendUtsettUttalelseFristMutation,
        forhåndsvisning: seForhåndsvisningMutation,

        sendForhåndsvarsel: (formData: ForhåndsvarselFormData): void => {
            if (formData.skalSendesForhåndsvarsel !== SkalSendesForhåndsvarsel.Ja) return;

            const payload: BestillBrevDto = {
                behandlingId: behandling.behandlingId,
                brevmalkode: BrevmalkodeEnum.VARSEL,
                fritekst: formData.fritekst,
            };

            sendForhåndsvarselMutation.mutate({
                body: payload,
            });
        },
        sendBrukeruttalelse: (formData: ForhåndsvarselFormData): void => {
            const payload = brukerUttalelsePayload(formData);
            if (!payload) return;
            sendBrukeruttalelseMutation.mutate({
                path: {
                    behandlingId: behandling.behandlingId,
                },
                body: payload,
            });
        },
        sendUtsettUttalelseFrist: (formData: ForhåndsvarselFormData): void => {
            if (
                formData.skalSendesForhåndsvarsel === SkalSendesForhåndsvarsel.Sendt &&
                formData.harBrukerUttaltSeg.harBrukerUttaltSeg === HarBrukerUttaltSeg.UtsettFrist
            ) {
                const payload: FristUtsettelseDto = {
                    nyFrist: formData.harBrukerUttaltSeg.utsettUttalelseFrist.nyFrist,
                    begrunnelse: formData.harBrukerUttaltSeg.utsettUttalelseFrist.begrunnelse,
                };

                sendUtsettUttalelseFristMutation.mutate({
                    body: payload,
                });
            }
        },
        seForhåndsvisning: (fritekst: string): void => {
            seForhåndsvisningMutation.mutate({
                body: {
                    behandlingId: behandling.behandlingId,
                    brevmalkode: BrevmalkodeEnum.VARSEL,
                    fritekst,
                },
            });
        },
        gåTilNeste,
    };
};
