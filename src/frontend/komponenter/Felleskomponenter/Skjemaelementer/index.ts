import { styled } from 'styled-components';

import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieRadioGruppe } from '@navikt/familie-form-elements';

export * from './FamilieTilbakeTextArea';
export * from './FixedDatovelger';
export * from './FTDatovelger';
export * from './LabelMedSpråk';

export const HorisontalFamilieRadioGruppe = styled(FamilieRadioGruppe)<{ marginbottom?: string }>`
    margin-bottom: ${({ marginbottom }) => (marginbottom ? marginbottom : '12px')};

    .navds-radio {
        display: inline-block;
        margin-right: ${ASpacing3};
    }
`;
