import styled from 'styled-components';

import { FamilieRadioGruppe } from '@navikt/familie-form-elements';

export * from './FamilieTilbakeTextArea';
export * from './FixedDatovelger';
export * from './LabelMedSpråk';

export const HorisontalFamilieRadioGruppe = styled(FamilieRadioGruppe)`
    margin-bottom: 12px;

    .skjemaelement {
        float: left;
        margin-right: 10px;
    }

    &.skjemagruppe {
        &.radiogruppe {
            .skjemaelement {
                margin-bottom: 5px;
            }
        }
    }

    div:last-child {
        margin-top: 30px;
    }
`;
