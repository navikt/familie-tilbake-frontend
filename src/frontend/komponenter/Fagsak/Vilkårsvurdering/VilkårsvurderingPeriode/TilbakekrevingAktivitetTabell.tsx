import type { YtelseInfo } from '../../../../typer/feilutbetalingtyper';

import { Table } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import { formatCurrencyNoKr } from '../../../../utils';

const StyledPeriodeTable = styled(Table)`
    max-width: 30rem;
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
            <Table.Body>
                {ytelser.map(y => (
                    <Table.Row key={y.aktivitet}>
                        <Table.DataCell>{y.aktivitet}</Table.DataCell>
                        <Table.DataCell align="right">{formatCurrencyNoKr(y.beløp)}</Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </StyledPeriodeTable>
    ) : null;
};

export default TilbakekrevingAktivitetTabell;
