import type { VedtaksbrevFormData } from './schema';
import type { VedtaksbrevData } from '~/generated-new';

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
import * as React from 'react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { vedtaksbrevLagSvgVedtaksbrevMutation } from '~/generated-new/@tanstack/react-query.gen';
// import { formatterDatoDDMMYYYY } from '~/utils/dateUtils';
import { fraIsoStringTilDatoOgKlokkeslett } from '~/utils/dato';

import { VedtaksbrevSkjema } from './VedtaksbrevSkjema';

const useDebounce = (updateFunction: () => void): (() => void) => {
    const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
    return (): void => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(() => {
            updateFunction();
            timeoutId.current = null;
        }, 500);
    };
};

type Props = {
    vedtaksbrevData: VedtaksbrevData;
};

export const Vedtaksbrev: React.FC<Props> = ({ vedtaksbrevData }) => {
    const queryClient = useQueryClient();

    const methods = useForm<VedtaksbrevFormData>({
        defaultValues: vedtaksbrevData,
    });

    const [pdfSider, setPdfSider] = useState<string[]>([]);
    const [gjeldendeSide, settGjeldendeSide] = useState(1);

    const { onMutate, ...originalMutation } = vedtaksbrevLagSvgVedtaksbrevMutation({
        baseURL: window.location.origin,
    });

    const vedtaksbrevMutation = useMutation({
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

    const sendInnSkjemaData = (): void => {
        vedtaksbrevMutation.mutate({
            body: methods.getValues(),
        });
    };

    const debouncedUpdate = useDebounce(() => sendInnSkjemaData());
    // eslint-disable-next-line react-hooks/incompatible-library
    methods.watch(() => debouncedUpdate());

    const sendInnSkjemaVedFørsteRendering = useEffectEvent(() => sendInnSkjemaData());
    useEffect(() => {
        sendInnSkjemaVedFørsteRendering();
    }, []);

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
                    <VedtaksbrevSkjema />
                </FormProvider>
            </section>

            <section className="col-span-1 sticky top-0 self-start border rounded-xl border-ax-border-neutral-subtle">
                {pdfSider.length > 0 && (
                    <HStack
                        justify="center"
                        align="center"
                        className="p-2 border-t border-ax-border-neutral-subtle gap-4 rounded-xl"
                    >
                        <Pagination
                            page={gjeldendeSide}
                            count={pdfSider.length}
                            size="small"
                            onPageChange={settGjeldendeSide}
                        />
                    </HStack>
                )}
                <div
                    className={classNames(
                        'flex-1 flex items-start justify-center overflow-auto rounded-b-xl',
                        {
                            'border-t border-ax-border-neutral-subtle':
                                !vedtaksbrevMutation.isError,
                        }
                    )}
                >
                    {vedtaksbrevMutation.isError ? (
                        <VStack
                            gap="space-16"
                            padding="space-16"
                            className="flex justify-center items-center h-full"
                        >
                            <InlineMessage size="small" status="error">
                                Kunne ikke laste inn forhåndsvisningen. Dette kan være et
                                midlertidig problem. Prøv å laste siden på nytt, eller prøv igjen om
                                litt.
                            </InlineMessage>

                            <Button
                                variant="secondary"
                                size="small"
                                onClick={() => {
                                    vedtaksbrevMutation.reset();
                                    sendInnSkjemaData();
                                }}
                            >
                                Last inn på nytt
                            </Button>
                        </VStack>
                    ) : pdfSider.length > 0 ? (
                        <img
                            className="max-w-full max-h-full object-contain"
                            alt={`Forhåndsvisning av vedtaksbrev, side ${gjeldendeSide}`}
                            src={pdfSider[gjeldendeSide - 1]}
                        />
                    ) : (
                        /* Fikser suspense etter hvert, dette er midlertidig */
                        <Skeleton
                            variant="rounded"
                            className="aspect-[1/1.414] w-full max-w-md"
                            height={600}
                        />
                    )}
                </div>
            </section>
        </div>
    );
};
