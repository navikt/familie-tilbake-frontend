import * as React from 'react';

import styled from 'styled-components';

import { Element, Normaltekst } from 'nav-frontend-typografi';

const StyledContainer = styled.div`
    max-width: 30rem;
    padding: 0.5rem 0;

    div {
        width: 100%;
        display: flex;
    }
`;

export interface IInformasjon {
    label: string;
    tekst: string;
    tekstTitle?: string;
}

interface IProps {
    informasjon: IInformasjon[];
}

const Informasjonsbolk: React.FC<IProps> = ({ informasjon }) => {
    return (
        <StyledContainer>
            {informasjon.map((info: IInformasjon) => (
                <div key={info.label + info.tekst}>
                    <div>
                        <Normaltekst children={info.label} />
                    </div>
                    <div>
                        <Element title={info.tekstTitle} children={info.tekst} />
                    </div>
                </div>
            ))}
        </StyledContainer>
    );
};

export default Informasjonsbolk;
