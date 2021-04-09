import styled from 'styled-components';

import { FamilieRadioGruppe } from '@navikt/familie-form-elements';

export * from './FamilieTilbakeTextArea';
export * from './FamilieTilbakeDatovelger';
export * from './FixedDatovelger';

export const HorisontalFamilieRadioGruppe = styled(FamilieRadioGruppe)`
    .skjemaelement {
        float: left;
        margin-right: 10px;
    }
`;
