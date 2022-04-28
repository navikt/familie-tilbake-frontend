import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';

import { Button } from '@navikt/ds-react';

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

export const FTAlertStripe = styled(AlertStripe)`
    .alertstripe__tekst {
        max-width: fit-content;
    }
`;

export const FTButton = styled(Button)`
    padding-right: 2rem;
    padding-left: 2rem;
`;
