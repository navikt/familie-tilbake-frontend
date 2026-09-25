import type { FC } from 'react';

import { ExpansionCard, Skeleton, Table } from '@navikt/ds-react';

const SkeletonRad: FC = () => (
    <Table.Row>
        <Table.DataCell>
            {/* Periode */}
            <Skeleton variant="text" width="150%" />
        </Table.DataCell>
        <Table.DataCell align="right">
            {/* Feilutbetalt */}
            <Skeleton variant="text" width="60%" className="ml-auto" />
        </Table.DataCell>
        <Table.DataCell>
            {/* Vurdering */}
            <Skeleton variant="text" width="70%" />
        </Table.DataCell>
        <Table.DataCell align="right">
            {/* I behold */}
            <Skeleton variant="text" width="40%" className="ml-auto" />
        </Table.DataCell>
        <Table.DataCell align="right">
            {/* Reduksjon */}
            <Skeleton variant="text" width="40%" className="ml-auto" />
        </Table.DataCell>
        <Table.DataCell align="right">
            {/* Renter */}
            <Skeleton variant="text" width="60%" className="ml-auto" />
        </Table.DataCell>
        <Table.DataCell align="right">
            {/* Beløp */}
            <Skeleton variant="text" width="60%" className="ml-auto" />
        </Table.DataCell>
    </Table.Row>
);

export const VedtakstabellSkeleton: FC = () => {
    return (
        <ExpansionCard
            size="small"
            defaultOpen
            aria-label="Laster oppsummering av vedtaket"
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
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Reduksjon
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Renter
                            </Table.HeaderCell>
                            <Table.HeaderCell scope="col" align="right">
                                Beløp
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
