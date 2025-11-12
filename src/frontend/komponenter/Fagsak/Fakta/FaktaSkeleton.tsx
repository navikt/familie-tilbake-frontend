import { PlusIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading, Skeleton, Table } from '@navikt/ds-react';
import * as React from 'react';

import { ActionBarSkeleton } from '../ActionBar/ActionBarSkeleton';

export const FaktaSkeleton: React.FC = () => {
    return (
        <>
            <div className="flex flex-col gap-8" aria-label="Fakta om feilutbetaling">
                <Heading level="1" size="medium">
                    Fakta om feilutbetalingen
                </Heading>
                <section
                    className="flex md:flex-row flex-col flex-col-3 w-full gap-6"
                    aria-label="Feilutbetaling og revurdering"
                >
                    <div className="flex flex-col flex-1 gap-4 p-4 bg-ax-bg-brand-blue-soft border rounded-xl border-ax-border-neutral-subtle">
                        <Heading level="2" size="small">
                            Feilutbetaling
                        </Heading>
                        <dl className="flex flex-col gap-4">
                            <div>
                                <dt className="font-ax-bold text-ax-medium">Periode</dt>
                                <dd>
                                    <Skeleton variant="rounded" width="50%" />
                                </dd>
                            </div>
                            <div>
                                <dt className="font-ax-bold text-ax-medium">Feilutbetalt beløp</dt>
                                <dd className="text-ax-text-danger-subtle">
                                    <Skeleton variant="rounded" width="50%" />
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div className="flex flex-col flex-2 gap-4 p-4 border rounded-xl border-ax-border-neutral-subtle">
                        <Heading level="2" size="small">
                            Revurdering
                        </Heading>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="font-ax-bold text-ax-medium">
                                    Årsak til revurdering
                                </dt>
                                <dd>
                                    <Skeleton variant="rounded" width="50%" />
                                </dd>
                            </div>
                            <div>
                                <dt className="font-ax-bold text-ax-medium">
                                    Dato for revurderingsvedtak
                                </dt>
                                <dd>
                                    <Skeleton variant="rounded" width="50%" />
                                </dd>
                            </div>
                            <div>
                                <dt className="font-ax-bold text-ax-medium">Resultat</dt>
                                <dd>
                                    <Skeleton variant="rounded" width="50%" />
                                </dd>
                            </div>
                            <div className="col-span-1">
                                <dt className="font-ax-bold text-ax-medium">Tilbakekrevingsvalg</dt>
                                <dd>
                                    <Skeleton variant="rounded" width="50%" />
                                </dd>
                            </div>
                        </dl>
                    </div>
                </section>
                <section className="flex flex-col gap-6" aria-label="Rettslig grunnlag innhold">
                    <Heading level="2" size="small">
                        Rettslig grunnlag
                    </Heading>
                    <div className="border rounded-xl border-ax-border-neutral-subtle">
                        <Table>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell scope="col">
                                        <span className="ml-2">Periode</span>
                                    </Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Bestemmelse</Table.HeaderCell>
                                    <Table.HeaderCell scope="col">Grunnlag</Table.HeaderCell>
                                    <Table.HeaderCell scope="col" className="text-end">
                                        Feilutbetalt beløp
                                    </Table.HeaderCell>
                                    <Table.HeaderCell scope="col" className="text-right">
                                        Valg
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.DataCell>
                                        <Skeleton variant="rounded" />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Skeleton variant="rounded" />
                                    </Table.DataCell>
                                    <Table.DataCell>
                                        <Skeleton variant="rounded" />
                                    </Table.DataCell>
                                    <Table.DataCell className="text-end text-ax-text-danger-subtle">
                                        <Skeleton variant="rounded" />
                                    </Table.DataCell>
                                    <Table.DataCell className="text-right">
                                        <Button
                                            size="small"
                                            variant="tertiary"
                                            className="align-middle"
                                            icon={<PlusIcon title="Legg til rettslig grunnlag" />}
                                        />
                                    </Table.DataCell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                    </div>
                </section>
                <section
                    className="flex flex-col gap-6 w-100"
                    aria-label="Rettslig grunnlag innhold"
                >
                    <Heading level="2" size="small">
                        Detaljer om feilutbetalingen
                    </Heading>
                    <div className="flex flex-col gap-1">
                        <BodyShort size="small" className="flex flex-col gap-1 mb-1">
                            <span className="font-ax-bold">Årsak til feilutbetalingen</span>
                            <span className="text-ax-text-neutral-subtle text-ax-medium">
                                Beskriv hvorfor utbetalingen er feil, og hva som har ført til at
                                brukeren har fått utbetalt for mye
                            </span>
                        </BodyShort>
                        <Skeleton height={80} variant="rounded" />
                        <BodyShort
                            size="small"
                            className="text-ax-text-neutral-subtle text-ax-medium"
                        >
                            3000 tegn igjen
                        </BodyShort>
                    </div>
                    <div className="flex flex-col gap-2">
                        <BodyShort size="small" className="font-ax-bold">
                            Når ble feilutbetalingen oppdaget?
                        </BodyShort>
                        <Skeleton variant="rounded" width="50%" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <BodyShort size="small" className="font-ax-bold">
                            Hvem oppdaget feilutbetalingen?
                        </BodyShort>
                        <Skeleton variant="rounded" width="20%" />
                        <Skeleton variant="rounded" width="20%" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <BodyShort size="small" className="font-ax-bold">
                            Hvordan ble feilutbetalingen oppdaget?
                        </BodyShort>
                        <Skeleton height={80} variant="rounded" />
                    </div>
                </section>
            </div>
            <ActionBarSkeleton />
        </>
    );
};
