import type { Bruker } from '../../../../typer/bruker';
import type { Institusjon } from '../../../../typer/fagsak';

import {
    BagdeIcon,
    Buildings2Icon,
    CandleIcon,
    FigureCombinationIcon,
    FigureInwardIcon,
    FigureOutwardIcon,
    FlowerPetalFallingIcon,
} from '@navikt/aksel-icons';
import { Box, CopyButton, Heading, Tag } from '@navikt/ds-react';
import React from 'react';

import { Kjønn } from '../../../../typer/bruker';
import { hentAlder } from '../../../../utils';
import { ICON_PROPS } from '../utils';

const erDNummer = (personIdent: string): boolean => personIdent.charAt(0) > '3';

const formatterPersonIdent = (personIdent: string): string =>
    personIdent.replace(/(\d{6})(\d{5})/, '$1 $2');

const formatterOrgNummer = (orgNummer: string): string =>
    orgNummer.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

const kjønnIkon = (kjønn: Kjønn): React.ReactNode => {
    switch (kjønn) {
        case Kjønn.Kvinne:
            return <FigureOutwardIcon {...ICON_PROPS} />;
        case Kjønn.Mann:
            return <FigureInwardIcon {...ICON_PROPS} />;
        default:
            return <FigureCombinationIcon {...ICON_PROPS} />;
    }
};

type Props = {
    bruker: Bruker;
    institusjon: Institusjon | null;
};

export const BrukerInformasjon: React.FC<Props> = ({ bruker, institusjon }) => {
    return (
        <Box
            padding="4"
            className="border rounded-xl border-ax-border-neutral-subtle flex flex-col gap-4 bg-ax-bg-default"
        >
            <Heading size="xsmall" level="2">
                Bruker
            </Heading>

            <dl className="grid grid-cols-[136px_1fr] ax-xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                    {kjønnIkon(bruker.kjønn)}
                    Navn
                </dt>
                <dd className="text-ax-medium">{bruker.navn}</dd>

                <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                    <CandleIcon {...ICON_PROPS} />
                    Alder
                </dt>
                <dd className="text-ax-medium">
                    {hentAlder(bruker.fødselsdato, bruker.dødsdato)} år
                </dd>

                <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                    <BagdeIcon {...ICON_PROPS} />
                    {erDNummer(bruker.personIdent) ? 'D-nummer' : 'Fødselsnummer'}
                </dt>
                <dd className="text-ax-medium flex flex-row gap-2 items-center">
                    {formatterPersonIdent(bruker.personIdent)}
                    <CopyButton copyText={bruker.personIdent} className="p-0" />
                </dd>

                {bruker.dødsdato && (
                    <>
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <FlowerPetalFallingIcon {...ICON_PROPS} />
                            Dødsdato
                        </dt>
                        <dd className="text-ax-medium">
                            <Tag size="small" variant="neutral-filled">
                                {bruker.dødsdato}
                            </Tag>
                        </dd>
                    </>
                )}
                {institusjon && (
                    <>
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <Buildings2Icon {...ICON_PROPS} />
                            Institusjon
                        </dt>
                        <dd className="text-ax-medium">{institusjon.navn}</dd>

                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <Buildings2Icon {...ICON_PROPS} />
                            Org.nummer
                        </dt>
                        <dd className="text-ax-medium flex flex-row gap-2 items-center">
                            {formatterOrgNummer(institusjon.organisasjonsnummer)}
                            <CopyButton
                                copyText={institusjon.organisasjonsnummer}
                                className="p-0"
                            />
                        </dd>
                    </>
                )}
            </dl>
        </Box>
    );
};
