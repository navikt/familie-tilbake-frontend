import type { Institusjon } from '../../../../typer/fagsak';
import type { Person } from '../../../../typer/person';

import { BagdeIcon, Buildings2Icon, FlowerPetalFallingIcon, PersonIcon } from '@navikt/aksel-icons';
import { Box, Heading, Tag } from '@navikt/ds-react';
import React from 'react';

import { hentAlder } from '../../../../utils';

type Props = {
    bruker: Person;
    insitusjon?: Institusjon;
};

export const BrukerBoks: React.FC<Props> = ({ bruker, insitusjon }) => {
    return (
        <Box
            padding="4"
            className="border-1 rounded-xl border-border-divider flex flex-col gap-4 bg-white"
        >
            <Heading size="xsmall" level="2">
                Bruker
            </Heading>

            <dl className="grid grid-cols-[120px_1fr] gap-y-2 gap-x-4">
                <dt className="w-36 text-medium font-bold flex flex-row gap-2 items-center">
                    <PersonIcon title="a11y-title" fontSize="1rem" className="text-icon-subtle" />
                    Navn
                </dt>
                <dd className="text-medium">
                    {bruker.navn} ({hentAlder(bruker.fødselsdato, bruker.dødsdato)} år)
                </dd>

                <dt className="w-36 text-medium font-bold flex flex-row gap-2 items-center">
                    <BagdeIcon title="a11y-title" fontSize="1rem" className="text-icon-subtle" />
                    Fødselsnummer
                    {/* D-nummer logikk + oppdeling av tallet + kopiering(CopyButton) + lengde på fnr*/}
                </dt>
                <dd className="text-medium">{bruker.personIdent}</dd>

                {bruker.dødsdato && (
                    <>
                        <dt className="w-36 text-medium font-bold flex flex-row gap-2 items-center">
                            <FlowerPetalFallingIcon
                                title="a11y-title"
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Dødsdato
                        </dt>
                        <dd className="text-medium">
                            <Tag size="small" variant="neutral-filled" className="border-0 px-2">
                                {bruker.dødsdato}
                            </Tag>
                        </dd>
                    </>
                )}
                {insitusjon && (
                    <>
                        <dt className="w-36 text-medium font-bold flex flex-row gap-2 items-center">
                            <Buildings2Icon
                                title="a11y-title"
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Institusjon
                        </dt>
                        <dd className="text-medium">{insitusjon.navn}</dd>
                        <dt className="w-36 text-medium font-bold flex flex-row gap-2 items-center">
                            <Buildings2Icon
                                title="a11y-title"
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Org.nummer
                        </dt>
                        <dd className="text-medium">
                            {insitusjon.organisasjonsnummer}
                            {/* TODO 3+2+3 og kopier logikk */}
                        </dd>
                    </>
                )}
            </dl>
        </Box>
    );
};
