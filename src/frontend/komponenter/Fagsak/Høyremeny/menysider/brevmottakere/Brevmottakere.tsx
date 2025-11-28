import type { Brevmottaker } from '../../../../../generated';

import {
    BagdeIcon,
    CalculatorIcon,
    EarthIcon,
    HikingTrailSignIcon,
    LocationPinIcon,
    PencilIcon,
    PersonCircleIcon,
    PlusIcon,
    TrashIcon,
} from '@navikt/aksel-icons';
import { Button, Heading, HStack, VStack } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { TypeEnum } from '../../../../../generated';
import { norskLandnavn } from '../../../../../utils/land';
import { erDNummer, formatterOrgNummer, formatterPersonIdent } from '../../utils';

export const Brevmottakere: React.FC = () => {
    const brevmottakere: Brevmottaker[] = [
        {
            navn: 'Ola Nordmann',
            personIdent: '12345678910',
            type: TypeEnum.DØDSBO,
            manuellAdresseInfo: {
                adresselinje1: 'Storgata 1',
                adresselinje2: 'H0203',
                postnummer: '0101',
                poststed: 'Oslo',
                landkode: 'NO',
            },
        },
        {
            navn: 'Kari Nordmann',
            personIdent: '12345678910',
            type: TypeEnum.FULLMEKTIG,
            organisasjonsnummer: '987654321',
        },
    ];

    return (
        <>
            <HStack className="justify-between">
                <Heading size="small" level="2">
                    Brevmottakere
                </Heading>
                <Button variant="tertiary" size="small" icon={<PlusIcon />}>
                    Legg til
                </Button>
            </HStack>
            <VStack gap="4" className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
                {brevmottakere.map(brevmottaker => (
                    <MottakerKort key={brevmottaker.personIdent} brevmottaker={brevmottaker} />
                ))}
            </VStack>
        </>
    );
};

type MottakerProps = {
    brevmottaker: Brevmottaker;
};

const MottakerKort: React.FC<MottakerProps> = ({ brevmottaker }) => {
    const erHovedmottaker =
        brevmottaker.type === TypeEnum.BRUKER_MED_UTENLANDSK_ADRESSE ||
        brevmottaker.type === TypeEnum.DØDSBO;
    const capitalizeType =
        brevmottaker.type.charAt(0).toUpperCase() + brevmottaker.type.slice(1).toLowerCase();
    return (
        <VStack
            gap="4"
            padding="4"
            className={classNames(
                'border rounded-2xl',
                {
                    'bg-ax-bg-brand-blue-soft border-ax-border-info': erHovedmottaker,
                },
                {
                    'border-ax-border-neutral-subtle':
                        brevmottaker.type === TypeEnum.VERGE ||
                        brevmottaker.type === TypeEnum.FULLMEKTIG,
                }
            )}
        >
            <Heading size="xsmall" level="3" className="flex flex-row justify-between items-center">
                <HStack gap="1">
                    {erHovedmottaker ? <span>Hovedmottaker</span> : <span>{capitalizeType}</span>}
                    {brevmottaker.type === TypeEnum.DØDSBO && <span>v/dødsbo</span>}
                </HStack>
                <HStack gap="4">
                    <Button size="small" variant="tertiary" icon={<PencilIcon />} />
                    {!erHovedmottaker && (
                        <Button size="small" variant="tertiary" icon={<TrashIcon />} />
                    )}
                </HStack>
            </Heading>
            <dl className="grid grid-cols-[136px_1fr] ax-xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                <HStack as="dt" gap="2" align="center">
                    <PersonCircleIcon />
                    {brevmottaker.type === TypeEnum.FULLMEKTIG ? 'Kontaktperson' : 'Navn'}
                </HStack>
                <dd>{brevmottaker.navn}</dd>

                {brevmottaker.organisasjonsnummer && (
                    <>
                        <HStack as="dt" gap="2" align="center">
                            <CalculatorIcon />
                            Org.nummer
                        </HStack>
                        <dd>{formatterOrgNummer(brevmottaker.organisasjonsnummer)}</dd>
                    </>
                )}

                {brevmottaker.personIdent && (
                    <>
                        <HStack as="dt" gap="2" align="center">
                            <BagdeIcon />
                            {erDNummer(brevmottaker.personIdent) ? 'D-nummer' : 'Fødselsnummer'}
                        </HStack>
                        <dd>{formatterPersonIdent(brevmottaker.personIdent)}</dd>
                    </>
                )}

                {brevmottaker.manuellAdresseInfo && (
                    <>
                        <HStack as="dt" gap="2" align="center">
                            <HikingTrailSignIcon />
                            Adresselinje 1
                        </HStack>
                        <dd>{brevmottaker.manuellAdresseInfo.adresselinje1}</dd>

                        <HStack as="dt" gap="2" align="center">
                            <HikingTrailSignIcon />
                            Adresselinje 2
                        </HStack>
                        <dd>{brevmottaker.manuellAdresseInfo.adresselinje2}</dd>

                        <HStack as="dt" gap="2" align="center">
                            <LocationPinIcon />
                            Postnummer
                        </HStack>
                        <dd>{brevmottaker.manuellAdresseInfo.postnummer}</dd>

                        <HStack as="dt" gap="2" align="center">
                            <LocationPinIcon />
                            Poststed
                        </HStack>
                        <dd>{brevmottaker.manuellAdresseInfo.poststed}</dd>

                        {brevmottaker.manuellAdresseInfo.landkode !== 'NO' && (
                            <HStack gap="4">
                                <HStack as="dt" gap="2" align="center">
                                    <EarthIcon />
                                    Land
                                </HStack>
                                <dd>{norskLandnavn(brevmottaker.manuellAdresseInfo.landkode)}</dd>
                            </HStack>
                        )}
                    </>
                )}
            </dl>
        </VStack>
    );
};
