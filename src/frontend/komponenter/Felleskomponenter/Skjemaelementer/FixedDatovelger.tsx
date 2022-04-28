import * as React from 'react';

import { DatepickerProps } from 'nav-datovelger/lib/Datepicker';
import styled from 'styled-components';

import { IDatovelgerProps } from '@navikt/familie-form-elements';

import { FTDatovelger } from './FTDatovelger';

const StyledDatovelger = styled(FTDatovelger)`
    .nav-datovelger__kalenderPortal__content {
        position: fixed;
    }
`;

const FixedDatovelger: React.FC<IDatovelgerProps & DatepickerProps> = ({ ...props }) => {
    return <StyledDatovelger {...props} />;
};

export { FixedDatovelger };
