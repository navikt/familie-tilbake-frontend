import type { IPerson } from '../../../typer/person';

import { CopyButton, HStack, Stack, Label } from '@navikt/ds-react';
import { ABorderStrong, ASpacing4, ASpacing2 } from '@navikt/ds-tokens/dist/tokens';
import React from 'react';
import styled from 'styled-components';

import { FamilieIkonVelger } from './PersonIkon/FamilieIkonVelger';

interface IVisittkortProps {
    navn: IPerson['navn'];
    ident: IPerson['personIdent'];
    kjønn: IPerson['kjønn'];
    alder: number;
    children: React.ReactNode;
}

const StyledVisittkort = styled(HStack)`
    ${`border-bottom: 1px solid ${ABorderStrong}`};
    padding: ${`${ASpacing2} ${ASpacing4}`};
    flex-wrap: nowrap;
`;

const Visittkort = ({ navn, alder, kjønn, ident, children }: IVisittkortProps) => {
    return (
        <StyledVisittkort align="center" justify="space-between" gap="4">
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
            <Stack gap="4" justify={{ xs: 'end' }}>
                {children}
            </Stack>
        </StyledVisittkort>
    );
};

export default Visittkort;
