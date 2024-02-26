import { styled } from 'styled-components';

import { RadioGroup } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';

export * from './LabelMedSpråk';

export const HorisontalRadioGroup = styled(RadioGroup)<{ marginbottom?: string }>`
    margin-bottom: ${({ marginbottom }) => (marginbottom ? marginbottom : '12px')};

    .navds-radio {
        display: inline-block;
        margin-right: ${ASpacing3};
    }
`;
