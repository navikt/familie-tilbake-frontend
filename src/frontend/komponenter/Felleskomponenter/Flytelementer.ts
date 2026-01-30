import { Alert } from '@navikt/ds-react';
import { styled } from 'styled-components';

export const Spacer20 = styled.div`
    height: 20px;
`;

export const Spacer8 = styled.div`
    height: 8px;
`;

export const Navigering = styled.div`
    padding: 16px 0;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
`;

export const FTAlertStripe = styled(Alert)`
    .aksel-alert__wrapper {
        max-width: fit-content;
    }
`;
