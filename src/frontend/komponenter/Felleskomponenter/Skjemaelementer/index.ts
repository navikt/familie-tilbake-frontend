import styled from 'styled-components';

import { NavdsSpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieRadioGruppe } from '@navikt/familie-form-elements';

export * from './FamilieTilbakeTextArea';
export * from './FixedDatovelger';
export * from './FTDatovelger';
export * from './LabelMedSpråk';

export const HorisontalFamilieRadioGruppe = styled(FamilieRadioGruppe)`
    margin-bottom: ${(props: { marginbottom?: string }) =>
        props.marginbottom ? props.marginbottom : '12px'};

    .navds-radio {
        display: inline-block;
        margin-right: ${NavdsSpacing3};
    }
`;
