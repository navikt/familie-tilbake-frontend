import React from 'react';

import styled from 'styled-components';

import { Delete } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { AFontWeightBold } from '@navikt/ds-tokens/dist/tokens';
import CountryData from '@navikt/land-verktoy';

import { IBrevmottaker, MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { useBrevmottaker } from './BrevmottakerContext';

const FlexDiv = styled.div`
    display: flex;
    justify-content: space-between;
    width: 26.5rem;
`;

const StyledDiv = styled.div`
    margin-top: 2.5rem;
    margin-right: 3.5rem;
`;

const DefinitionList = styled.dl`
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: 10rem 20rem;
    margin-left: 1rem;

    dt {
        font-weight: ${AFontWeightBold};
    }
    dd {
        margin-left: 0;
    }
`;

interface IProps {
    brevmottaker: IBrevmottaker;
    brevmottakerId: string;
    behandlingId: string;
    erLesevisning: boolean;
}

const Brevmottaker: React.FC<IProps> = ({ brevmottaker, brevmottakerId, erLesevisning }) => {
    const { fjernBrevMottakerOgOppdaterState } = useBrevmottaker();
    const land = brevmottaker.manuellAdresseInfo
        ? CountryData.getCountryInstance('nb').findByValue(brevmottaker.manuellAdresseInfo.landkode)
        : undefined;

    return (
        <StyledDiv>
            <FlexDiv>
                <Heading size="medium" children={mottakerTypeVisningsnavn[brevmottaker.type]} />
                {!erLesevisning && brevmottaker.type !== MottakerType.BRUKER && (
                    <Button
                        variant={'tertiary'}
                        onClick={() => fjernBrevMottakerOgOppdaterState(brevmottakerId)}
                        loading={false}
                        disabled={false}
                        size={'small'}
                        icon={<Delete />}
                    >
                        {'Fjern'}
                    </Button>
                )}
            </FlexDiv>
            <DefinitionList>
                <dt>Navn</dt>
                <dd>{brevmottaker.navn}</dd>
                {brevmottaker.personIdent && (
                    <>
                        <dt>Fødselsnummer</dt>
                        <dd>{brevmottaker.personIdent}</dd>
                    </>
                )}
                {brevmottaker.organisasjonsnummer && (
                    <>
                        <dt>Organisasjonsnummer</dt>
                        <dd>{brevmottaker.organisasjonsnummer}</dd>
                    </>
                )}
                {brevmottaker.manuellAdresseInfo && (
                    <>
                        <dt>Adresselinje 1</dt>
                        <dd>{brevmottaker.manuellAdresseInfo?.adresselinje1}</dd>
                        <dt>Adresselinje 2</dt>
                        <dd>{brevmottaker.manuellAdresseInfo?.adresselinje2 || '-'}</dd>
                        <dt>Postnummer</dt>
                        <dd>{brevmottaker.manuellAdresseInfo?.postnummer}</dd>
                        <dt>Poststed</dt>
                        <dd>{brevmottaker.manuellAdresseInfo?.poststed}</dd>
                        <dt>Land</dt>
                        <dd>{land.label}</dd>
                    </>
                )}
            </DefinitionList>
        </StyledDiv>
    );
};

export default Brevmottaker;
