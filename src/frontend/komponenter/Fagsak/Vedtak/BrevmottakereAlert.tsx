import * as React from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Search } from '@navikt/ds-icons';
import { Alert, Button } from '@navikt/ds-react';

import { IBrevmottaker } from '../../../typer/Brevmottaker';
import type { IInstitusjon } from '../../../typer/fagsak';
import type { IPerson } from '../../../typer/person';
import BrevmottakerListe from '../../Felleskomponenter/Hendelsesoversikt/BrevModul/BrevmottakerListe';

export const StyledAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

interface Props {
    brevmottakere: IBrevmottaker[];
    institusjon?: IInstitusjon;
    bruker: IPerson;
    linkTilBrevmottakerSteg: string;
}

export const BrevmottakereAlert: React.FC<Props> = ({
    brevmottakere,
    institusjon,
    bruker,
    linkTilBrevmottakerSteg,
}) => {
    const navigate = useNavigate();

    return (
        <>
            {brevmottakere && brevmottakere.length !== 0 && (
                <StyledAlert variant="info">
                    Brevmottaker(e) er endret, og vedtak sendes til:
                    <BrevmottakerListe
                        brevmottakere={brevmottakere}
                        institusjon={institusjon}
                        bruker={bruker}
                    />
                    <Button
                        variant={'tertiary'}
                        onClick={() => navigate(linkTilBrevmottakerSteg)}
                        icon={<Search />}
                        size={'xsmall'}
                    >
                        Se detaljer
                    </Button>
                </StyledAlert>
            )}
        </>
    );
};
