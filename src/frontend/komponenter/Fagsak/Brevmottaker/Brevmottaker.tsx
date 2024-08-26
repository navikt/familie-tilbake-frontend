import React from 'react';

import { styled } from 'styled-components';

import { PencilIcon, TrashIcon } from '@navikt/aksel-icons';
import { Button, Heading } from '@navikt/ds-react';
import { AFontWeightBold } from '@navikt/ds-tokens/dist/tokens';
import CountryData from '@navikt/land-verktoy';

import { useBrevmottaker } from './BrevmottakerContext';
import { useBehandling } from '../../../context/BehandlingContext';
import { IBrevmottaker, MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';

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
    row-gap: 1rem;
    column-gap: 2rem;
    grid-template-columns: 10.5rem 20rem;
    margin-left: 0.2rem;

    dt {
        font-weight: ${AFontWeightBold};
    }
    dd {
        margin-left: 0;
    }
`;

const EndreBrukerKnapp = styled(Button)`
    margin-top: 1rem;
`;

interface IProps {
    brevmottaker: IBrevmottaker;
    brevmottakerId: string;
    behandlingId: string;
    erLesevisning: boolean;
    antallBrevmottakere: number;
}

const Brevmottaker: React.FC<IProps> = ({
    brevmottaker,
    brevmottakerId,
    erLesevisning,
    antallBrevmottakere,
}) => {
    const {
        fjernBrevMottakerOgOppdaterState,
        settBrevmottakerIdTilEndring,
        validerAlleSynligeFelter,
    } = useBrevmottaker();
    const { settVisBrevmottakerModal } = useBehandling();
    const land = brevmottaker.manuellAdresseInfo
        ? CountryData.getCountryInstance('nb').findByValue(brevmottaker.manuellAdresseInfo.landkode)
        : undefined;
    const [organisasjonsnavn, kontaktperson] = brevmottaker.navn.split(' v/ ');

    return (
        <StyledDiv>
            <FlexDiv>
                <Heading size="medium">{mottakerTypeVisningsnavn[brevmottaker.type]}</Heading>
                {!erLesevisning && brevmottaker.type !== MottakerType.BRUKER && (
                    <Button
                        variant={'tertiary'}
                        onClick={() => fjernBrevMottakerOgOppdaterState(brevmottakerId)}
                        size={'small'}
                        icon={<TrashIcon />}
                    >
                        {'Fjern'}
                    </Button>
                )}
            </FlexDiv>
            <DefinitionList>
                {brevmottaker.organisasjonsnummer ? (
                    <>
                        {kontaktperson && (
                            <>
                                <dt>Kontaktperson</dt>
                                <dd>{kontaktperson}</dd>
                            </>
                        )}
                        <dt>Organisasjonsnummer</dt>
                        <dd>{brevmottaker.organisasjonsnummer}</dd>
                        <dt>Organisasjonsnavn</dt>
                        <dd>{organisasjonsnavn}</dd>
                    </>
                ) : (
                    <>
                        <dt>Navn</dt>
                        <dd>{brevmottaker.navn}</dd>
                    </>
                )}
                {brevmottaker.personIdent && (
                    <>
                        <dt>Fødselsnummer</dt>
                        <dd>{brevmottaker.personIdent}</dd>
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
            {!erLesevisning && brevmottaker.type !== MottakerType.BRUKER && (
                <Button
                    variant={'tertiary'}
                    onClick={() => {
                        settBrevmottakerIdTilEndring(brevmottakerId);
                        settVisBrevmottakerModal(true);
                        validerAlleSynligeFelter();
                    }}
                    size={'small'}
                    icon={<PencilIcon />}
                >
                    {'Endre'}
                </Button>
            )}

            {!erLesevisning &&
                brevmottaker.type === MottakerType.BRUKER &&
                antallBrevmottakere > 1 && (
                    <EndreBrukerKnapp
                        variant="tertiary"
                        size="small"
                        icon={<PencilIcon />}
                        onClick={() => {
                            settBrevmottakerIdTilEndring(brevmottakerId);
                            settVisBrevmottakerModal(true);
                        }}
                    >
                        {'Endre'}
                    </EndreBrukerKnapp>
                )}
        </StyledDiv>
    );
};

export default Brevmottaker;
