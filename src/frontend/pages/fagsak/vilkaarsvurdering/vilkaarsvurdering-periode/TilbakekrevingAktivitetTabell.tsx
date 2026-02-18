import type { YtelseInfo } from '@typer/tilbakekrevingstyper';

import { Table } from '@navikt/ds-react';
import { formatCurrencyNoKr } from '@utils';
import * as React from 'react';

type Props = {
    ytelser?: YtelseInfo[];
};

export const TilbakekrevingAktivitetTabell: React.FC<Props> = ({ ytelser }) => {
    return ytelser && ytelser.length > 0 ? (
        <Table>
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
        </Table>
    ) : null;
};
