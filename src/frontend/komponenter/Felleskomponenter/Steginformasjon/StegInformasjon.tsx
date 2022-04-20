import * as React from 'react';

import styled from 'styled-components';

import { Normaltekst } from 'nav-frontend-typografi';

import { Alert } from '@navikt/ds-react';

const InlineNormaltekst = styled(Normaltekst)`
    display: inline-block;
`;

const StyledNormaltekst = styled(InlineNormaltekst)`
    font-weight: 600;
`;

const StyledAlert = styled(Alert)`
    & .navds-alert__wrapper {
        max-width: 100%;
    }
`;

interface IProps {
    behandletSteg: boolean;
    infotekst: string;
}

const Steginformasjon: React.FC<IProps> = ({ behandletSteg, infotekst }) => {
    return !behandletSteg ? (
        <StyledAlert variant="warning" children={infotekst} />
    ) : (
        <div>
            <StyledNormaltekst>Behandlet:</StyledNormaltekst>{' '}
            <InlineNormaltekst>{infotekst}</InlineNormaltekst>
        </div>
    );
};

export default Steginformasjon;
