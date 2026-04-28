import type { VedtaksbrevFormData } from './schema';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { VedtaksbrevData, VedtaksbrevDataWritable } from '~/generated-new';

import {
    Button,
    Heading,
    HStack,
    InlineMessage,
    Pagination,
    Skeleton,
    Tag,
    VStack,
} from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classNames from 'classnames';
import { Suspense, useEffect, useEffectEvent, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useBehandling } from '~/context/BehandlingContext';
import {
    behandlingOppdaterVedtaksbrevMutation,
    vedtaksbrevLagSvgVedtaksbrevMutation,
} from '~/generated-new/@tanstack/react-query.gen';
import { fraIsoStringTilDatoOgKlokkeslett } from '~/utils/dato';

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

export const Vedtaksbrev: FC<Props> = ({ vedtaksbrevData, onSubmit }) => {
    const { behandlingId } = useBehandling();
    const queryClient = useQueryClient();

    const methods = useForm<VedtaksbrevFormData>({
        resolver: vedtaksbrevResolver,
        mode: 'onSubmit',
        values: tilFormData(vedtaksbrevData),
    });

    const [pdfSider, setPdfSider] = useState<string[]>([]);
    const [gjeldendeSide, setGjeldendeSide] = useState(1);

    const { onMutate, ...originalMutation } = vedtaksbrevLagSvgVedtaksbrevMutation({
        baseURL: window.location.origin,
    });

    const forhåndsvisningMutation = useMutation({
        mutationKey: ['lagPdf'],
        ...originalMutation,
        onSuccess: async data => {
            const blob = data as Blob;
            const tekst = await blob.text();
            const respons = JSON.parse(tekst) as { page_count: number; pages: string[] };
            const siderSomBase64 = respons.pages.map(
                svg => `data:image/svg+xml;base64,${btoa(svg)}`
            );
            setPdfSider(siderSomBase64);
        },
        onMutate: async (variables, context) => {
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

    useEffect(() => {
        forhåndsvisBrev(vedtaksbrevData);
    }, [vedtaksbrevData]);

    const harDataEllerFeil = pdfSider.length > 0 || forhåndsvisningMutation.isError;

    return (
        <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
            <section className="col-span-1 flex-1 min-h-0 flex flex-col gap-6">
                <HStack className="flex justify-between">
                    <Heading size="small">Lag vedtaksbrev</Heading>
                    {/* {vedtaksbrevData.sendtDato ? ( TODO: Legg til korrekt dato verdi her.
                        <Tag data-color="success" size="small" variant="moderate">
                            Sendt: {formatterDatoDDMMYYYY(new Date(vedtaksbrevData.sendtDato))}
                        </Tag>
                    ) : ( */}
                    <Tag data-color="info" size="small" variant="moderate">
                        Oppdatert: {fraIsoStringTilDatoOgKlokkeslett(vedtaksbrevData.sistOppdatert)}
                    </Tag>
                    {/* )} */}
                </HStack>

                <FormProvider {...methods}>
                    <VedtaksbrevSkjema vedtaksbrevData={vedtaksbrevData} onSubmit={onSubmit} />
                </FormProvider>
            </section>

            {harDataEllerFeil && (
                <Suspense
                    fallback={
                        <Skeleton
                            variant="rounded"
                            className="aspect-[1/1.414] w-full max-w-md"
                            height={600}
                        />
                    }
                >
                    <section
                        className={classNames(
                            'col-span-1 sticky top-0 self-start border rounded-xl border-ax-border-neutral-subtle flex flex-col',
                            {
                                /* Må trekke fra høyden på alt annet enn den hvite boksen for å gi den en korrekt høyde */
                                'h-[calc(100vh-17.8rem)] overflow-hidden':
                                    forhåndsvisningMutation.isError,
                            }
                        )}
                    >
                        {pdfSider.length > 0 && !forhåndsvisningMutation.isError && (
                            <HStack
                                justify="center"
                                align="center"
                                className="p-2 border-t border-ax-border-neutral-subtle gap-4 rounded-xl"
                            >
                                <Pagination
                                    page={gjeldendeSide}
                                    count={pdfSider.length}
                                    size="small"
                                    onPageChange={setGjeldendeSide}
                                />
                            </HStack>
                        )}
                        <div
                            className={classNames(
                                'flex-1 flex justify-center overflow-auto rounded-b-xl',
                                forhåndsvisningMutation.isError ? 'items-center' : 'items-start',
                                {
                                    'border-t border-ax-border-neutral-subtle':
                                        !forhåndsvisningMutation.isError,
                                }
                            )}
                        >
                            {forhåndsvisningMutation.isError && (
                                <VStack
                                    gap="space-16"
                                    padding="space-16"
                                    className="flex justify-center items-center h-full"
                                >
                                    <InlineMessage size="small" status="error">
                                        Kunne ikke laste inn forhåndsvisningen av vedtaksbrevet.
                                        Dette kan være et midlertidig problem. Prøv å laste siden på
                                        nytt, eller prøv igjen om litt.
                                    </InlineMessage>

                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => {
                                            forhåndsvisningMutation.reset();
                                            debouncedUpdate();
                                        }}
                                    >
                                        Last inn på nytt
                                    </Button>
                                </VStack>
                            )}
                            {pdfSider.length > 0 && !forhåndsvisningMutation.isError && (
                                <img
                                    className="max-w-full max-h-full object-contain"
                                    alt={`Forhåndsvisning av vedtaksbrev, side ${gjeldendeSide}`}
                                    src={pdfSider[gjeldendeSide - 1]}
                                />
                            )}
                        </div>
                    </section>
                </Suspense>
            )}
        </div>
    );
};
