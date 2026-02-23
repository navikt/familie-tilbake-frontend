import type { KjønnEnum } from '~/generated';

import {
    BagdeIcon,
    Buildings2Icon,
    CandleIcon,
    FigureCombinationIcon,
    FigureInwardIcon,
    FigureOutwardIcon,
    FlowerPetalFallingIcon,
} from '@navikt/aksel-icons';
import { CopyButton, ExpansionCard, Tag } from '@navikt/ds-react';
import React from 'react';

import { useFagsak } from '~/context/FagsakContext';
import { formatterDatostring, hentAlder } from '~/utils';

import { ICON_PROPS } from '../utils';

const erDNummer = (personIdent: string): boolean => personIdent.charAt(0) > '3';

const formatterPersonIdent = (personIdent: string): string =>
    personIdent.replace(/(\d{6})(\d{5})/, '$1 $2');

const formatterOrgNummer = (orgNummer: string): string =>
    orgNummer.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');

const kjønnIkon = (kjønn: KjønnEnum): React.ReactNode => {
    switch (kjønn) {
        case 'KVINNE':
            return <FigureOutwardIcon {...ICON_PROPS} />;
        case 'MANN':
            return <FigureInwardIcon {...ICON_PROPS} />;
        default:
            return <FigureCombinationIcon {...ICON_PROPS} />;
    }
};

export const BrukerInformasjon: React.FC = () => {
    const { bruker, institusjon } = useFagsak();
    return (
        <ExpansionCard
            size="small"
            defaultOpen
            aria-label="Brukers informasjon"
            className="border-ax-border-neutral-subtle"
        >
            <ExpansionCard.Header>
                <ExpansionCard.Title as="h2" size="small" className="text-lg">
                    Informasjon om bruker
                </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <dl className="grid grid-cols-[136px_1fr] ax-xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4 text-ax-text-neutral">
                    <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                        {kjønnIkon(bruker.kjønn)}
                        Navn
                    </dt>
                    <dd className="text-ax-medium">{bruker.navn}</dd>

                    {bruker.fødselsdato && (
                        <>
                            <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                                <CandleIcon {...ICON_PROPS} />
                                Alder
                            </dt>
                            <dd className="text-ax-medium">
                                {hentAlder(bruker.fødselsdato, bruker.dødsdato)} år
                            </dd>
                        </>
                    )}

                    <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                        <BagdeIcon {...ICON_PROPS} />
                        {erDNummer(bruker.personIdent) ? 'D-nummer' : 'Fødselsnummer'}
                    </dt>
                    <dd
                        className="text-ax-medium flex flex-row gap-2 items-center"
                        aria-label={formatterPersonIdent(bruker.personIdent).split('').join(' ')}
                    >
                        {formatterPersonIdent(bruker.personIdent)}
                        <CopyButton
                            copyText={bruker.personIdent}
                            className="p-0"
                            title="Kopier fødselsnummer"
                        />
                    </dd>

                    {bruker.dødsdato && (
                        <>
                            <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                                <FlowerPetalFallingIcon {...ICON_PROPS} />
                                Dødsdato
                            </dt>
                            <dd className="text-ax-medium">
                                <Tag data-color="neutral" size="small" variant="strong">
                                    {formatterDatostring(bruker.dødsdato)}
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
                            <dd
                                className="text-ax-medium flex flex-row gap-2 items-center"
                                aria-label={institusjon.organisasjonsnummer.split('').join(' ')}
                            >
                                {formatterOrgNummer(institusjon.organisasjonsnummer)}
                                <CopyButton
                                    copyText={institusjon.organisasjonsnummer}
                                    className="p-0"
                                    title="Kopier organisasjonsnummer"
                                />
                            </dd>
                        </>
                    )}
                </dl>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};
