import styled from 'styled-components';

import { Alert, Button } from '@navikt/ds-react';

export const Spacer20 = styled.div`
    height: 20px;
`;

export const Spacer8 = styled.div`
    height: 8px;
`;

export const Navigering = styled.div`
    padding: 1rem 0;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
`;

export const FTAlertStripe = styled(Alert)`
    .navds-alert__wrapper {
        max-width: fit-content;
    }
`;

export const FTButton = styled(Button)`
    padding-right: 2rem;
    padding-left: 2rem;
`;
