import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';
import { IFamilieTextareaProps } from '@navikt/familie-form-elements/src/textarea';
import { FamilieTextarea } from '@navikt/familie-form-elements';

const StyledFamilieTextArea = styled(FamilieTextarea)`
    min-height: 100px;

    .navds-label {
        width: 100%;
    }

    &.lesevisning {
        min-height: auto;

        &_ikke_utfylt {
            font-style: italic;
        }
    }
`;

const FamilieTilbakeTextArea: React.FC<IFamilieTextareaProps> = ({
    erLesevisning,
    className,
    ...props
}) => {
    return (
        <StyledFamilieTextArea
            erLesevisning={erLesevisning}
            {...props}
            className={classNames(className, erLesevisning ? 'lesevisning' : '')}
        />
    );
};

export { FamilieTilbakeTextArea };
