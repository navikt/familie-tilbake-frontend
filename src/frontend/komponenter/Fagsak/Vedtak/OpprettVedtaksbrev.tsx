import type { Avsnitt, VedtaksbrevData } from '../../../generated-new';

import {
    BodyShort,
    Button,
    ExpansionCard,
    Heading,
    HStack,
    InlineMessage,
    Pagination,
    Skeleton,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { vedtaksbrevDefaultValues } from './schema';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { vedtaksbrevLagSvgVedtaksbrevMutation } from '../../../generated-new/@tanstack/react-query.gen';
import { Behandlingssteg } from '../../../typer/behandling';
import { useStegNavigering } from '../../../utils/sider';
import { ActionBar } from '../ActionBar/ActionBar';

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

const OpprettVedtaksbrev: React.FC = () => {
    const queryClient = useQueryClient();
    const { actionBarStegtekst } = useBehandlingState();
    const navigerTilForrige = useStegNavigering(Behandlingssteg.Vilkårsvurdering);
    const methods = useForm<VedtaksbrevData>({
        defaultValues: vedtaksbrevDefaultValues,
    });
    const [pdfSider, setPdfSider] = useState<string[]>([]);
    const [gjeldendeSide, settGjeldendeSide] = useState(1);
    const { onMutate, ...originalMutation } = vedtaksbrevLagSvgVedtaksbrevMutation({
        baseURL: 'http://localhost:4000/pdf',
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
    methods.watch(() => debouncedUpdate());

    const sendInnSkjemaVedFørsteRendering = useEffectEvent(() => sendInnSkjemaData());
    useEffect(() => {
        sendInnSkjemaVedFørsteRendering();
    }, []);

    return (
        <>
            <div className="grid grid-cols-1 ax-md:grid-cols-2 gap-4">
                <VStack className="col-span-1 overflow-auto flex-1 min-h-0 gap-4">
                    <Heading size="small">Opprett vedtaksbrev</Heading>
                    <FormProvider {...methods}>
                        <Textarea
                            label="Brevets innledning"
                            size="small"
                            minRows={3}
                            {...methods.register('hovedavsnitt.underavsnitt.0.tekst')}
                        />
                        {methods.getValues('avsnitt').map((avsnitt, index) => (
                            <PeriodeAvsnittSkjema
                                key={`${avsnitt}-${index}`}
                                avsnitt={avsnitt}
                                indeks={index}
                            />
                        ))}
                    </FormProvider>
                </VStack>

                <div className="col-span-1 sticky top-0 self-start border rounded-xl border-ax-border-neutral-subtle">
                    {pdfSider.length > 0 && (
                        <HStack
                            justify="center"
                            align="center"
                            className="p-2 border-t border-ax-border-neutral-subtle gap-4 rounded-xl "
                        >
                            <Pagination
                                page={gjeldendeSide}
                                count={pdfSider.length}
                                size="small"
                                onPageChange={settGjeldendeSide}
                            />
                        </HStack>
                    )}
                    <div className="flex-1 flex items-start justify-center overflow-auto rounded-b-xl border-t border-ax-border-neutral-subtle">
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
                stegtekst={actionBarStegtekst(Behandlingssteg.ForeslåVedtak)}
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

// TODO få fra periode.dato senere
const formaterPeriodeTittel = (tittel: string): string => {
    const match = tittel.match(/fra og med (.+) til og med (.+)/i);
    if (match) {
        return `${match[1]}–${match[2]}`;
    }
    return tittel;
};

// TODO få info fra periode senere
const harSærligeGrunner = (avsnitt: Avsnitt): boolean => {
    return avsnitt.underavsnitt.some(
        underavsnitt =>
            underavsnitt.type === 'underavsnitt' &&
            underavsnitt.tittel === 'Er det særlige grunner til å redusere beløpet?'
    );
};

type PeriodeAvsnittSkjemaProps = {
    avsnitt: Avsnitt;
    indeks: number;
};

const PeriodeAvsnittSkjema: React.FC<PeriodeAvsnittSkjemaProps> = ({ avsnitt, indeks }) => {
    const { register } = useFormContext<VedtaksbrevData>();
    const [erÅpen, settErÅpen] = useState(false);

    const periodeTittel = formaterPeriodeTittel(avsnitt.tittel);
    const visSærligeGrunner = harSærligeGrunner(avsnitt);

    return (
        <ExpansionCard
            size="small"
            open={erÅpen}
            onToggle={() => settErÅpen(prev => !prev)}
            aria-label={periodeTittel}
        >
            <ExpansionCard.Header className="flex items-center">
                <BodyShort className="font-ax-bold">{periodeTittel}</BodyShort>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <VStack gap="space-24">
                    <Textarea
                        label={avsnitt.tittel}
                        description="Beskriv kort hva som har skjedd i denne perioden"
                        size="small"
                        minRows={3}
                        {...register(`avsnitt.${indeks}.underavsnitt.0.tekst`)}
                    />
                    <Textarea
                        label="Hvordan har vi kommet fram til at du må betale tilbake?"
                        size="small"
                        minRows={3}
                        {...register(`avsnitt.${indeks}.underavsnitt.2.underavsnitt.0.tekst`)}
                    />
                    {visSærligeGrunner && (
                        <Textarea
                            label="Er det særlige grunner til å redusere beløpet?"
                            size="small"
                            minRows={3}
                            {...register(`avsnitt.${indeks}.underavsnitt.3.underavsnitt.0.tekst`)}
                        />
                    )}
                </VStack>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};

export default OpprettVedtaksbrev;
