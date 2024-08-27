import { styled } from 'styled-components';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { BodyLong, Loader } from '@navikt/ds-react';

const HenterDataContainer = styled.div`
    padding: ${ASpacing3};
    text-align: center;
`;

interface IProps {
    beskrivelse: string;
    størrelse?: '2xlarge' | 'large';
}

const HenterData: React.FC<IProps> = ({ beskrivelse, størrelse = '2xlarge' }) => {
    return (
        <HenterDataContainer>
            <BodyLong>{beskrivelse}</BodyLong>
            <Loader size={størrelse} title="henter..." transparent={false} variant="neutral" />
        </HenterDataContainer>
    );
};

export default HenterData;
