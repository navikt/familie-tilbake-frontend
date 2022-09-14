import * as React from 'react';

import { DatepickerProps } from 'nav-datovelger/lib/Datepicker';
import styled from 'styled-components';

import { FamilieDatovelger, IDatovelgerProps } from '@navikt/familie-form-elements';

const StyledDatovelger = styled(FamilieDatovelger)`
    & div.nav-datovelger div.DayPicker-Caption {
        & div.nav-datovelger__yearSelector {
            & div[class='selectContainer'] {
                display: inline-block;
                select {
                    width: fit-content;
                }
            }
        }
    }
`;

const FTDatovelger: React.FC<IDatovelgerProps & DatepickerProps> = ({ ...props }) => {
    return <StyledDatovelger {...props} />;
};

export { FTDatovelger };
