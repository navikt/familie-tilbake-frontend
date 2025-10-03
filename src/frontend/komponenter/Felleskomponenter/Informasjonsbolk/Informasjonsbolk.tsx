import { BodyShort, Heading } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

const StyledContainer = styled.div`
    max-width: 30rem;
    padding: 0.5rem 0;

    div {
        width: 100%;
        display: flex;
    }
`;

type Informasjon = {
    label: string;
    tekst: string;
    tekstTitle?: string;
};

type Props = {
    informasjon: Informasjon[];
};

const Informasjonsbolk: React.FC<Props> = ({ informasjon }) => {
    return (
        <StyledContainer>
            {informasjon.map((info: Informasjon) => (
                <div key={info.label + info.tekst}>
                    <div>
                        <BodyShort size="small">{info.label}</BodyShort>
                    </div>
                    <div>
                        <Heading size="xsmall" level="3" title={info.tekstTitle}>
                            {info.tekst}
                        </Heading>
                    </div>
                </div>
            ))}
        </StyledContainer>
    );
};

export default Informasjonsbolk;
