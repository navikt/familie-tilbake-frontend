import {
    Buildings3Icon,
    CalendarFillIcon,
    CalendarIcon,
    ClipboardIcon,
    FileCheckmarkIcon,
} from '@navikt/aksel-icons';
import { Box, Heading, Tag } from '@navikt/ds-react';
import React from 'react';

type Props = {
    tittel: string;
};

export const Faktaboks: React.FC<Props> = () => {
    const type = 'overgangsstønad'; //TODO
    const status = 'Avsluttet'; // TODO
    const resultat = 'Ingen tilbakebetaling'; // TODO
    const opprettet = '01.01.2024'; // TODO
    const avsluttet = '01.01.2025'; // TODO
    const enhet = '1234'; // TODO

    return (
        <Box
            padding="4"
            className="border-1 rounded-xl border-border-divider flex flex-col gap-4 bg-white"
        >
            <Heading size="xsmall" level="2">
                Revurdering tilbakekreving av {type}
            </Heading>

            <dl className="grid grid-cols-[136px_1fr] gap-y-2 gap-x-4">
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

                {opprettet && (
                    <>
                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <CalendarIcon
                                title="a11y-title"
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Opprettet
                        </dt>
                        <dd className="text-medium items-center flex">{opprettet}</dd>
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
