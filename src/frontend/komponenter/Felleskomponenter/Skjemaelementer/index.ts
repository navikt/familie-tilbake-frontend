import { RadioGroup } from '@navikt/ds-react';
import { styled } from 'styled-components';

export * from './LabelMedSpråk';

export const HorisontalRadioGroup = styled(RadioGroup)<{ marginbottom?: string }>`
    margin-bottom: ${({ marginbottom }): string => (marginbottom ? marginbottom : '12px')};

    .aksel-radio {
        display: inline-flex;
        margin-right: 12px;
    }
`;
