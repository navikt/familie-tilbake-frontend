import * as React from 'react';

import styled from 'styled-components';

import { Element, Normaltekst } from 'nav-frontend-typografi';

const StyledContainer = styled.div`
    column-count: 2;
    max-width: 30rem;
    padding: 0.5rem 0;
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
            {informasjon.map((info: IInformasjon) => {
                return <Normaltekst key={info.label + info.tekst} children={info.label} />;
            })}
            {informasjon.map((info: IInformasjon) => {
                return (
                    <Element
                        title={info.tekstTitle}
                        key={info.tekst + info.label}
                        children={info.tekst}
                    />
                );
            })}
        </StyledContainer>
    );
};

export default Informasjonsbolk;
