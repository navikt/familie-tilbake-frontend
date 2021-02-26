import * as React from 'react';

import styled from 'styled-components';

import { YtelseInfo } from '../../../../typer/feilutbetalingtyper';
import { formatCurrencyNoKr } from '../../../../utils';

const StyledPeriodeTable = styled.table`
    width: 400px;

    th {
        border-bottom: 1px solid black;
    }

    th,
    td {
        padding: 10px 5px;

        :first-child {
            text-align: left;
        }

        :last-child {
            text-align: right;
        }
    }

    tbody tr:last-child td {
        border-bottom: 1px solid black;
    }
`;

interface IProps {
    ytelser?: YtelseInfo[];
}

const TilbakekrevingAktivitetTabell: React.FC<IProps> = ({ ytelser }) => {
    return ytelser && ytelser.length > 0 ? (
        <StyledPeriodeTable cellPadding={0} cellSpacing={0}>
            <thead>
                <tr>
                    <th>Aktivitet</th>
                    <th>Feilutbetalt beløp</th>
                </tr>
            </thead>
            <tbody>
                {ytelser.map(y => (
                    <tr key={y.aktivitet}>
                        <td>{y.aktivitet}</td>
                        <td>{formatCurrencyNoKr(y.beløp)}</td>
                    </tr>
                ))}
            </tbody>
        </StyledPeriodeTable>
    ) : null;
};

export default TilbakekrevingAktivitetTabell;
