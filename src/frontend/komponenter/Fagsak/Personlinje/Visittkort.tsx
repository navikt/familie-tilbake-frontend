import type { IPerson } from '../../../typer/person';

import { CopyButton, HStack, Label } from '@navikt/ds-react';
import { ABorderStrong, ASpacing4 } from '@navikt/ds-tokens/dist/tokens';
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
    height: 3rem;
    padding: ${`0 ${ASpacing4}`};
`;

const GrådigChildrenContainer = styled(HStack)`
    flex: 1;
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
            <GrådigChildrenContainer align="center" gap="4">
                {children}
            </GrådigChildrenContainer>
        </StyledVisittkort>
    );
};

export default Visittkort;
