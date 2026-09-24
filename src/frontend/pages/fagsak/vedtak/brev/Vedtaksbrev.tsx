import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type {
    BrevLagSvgVedtaksbrevData,
    Options,
    VedtaksbrevData,
    VedtaksbrevDataWritable,
} from '@/generated-new';
import type { VedtaksbrevFormData } from './schema';

import { Heading, HStack, Tag } from '@navikt/ds-react';
import {
    type MutationFunctionContext,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import {
    behandlingHentDokumentInfoOptions,
    behandlingHentDokumentOptions,
    behandlingOppdaterVedtaksbrevMutation,
    brevLagSvgVedtaksbrevMutation,
} from '@/generated-new/@tanstack/react-query.gen';
import { lesFeilmeldingFraBlob } from '@/utils/blobFeilmelding';
import { fraIsoStringTilDatoOgKlokkeslett } from '@/utils/dato';

import { Forhåndsvisning } from './Forhåndsvisning';
import {
    tilFormData,
    tilVedtaksbrevDataWritable,
    tilVedtaksbrevRedigerbareDataUpdate,
} from './mapping';
import { SendtVedtaksbrev } from './SendtVedtaksbrev';
import { vedtaksbrevResolver } from './schema';
import { VedtaksbrevSkjema } from './VedtaksbrevSkjema';

const useDebounce = (updateFunction: () => Promise<void> | void): (() => void) => {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    return (): void => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            updateFunction();
            timeoutRef.current = null;
        }, 500);
    };
};

type Props = {
    vedtaksbrevData: VedtaksbrevData;
    onSubmit: SubmitHandler<VedtaksbrevFormData>;
};

