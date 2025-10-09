import type { Behandling } from '../../../../typer/behandling';
import type { Fagsak } from '../../../../typer/fagsak';

import {
    Buildings3Icon,
    CalendarFillIcon,
    CalendarIcon,
    ClipboardIcon,
    FileCheckmarkIcon,
} from '@navikt/aksel-icons';
import { Box, Heading, Tag } from '@navikt/ds-react';
import React from 'react';

import { formatterDatostring } from '../../../../utils';

type Props = {
    behandling: Behandling;
    ytelsestype: Fagsak['ytelsestype'];
};

export const Faktaboks: React.FC<Props> = ({ behandling, ytelsestype }) => {
    // const årsak = ''; // TODO
    const status = 'Avsluttet'; // TODO
    const resultat = 'Ingen tilbakebetaling'; // TODO
    const avsluttet = '01.01.2025'; // TODO
    const enhet = '1234'; // TODO

    return (
        <Box
            padding="4"
            className="border-1 rounded-xl border-border-divider flex flex-col gap-4 bg-white"
        >
            <Heading size="xsmall" level="2">
                Revurdering tilbakekreving av {ytelsestype}
            </Heading>

            <dl className="grid grid-cols-[136px_1fr] xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                    <FileCheckmarkIcon
                        title="a11y-title"
                        fontSize="1rem"
                        className="text-icon-subtle"
                    />
                    Status
                </dt>
                <dd className="text-medium items-center flex">
                    <Tag size="small" variant="success-moderate" className="border-0 px-2">
                        {status}
                        {/* TODO Chip */}
                    </Tag>
                </dd>

                {resultat && (
                    <>
                        <dt className="shrink-0 text-medium font-bold flex flex-row gap-2 items-center">
                            <ClipboardIcon
                                title="a11y-title"
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Resultat
                        </dt>
                        <dd className="text-medium items-center flex">
                            <Tag size="small" variant="warning-moderate" className="border-0 px-2">
                                {resultat}
                                {/* TODO Chip */}
                            </Tag>
                        </dd>
                    </>
                )}

                {behandling.opprettetDato && (
                    <>
                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <CalendarIcon
                                title="a11y-title"
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Opprettet
                        </dt>
                        <dd className="text-medium items-center flex">
                            {formatterDatostring(behandling.opprettetDato)}
                        </dd>
                    </>
                )}

                {avsluttet && (
                    <>
                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <CalendarFillIcon
                                title="a11y-title"
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Avsluttet
                        </dt>
                        <dd className="text-medium items-center flex">{avsluttet}</dd>
                    </>
                )}

                {enhet && (
                    <>
                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <Buildings3Icon
                                title="a11y-title"
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Enhet
                        </dt>
                        <dd className="text-medium items-center flex">{enhet}</dd>
                    </>
                )}
            </dl>
        </Box>
    );
};
