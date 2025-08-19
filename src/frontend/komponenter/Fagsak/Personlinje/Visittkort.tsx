import type { IPerson } from '../../../typer/person';

import { CopyButton, HStack, Stack, Label } from '@navikt/ds-react';
import React from 'react';

import { FamilieIkonVelger } from './PersonIkon/FamilieIkonVelger';

interface IVisittkortProps {
    navn: IPerson['navn'];
    ident: IPerson['personIdent'];
    kjønn: IPerson['kjønn'];
    alder: number;
    children: React.ReactNode;
}

const Visittkort: React.FC<IVisittkortProps> = ({ navn, alder, kjønn, ident, children }) => {
    return (
        <HStack gap="4" className="justify-between border-b-2 border-solid px-4 py-2">
            <HStack align="center" gap="4">
                <FamilieIkonVelger alder={alder} kjønn={kjønn} width={24} height={24} />

                <Label size="small">
                    {navn} ({alder} år)
                </Label>

                <div>|</div>
                <HStack align="center" gap="1">
                    {ident}
                    <CopyButton copyText={ident.replace(' ', '')} size="small" />
                </HStack>
            </HStack>
            <Stack gap="4" justify={{ sm: 'space-between', md: 'end' }} className="flex-auto">
                {children}
            </Stack>
        </HStack>
    );
};

export default Visittkort;
