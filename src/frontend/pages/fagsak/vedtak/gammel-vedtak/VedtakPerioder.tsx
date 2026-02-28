import type { FC } from 'react';
import type { BeregningsresultatPeriode } from '~/typer/vedtakTyper';

import { Table } from '@navikt/ds-react';

import { vurderinger } from '~/kodeverk';
import { formatCurrencyNoKr, formatterDatostring } from '~/utils';

type Props = {
    perioder: BeregningsresultatPeriode[];
};

export const VedtakPerioder: FC<Props> = ({ perioder }) => {
    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.DataCell scope="col">Periode</Table.DataCell>
                    <Table.DataCell scope="col">Feilutbetalt beløp</Table.DataCell>
                    <Table.DataCell scope="col">Vurdering</Table.DataCell>
                    <Table.DataCell scope="col">Andel av beløp</Table.DataCell>
                    <Table.DataCell scope="col">Renter</Table.DataCell>
                    <Table.DataCell scope="col">Beløp før skatt</Table.DataCell>
                    <Table.DataCell scope="col">Beløp etter skatt</Table.DataCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {perioder.map((per, index) => {
                    return (
                        <Table.Row key={index}>
                            <Table.DataCell>
                                {`${formatterDatostring(per.periode.fom)} - ${formatterDatostring(
                                    per.periode.tom
                                )}`}
                            </Table.DataCell>
                            <Table.DataCell>
                                {formatCurrencyNoKr(per.feilutbetaltBeløp)}
                            </Table.DataCell>
                            <Table.DataCell>{vurderinger[per.vurdering]}</Table.DataCell>
                            <Table.DataCell>
                                {per.andelAvBeløp !== undefined && per.andelAvBeløp !== null
                                    ? `${per.andelAvBeløp} %`
                                    : ''}
                            </Table.DataCell>
                            <Table.DataCell>
                                {per.renteprosent ? `${per.renteprosent}%` : ''}
                            </Table.DataCell>
                            <Table.DataCell>
                                {formatCurrencyNoKr(per.tilbakekrevingsbeløp)}
                            </Table.DataCell>
                            <Table.DataCell>
                                {formatCurrencyNoKr(per.tilbakekrevesBeløpEtterSkatt)}
                            </Table.DataCell>
                        </Table.Row>
                    );
                })}
                <Table.DataCell>Sum</Table.DataCell>
                <Table.DataCell>
                    {formatCurrencyNoKr(
                        perioder.reduce((sum, periode) => sum + periode.feilutbetaltBeløp, 0)
                    )}
                </Table.DataCell>
                <Table.DataCell></Table.DataCell>
                <Table.DataCell></Table.DataCell>
                <Table.DataCell></Table.DataCell>
                <Table.DataCell>
                    {formatCurrencyNoKr(
                        perioder.reduce((sum, periode) => sum + periode.tilbakekrevingsbeløp, 0)
                    )}
                </Table.DataCell>
                <Table.DataCell>
                    {formatCurrencyNoKr(
                        perioder.reduce(
                            (sum, periode) => sum + periode.tilbakekrevesBeløpEtterSkatt,
                            0
                        )
                    )}
                </Table.DataCell>
            </Table.Body>
        </Table>
    );
};
