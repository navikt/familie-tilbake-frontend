import styled from 'styled-components';

import { Alert, Button, Detail } from '@navikt/ds-react';

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

export const BehandlingsMenyButton = styled(Button)`
    margin: 0.1rem 0rem;
    width: 100%;

    span {
        width: 100%;
        text-align: left;
        padding: 0rem 0.5rem;
    }

    & .navds-body-short {
        font-weight: var(--navds-font-weight-bold);
    }

    &:disabled:hover {
        background-color: var(--navds-semantic-color-interaction-primary-hover-subtle);
    }
`;

export const DetailBold = styled(Detail)`
    font-weight: var(--navds-font-weight-bold);
`;
