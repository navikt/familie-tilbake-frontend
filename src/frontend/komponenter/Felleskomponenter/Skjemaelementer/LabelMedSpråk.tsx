import * as React from 'react';

import styled from 'styled-components';

import Etikett from 'nav-frontend-etiketter';
import { Element } from 'nav-frontend-typografi';

const LabelFlex = styled.div`
    display: flex;
    justify-content: space-between;

    .label {
        max-width: 80%;
    }
`;

interface IProps {
    label: string;
    språk: string;
}

const LabelMedSpråk: React.FC<IProps> = ({ label, språk }) => {
    return (
        <LabelFlex>
            <div className="label">
                <Element>{label}</Element>
            </div>
            <div className="språkkode">
                <Etikett type="info" mini>
                    {språk}
                </Etikett>
            </div>
        </LabelFlex>
    );
};

export { LabelMedSpråk };
