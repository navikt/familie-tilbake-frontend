import type { Brevmottaker } from '../../../generated';

import { MagnifyingGlassIcon } from '@navikt/aksel-icons';
import { Alert, Button } from '@navikt/ds-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { styled } from 'styled-components';

import BrevmottakerListe from '../../Felleskomponenter/Hendelsesoversikt/BrevModul/BrevmottakerListe';

const StyledAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

type Props = {
    brevmottakere: Brevmottaker[];
    linkTilBrevmottakerSteg: string;
};

export const BrevmottakereAlert: React.FC<Props> = ({ brevmottakere, linkTilBrevmottakerSteg }) => {
    const navigate = useNavigate();

    return (
        <>
            {brevmottakere && brevmottakere.length !== 0 && (
                <StyledAlert variant="info">
                    Brevmottaker(e) er endret, og vedtak sendes til:
                    <BrevmottakerListe brevmottakere={brevmottakere} />
                    <Button
                        variant="tertiary"
                        onClick={() => navigate(linkTilBrevmottakerSteg)}
                        icon={<MagnifyingGlassIcon />}
                        size="xsmall"
                    >
                        Se detaljer
                    </Button>
                </StyledAlert>
            )}
        </>
    );
};
