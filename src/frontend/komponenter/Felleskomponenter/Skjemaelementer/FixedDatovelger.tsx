import * as React from 'react';

import { DatepickerProps } from 'nav-datovelger/lib/Datepicker';
import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Normaltekst } from 'nav-frontend-typografi';

import { FamilieDatovelger, IDatovelgerProps } from '@navikt/familie-form-elements';

const StyledDatovelger = styled(FamilieDatovelger)`
    &.harfeilifelt {
        .nav-datovelger__input {
            border: 2px solid red;
        }
        .nav-datovelger__kalenderknapp {
            border-top: 2px solid red;
            border-right: 2px solid red;
            border-bottom: 2px solid red;
        }
    }
    .nav-datovelger__kalenderPortal__content {
        position: fixed;
    }
`;

const FeltFeilmelding = styled(Normaltekst)`
    margin-top: 0.5rem;
    font-weight: 600;
    color: ${navFarger.redError};
`;

interface IProps {
    harFeil?: boolean;
    feilmelding?: string;
}

const FixedDatovelger: React.FC<IProps & IDatovelgerProps & DatepickerProps> = ({
    harFeil,
    feilmelding,
    ...props
}) => {
    return (
        <>
            <StyledDatovelger
                inputProps={{ 'aria-invalid': harFeil }}
                {...props}
                className={harFeil ? 'harfeilifelt' : ''}
            />
            {harFeil && <FeltFeilmelding>{feilmelding}</FeltFeilmelding>}
        </>
    );
};

export { FixedDatovelger };
