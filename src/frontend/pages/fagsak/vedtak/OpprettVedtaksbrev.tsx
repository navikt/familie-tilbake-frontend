import type { VedtaksbrevFormData } from './schema';
import type { FieldPath } from 'react-hook-form';
import type { PakrevdBegrunnelse, RotElement } from '~/generated-new';

import {
    Button,
    Heading,
    HStack,
    InlineMessage,
    Pagination,
    Skeleton,
    Tag,
    Textarea,
    type TextareaProps,
    VStack,
} from '@navikt/ds-react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import * as React from 'react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';
import {
    behandlingHentVedtaksbrevOptions,
    vedtaksbrevLagSvgVedtaksbrevMutation,
} from '~/generated-new/@tanstack/react-query.gen';
import { ActionBar } from '~/komponenter/action-bar/ActionBar';
import { formatterDatoDDMMYYYY } from '~/utils/dateUtils';
import { fraIsoStringTilDatoOgKlokkeslett } from '~/utils/dato';
import { useStegNavigering } from '~/utils/sider';

import { elementArrayTilTekst, tekstTilElementArray } from './utils';

const ElementTextarea: React.FC<
    Omit<TextareaProps, 'onChange' | 'value'> & {
        name: FieldPath<VedtaksbrevFormData>;
    }
> = ({ name, ...props }) => {
    const { setValue } = useFormContext<VedtaksbrevFormData>();
    const value = useWatch<VedtaksbrevFormData>({ name });

    return (
        <Textarea
            {...props}
            name={name}
            value={elementArrayTilTekst(value as RotElement[])}
            onChange={e => setValue(name, tekstTilElementArray(e.target.value) as never)}
            size="small"
            maxLength={3000}
            minRows={3}
            resize
        />
    );
};

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

export const OpprettVedtaksbrev: React.FC = () => {
    const queryClient = useQueryClient();
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst } = useBehandlingState();
    const navigerTilForrige = useStegNavigering('VILKÅRSVURDERING');
    const { data: vedtaksbrevData } = useSuspenseQuery(
        behandlingHentVedtaksbrevOptions({ path: { behandlingId } })
    );

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
        <>
            <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
                <VStack className="col-span-1 flex-1 min-h-0 gap-6">
                    <HStack className="flex justify-between">
                        <Heading size="small">Lag vedtaksbrev</Heading>
                        {!vedtaksbrevData.sendtDato ? (
                            <Tag data-color="success" size="small" variant="moderate">
                                Sendt: {formatterDatoDDMMYYYY(new Date(vedtaksbrevData.sendtDato))}
                            </Tag>
                        ) : (
                            <Tag data-color="info" size="small" variant="moderate">
                                Oppdatert:{' '}
                                {fraIsoStringTilDatoOgKlokkeslett(vedtaksbrevData.sistOppdatert)}
                            </Tag>
                        )}
                    </HStack>

                    <FormProvider {...methods}>
                        <ElementTextarea
                            name="hovedavsnitt.underavsnitt"
                            label={methods.getValues('hovedavsnitt').tittel}
                        />
                        {methods.getValues('avsnitt').map((avsnitt, index) => (
                            <Avsnitt key={avsnitt.id} avsnitt={avsnitt} avsnittIndex={index} />
                        ))}
                    </FormProvider>
                </VStack>

                <div className="col-span-1 sticky top-0 self-start border rounded-xl border-ax-border-neutral-subtle">
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
                                    midlertidig problem. Prøv å laste siden på nytt, eller prøv
                                    igjen om litt.
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
                </div>
            </div>
            <ActionBar
                stegtekst={actionBarStegtekst('FORESLÅ_VEDTAK')}
                nesteTekst="Send til godkjenning"
                forrigeAriaLabel="Gå tilbake til vilkårsvurderingssteget"
                nesteAriaLabel="Send til godkjenning hos beslutter"
                onNeste={() => {
                    // TODO: Implementer send til godkjenning
                }}
                onForrige={navigerTilForrige}
            />
        </>
    );
};

const Avsnitt: React.FC<{
    avsnitt: VedtaksbrevFormData['avsnitt'][number];
    avsnittIndex: number;
}> = ({ avsnitt, avsnittIndex }) => {
    const name = `avsnitt.${avsnittIndex}.underavsnitt` as FieldPath<VedtaksbrevFormData>;
    const { setValue } = useFormContext<VedtaksbrevFormData>();
    const value = useWatch<VedtaksbrevFormData>({ name }) as RotElement[];
    const rentekstTekst = elementArrayTilTekst(value);

    return (
        <>
            <Textarea
                name={name}
                label={avsnitt.tittel}
                value={rentekstTekst}
                onChange={e => {
                    const nyeRentekst = tekstTilElementArray(e.target.value);
                    const andreElementer = value.filter(({ type }) => type !== 'rentekst');
                    setValue(name, [...nyeRentekst, ...andreElementer] as never);
                }}
                size="small"
                maxLength={3000}
                minRows={3}
                resize
            />

            {avsnitt.underavsnitt.map((element, elementIndex) => {
                if (element.type !== 'påkrevd_begrunnelse') return null;
                const påkrevdBegrunnelse = element as PakrevdBegrunnelse;
                return (
                    <ElementTextarea
                        key={påkrevdBegrunnelse.tittel}
                        name={`avsnitt.${avsnittIndex}.underavsnitt.${elementIndex}.underavsnitt`}
                        label={påkrevdBegrunnelse.tittel}
                        description={påkrevdBegrunnelse.forklaring}
                    />
                );
            })}
        </>
    );
};
