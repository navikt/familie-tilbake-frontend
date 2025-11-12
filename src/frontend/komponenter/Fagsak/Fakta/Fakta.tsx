import type { Datoperiode, FaktaFeilutbetalingDto } from '../../../generated';
import type { Tilbakekrevingsvalg } from '../../../typer/tilbakekrevingstyper';

import { PlusIcon } from '@navikt/aksel-icons';
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
import * as React from 'react';

import { FaktaSkeleton } from './FaktaSkeleton';
import { useBehandling } from '../../../context/BehandlingContext';
import {
    HarBrukerUttaltSegEnum,
    HendelsestypeEnum,
    HendelsesundertypeEnum,
    TilbakekrevingsvalgEnum,
} from '../../../generated';
import { Behandlingssteg } from '../../../typer/behandling';
import { tilbakekrevingsvalg } from '../../../typer/tilbakekrevingstyper';
import { formatterDatostring } from '../../../utils';
import { ActionBar } from '../ActionBar/ActionBar';

export const Fakta: React.FC = () => {
    const { datepickerProps, inputProps } = useDatepicker({
        onDateChange: console.info,
    });
    const { actionBarStegtekst } = useBehandling();
    const isLoading = false;

    const bestemmelser: HendelsestypeEnum[] = [HendelsestypeEnum.ANNET];
    const alleGrunnlag: HendelsesundertypeEnum[] = [HendelsesundertypeEnum.ANNET_FRITEKST];
    const tidligereVarsletBeløp = 13800;
    const fakta: FaktaFeilutbetalingDto = {
        begrunnelse: '',
        feilutbetaltePerioder: [
            {
                periode: {
                    fom: '1969-04-20',
                    tom: '1969-04-30',
                } as Datoperiode,
                hendelsestype: HendelsestypeEnum.ANNET,
                hendelsesundertype: HendelsesundertypeEnum.ANNET_FRITEKST,
                feilutbetaltBeløp: 6900,
            },
            {
                periode: {
                    fom: '1969-05-01',
                    tom: '1969-05-31',
                } as Datoperiode,
                hendelsestype: HendelsestypeEnum.ANNET,
                hendelsesundertype: HendelsesundertypeEnum.ANNET_FRITEKST,
                feilutbetaltBeløp: 6900,
            },
        ],
        gjelderDødsfall: false,
        kravgrunnlagReferanse: '',
        revurderingsvedtaksdato: '2025-01-31',
        totalFeilutbetaltPeriode: {
            fom: '1969-04-20',
            tom: '1969-05-31',
        } as Datoperiode,
        totaltFeilutbetaltBeløp: 13800,
        vurderingAvBrukersUttalelse: {
            harBrukerUttaltSeg: HarBrukerUttaltSegEnum.NEI,
            beskrivelse: undefined,
        },
        faktainfo: {
            konsekvensForYtelser: ['Feilutbetaling', 'Revurdering av ytelsen'],
            revurderingsresultat: 'Innvilget',
            revurderingsårsak: 'Nye opplysninger',
            tilbakekrevingsvalg: TilbakekrevingsvalgEnum.OPPRETT_TILBAKEKREVING_MED_VARSEL,
        },
    };
    const tilbakekrevingsvalgText =
        tilbakekrevingsvalg[fakta.faktainfo.tilbakekrevingsvalg as unknown as Tilbakekrevingsvalg];
    if (isLoading) return <FaktaSkeleton />;
    return (
        <>
            <div className="flex flex-col gap-8" aria-label="Fakta om feilutbetaling">
                <Heading level="1" size="medium">
                    Fakta om feilutbetalingen
                </Heading>
                <section
                    className="flex md:flex-row flex-col flex-col-3 w-full gap-6"
                    aria-label="Feilutbetaling og revurdering"
                >
                    <div className="flex flex-col flex-1 gap-4 p-4 bg-ax-bg-brand-blue-soft border rounded-xl border-ax-border-neutral-subtle">
                        <Heading level="2" size="small">
                            Feilutbetaling
                        </Heading>
                        <dl className="flex flex-col gap-4">
                            <div>
                                <dt className="font-ax-bold text-ax-medium">Periode</dt>
                                <dd>
                                    {formatterDatostring(fakta.totalFeilutbetaltPeriode.fom)}–
                                    {formatterDatostring(fakta.totalFeilutbetaltPeriode.tom)}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-ax-bold text-ax-medium">Feilutbetalt beløp</dt>
                                <dd className="text-ax-text-danger-subtle">
                                    {fakta.totaltFeilutbetaltBeløp}
                                </dd>
                            </div>
                            {tidligereVarsletBeløp && (
                                <div>
                                    <dt className="font-ax-bold text-ax-medium">
                                        Tidligere varslet beløp
                                    </dt>
                                    <dd>{tidligereVarsletBeløp}</dd>
                                </div>
                            )}
                        </dl>
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
                                        key={fakta.faktainfo.revurderingsårsak}
                                        variant="neutral-moderate"
                                        size="small"
                                    >
                                        {fakta.faktainfo.revurderingsårsak}
                                    </Tag>
                                </dd>
                            </div>
                            <div>
                                <dt className="font-ax-bold text-ax-medium">
                                    Dato for revurderingsvedtak
                                </dt>
                                <dd>{formatterDatostring(fakta.revurderingsvedtaksdato)}</dd>
                            </div>
                            <div>
                                <dt className="font-ax-bold text-ax-medium">Resultat</dt>
                                <dd>{fakta.faktainfo.revurderingsresultat}</dd>
                            </div>
                            <div className="col-span-1">
                                <dt className="font-ax-bold text-ax-medium">Tilbakekrevingsvalg</dt>
                                <dd>
                                    <Tag
                                        key={tilbakekrevingsvalgText}
                                        variant="neutral-moderate"
                                        size="small"
                                    >
                                        {tilbakekrevingsvalgText}
                                    </Tag>
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
                                {fakta.feilutbetaltePerioder.map(periode => (
                                    <Table.Row key={periode.periode.fom}>
                                        <Table.DataCell>
                                            <span className="ml-2">
                                                {formatterDatostring(periode.periode.fom)}–
                                                {formatterDatostring(periode.periode.tom)}
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
                                        <Table.DataCell className="text-end text-ax-text-danger-subtle">
                                            {periode.feilutbetaltBeløp}
                                        </Table.DataCell>
                                        <Table.DataCell className="text-center">
                                            <Button
                                                size="small"
                                                variant="tertiary"
                                                className="align-middle"
                                                icon={
                                                    <PlusIcon title="Legg til rettslig grunnlag" />
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
                    <RadioGroup size="small" legend="Hvem oppdaget feilutbetaling?">
                        <Radio value="Bruker">Bruker</Radio>
                        <Radio value="Nav">Nav</Radio>
                    </RadioGroup>
                    <Textarea
                        label="Hvordan ble feilutbetalingen oppdaget?"
                        size="small"
                        className="w-100"
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
