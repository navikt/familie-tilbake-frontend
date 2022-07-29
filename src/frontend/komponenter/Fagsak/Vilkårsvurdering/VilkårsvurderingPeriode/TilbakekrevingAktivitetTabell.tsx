import * as React from 'react';

import styled from 'styled-components';

import { Table } from '@navikt/ds-react';

import { YtelseInfo } from '../../../../typer/feilutbetalingtyper';
import { formatCurrencyNoKr } from '../../../../utils';

const StyledPeriodeTable = styled(Table)`
    width: 400px;

    th,
    td {
        padding: 10px 5px;
    }
`;

interface IProps {
    ytelser?: YtelseInfo[];
}

const TilbakekrevingAktivitetTabell: React.FC<IProps> = ({ ytelser }) => {
    return ytelser && ytelser.length > 0 ? (
        <StyledPeriodeTable>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Aktivitet</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">
                        Feilutbetalt beløp
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <tbody>
                {ytelser.map(y => (
                    <Table.Row key={y.aktivitet}>
                        <Table.DataCell>{y.aktivitet}</Table.DataCell>
                        <Table.DataCell align="right">{formatCurrencyNoKr(y.beløp)}</Table.DataCell>
                    </Table.Row>
                ))}
            </tbody>
        </StyledPeriodeTable>
    ) : null;
};

export default TilbakekrevingAktivitetTabell;
