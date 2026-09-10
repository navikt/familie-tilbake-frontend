import type { AxiosError } from 'axios';
import type { FC } from 'react';
import type { EventType, FormState, InternalFieldName, SubmitHandler } from 'react-hook-form';
import type {
    BehandlingOppdaterFaktaData,
    BehandlingOppdaterFaktaError,
    BehandlingOppdaterFaktaResponse,
    BestemmelseEllerGrunnlag,
    FaktaOmFeilutbetaling,
    FaktaPeriode,
    MuligeRettsligGrunnlag,
    OppdaterFaktaOmFeilutbetaling,
    OppdaterFaktaPeriode,
    Options,
} from '@/generated-new';
import type { OppdaterFaktaOmFeilutbetalingSchema } from './schema';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDownIcon, ArrowUpIcon } from '@navikt/aksel-icons';
import {
    // Button,
    DatePicker,
    type DateValidationT,
    Heading,
    Radio,
    RadioGroup,
    Select,
    Table,
    Tag,
    Textarea,
    useDatepicker,
} from '@navikt/ds-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import { useActionBar } from '@/hooks/useActionBar';
import { formatCurrencyNoKr, formatterDatostring } from '@/utils';
import { dateTilIsoDatoString } from '@/utils/dato';
import { useStegNavigering } from '@/utils/sider';

import { lagOppdaterFaktaOmFeilutbetalingSchema } from './schema';

type FaktaOmFeilUtbetalingForm = {
    vurdering: {
        oppdaget: {
            av: 'NAV' | 'BRUKER';
            dato: string;
            beskrivelse: string;
        };
        årsak: string | null;
    };
    perioder?:
        | {
              id: string;
              rettsligGrunnlag: {
                  bestemmelse: string;
                  grunnlag: string;
              }[];
          }[]
        | undefined;
};

type Props = {
    faktaOmFeilutbetaling: FaktaOmFeilutbetaling;
};

