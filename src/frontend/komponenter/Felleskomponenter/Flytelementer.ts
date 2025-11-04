import { Alert } from '@navikt/ds-react';
import { ASpacing2, ASpacing4, ASpacing5 } from '@navikt/ds-tokens/dist/tokens';
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
    .aksel-alert__wrapper {
        max-width: fit-content;
    }
`;
