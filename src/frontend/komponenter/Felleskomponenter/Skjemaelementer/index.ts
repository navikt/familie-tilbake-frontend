import { styled } from 'styled-components';

import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RadioGroup } from '@navikt/ds-react';

export * from './FixedDatovelger';
export * from './FTDatovelger';
export * from './LabelMedSpråk';

export const HorisontalRadioGroup = styled(RadioGroup)<{ marginbottom?: string }>`
    margin-bottom: ${({ marginbottom }) => (marginbottom ? marginbottom : '12px')};

    .navds-radio {
        display: inline-block;
        margin-right: ${ASpacing3};
    }
`;
