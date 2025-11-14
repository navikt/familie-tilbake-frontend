import type { Bruker } from '../../../../typer/bruker';

import {
    EarthIcon,
    PencilIcon,
    PersonCircleIcon,
    PinIcon,
    PlusIcon,
    TrashIcon,
} from '@navikt/aksel-icons';
import { Button, Heading, HStack } from '@navikt/ds-react';
import React from 'react';

import { Kjønn } from '../../../../typer/bruker';

export const Brevmottakere: React.FC = () => {
    const bruker: Bruker = {
        navn: 'Ola Nordmann',
        personIdent: '12345678910',
        dødsdato: null,
        fødselsdato: '01.01.1990',
        kjønn: Kjønn.Mann,
    };
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
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
                <MottakerKort
                    type="Verge"
                    navn={bruker.navn}
                    addresse={{
                        gatenavn: 'Eksempelveien 1',
                        postnummer: '0123',
                        poststed: 'Oslo',
                        land: 'Norge',
                    }}
                />
            </div>
        </>
    );
};

type MottakerProps = {
    type: string;
    navn: string;
    addresse: { gatenavn: string; postnummer: string; poststed: string; land: string };
};
const MottakerKort: React.FC<MottakerProps> = ({ type, navn, addresse }) => {
    return (
        <div className="border-ax-border-neutral-subtle border rounded-2xl p-4 flex flex-col gap-4">
            <Heading size="xsmall" level="3" className="flex flex-row justify-between items-center">
                {type}
                <div className="flex flex-row gap-4">
                    <Button size="small" variant="tertiary" icon={<PencilIcon />} />
                    <Button size="small" variant="tertiary" icon={<TrashIcon />} />
                </div>
            </Heading>
            <dl>
                <div className="flex flex-row gap-4">
                    <dt className="flex flex-row gap-2 items-center">
                        <PersonCircleIcon /> Navn
                    </dt>
                    <dd>{navn}</dd>
                </div>

                <div className="flex flex-row gap-4">
                    <dt className="flex flex-row gap-2 items-center">
                        <PinIcon /> Gatenavn
                    </dt>
                    <dd>{addresse.gatenavn}</dd>
                </div>

                <div className="flex flex-row gap-4">
                    <dt className="flex flex-row gap-2 items-center">
                        <PinIcon /> Postnummer
                    </dt>
                    <dd>{addresse.postnummer}</dd>
                </div>

                <div className="flex flex-row gap-4">
                    <dt className="flex flex-row gap-2 items-center">
                        <PinIcon /> Poststed
                    </dt>
                    <dd>{addresse.poststed}</dd>
                </div>

                <div className="flex flex-row gap-4">
                    <dt className="flex flex-row gap-2 items-center">
                        <EarthIcon /> Land
                    </dt>
                    <dd>{addresse.land}</dd>
                </div>
            </dl>
        </div>
    );
};
