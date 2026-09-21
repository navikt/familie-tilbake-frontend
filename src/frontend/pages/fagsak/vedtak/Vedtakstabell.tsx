import type { FC } from 'react';
import type { Beregningsresultat } from '@/generated-new/types.gen';

import { ExpansionCard, Table, Tag } from '@navikt/ds-react';

import { formatCurrencyNoKr, formatterDatostring } from '@/utils';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';
import { vurderingsmapper, vurderingstag } from '@/utils/vurderingstag';

type Props = {
    beregningsresultat: Beregningsresultat;
};

export const Vedtakstabell: FC<Props> = ({ beregningsresultat }: Props) => {
    const { beregningsresultatsperioder } = beregningsresultat;

    const totalFeilutbetalt = beregningsresultatsperioder.reduce(
        (sum, periode) => sum + periode.feilutbetaltBeløp,
        0
    );
    const erSkattRelevant = beregningsresultatsperioder.some(periode => periode.skattebeløp);
    const totalSkatt = beregningsresultatsperioder.reduce(
        (sum, periode) => sum + (periode.skattebeløp || 0),
        0
    );

    const totalTilbakekrevingsbeløp = beregningsresultatsperioder.reduce(
        (sum, periode) => sum + periode.tilbakekrevingsbeløp,
        0
    );
    const totaltBeløpIBehold = beregningsresultatsperioder.reduce(
        (sum, periode) => sum + (periode.beløpIbehold || 0),
        0
    );
    return (
        <ExpansionCard
            size="small"
            defaultOpen
            onToggle={(åpen: boolean): void =>
                sporHendelse(
                    åpen ? Hendelser.UTVIDBART_KORT_APNET : Hendelser.UTVIDBART_KORT_LUKKET,
                    {
                        tittel: 'Oppsummering av vedtaket',
                        kontekst: Sporingskontekst.Vedtak,
                        komponentId: 'vedtakstabell',
                    }
                )
            }
            aria-label="Oppsummering av vedtaket"
            className="border-ax-border-brand-blue-subtle"
        >
            <ExpansionCard.Header>
                <ExpansionCard.Title as="h2" size="small">
                    Oppsummering av vedtaket
                </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content className="py-0">
                <Table zebraStripes>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Feilutbetalt
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">Vurdering</Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                I behold
                                {/* Vises ikke alltid (kun hvis det er en periode med god tro), Ikke relevant når det ikke gjelder */}
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Reduksjon
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Renter
                            </Table.HeaderCell>
                            {erSkattRelevant && (
                                <Table.HeaderCell scope="col" align="right">
                                    Skatt
                                </Table.HeaderCell>
                            )}
                            <Table.HeaderCell scope="col" align="right">
                                Beløp
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {beregningsresultatsperioder.map(periode => (
                            <Table.Row key={`${periode.fom}–${periode.tom}`}>
                                <Table.DataCell>
                                    {`${formatterDatostring(periode.fom)}\u2013${formatterDatostring(periode.tom)}`}
                                </Table.DataCell>
                                <Table.DataCell
                                    align="right"
                                    className="text-ax-text-brand-magenta"
                                >
                                    {formatCurrencyNoKr(periode.feilutbetaltBeløp)} kr
                                </Table.DataCell>
                                <Table.DataCell>
                                    <Tag
                                        variant="moderate"
                                        size="small"
                                        className="w-fit"
                                        data-color={
                                            vurderingstag[vurderingsmapper[periode.vurdering]][
                                                'data-color'
                                            ]
                                        }
                                    >
                                        {vurderingstag[vurderingsmapper[periode.vurdering]].label}
                                    </Tag>
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {periode.beløpIbehold
                                        ? `${formatCurrencyNoKr(periode.beløpIbehold)} kr`
                                        : 'Ikke relevant'}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {periode.reduksjonprosent
                                        ? `${100 - periode.reduksjonprosent} %`
                                        : '0 kr'}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {periode.renteprosent ? `${periode.renteprosent} %` : 'Nei'}
                                </Table.DataCell>
                                {erSkattRelevant && (
                                    <Table.DataCell align="right">
                                        -{formatCurrencyNoKr(periode.skattebeløp)} kr
                                    </Table.DataCell>
                                )}
                                <Table.DataCell align="right">
                                    {formatCurrencyNoKr(periode.tilbakekrevingsbeløp)} kr
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                        <Table.Row className="border-t-2 border-ax-border-brand-blue-subtle">
                            <Table.DataCell className="border-b-0 font-bold">
                                Totalt beløp
                            </Table.DataCell>
                            <Table.DataCell
                                align="right"
                                className="text-ax-text-brand-magenta border-b-0 font-bold"
                            >
                                {formatCurrencyNoKr(totalFeilutbetalt)} kr
                            </Table.DataCell>
                            {/* Vurdering */}
                            <Table.DataCell className="border-b-0" />
                            <Table.DataCell align="right" className="border-b-0">
                                {formatCurrencyNoKr(totaltBeløpIBehold)} kr
                            </Table.DataCell>
                            {/* Reduksjon */}
                            <Table.DataCell className="border-b-0" />
                            <Table.DataCell align="right" className="border-b-0">
                                {/* Renter, skal være et beløp */}
                            </Table.DataCell>
                            {erSkattRelevant && (
                                <Table.DataCell align="right" className="border-b-0">
                                    -{formatCurrencyNoKr(totalSkatt)} kr
                                </Table.DataCell>
                            )}
                            <Table.DataCell align="right" className="border-b-0 font-bold">
                                {formatCurrencyNoKr(totalTilbakekrevingsbeløp)} kr
                            </Table.DataCell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};
