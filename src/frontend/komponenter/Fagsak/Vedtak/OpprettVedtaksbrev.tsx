import type { VedtaksbrevData } from '../../../generated-new';

import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading, HStack, Skeleton, Textarea } from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { vedtaksbrevLagSvgVedtaksbrevMutation } from '../../../generated-new/@tanstack/react-query.gen';
import { Behandlingssteg } from '../../../typer/behandling';
import { useStegNavigering } from '../../../utils/sider';
import { ActionBar } from '../ActionBar/ActionBar';

const useDebounce = (updateFunction: () => void): (() => void) => {
    const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
    return (): void => {
        if (timeoutId.current != null) {
            clearInterval(timeoutId.current);
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
        defaultValues: {
            hovedavsnitt: {
                tittel: 'Tilbakekreving av arbeidsavklaringspenger',
                underavsnitt: [
                    {
                        type: 'rentekst',
                        tekst: 'I brev 26. januar 2026 fikk du melding om at barnetrygden din er endret. Endringen førte til at du har fått utbetalt for mye. Du må betale tilbake 3 450 kroner, som er deler av det feilutbetalte beløpet.',
                    },
                    {
                        type: 'rentekst',
                        tekst: 'Du har ikke uttalt deg om feilutbetalingen.',
                    },
                ],
            },
            avsnitt: [
                {
                    tittel: 'Perioden fra og med 1. februar 2025 til og med 28. februar 2025',
                    underavsnitt: [
                        {
                            type: 'rentekst',
                            tekst: 'Vi har fått melding om at barnet ditt døde. Barnetrygden skulle vært stanset fra og med 1. februar 2025.',
                        },
                        {
                            type: 'rentekst',
                            tekst: 'Fordi barnetrygden er utbetalt etter denne datoen er det utbetalt 6 900 kroner for mye',
                        },
                        {
                            type: 'underavsnitt',
                            tittel: 'Hvordan har vi kommet fram til at du må betale tilbake?',
                            underavsnitt: [
                                {
                                    type: 'rentekst',
                                    tekst: 'Du har fått vite om du har rett til barnetrygd og hvor mye du har rett til. Selv hvis du har meldt fra til oss, kan vi kreve tilbake det du har fått for mye hvis du burde forstått at beløpet var feil. At du må betale tilbake, betyr ikke at du selv har skyld i feilutbetalingen.',
                                },
                                {
                                    type: 'rentekst',
                                    tekst: 'Ut fra informasjonen du har fått, burde du etter vår vurdering forstått at du fikk for mye utbetalt. Derfor kan vi kreve tilbake.',
                                },
                            ],
                        },
                        {
                            type: 'underavsnitt',
                            tittel: 'Er det særlige grunner til å redusere beløpet?',
                            underavsnitt: [
                                {
                                    type: 'rentekst',
                                    tekst: 'Vi har lagt vekt på at du burde forstått at du fikk penger du ikke har rett til. Vi har likevel redusert beløpet du må betale tilbake fordi det er lenge siden feilutbetalingen skjedde.',
                                },
                            ],
                        },
                    ],
                },
                {
                    tittel: 'Perioden fra og med 1. mars 2025 til og med 31. mars 2025',
                    underavsnitt: [
                        {
                            type: 'rentekst',
                            tekst: 'Vi har fått melding om at barnet ditt døde. Barnetrygden skulle vært stanset fra og med 1. februar 2025.',
                        },
                        {
                            type: 'rentekst',
                            tekst: 'Fordi barnetrygden er utbetalt etter denne datoen er det utbetalt 6 900 kroner for mye',
                        },
                    ],
                },
            ],
            brevGjelder: {
                fultNavn: 'Kevin Sillerud',
                fødselsnummer: '04206912345',
            },
            sendtDato: '27.januar 2026',
            ytelse: {
                url: 'nav.no/barnetrygd',
                ubestemtEntall: 'barnetrygd',
                bestemtEntall: 'barnetrygden',
            },
            signatur: {
                enhetNavn: 'NAV Solør',
                ansvarligSaksbehandler: 'Saks Behandler',
                besluttendeSaksbehandler: null,
            },
        },
    });
    const [pdfSider, setPdfSider] = useState<string[]>([]);
    const [gjeldendeSide, settGjeldendeSide] = useState(1);
    const antallSider = pdfSider.length;
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
            if (gjeldendeSide > respons.page_count) {
                settGjeldendeSide(1);
            }
        },
        onMutate: async (variables, context) => {
            await queryClient.cancelQueries({ queryKey: ['lagPdf'] });
            onMutate?.(variables, context);
        },
    });

    const debouncedUpdate = useDebounce(() => {
        vedtaksbrevMutation.mutate({
            body: methods.getValues(),
        });
    });

    useEffect(() => {
        vedtaksbrevMutation.mutate({
            body: methods.getValues(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    methods.watch(() => debouncedUpdate());

    return (
        <>
            <Heading size="small" spacing>
                Opprett vedtaksbrev
            </Heading>
            <FormProvider {...methods}>
                <div className="flex gap-4 flex-1 min-h-0">
                    <div className="flex-1 min-w-0 p-4 border rounded-xl border-ax-border-neutral-subtle">
                        <Textarea
                            label="Brevets innledning"
                            size="small"
                            {...methods.register('hovedavsnitt.underavsnitt.0.tekst')}
                        />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col border rounded-xl border-ax-border-neutral-subtle bg-white">
                        <div className="flex-1 flex items-start justify-center p-4 overflow-auto bg-white rounded-t-xl">
                            {pdfSider.length > 0 ? (
                                <img
                                    className="max-w-full h-auto"
                                    alt={`Forhåndsvisning av vedtaksbrev, side ${gjeldendeSide}`}
                                    src={pdfSider[gjeldendeSide - 1]}
                                />
                            ) : (
                                <Skeleton
                                    variant="rounded"
                                    className="aspect-[1/1.414] max-h-full w-auto"
                                    height="100%"
                                />
                            )}
                        </div>
                        <HStack
                            justify="center"
                            align="center"
                            className="p-3 border-t border-ax-border-neutral-subtle gap-4"
                        >
                            <Button
                                variant="tertiary"
                                size="small"
                                icon={<ChevronLeftIcon aria-hidden />}
                                disabled={gjeldendeSide <= 1}
                                onClick={() => settGjeldendeSide(s => Math.max(1, s - 1))}
                                aria-label="Forrige side"
                            />
                            <BodyShort size="small">
                                Side {gjeldendeSide} av {antallSider}
                            </BodyShort>
                            <Button
                                variant="tertiary"
                                size="small"
                                icon={<ChevronRightIcon aria-hidden />}
                                disabled={gjeldendeSide >= antallSider}
                                onClick={() => settGjeldendeSide(s => Math.min(antallSider, s + 1))}
                                aria-label="Neste side"
                            />
                        </HStack>
                    </div>
                </div>
            </FormProvider>
            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.ForeslåVedtak)}
                nesteTekst="Send til godkjenning"
                forrigeAriaLabel="Gå tilbake til vilkårsvurderingssteget"
                nesteAriaLabel="Send til godkjenning hos beslutter"
                onNeste={() => {
                    // TODO: Implementer innsending
                }}
                onForrige={navigerTilForrige}
            />
        </>
    );
};

export default OpprettVedtaksbrev;
