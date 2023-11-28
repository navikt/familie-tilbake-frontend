import { styled } from 'styled-components';

import { Alert, Button, Detail } from '@navikt/ds-react';
import {
    AFontWeightBold,
    ASurfaceActionSubtleHover,
    ASpacing2,
    ASpacing4,
    ASpacing5,
    ASpacing8,
} from '@navikt/ds-tokens/dist/tokens';

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

export const FTButton = styled(Button)`
    padding-right: ${ASpacing8};
    padding-left: ${ASpacing8};
`;

export const BehandlingsMenyButton = styled(Button)`
    margin: 0.1rem 0rem;
    width: 100%;

    span {
        width: 100%;
        text-align: left;
        padding: 0rem ${ASpacing2};
    }

    & .navds-body-short {
        font-weight: ${AFontWeightBold};
    }

    &:disabled:hover {
        background-color: ${ASurfaceActionSubtleHover};
    }
`;

export const DetailBold = styled(Detail)`
    font-weight: ${AFontWeightBold};
`;
