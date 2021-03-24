import * as React from 'react';

import styled from 'styled-components';

import { FamilieTextarea, IFamilieTextareaProps } from '@navikt/familie-form-elements';

const StyledFamilieTextArea = styled(FamilieTextarea)`
    min-height: 100px;

    &.lesevisning {
        min-height: auto;
    }
`;

const FamilieTilbakeTextArea: React.FC<IFamilieTextareaProps> = ({ erLesevisning, ...props }) => {
    return (
        <StyledFamilieTextArea
            erLesevisning={erLesevisning}
            {...props}
            className={erLesevisning ? 'lesevisning' : ''}
        />
    );
};

export { FamilieTilbakeTextArea };
