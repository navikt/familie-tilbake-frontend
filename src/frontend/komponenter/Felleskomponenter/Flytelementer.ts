import styled from 'styled-components';

import { Alert, Button, Detail } from '@navikt/ds-react';
import {
    NavdsFontWeightBold,
    NavdsSemanticColorInteractionPrimaryHoverSubtle,
    NavdsSpacing2,
    NavdsSpacing4,
    NavdsSpacing5,
    NavdsSpacing8,
} from '@navikt/ds-tokens/dist/tokens';

export const Spacer20 = styled.div`
    height: ${NavdsSpacing5};
`;

export const Spacer8 = styled.div`
    height: ${NavdsSpacing2};
`;

export const Navigering = styled.div`
    padding: ${NavdsSpacing4} 0;
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
    padding-right: ${NavdsSpacing8};
    padding-left: ${NavdsSpacing8};
`;

export const BehandlingsMenyButton = styled(Button)`
    margin: 0.1rem 0rem;
    width: 100%;

    span {
        width: 100%;
        text-align: left;
        padding: 0rem ${NavdsSpacing2};
    }

    & .navds-body-short {
        font-weight: ${NavdsFontWeightBold};
    }

    &:disabled:hover {
        background-color: ${NavdsSemanticColorInteractionPrimaryHoverSubtle};
    }
`;

export const DetailBold = styled(Detail)`
    font-weight: ${NavdsFontWeightBold};
`;
