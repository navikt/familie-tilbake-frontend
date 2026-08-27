import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type {
    BrevLagSvgVedtaksbrevData,
    Options,
    VedtaksbrevData,
    VedtaksbrevDataWritable,
} from '@/generated-new';
import type { VedtaksbrevFormData } from './schema';

import {
    BodyShort,
    Button,
    Heading,
    HStack,
    InlineMessage,
    Link,
    Pagination,
    Skeleton,
    Tag,
    VStack,
} from '@navikt/ds-react';
import {
    type MutationFunctionContext,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { Suspense, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import {
    behandlingHentDokumentInfoOptions,
    behandlingHentDokumentOptions,
    behandlingOppdaterVedtaksbrevMutation,
    brevLagSvgVedtaksbrevMutation,
} from '@/generated-new/@tanstack/react-query.gen';
import { fraIsoStringTilDatoOgKlokkeslett } from '@/utils/dato';

import { vedtaksbrevResolver } from './schema';
import {
    tilFormData,
    tilVedtaksbrevDataWritable,
    tilVedtaksbrevRedigerbareDataUpdate,
} from './utils';
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

export const VEDTAKSBREV_FORM_ID = 'vedtaksbrev-skjema';

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

    const { data: dokumentInfo } = useQuery({
        ...behandlingHentDokumentInfoOptions({
            path: { behandlingId, dokumentType: 'VEDTAKSBREV' },
        }),
        enabled: behandlingILesemodus,
    });

    const journalpostId = dokumentInfo?.journalpostId ?? undefined;
    const dokumentId = dokumentInfo?.dokumentId ?? undefined;
    const harSendtBrev = !!journalpostId && !!dokumentId;
    const venterPåDokumentInfo = behandlingILesemodus && dokumentInfo === undefined;

    const { data: sendtDokument } = useQuery({
        ...behandlingHentDokumentOptions({
            path: {
                behandlingId,
                journalpostId: journalpostId ?? '',
                dokumentInfoId: dokumentId ?? '',
            },
        }),
        enabled: harSendtBrev,
    });

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

    const skalViseForhåndsvisning = !harSendtBrev && !venterPåDokumentInfo;

    useEffect(() => {
        if (!skalViseForhåndsvisning) return;
        forhåndsvisBrev(vedtaksbrevData);
    }, [vedtaksbrevData, skalViseForhåndsvisning]);

    const harDataEllerFeil = pdfSider.length > 0 || forhåndsvisningMutation.isError;

    if (harSendtBrev || venterPåDokumentInfo) {
        return <SendtVedtaksbrev sendtBrevUrl={sendtBrevUrl} />;
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

const ForhåndsvisningSkjelett: FC = () => (
    <Skeleton variant="rounded" className="aspect-[1/1.414] w-full max-w-md" height={600} />
);

type SendtVedtaksbrevProps = {
    sendtBrevUrl: string | null;
};

const SendtVedtaksbrev: FC<SendtVedtaksbrevProps> = ({ sendtBrevUrl }: SendtVedtaksbrevProps) => (
    <section className="sticky top-0 w-full border rounded-xl border-ax-border-brand-blue-subtle flex flex-col h-[calc(100vh-17.8rem)] overflow-hidden">
        {sendtBrevUrl ? (
            <object
                className="h-full w-full rounded-xl"
                data={sendtBrevUrl}
                type="application/pdf"
                aria-label="Sendt vedtaksbrev"
            >
                <VStack
                    gap="space-16"
                    padding="space-16"
                    align="center"
                    justify="center"
                    className="h-full"
                >
                    <BodyShort>Kunne ikke vise vedtaksbrevet her.</BodyShort>
                    <Link href={sendtBrevUrl} target="_blank" rel="noopener noreferrer">
                        Åpne vedtaksbrevet i ny fane
                    </Link>
                </VStack>
            </object>
        ) : (
            <Skeleton variant="rounded" className="h-full w-full" />
        )}
    </section>
);

type ForhåndsvisningProps = {
    pdfSider: string[];
    gjeldendeSide: number;
    onSideEndring: (side: number) => void;
    erFeil: boolean;
    onLastInnPåNytt: () => void;
};

const Forhåndsvisning: FC<ForhåndsvisningProps> = ({
    pdfSider,
    gjeldendeSide,
    onSideEndring,
    erFeil,
    onLastInnPåNytt,
}: ForhåndsvisningProps) => (
    <Suspense fallback={<ForhåndsvisningSkjelett />}>
        <section
            className={
                /* Må trekke fra høyden på alt annet enn den hvite boksen for å gi den en korrekt høyde */
                `col-span-1 sticky top-0 self-start border rounded-xl border-ax-border-brand-blue-subtle flex flex-col ${erFeil ? 'h-[calc(100vh-17.8rem)] overflow-hidden' : ''}`
            }
        >
            {pdfSider.length > 0 && !erFeil && (
                <HStack
                    justify="center"
                    align="center"
                    className="p-2 border-t border-ax-border-brand-blue-subtle gap-4 rounded-xl"
                >
                    <Pagination
                        page={gjeldendeSide}
                        count={pdfSider.length}
                        size="small"
                        onPageChange={onSideEndring}
                    />
                </HStack>
            )}
            <div
                className={`flex-1 flex justify-center overflow-auto rounded-b-xl ${erFeil ? 'items-center' : 'items-start'} ${
                    !erFeil ? 'border-t border-ax-border-brand-blue-subtle' : ''
                }`}
            >
                {erFeil && (
                    <VStack
                        gap="space-16"
                        padding="space-16"
                        className="flex justify-center items-center h-full"
                    >
                        <InlineMessage size="small" status="error">
                            Kunne ikke laste inn forhåndsvisningen av vedtaksbrevet. Dette kan være
                            et midlertidig problem. Prøv å laste siden på nytt, eller prøv igjen om
                            litt.
                        </InlineMessage>

                        <Button variant="secondary" size="small" onClick={onLastInnPåNytt}>
                            Last inn på nytt
                        </Button>
                    </VStack>
                )}
                {pdfSider.length > 0 && !erFeil && (
                    <img
                        className="max-w-full max-h-full object-contain"
                        alt={`Forhåndsvisning av vedtaksbrev, side ${gjeldendeSide}`}
                        src={pdfSider[gjeldendeSide - 1]}
                    />
                )}
            </div>
        </section>
    </Suspense>
);
