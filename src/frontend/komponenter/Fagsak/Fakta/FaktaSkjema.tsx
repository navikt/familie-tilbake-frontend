import type { OppdaterFaktaOmFeilutbetalingSchemaDto } from './schema';
import type {
    BestemmelseEllerGrunnlagDto,
    FaktaOmFeilutbetalingDto,
    FaktaPeriodeDto,
    MuligeRettsligGrunnlagDto,
    OppdaterFaktaOmFeilutbetalingDto,
    OppdaterFaktaPeriodeDto,
} from '../../../generated';
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
import { formatISO, parseISO } from 'date-fns';
import * as React from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';

import { oppdaterFaktaOmFeilutbetalingSchema } from './schema';
import { useBehandling } from '../../../context/BehandlingContext';
import { Behandlingssteg } from '../../../typer/behandling';
import { formatterDatostring } from '../../../utils';
import { ActionBar } from '../ActionBar/ActionBar';

type Props = {
    faktaOmFeilutbetaling: FaktaOmFeilutbetalingDto;
};

export const FaktaSkjema = ({ faktaOmFeilutbetaling }: Props): React.JSX.Element => {
    const { actionBarStegtekst } = useBehandling();
    const methods = useForm<OppdaterFaktaOmFeilutbetalingSchemaDto>({
        resolver: zodResolver(oppdaterFaktaOmFeilutbetalingSchema),
        defaultValues: {
            perioder: faktaOmFeilutbetaling.perioder,
            vurdering: faktaOmFeilutbetaling.vurdering,
        },
        mode: 'all',
    });
    const perioder = useFieldArray({
        control: methods.control,
        name: 'perioder',
    }).fields;
    const { ...oppdagetDatoProps } = methods.register('vurdering.oppdaget.dato');
    const { datepickerProps, inputProps } = useDatepicker({
        onDateChange: date => {
            date
                ? methods.setValue(
                      'vurdering.oppdaget.dato',
                      formatISO(date, { representation: 'date' })
                  )
                : methods.resetField('vurdering.oppdaget.dato');
        },
        defaultSelected: faktaOmFeilutbetaling.vurdering.oppdaget?.dato
            ? parseISO(faktaOmFeilutbetaling.vurdering.oppdaget.dato)
            : undefined,
    });
    const dataForPeriode = (id: string): FaktaPeriodeDto =>
        // Siden disse kommer fra samme kall skal det ikke være mulig å ende opp med tomt svar
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        perioder.find(periode => periode.id === id)! as FaktaPeriodeDto;
    const onSubmit: SubmitHandler<OppdaterFaktaOmFeilutbetalingDto> = data =>
        console.log(JSON.stringify(data));

    const { name: avRadioGroupName, ...radioProps } = methods.register('vurdering.oppdaget.av');

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} id="fakta-skjema">
                <section className="flex flex-col gap-6" aria-label="Rettslig grunnlag innhold">
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
                </section>
                <section className="flex flex-col gap-6" aria-label="Rettslig grunnlag innhold">
                    <Heading level="2" size="small">
                        Detaljer om feilutbetalingen
                    </Heading>
                    <Textarea
                        label="Årsak til feilutbetalingen"
                        {...methods.register('vurdering.årsak')}
                        size="small"
                        className="w-100"
                        minRows={3}
                        resize
                        maxLength={3000}
                        description="Beskriv hvorfor utbetalingen er feil, og hva som har ført til at brukeren har fått utbetalt for mye"
                    />
                    <DatePicker {...datepickerProps} dropdownCaption>
                        <DatePicker.Input
                            size="small"
                            {...oppdagetDatoProps}
                            {...inputProps}
                            label="Når ble feilutbetalingen oppdaget?"
                        />
                    </DatePicker>
                    <RadioGroup
                        name={avRadioGroupName}
                        size="small"
                        legend="Hvem oppdaget feilutbetalingen?"
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
                        size="small"
                        className="w-100 mb-6"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                </section>
                <ActionBar
                    type="submit"
                    formId="fakta-skjema"
                    stegtekst={actionBarStegtekst(Behandlingssteg.Fakta)}
                    forrigeAriaLabel={undefined}
                    nesteAriaLabel="Gå videre til foreldelsessteget"
                    onForrige={undefined}
                    onNeste={undefined}
                    isLoading={false}
                />
            </form>
        </FormProvider>
    );
};

const PeriodeRad = ({
    periode,
    periodeIndex,
    periodeInfo,
    muligeRettsligGrunnlag,
}: {
    periode: OppdaterFaktaPeriodeDto;
    periodeIndex: number;
    periodeInfo: FaktaPeriodeDto;
    muligeRettsligGrunnlag: MuligeRettsligGrunnlagDto[];
}): React.JSX.Element => {
    const tilgjengeligeGrunnlag = (bestemmelse: string): BestemmelseEllerGrunnlagDto[] =>
        muligeRettsligGrunnlag.find(
            muligGrunnlag => muligGrunnlag.bestemmelse.nøkkel === bestemmelse
        )?.grunnlag ?? [];
    const { register } = useFormContext<OppdaterFaktaOmFeilutbetalingSchemaDto>();
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
                            {...register(
                                `perioder.${periodeIndex}.rettsligGrunnlag.${index}.bestemmelse`
                            )}
                            className="flex-1"
                        >
                            <option value="default" disabled>
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
                            {...register(
                                `perioder.${periodeIndex}.rettsligGrunnlag.${index}.grunnlag`
                            )}
                            className="flex-1"
                        >
                            <>
                                <option value="default" disabled>
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
