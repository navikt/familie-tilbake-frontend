import type { FC } from 'react';
import type { Beregningsresultat, BeregningsresultatVurdering } from '~/generated-new/types.gen';

import { ExpansionCard, Table } from '@navikt/ds-react';

import { formatterDatostring, formatCurrencyNoKr } from '~/utils';

const vurderingstekster: Record<BeregningsresultatVurdering, string> = {
    FORSETT: 'Forsett',
    GROV_UAKTSOMHET: 'Grov uaktsom',
    UAKTSOMHET: 'Uaktsom',
    GOD_TRO: 'God tro',
};

type Props = {
    beregningsresultat: Beregningsresultat;
};

export const Vedtakstabell: FC<Props> = ({ beregningsresultat }) => {
    const { beregningsresultatsperioder } = beregningsresultat;

    const totalFeilutbetalt = beregningsresultatsperioder.reduce(
        (sum, periode) => sum + periode.feilutbetaltBeløp,
        0
    );
    const totalBeløpFørSkatt = beregningsresultatsperioder.reduce(
        (sum, periode) => sum + periode.tilbakekrevingsbeløp,
        0
    );
    const totalBeløpEtterSkatt = beregningsresultatsperioder.reduce(
        (sum, periode) => sum + periode.tilbakekrevesBeløpEtterSkatt,
        0
    );

    return (
        <ExpansionCard
            size="small"
            defaultOpen
            aria-label="Oppsummering av vedtaket"
            className="border-ax-border-neutral-subtle"
        >
            <ExpansionCard.Header>
                <ExpansionCard.Title as="h2" size="small">
                    Oppsummering av vedtaket
                </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <Table size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Feilutbetalt
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">Vurdering</Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Beløpsandel
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Renter
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Før skatt
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Etter skatt
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {beregningsresultatsperioder.map(periode => (
                            <Table.Row key={`${periode.fom}-${periode.tom}`}>
                                <Table.DataCell>
                                    {`${formatterDatostring(periode.fom)}\u2013${formatterDatostring(periode.tom)}`}
                                </Table.DataCell>
                                <Table.DataCell
                                    align="right"
                                    className="text-ax-text-brand-magenta"
                                >
                                    {formatCurrencyNoKr(periode.feilutbetaltBeløp)}
                                </Table.DataCell>
                                <Table.DataCell>
                                    {vurderingstekster[periode.vurdering]}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {`${periode.andelAvBeløp}`}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {`${periode.renteprosent}`}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {formatCurrencyNoKr(periode.tilbakekrevingsbeløp)}
                                </Table.DataCell>
                                <Table.DataCell align="right">
                                    {formatCurrencyNoKr(periode.tilbakekrevesBeløpEtterSkatt)}
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                        <Table.Row>
                            <Table.DataCell>
                                <strong>Sum</strong>
                            </Table.DataCell>
                            <Table.DataCell align="right" className="text-ax-text-brand-magenta">
                                <strong>{formatCurrencyNoKr(totalFeilutbetalt)}</strong>
                            </Table.DataCell>
                            <Table.DataCell />
                            <Table.DataCell />
                            <Table.DataCell />
                            <Table.DataCell align="right">
                                <strong>{formatCurrencyNoKr(totalBeløpFørSkatt)}</strong>
                            </Table.DataCell>
                            <Table.DataCell align="right">
                                <strong>{formatCurrencyNoKr(totalBeløpEtterSkatt)}</strong>
                            </Table.DataCell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};
