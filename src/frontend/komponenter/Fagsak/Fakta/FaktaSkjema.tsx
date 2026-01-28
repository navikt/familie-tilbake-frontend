import type { OppdaterFaktaOmFeilutbetalingSchema } from './schema';
import type {
    BestemmelseEllerGrunnlag,
    FaktaOmFeilutbetaling,
    FaktaPeriode,
    MuligeRettsligGrunnlag,
    OppdaterFaktaData,
    OppdaterFaktaError,
    OppdaterFaktaOmFeilutbetaling,
    OppdaterFaktaPeriode,
    OppdaterFaktaResponse,
    Options,
} from '../../../generated-new';
import type { AxiosError } from 'axios';
import type { SubmitHandler } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import {
    Button,
    DatePicker,
    Heading,
    Radio,
    RadioGroup,
    Select,
    Table,
    Textarea,
    useDatepicker,
    VStack,
} from '@navikt/ds-react';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { formatISO, parseISO } from 'date-fns';
import * as React from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';

import { oppdaterFaktaOmFeilutbetalingSchema } from './schema';
import { useBehandling } from '../../../context/BehandlingContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { Behandlingssteg } from '../../../typer/behandling';
import { formatterDatostring } from '../../../utils';
import { useStegNavigering } from '../../../utils/sider';
import { ActionBar } from '../ActionBar/ActionBar';

type Props = {
    behandlingUrl: string;
    faktaOmFeilutbetaling: FaktaOmFeilutbetaling;
};

export const FaktaSkjema = ({ faktaOmFeilutbetaling, behandlingUrl }: Props): React.JSX.Element => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst, settIkkePersistertKomponent, nullstillIkkePersisterteKomponenter } =
        useBehandlingState();
    const queryClient = useQueryClient();

    const navigerTilNeste = useStegNavigering(behandlingUrl, Behandlingssteg.Forhåndsvarsel);

    const methods = useForm<OppdaterFaktaOmFeilutbetalingSchema>({
        resolver: zodResolver(oppdaterFaktaOmFeilutbetalingSchema),
        defaultValues: {
            perioder: faktaOmFeilutbetaling.perioder.map(periode => ({
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
                    ...faktaOmFeilutbetaling.vurdering.oppdaget,
                    dato: faktaOmFeilutbetaling.vurdering.oppdaget?.dato ?? undefined,
                    beskrivelse: faktaOmFeilutbetaling.vurdering.oppdaget?.beskrivelse ?? undefined,
                    av:
                        faktaOmFeilutbetaling.vurdering.oppdaget?.av === 'IKKE_VURDERT'
                            ? undefined
                            : faktaOmFeilutbetaling.vurdering.oppdaget?.av,
                },
            },
        },
        reValidateMode: 'onChange',
        mode: 'onSubmit',
        criteriaMode: 'all',
    });

    const perioder = useFieldArray({
        control: methods.control,
        name: 'perioder',
    }).fields;

    const {
        datepickerProps,
        inputProps: { onBlur: datepickerOnBlur, ...datepickerInputProps },
    } = useDatepicker({
        onDateChange: async date => {
            if (date) {
                methods.setValue(
                    'vurdering.oppdaget.dato',
                    formatISO(date, { representation: 'date' }),
                    { shouldDirty: true }
                );
            } else {
                methods.setValue('vurdering.oppdaget.dato', '', { shouldDirty: true });
            }
            await methods.trigger('vurdering.oppdaget.dato');
        },
        defaultSelected: faktaOmFeilutbetaling.vurdering.oppdaget?.dato
            ? parseISO(faktaOmFeilutbetaling.vurdering.oppdaget.dato)
            : undefined,
    });
    const oppdaterMutation = useMutation<
        OppdaterFaktaResponse,
        AxiosError<OppdaterFaktaError>,
        Options<OppdaterFaktaData>
    >({
        mutationKey: ['oppdaterFakta'],
    });

    methods.subscribe({
        formState: { isDirty: true },
        callback: data => {
            if (data.isDirty) {
                settIkkePersistertKomponent('fakta');
            } else {
                nullstillIkkePersisterteKomponenter();
            }
        },
    });

    const dataForPeriode = (id: string): FaktaPeriode =>
        // Siden disse kommer fra samme kall skal det ikke være mulig å ende opp med tomt svar
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        perioder.find(periode => periode.id === id)! as FaktaPeriode;
    const onSubmit: SubmitHandler<OppdaterFaktaOmFeilutbetaling> = data => {
        oppdaterMutation.mutate(
            { body: data, path: { behandlingId } },
            {
                onSuccess: data => {
                    nullstillIkkePersisterteKomponenter();
                    if (data.ferdigvurdert) {
                        queryClient
                            .invalidateQueries({
                                queryKey: ['hentBehandling', { path: { behandlingId } }],
                            })
                            .then(navigerTilNeste);
                    }
                },
            }
        );
    };

    const { name: avRadioGroupName, ...radioProps } = methods.register('vurdering.oppdaget.av');

    return (
        <FormProvider {...methods}>
            <VStack
                as="form"
                gap="space-32"
                onSubmit={methods.handleSubmit(onSubmit)}
                id="fakta-skjema"
            >
                <VStack as="section" gap="space-24" aria-label="Rettslig grunnlag innhold">
                    <Heading level="2" size="small">
                        Rettslig grunnlag
                    </Heading>
                    <div className="border rounded-xl border-ax-border-neutral-subtle">
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">
                                        <span className="ml-2">Periode</span>
                                    </Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Bestemmelse</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Grunnlag</Table.HeaderCell>
                                    <Table.HeaderCell scope="col" className="text-end">
                                        Feilutbetalt beløp
                                    </Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Valg</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {perioder.map((periode, periodeIndex) => (
                                    <PeriodeRad
                                        key={periode.id}
                                        periode={periode}
                                        periodeIndex={periodeIndex}
                                        periodeInfo={dataForPeriode(periode.id)}
                                        muligeRettsligGrunnlag={
                                            faktaOmFeilutbetaling.muligeRettsligGrunnlag
                                        }
                                    />
                                ))}
                            </Table.Body>
                        </Table>
                    </div>
                </VStack>
                <VStack
                    as="section"
                    gap="space-24"
                    className="max-w-xl"
                    aria-label="Rettslig grunnlag innhold"
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
                        resize
                        maxLength={3000}
                        description="Beskriv hvorfor utbetalingen er feil, og hva som har ført til at brukeren har fått utbetalt for mye"
                    />
                    <DatePicker {...datepickerProps} dropdownCaption>
                        <DatePicker.Input
                            size="small"
                            {...methods.register('vurdering.oppdaget.dato')}
                            {...datepickerInputProps}
                            onBlur={async event => {
                                datepickerOnBlur?.(event);
                                await methods.trigger('vurdering.oppdaget.dato');
                            }}
                            label="Når ble feilutbetalingen oppdaget?"
                            error={methods.formState.errors.vurdering?.oppdaget?.dato?.message}
                        />
                    </DatePicker>
                    <RadioGroup
                        name={avRadioGroupName}
                        size="small"
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
                        className="mb-6"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                </VStack>
                <ActionBar
                    {...(methods.formState.isDirty || !faktaOmFeilutbetaling.ferdigvurdert
                        ? {
                              type: 'submit',
                              nesteTekst: 'Lagre og gå til neste',
                              formId: 'fakta-skjema',
                          }
                        : { type: 'button', onNeste: navigerTilNeste })}
                    stegtekst={actionBarStegtekst(Behandlingssteg.Fakta)}
                    forrigeAriaLabel={undefined}
                    nesteAriaLabel="Gå videre til foreldelsessteget"
                    onForrige={undefined}
                    isLoading={false}
                />
            </VStack>
        </FormProvider>
    );
};

