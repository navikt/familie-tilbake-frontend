import * as React from 'react';

import styled from 'styled-components';

import {
    NavdsGlobalColorGreen200,
    NavdsGlobalColorGreen300,
    NavdsGlobalColorGreen400,
    NavdsGlobalColorGreen500,
    NavdsGlobalColorOrange200,
    NavdsGlobalColorOrange300,
    NavdsGlobalColorOrange400,
    NavdsGlobalColorOrange500,
    NavdsGlobalColorRed300,
    NavdsGlobalColorRed400,
    NavdsGlobalColorRed500,
    NavdsGlobalColorRed600,
    NavdsSemanticColorBorder,
    NavdsSpacing5,
} from '@navikt/ds-tokens/dist/tokens';
import { type Periode, Tidslinje } from '@navikt/familie-tidslinje';

const TidslinjeContainer = styled.div`
    border: 1px solid ${NavdsSemanticColorBorder};
    margin-bottom: ${NavdsSpacing5};

    .etiketter div:last-child {
        max-width: max-content;
    }

    & div.tidslinje .behandlet {
        background-color: ${NavdsGlobalColorGreen200};
        border-color: ${NavdsGlobalColorGreen400};

        &.aktivPeriode {
            background-color: ${NavdsGlobalColorGreen300};
            box-shadow: 0 0 0 2px ${NavdsGlobalColorGreen500};
        }
    }

    & div.tidslinje .avvist {
        background-color: ${NavdsGlobalColorRed300};
        border-color: ${NavdsGlobalColorRed500};

        &.aktivPeriode {
            background-color: ${NavdsGlobalColorRed400};
            box-shadow: 0 0 0 2px ${NavdsGlobalColorRed600};
        }
    }

    & div.tidslinje .ubehandlet {
        background-color: ${NavdsGlobalColorOrange200};
        border-color: ${NavdsGlobalColorOrange400};

        &.aktivPeriode {
            background-color: ${NavdsGlobalColorOrange300};
            box-shadow: 0 0 0 2px ${NavdsGlobalColorOrange500};
        }
    }
`;

interface IProps {
    rader: Periode[][];
    onSelectPeriode: (periode: Periode) => void;
}

const TilbakeTidslinje: React.FC<IProps> = ({ rader, onSelectPeriode }) => {
    return (
        <TidslinjeContainer>
            <Tidslinje kompakt rader={rader} onSelectPeriode={onSelectPeriode} />
        </TidslinjeContainer>
    );
};

export default TilbakeTidslinje;