export const FaktaSkjema: FC<Props> = ({ faktaOmFeilutbetaling }: Props) => {
    const { behandlingId, endretKravgrunnlag } = useBehandling();
    const { behandlingILesemodus } = useBehandlingState();
    const { actionBarStegtekst, setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();
    const queryClient = useQueryClient();
    const [uttalelsesdatoFeil, setUttalelsesdatoFeil] = useState<string | undefined>(undefined);

    const navigerTilNeste = useStegNavigering('FORHÅNDSVARSEL');
    const skjulNyePerioder = !!endretKravgrunnlag;
    const synligePerioder = useMemo(
        () =>
            skjulNyePerioder
                ? faktaOmFeilutbetaling.perioder.filter(
                      periode => periode.endringIKravgrunnlag?.type !== 'ny_periode'
                  )
                : faktaOmFeilutbetaling.perioder,
        [faktaOmFeilutbetaling.perioder, skjulNyePerioder]
    );

    const methods = useForm<OppdaterFaktaOmFeilutbetalingSchema>({
        resolver: zodResolver(
            lagOppdaterFaktaOmFeilutbetalingSchema(faktaOmFeilutbetaling.usikker4xRettsgebyr)
        ),
        defaultValues: {
            perioder: synligePerioder.map(periode => ({
                ...periode,
                rettsligGrunnlag:
                    periode.rettsligGrunnlag.length > 0
                        ? periode.rettsligGrunnlag
                        : [
                              {
                                  bestemmelse: '',
                                  grunnlag: '',
                              },
                          ],
            })),
            vurdering: {
                ...faktaOmFeilutbetaling.vurdering,
                oppdaget: {
                    dato: faktaOmFeilutbetaling.vurdering.oppdaget?.dato ?? undefined,
                    beskrivelse: faktaOmFeilutbetaling.vurdering.oppdaget?.beskrivelse ?? undefined,
                    av:
                        faktaOmFeilutbetaling.vurdering.oppdaget?.av === 'IKKE_VURDERT'
                            ? undefined
                            : faktaOmFeilutbetaling.vurdering.oppdaget?.av,
                },
            },
            rettsgebyrÅrFraSaksbehandler: faktaOmFeilutbetaling.rettsgebyrÅrFraSaksbehandler,
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
        criteriaMode: 'all',
    });

    const { fields: perioder, replace: erstattPerioder } = useFieldArray({
        control: methods.control,
        name: 'perioder',
        keyName: 'feltId',
    });

    useEffect(() => {
        const harSammePerioder =
            perioder.length === synligePerioder.length &&
            perioder.every(
                (periode, periodeIndex) => periode.id === synligePerioder[periodeIndex]?.id
            );
        if (harSammePerioder) {
            return;
        }

        const skjemaperioderById = new Map(
            (methods.getValues('perioder') ?? []).map(periode => [periode.id, periode] as const)
        );
        erstattPerioder(
            synligePerioder.map(periode => ({
                id: periode.id,
                rettsligGrunnlag:
                    skjemaperioderById.get(periode.id)?.rettsligGrunnlag ??
                    (periode.rettsligGrunnlag.length > 0
                        ? periode.rettsligGrunnlag
                        : [{ bestemmelse: '', grunnlag: '' }]),
            }))
        );
    }, [erstattPerioder, methods, perioder, synligePerioder]);

    const iDag = useMemo(() => new Date(), []);

    const {
        datepickerProps,
        inputProps: { onBlur: datepickerOnBlur, ...datepickerInputProps },
    } = useDatepicker({
        toDate: iDag,
        defaultSelected: faktaOmFeilutbetaling.vurdering.oppdaget?.dato
            ? parseISO(faktaOmFeilutbetaling.vurdering.oppdaget.dato)
            : undefined,
        onDateChange: async (date: Date | undefined): Promise<void> => {
            const dateString = dateTilIsoDatoString(date);
            methods.setValue('vurdering.oppdaget.dato', dateString, { shouldDirty: true });
            await methods.trigger('vurdering.oppdaget.dato');
        },
        onValidate: (val: DateValidationT): void => {
            if (val.isAfter) {
                setUttalelsesdatoFeil('Datoen kan ikke være i fremtiden');
            } else {
                setUttalelsesdatoFeil(undefined);
            }
        },
    });

    const førsteFaktaperiodeFom = faktaOmFeilutbetaling.perioder[0]?.fom;
    const førsteFaktaperiodeÅr = førsteFaktaperiodeFom
        ? parseISO(førsteFaktaperiodeFom).getFullYear()
        : undefined;

    const årsalternativer =
        førsteFaktaperiodeÅr === undefined
            ? []
            : Array.from(
                  { length: iDag.getFullYear() - førsteFaktaperiodeÅr + 1 },
                  (_, i) => iDag.getFullYear() - i
              );
    const oppdaterMutation = useMutation<
        BehandlingOppdaterFaktaResponse,
        AxiosError<BehandlingOppdaterFaktaError>,
        Options<BehandlingOppdaterFaktaData>
    >({
        mutationKey: ['oppdaterFakta'],
    });

    useEffect(() => {
        const unsubscribe = methods.subscribe({
            formState: { isDirty: true },
            callback: (
                data: Partial<FormState<FaktaOmFeilUtbetalingForm>> & {
                    values: FaktaOmFeilUtbetalingForm;
                    name?: InternalFieldName;
                    type?: EventType;
                }
            ): void => {
                if (data.isDirty) {
                    setIkkePersistertKomponent('fakta');
                } else {
                    nullstillIkkePersisterteKomponenter();
                }
            },
        });
        return unsubscribe;
    }, [methods, setIkkePersistertKomponent, nullstillIkkePersisterteKomponenter]);

    const dataForPeriode = (periodeIndex: number): FaktaPeriode => synligePerioder[periodeIndex];

    const onSubmit: SubmitHandler<OppdaterFaktaOmFeilutbetaling> = (
        data: OppdaterFaktaOmFeilutbetaling
    ): void => {
        const body: OppdaterFaktaOmFeilutbetaling = {
            ...data,
            rettsgebyrÅrFraSaksbehandler: faktaOmFeilutbetaling.usikker4xRettsgebyr
                ? data.rettsgebyrÅrFraSaksbehandler
                : null,
        };
        oppdaterMutation.mutate(
            { body, path: { behandlingId } },
            {
                onSuccess: async (data: FaktaOmFeilutbetaling) => {
                    nullstillIkkePersisterteKomponenter();
                    if (data.ferdigvurdert) {
                        await queryClient.refetchQueries({
                            queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
                        });
                        navigerTilNeste();
                    }
                },
            }
        );
    };

    const { name: avRadioGroupName, ...radioProps } = methods.register('vurdering.oppdaget.av');
    const skalSubmitteFaktaSkjema =
        methods.formState.isDirty || !faktaOmFeilutbetaling.ferdigvurdert;

    const fellesActionBarConfig = {
        stegtekst: actionBarStegtekst('FAKTA'),
        forrigeAriaLabel: undefined,
        nesteAriaLabel: 'Gå videre til forhåndsvarselsteget',
        onForrige: undefined,
        isLoading: oppdaterMutation.isPending,
    };

    useActionBar(
        skalSubmitteFaktaSkjema
            ? {
                  type: 'submit',
                  formId: 'fakta-skjema',
                  ...fellesActionBarConfig,
                  ...(methods.formState.isDirty && { nesteTekst: 'Lagre og gå til neste' }),
              }
            : {
                  ...fellesActionBarConfig,
                  onNeste: navigerTilNeste,
              }
    );

    return (
        <FormProvider {...methods}>
            <form
                id="fakta-skjema"
                className="flex flex-col gap-8"
                onSubmit={methods.handleSubmit(onSubmit)}
            >
                <section className="flex flex-col gap-6" aria-label="Rettslig grunnlag innhold">
                    <Heading level="2" size="small">
                        Rettslig grunnlag
                    </Heading>
                    <div className="border rounded-xl border-ax-border-brand-blue-subtle">
                        <Table zebraStripes>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">
                                        <span className="ml-2">Periode</span>
                                    </Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Bestemmelse</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Grunnlag</Table.HeaderCell>
                                    <Table.HeaderCell scope="col" className="text-end">
                                        Feilutbetalt
                                    </Table.HeaderCell>
                                    {/* <Table.HeaderCell scope="col">Valg</Table.HeaderCell> */}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {perioder.map((periode, periodeIndex) => (
                                    <PeriodeRad
                                        key={periode.feltId}
                                        periode={periode}
                                        periodeIndex={periodeIndex}
                                        periodeInfo={dataForPeriode(periodeIndex)}
                                        muligeRettsligGrunnlag={
                                            faktaOmFeilutbetaling.muligeRettsligGrunnlag
                                        }
                                        erSiste={periodeIndex === perioder.length - 1}
                                    />
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                </section>
                <section
                    className="flex flex-col gap-6 max-w-xl"
                    aria-label="Detaljer om feilutbetalingen innhold"
                >
                    <Heading level="2" size="small">
                        Detaljer om feilutbetalingen
                    </Heading>
                    <Textarea
                        label="Årsak til feilutbetalingen"
                        {...methods.register('vurdering.årsak')}
                        error={methods.formState.errors.vurdering?.årsak?.message}
                        size="small"
                        minRows={3}
                        readOnly={behandlingILesemodus}
                        resize
                        maxLength={3000}
                        description="Beskriv hvorfor utbetalingen er feil, og hva som har ført til at brukeren har fått utbetalt for mye"
                    />
                    {faktaOmFeilutbetaling.usikker4xRettsgebyr && (
                        <Select
                            label="Hvilket år var siste utbetaling?"
                            description="For å kunne regne ut riktig rettsgebyr trenger vi denne informasjonen"
                            size="small"
                            readOnly={behandlingILesemodus}
                            error={methods.formState.errors.rettsgebyrÅrFraSaksbehandler?.message}
                            style={{ width: '137px' }}
                            {...methods.register('rettsgebyrÅrFraSaksbehandler', {
                                setValueAs: (value: string): number | null =>
                                    value ? Number(value) : null,
                            })}
                        >
                            <option value="" disabled>
                                Velg år
                            </option>
                            {årsalternativer.map(år => (
                                <option key={år} value={år}>
                                    {år}
                                </option>
                            ))}
                        </Select>
                    )}
                    <DatePicker {...datepickerProps} dropdownCaption>
                        <DatePicker.Input
                            size="small"
                            readOnly={behandlingILesemodus}
                            {...methods.register('vurdering.oppdaget.dato')}
                            {...datepickerInputProps}
                            onBlur={async (
                                event: React.FocusEvent<HTMLInputElement>
                            ): Promise<void> => {
                                datepickerOnBlur?.(event);
                                await methods.trigger('vurdering.oppdaget.dato');
                            }}
                            label="Når ble feilutbetalingen oppdaget?"
                            error={
                                uttalelsesdatoFeil ??
                                methods.formState.errors.vurdering?.oppdaget?.dato?.message
                            }
                        />
                    </DatePicker>
                    <RadioGroup
                        name={avRadioGroupName}
                        size="small"
                        readOnly={behandlingILesemodus}
                        legend="Hvem oppdaget feilutbetalingen?"
                        error={methods.formState.errors.vurdering?.oppdaget?.av?.message}
                    >
                        <Radio value="BRUKER" name="BRUKER" {...radioProps}>
                            Bruker
                        </Radio>
                        <Radio value="NAV" name="NAV" {...radioProps}>
                            Nav
                        </Radio>
                    </RadioGroup>
                    <Textarea
                        label="Hvordan ble feilutbetalingen oppdaget?"
                        {...methods.register('vurdering.oppdaget.beskrivelse')}
                        error={methods.formState.errors.vurdering?.oppdaget?.beskrivelse?.message}
                        size="small"
                        minRows={3}
                        resize
                        maxLength={3000}
                        readOnly={behandlingILesemodus}
                    />
                </section>
            </form>
        </FormProvider>
    );
};

type PeriodeRadProps = {
    periode: OppdaterFaktaPeriode;
    periodeIndex: number;
    periodeInfo: FaktaPeriode;
    muligeRettsligGrunnlag: MuligeRettsligGrunnlag[];
    erSiste?: boolean;
};

const PeriodeRad: FC<PeriodeRadProps> = ({
    periode,
    periodeIndex,
    periodeInfo,
    muligeRettsligGrunnlag,
    erSiste,
}: PeriodeRadProps) => {
    const { behandlingILesemodus } = useBehandlingState();
    const endringIKravgrunnlag = periodeInfo.endringIKravgrunnlag;
    const [visNyPeriodeMarkering, setVisNyPeriodeMarkering] = useState(
        endringIKravgrunnlag?.type === 'ny_periode'
    );

    useEffect(() => {
        if (!visNyPeriodeMarkering) {
            return;
        }

        const timeoutId = window.setTimeout(() => setVisNyPeriodeMarkering(false), 3000);
        return (): void => window.clearTimeout(timeoutId);
    }, [visNyPeriodeMarkering]);

    const beløpsendring =
        endringIKravgrunnlag?.type === 'endret_periode' &&
        endringIKravgrunnlag.gammeltBeløp !== endringIKravgrunnlag.nyttBeløp
            ? endringIKravgrunnlag
            : undefined;

    const tilgjengeligeGrunnlag = (bestemmelse: string): BestemmelseEllerGrunnlag[] =>
        muligeRettsligGrunnlag.find(
            muligGrunnlag => muligGrunnlag.bestemmelse.nøkkel === bestemmelse
        )?.grunnlag ?? [];
    const { register, setValue, formState } = useFormContext<OppdaterFaktaOmFeilutbetalingSchema>();
    const nullstillBestemmelse = (index: number): void => {
        setValue(`perioder.${periodeIndex}.rettsligGrunnlag.${index}.grunnlag`, '', {
            shouldDirty: true,
        });
    };

    return (
        <Table.Row className={visNyPeriodeMarkering ? 'bg-ax-bg-success-soft!' : undefined}>
            <Table.DataCell className={`pl-2 ${erSiste ? 'border-b-0 rounded-bl-xl' : ''}`}>
                {formatterDatostring(periodeInfo.fom)}–{formatterDatostring(periodeInfo.tom)}
            </Table.DataCell>
            <Table.DataCell className={erSiste ? 'border-b-0' : ''}>
                {periode.rettsligGrunnlag.map((_, index) => (
                    <Select
                        label="Velg bestemmelse"
                        hideLabel
                        size="small"
                        readOnly={behandlingILesemodus}
                        key={crypto.randomUUID()}
                        error={
                            formState.errors.perioder
                                ?.at?.(periodeIndex)
                                ?.rettsligGrunnlag?.at?.(index)?.bestemmelse?.message
                        }
                        {...register(
                            `perioder.${periodeIndex}.rettsligGrunnlag.${index}.bestemmelse`,
                            { onChange: () => nullstillBestemmelse(index) }
                        )}
                        className="flex-1"
                    >
                        <option value="" disabled>
                            Velg bestemmelse
                        </option>
                        {muligeRettsligGrunnlag.map(({ bestemmelse }) => (
                            <option key={bestemmelse.nøkkel} value={bestemmelse.nøkkel}>
                                {bestemmelse.beskrivelse}
                            </option>
                        ))}
                    </Select>
                ))}
            </Table.DataCell>
            <Table.DataCell className={erSiste ? 'border-b-0' : ''}>
                {periode.rettsligGrunnlag.map((rettsligGrunnlag, index) => (
                    <Select
                        label="Velg grunnlag"
                        hideLabel
                        size="small"
                        key={rettsligGrunnlag.grunnlag}
                        readOnly={behandlingILesemodus}
                        error={
                            formState.errors.perioder
                                ?.at?.(periodeIndex)
                                ?.rettsligGrunnlag?.at?.(index)?.grunnlag?.message
                        }
                        {...register(`perioder.${periodeIndex}.rettsligGrunnlag.${index}.grunnlag`)}
                        className="flex-1"
                    >
                        <>
                            <option value="" disabled>
                                Velg grunnlag
                            </option>
                            {tilgjengeligeGrunnlag(rettsligGrunnlag.bestemmelse).map(grunnlag => (
                                <option key={grunnlag.nøkkel} value={grunnlag.nøkkel}>
                                    {grunnlag.beskrivelse}
                                </option>
                            ))}
                        </>
                    </Select>
                ))}
            </Table.DataCell>
            <Table.DataCell
                className={`text-end ${beløpsendring ? '' : 'text-ax-text-brand-magenta'} ${erSiste ? 'border-b-0 rounded-br-xl' : ''}`}
            >
                {beløpsendring ? (
                    <Tag
                        variant="moderate"
                        data-color="success"
                        size="small"
                        icon={
                            beløpsendring.nyttBeløp < beløpsendring.gammeltBeløp ? (
                                <ArrowDownIcon title="Beløpet er redusert" />
                            ) : (
                                <ArrowUpIcon title="Beløpet er økt" />
                            )
                        }
                    >
                        {formatCurrencyNoKr(periodeInfo.feilutbetaltBeløp)}
                    </Tag>
                ) : (
                    formatCurrencyNoKr(periodeInfo.feilutbetaltBeløp)
                )}
            </Table.DataCell>
            {/* <Table.DataCell className="text-center">
                <Button
                    size="small"
                    variant="tertiary"
                    className="align-middle"
                    icon={<MenuElipsisHorizontalIcon title="Legg til rettslig grunnlag" />}
                />
            </Table.DataCell> */}
        </Table.Row>
    );
};
