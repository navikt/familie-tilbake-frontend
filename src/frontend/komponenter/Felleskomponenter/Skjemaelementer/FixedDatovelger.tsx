import * as React from 'react';

import { DatepickerProps } from 'nav-datovelger/lib/Datepicker';
import styled from 'styled-components';

import { FamilieDatovelger, IDatovelgerProps } from '@navikt/familie-form-elements';

const StyledDatovelger = styled(FamilieDatovelger)`
    .nav-datovelger__kalenderPortal__content {
        position: fixed;
    }

    & div.nav-datovelger div.DayPicker-Caption {
        padding: 0rem 0.5rem;
    }
`;

const FixedDatovelger: React.FC<IDatovelgerProps & DatepickerProps> = ({ ...props }) => {
    return <StyledDatovelger {...props} />;
};

export { FixedDatovelger };
