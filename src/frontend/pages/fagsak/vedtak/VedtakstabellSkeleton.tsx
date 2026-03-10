import type { FC } from 'react';

import { ExpansionCard, Skeleton, Table } from '@navikt/ds-react';

const SkeletonRad: FC = () => (
    <Table.Row>
        <Table.DataCell>
            <Skeleton variant="text" width="80%" />
        </Table.DataCell>
        <Table.DataCell align="right">
            <Skeleton variant="text" width="60%" />
        </Table.DataCell>
        <Table.DataCell>
            <Skeleton variant="text" width="70%" />
        </Table.DataCell>
        <Table.DataCell align="right">
            <Skeleton variant="text" width="40%" />
        </Table.DataCell>
        <Table.DataCell align="right">
            <Skeleton variant="text" width="40%" />
        </Table.DataCell>
        <Table.DataCell align="right">
            <Skeleton variant="text" width="60%" />
        </Table.DataCell>
        <Table.DataCell align="right">
            <Skeleton variant="text" width="60%" />
        </Table.DataCell>
    </Table.Row>
);

export const VedtakstabellSkeleton: FC = () => {
    return (
        <ExpansionCard
            size="small"
            defaultOpen
            aria-label="Laster oppsummering av vedtaket"
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
                                Feilutbetalt beløp
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col">Vurdering</Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Andel av beløp
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Renter
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Beløp før skatt
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Beløp etter skatt
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        <SkeletonRad />
                        <SkeletonRad />
                        <SkeletonRad />
                    </Table.Body>
                </Table>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};
