import type { BeregningsresultatPeriode } from '../../../typer/vedtakTyper';

import * as React from 'react';
import { styled } from 'styled-components';

import { vurderinger } from '../../../kodeverk';
import { formatCurrencyNoKr, formatterDatostring } from '../../../utils';

const StyledPeriodeTable = styled.table`
    width: 90%;

    th {
        text-align: left;
    }

    th,
    td {
        padding: 10px 5px 10px 5px;
        border-bottom: 1px solid black;
    }

    tfoot {
        font-weight: 600;
    }
`;

type Props = {
    perioder: BeregningsresultatPeriode[];
};

export const VedtakPerioder: React.FC<Props> = ({ perioder }) => {
    return (
        <StyledPeriodeTable cellPadding="0" cellSpacing="0">
            <thead>
                <tr>
                    <th>Periode</th>
                    <th>Feilutbetalt beløp</th>
                    <th>Vurdering</th>
                    <th>Andel av beløp</th>
                    <th>Renter</th>
                    <th>Beløp før skatt</th>
                    <th>Beløp etter skatt</th>
                </tr>
            </thead>
            <tbody>
                {perioder.map((per, index) => {
                    return (
                        <tr key={index}>
                            <td>
                                {`${formatterDatostring(per.periode.fom)} - ${formatterDatostring(
                                    per.periode.tom
                                )}`}
                            </td>
                            <td>{formatCurrencyNoKr(per.feilutbetaltBeløp)}</td>
                            <td>{vurderinger[per.vurdering]}</td>
                            <td>
                                {per.andelAvBeløp !== undefined && per.andelAvBeløp !== null
                                    ? `${per.andelAvBeløp} %`
                                    : ''}
                            </td>
                            <td>{per.renteprosent ? `${per.renteprosent}%` : ''}</td>
                            <td>{formatCurrencyNoKr(per.tilbakekrevingsbeløp)}</td>
                            <td>{formatCurrencyNoKr(per.tilbakekrevesBeløpEtterSkatt)}</td>
                        </tr>
                    );
                })}
            </tbody>
            <tfoot>
                <tr>
                    <td>Sum</td>
                    <td>
                        {formatCurrencyNoKr(
                            perioder.reduce((sum, periode) => sum + periode.feilutbetaltBeløp, 0)
                        )}
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                        {formatCurrencyNoKr(
                            perioder.reduce((sum, periode) => sum + periode.tilbakekrevingsbeløp, 0)
                        )}
                    </td>
                    <td>
                        {formatCurrencyNoKr(
                            perioder.reduce(
                                (sum, periode) => sum + periode.tilbakekrevesBeløpEtterSkatt,
                                0
                            )
                        )}
                    </td>
                </tr>
            </tfoot>
        </StyledPeriodeTable>
    );
};
