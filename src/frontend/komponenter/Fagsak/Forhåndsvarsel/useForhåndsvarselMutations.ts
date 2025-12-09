import type {
    BehandlingDto,
    FagsakDto,
    BestillBrevDto,
    BrukeruttalelseDto,
    FristUtsettelseDto,
    BestillBrevData,
    Options,
    BestillBrevResponse,
    Uttalelsesdetaljer,
    LagreBrukeruttalelseData,
    LagreBrukeruttalelseResponse,
    UtsettUttalelseFristData,
    UtsettUttalelseFristResponse,
    ForhåndsvisBrevData,
    ForhåndsvisBrevResponse,
} from '../../../generated';
import type { DefaultError, UseMutationResult } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { HarBrukerUttaltSeg } from './Enums';
import { BrevmalkodeEnum, HarBrukerUttaltSegEnum } from '../../../generated';
import {
    bestillBrevMutation,
    forhåndsvisBrevMutation,
    lagreBrukeruttalelseMutation,
    utsettUttalelseFristMutation,
} from '../../../generated/@tanstack/react-query.gen';
import { SYNLIGE_STEG } from '../../../utils/sider';

export type ForhåndsvarselFormData = {
    skalSendesForhåndsvarsel: string;
    fritekst: string;
    harBrukerUttaltSeg: HarBrukerUttaltSeg;
    uttalelsesKommentar: string;
    uttalelsesDetaljer: Uttalelsesdetaljer[] | string;
    uttalelsesdato: string;
    hvorBrukerenUttalteSeg: string;
    uttalelseBeskrivelse: string;
    nyFristDato: string;
    begrunnelseUtsattFrist: string;
};

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
    return HarBrukerUttaltSegFraApiDto[backendVerdi as keyof typeof HarBrukerUttaltSegFraApiDto];
};

const mapHarBrukerUttaltSegTilApiDto = (
    frontendVerdi: string | undefined
): HarBrukerUttaltSegEnum => {
    return HarBrukerUttaltSegTilApiDto[frontendVerdi as keyof typeof HarBrukerUttaltSegTilApiDto];
};

const transformFormDataToBrukeruttalelse = (
    formData: ForhåndsvarselFormData
): BrukeruttalelseDto => {
    return {
        ...formData,
        harBrukerUttaltSeg: mapHarBrukerUttaltSegTilApiDto(formData.harBrukerUttaltSeg),
    };
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
            const bestillBrevDto: BestillBrevDto = {
                behandlingId: behandling.behandlingId,
                brevmalkode: BrevmalkodeEnum.VARSEL,
                fritekst: formData.fritekst,
            };

            sendForhåndsvarselMutation.mutate({
                body: bestillBrevDto,
            });
        },
        sendBrukeruttalelse: (formData: ForhåndsvarselFormData): void => {
            const transformedData = transformFormDataToBrukeruttalelse(formData);
            sendBrukeruttalelseMutation.mutate({
                path: {
                    behandlingId: behandling.behandlingId,
                },
                body: transformedData,
            });
        },
        sendUtsettUttalelseFrist: (formData: ForhåndsvarselFormData): void => {
            const fristUtsettelseDto: FristUtsettelseDto = {
                nyFrist: formData.nyFristDato,
                begrunnelse: formData.begrunnelseUtsattFrist,
            };

            sendUtsettUttalelseFristMutation.mutate({
                body: fristUtsettelseDto,
            });
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
