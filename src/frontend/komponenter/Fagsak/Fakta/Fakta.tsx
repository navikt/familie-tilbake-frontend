import type { Behandling } from '../../../generated';

import { MenuElipsisHorizontalIcon } from '@navikt/aksel-icons';
import {
    Button,
    DatePicker,
    Heading,
    Radio,
    RadioGroup,
    Select,
    Table,
    Tag,
    Textarea,
    useDatepicker,
} from '@navikt/ds-react';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import * as React from 'react';

import { FaktaSkeleton } from './FaktaSkeleton';
import { useBehandling } from '../../../context/BehandlingContext';
import { fakta, HendelsestypeEnum, HendelsesundertypeEnum } from '../../../generated';
import { Behandlingssteg } from '../../../typer/behandling';
import { formatterDatostring } from '../../../utils';
import { ActionBar } from '../ActionBar/ActionBar';

type Props = {
    behandlingId: Behandling['behandlingId'];
};

export const Fakta: React.FC<Props> = ({ behandlingId }: Props) => {
    const { datepickerProps, inputProps } = useDatepicker({
        onDateChange: console.info,
    });
    const { actionBarStegtekst } = useBehandling();

    const { data: faktaOmFeilutbetaling, isPending } = useQuery({
        queryKey: ['hentFaktaOmFeilutbetaling'],
        queryFn: () =>
            fakta({
                path: {
                    behandlingId: behandlingId,
                },
            }),
        select: data => data.data,
    });
    const bestemmelser: HendelsestypeEnum[] = [HendelsestypeEnum.ANNET];
    const alleGrunnlag: HendelsesundertypeEnum[] = [HendelsesundertypeEnum.ANNET_FRITEKST];

    if (isPending || !faktaOmFeilutbetaling) return <FaktaSkeleton />;
    return (
        <>
            <div className="flex flex-col gap-8" aria-label="Fakta om feilutbetaling">
                <Heading level="1" size="medium">
                    Fakta om feilutbetalingen
                </Heading>
                <section
                    className={classNames('flex md:flex-row flex-col flex-col-3 w-full gap-6', {
                        'flex-col-4': faktaOmFeilutbetaling.tidligereVarsletBeløp,
                    })}
                    aria-label="Feilutbetaling og revurdering"
                >
                    <div
                        className={classNames('grid grid-cols-2 gap-4 flex-1', {
                            'flex-2': faktaOmFeilutbetaling.tidligereVarsletBeløp,
                        })}
                    >
                        <div
                            className={classNames(
                                'flex-1 p-4 bg-ax-bg-brand-magenta-soft border rounded-xl border-ax-border-brand-magenta-strong align-middle col-span-1',
                                { 'col-span-2': !faktaOmFeilutbetaling.tidligereVarsletBeløp }
                            )}
                        >
                            <dt className="font-ax-bold text-ax-medium">Feilutbetalt beløp</dt>
                            <dd className="text-ax-text-danger font-ax-bold text-ax-heading-medium">
                                {faktaOmFeilutbetaling.feilutbetaling.beløp}
                            </dd>
                        </div>
                        {faktaOmFeilutbetaling.tidligereVarsletBeløp && (
                            <div className="col-span-1 p-4 border rounded-xl border-ax-border-neutral-subtle">
                                <dt className="font-ax-bold text-ax-medium">
                                    Tidligere varslet beløp
                                </dt>
                                <dd className="font-ax-bold text-ax-heading-medium">
                                    {faktaOmFeilutbetaling.tidligereVarsletBeløp}
                                </dd>
                            </div>
                        )}
                        <div className="col-span-2 p-4 h-22 border rounded-xl border-ax-border-neutral-subtle">
                            <dt className="font-ax-bold text-ax-medium">Periode</dt>
                            <dd className="font-ax-bold text-ax-heading-medium">
                                {formatterDatostring(faktaOmFeilutbetaling.feilutbetaling.fom)}–
                                {formatterDatostring(faktaOmFeilutbetaling.feilutbetaling.tom)}
                            </dd>
                        </div>
                    </div>
                    <div className="flex flex-col flex-2 gap-4 p-4 border rounded-xl border-ax-border-neutral-subtle">
                        <Heading level="2" size="small">
                            Revurdering
                        </Heading>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="font-ax-bold text-ax-medium">
                                    Årsak til revurdering
                                </dt>
                                <dd>
                                    <Tag
                                        key={faktaOmFeilutbetaling.feilutbetaling.revurdering.årsak}
                                        variant="neutral-moderate"
                                        size="small"
                                        className="text-ax-medium"
                                    >
                                        {faktaOmFeilutbetaling.feilutbetaling.revurdering.årsak}
                                    </Tag>
                                </dd>
                            </div>
                            <div>
                                <dt className="font-ax-bold text-ax-medium">
                                    Dato for revurderingsvedtak
                                </dt>
                                <dd className="text-ax-medium">
                                    {formatterDatostring(
                                        faktaOmFeilutbetaling.feilutbetaling.revurdering.vedtaksdato
                                    )}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-ax-bold text-ax-medium">Resultat</dt>
                                <dd className="text-ax-medium">
                                    {faktaOmFeilutbetaling.feilutbetaling.revurdering.resultat}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>
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
                                {faktaOmFeilutbetaling.perioder.map(periode => (
                                    <Table.Row key={periode.fom}>
                                        <Table.DataCell>
                                            <span className="ml-2">
                                                {formatterDatostring(periode.fom)}–
                                                {formatterDatostring(periode.tom)}
                                            </span>
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <Select
                                                label="Velg bestemmelse"
                                                hideLabel
                                                size="small"
                                                value="default"
                                                className="flex-1"
                                            >
                                                <option value="default" disabled>
                                                    Velg bestemmelse
                                                </option>
                                                {bestemmelser.map(bestemmelse => (
                                                    <option key={bestemmelse} value={bestemmelse}>
                                                        {bestemmelse}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Table.DataCell>
                                        <Table.DataCell>
                                            <Select
                                                label="Velg grunnlag"
                                                hideLabel
                                                size="small"
                                                value="default"
                                                className="flex-1"
                                            >
                                                <option value="default" disabled>
                                                    Velg grunnlag
                                                </option>
                                                {alleGrunnlag.map(grunnlag => (
                                                    <option key={grunnlag} value={grunnlag}>
                                                        {grunnlag}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Table.DataCell>
                                        <Table.DataCell className="text-end text-ax-text-brand-magenta">
                                            {periode.feilutbetaltBeløp}
                                        </Table.DataCell>
                                        <Table.DataCell className="text-center">
                                            <Button
                                                size="small"
                                                variant="tertiary"
                                                className="align-middle"
                                                icon={
                                                    <MenuElipsisHorizontalIcon title="Legg til rettslig grunnlag" />
                                                }
                                            />
                                        </Table.DataCell>
                                    </Table.Row>
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
                            {...inputProps}
                            label="Når ble feilutbetalingen oppdaget?"
                        />
                    </DatePicker>
                    <RadioGroup size="small" legend="Hvem oppdaget feilutbetalingen?">
                        <Radio value="Bruker">Bruker</Radio>
                        <Radio value="Nav">Nav</Radio>
                    </RadioGroup>
                    <Textarea
                        label="Hvordan ble feilutbetalingen oppdaget?"
                        size="small"
                        className="w-100 mb-6"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                </section>
            </div>
            <ActionBar
                stegtekst={actionBarStegtekst(Behandlingssteg.Fakta)}
                forrigeAriaLabel={undefined}
                nesteAriaLabel="Gå videre til foreldelsessteget"
                onForrige={undefined}
                onNeste={() => {}}
                isLoading={false}
            />
        </>
    );
};
