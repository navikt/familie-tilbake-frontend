import { Alert, Button } from '@navikt/ds-react';
import {
    AFontWeightBold,
    ASurfaceActionSubtleHover,
    ASpacing2,
    ASpacing4,
    ASpacing5,
} from '@navikt/ds-tokens/dist/tokens';
import { styled } from 'styled-components';

export const Spacer20 = styled.div`
    height: ${ASpacing5};
`;

export const Spacer8 = styled.div`
    height: ${ASpacing2};
`;

export const Navigering = styled.div`
    padding: ${ASpacing4} 0;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
`;

export const FTAlertStripe = styled(Alert)`
    .navds-alert__wrapper {
        max-width: fit-content;
    }
`;

export const BehandlingsMenyButton = styled(Button)`
    margin: 0.1rem 0;
    width: 100%;

    span {
        width: 100%;
        text-align: left;
        padding: 0 ${ASpacing2};
    }

    & .navds-body-short {
        font-weight: ${AFontWeightBold};
    }

    &:disabled:hover {
        background-color: ${ASurfaceActionSubtleHover};
    }
`;
