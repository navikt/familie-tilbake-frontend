import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Normaltekst } from 'nav-frontend-typografi';

import { AdvarselIkon } from '../Ikoner/';

const InlineNormaltekst = styled(Normaltekst)`
    display: inline-block;
`;

const StyledNormaltekst = styled(InlineNormaltekst)`
    font-weight: 600;
`;

const UbehandletSteg = styled.div`
    background-color: ${navFarger.orangeFocusLighten60};
    border: 1px solid ${navFarger.navOransjeDarken20};
    padding: 10px;
    border-radius: 4px;

    ${StyledNormaltekst} {
        vertical-align: top;
        margin-left: 1ex;
    }
`;

interface IProps {
    behandletSteg: boolean;
    infotekst: string;
}

const Steginformasjon: React.FC<IProps> = ({ behandletSteg, infotekst }) => {
    return !behandletSteg ? (
        <UbehandletSteg>
            <AdvarselIkon />
            <StyledNormaltekst>{infotekst}</StyledNormaltekst>
        </UbehandletSteg>
    ) : (
        <div>
            <StyledNormaltekst>Behandlet:</StyledNormaltekst>{' '}
            <InlineNormaltekst>{infotekst}</InlineNormaltekst>
        </div>
    );
};

export default Steginformasjon;