const PeriodeRad = ({
    periode,
    periodeIndex,
    periodeInfo,
    muligeRettsligGrunnlag,
}: {
    periode: OppdaterFaktaPeriode;
    periodeIndex: number;
    periodeInfo: FaktaPeriode;
    muligeRettsligGrunnlag: MuligeRettsligGrunnlag[];
}): React.JSX.Element => {
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
        <Table.Row>
            <Table.DataCell>
                <span className="ml-2">
                    {formatterDatostring(periodeInfo.fom)}–{formatterDatostring(periodeInfo.tom)}
                </span>
            </Table.DataCell>
            <Table.DataCell>
                <VStack>
                    {periode.rettsligGrunnlag.map((rettsligGrunnlag, index) => (
                        <Select
                            label="Velg bestemmelse"
                            hideLabel
                            size="small"
                            key={`${rettsligGrunnlag.bestemmelse}${index}`}
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
                </VStack>
            </Table.DataCell>
            <Table.DataCell>
                <VStack>
                    {periode.rettsligGrunnlag.map((rettsligGrunnlag, index) => (
                        <Select
                            label="Velg grunnlag"
                            hideLabel
                            size="small"
                            key={`${rettsligGrunnlag.grunnlag}${index}`}
                            error={
                                formState.errors.perioder
                                    ?.at?.(periodeIndex)
                                    ?.rettsligGrunnlag?.at?.(index)?.grunnlag?.message
                            }
                            {...register(
                                `perioder.${periodeIndex}.rettsligGrunnlag.${index}.grunnlag`
                            )}
                            className="flex-1"
                        >
                            <>
                                <option value="" disabled>
                                    Velg grunnlag
                                </option>
                                {tilgjengeligeGrunnlag(rettsligGrunnlag.bestemmelse).map(
                                    grunnlag => (
                                        <option key={grunnlag.nøkkel} value={grunnlag.nøkkel}>
                                            {grunnlag.beskrivelse}
                                        </option>
                                    )
                                )}
                            </>
                        </Select>
                    ))}
                </VStack>
            </Table.DataCell>
            <Table.DataCell className="text-end text-ax-text-brand-magenta">
                {periodeInfo.feilutbetaltBeløp}
            </Table.DataCell>
            <Table.DataCell className="text-center">
                <Button
                    size="small"
                    variant="tertiary"
                    className="align-middle"
                    icon={<MenuElipsisHorizontalIcon title="Legg til rettslig grunnlag" />}
                />
            </Table.DataCell>
        </Table.Row>
    );
};