export const Vedtaksbrev: FC<Props> = ({ vedtaksbrevData, onSubmit }: Props) => {
    const { behandlingId } = useBehandling();
    const { behandlingILesemodus } = useBehandlingState();
    const queryClient = useQueryClient();

    const methods = useForm<VedtaksbrevFormData>({
        resolver: vedtaksbrevResolver,
        mode: 'onSubmit',
        values: tilFormData(vedtaksbrevData),
    });

    const [pdfSider, setPdfSider] = useState<string[]>([]);
    const [gjeldendeSide, setGjeldendeSide] = useState(1);

    const { data: dokumentInfo, error: dokumentInfoFeil } = useQuery({
        ...behandlingHentDokumentInfoOptions({
            path: { behandlingId, dokumentType: 'VEDTAKSBREV' },
        }),
        enabled: behandlingILesemodus,
        retry: false,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const journalpostId = dokumentInfo?.journalpostId ?? undefined;
    const dokumentId = dokumentInfo?.dokumentId ?? undefined;
    const harSendtBrev = !!journalpostId && !!dokumentId;
    const dokumentInfoHarFeilet =
        behandlingILesemodus && dokumentInfo === undefined && !!dokumentInfoFeil;
    const venterPåDokumentInfo =
        behandlingILesemodus && dokumentInfo === undefined && !dokumentInfoFeil;

    const { data: sendtDokument, error: sendtDokumentFeil } = useQuery({
        ...behandlingHentDokumentOptions({
            path: {
                behandlingId,
                journalpostId: journalpostId ?? '',
                dokumentInfoId: dokumentId ?? '',
            },
        }),
        enabled: harSendtBrev,
        retry: false,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    const [sendtDokumentFeilmelding, setSendtDokumentFeilmelding] = useState<string | undefined>();

    useEffect(() => {
        if (dokumentInfoHarFeilet) {
            setSendtDokumentFeilmelding(
                dokumentInfoFeil?.response?.data?.melding ?? 'Prøv igjen senere.'
            );
            return;
        }
        if (!sendtDokumentFeil) {
            setSendtDokumentFeilmelding(undefined);
            return;
        }
        let avbrutt = false;
        lesFeilmeldingFraBlob(sendtDokumentFeil).then(feil => {
            if (!avbrutt) {
                setSendtDokumentFeilmelding(feil?.melding ?? 'Prøv igjen senere.');
            }
        });
        return (): void => {
            avbrutt = true;
        };
    }, [sendtDokumentFeil, dokumentInfoHarFeilet, dokumentInfoFeil]);

    const sendtBrevUrl = useMemo(() => {
        if (!sendtDokument) return null;
        return URL.createObjectURL(new Blob([sendtDokument], { type: 'application/pdf' }));
    }, [sendtDokument]);

    useEffect(() => {
        return (): void => {
            if (sendtBrevUrl) URL.revokeObjectURL(sendtBrevUrl);
        };
    }, [sendtBrevUrl]);

    const { onMutate, ...originalMutation } = brevLagSvgVedtaksbrevMutation({
        baseURL: window.location.origin,
    });

    const forhåndsvisningMutation = useMutation({
        mutationKey: ['lagPdf'],
        ...originalMutation,
        onSuccess: async (data: Blob | File) => {
            const blob = data as Blob;
            const tekst = await blob.text();
            const respons = JSON.parse(tekst) as { page_count: number; pages: string[] };
            const siderSomBase64 = respons.pages.map(
                svg => `data:image/svg+xml;base64,${btoa(svg)}`
            );
            setPdfSider(siderSomBase64);
        },
        onMutate: async (
            variables: Options<BrevLagSvgVedtaksbrevData>,
            context: MutationFunctionContext
        ) => {
            await queryClient.cancelQueries({ queryKey: ['lagPdf'] });
            onMutate?.(variables, context);
        },
    });

    const oppdaterVedtaksbrevMutation = useMutation({
        mutationKey: ['oppdaterVedtaksbrev'],
        ...behandlingOppdaterVedtaksbrevMutation(),
    });

    const oppdaterForhåndsvisning = (data: VedtaksbrevDataWritable): void =>
        forhåndsvisningMutation.mutate({
            body: data,
        });

    const debouncedUpdate = useDebounce(() => {
        const formData = methods.getValues();
        oppdaterForhåndsvisning(tilVedtaksbrevDataWritable(vedtaksbrevData, formData));
        oppdaterVedtaksbrevMutation.mutate({
            path: { behandlingId },
            body: tilVedtaksbrevRedigerbareDataUpdate(vedtaksbrevData, formData),
        });
    });
    useEffect(() => {
        return methods.subscribe({
            formState: {
                values: true,
            },
            callback: () => {
                debouncedUpdate();
            },
        });
    }, [debouncedUpdate, methods]);

    const forhåndsvisBrev = useEffectEvent((vedtaksbrevData: VedtaksbrevData) => {
        oppdaterForhåndsvisning(vedtaksbrevData);
    });

    const skalViseForhåndsvisning =
        !harSendtBrev && !venterPåDokumentInfo && !dokumentInfoHarFeilet;

    useEffect(() => {
        if (!skalViseForhåndsvisning) return;
        forhåndsvisBrev(vedtaksbrevData);
    }, [vedtaksbrevData, skalViseForhåndsvisning]);

    const harDataEllerFeil = pdfSider.length > 0 || forhåndsvisningMutation.isError;

    if (harSendtBrev || venterPåDokumentInfo || dokumentInfoHarFeilet) {
        return (
            <SendtVedtaksbrev
                sendtBrevUrl={sendtBrevUrl}
                feilmelding={sendtDokumentFeilmelding}
                erFeil={!!sendtDokumentFeil || dokumentInfoHarFeilet}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
            <section className="col-span-1 flex-1 min-h-0 flex flex-col gap-6">
                <HStack className="flex justify-between">
                    <Heading size="small">Lag vedtaksbrev</Heading>
                    <Tag data-color="info" size="small" variant="moderate">
                        Oppdatert: {fraIsoStringTilDatoOgKlokkeslett(vedtaksbrevData.sistOppdatert)}
                    </Tag>
                </HStack>

                <FormProvider {...methods}>
                    <VedtaksbrevSkjema vedtaksbrevData={vedtaksbrevData} onSubmit={onSubmit} />
                </FormProvider>
            </section>

            {harDataEllerFeil && (
                <Forhåndsvisning
                    pdfSider={pdfSider}
                    gjeldendeSide={gjeldendeSide}
                    onSideEndring={setGjeldendeSide}
                    erFeil={forhåndsvisningMutation.isError}
                    onLastInnPåNytt={(): void => {
                        forhåndsvisningMutation.reset();
                        debouncedUpdate();
                    }}
                />
            )}
        </div>
    );
};
