import styled from 'styled-components';

import { FamilieRadioGruppe, FamilieTextarea } from '@navikt/familie-form-elements';

export const HorisontalFamilieRadioGruppe = styled(FamilieRadioGruppe)`
    .skjemaelement {
        float: left;
        margin-right: 10px;
    }
`;

export const FamilieTilbakeTextArea = styled(FamilieTextarea)`
    min-height: 100px;
`;
