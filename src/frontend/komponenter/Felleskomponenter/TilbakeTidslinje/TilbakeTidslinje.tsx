import * as React from 'react';

import styled from 'styled-components';

import {
    AGreen200,
    AGreen300,
    AGreen400,
    AGreen500,
    AOrange200,
    AOrange300,
    AOrange400,
    AOrange500,
    ARed300,
    ARed400,
    ARed500,
    ARed600,
    ABorderStrong,
    ASpacing5,
} from '@navikt/ds-tokens/dist/tokens';
import { type Periode, Tidslinje } from '@navikt/familie-tidslinje';

const TidslinjeContainer = styled.div`
    border: 1px solid ${ABorderStrong};
    margin-bottom: ${ASpacing5};

    .etiketter div:last-child {
        max-width: max-content;
    }

    & div.tidslinje .behandlet {
        background-color: ${AGreen200};
        border-color: ${AGreen400};

        &.aktivPeriode {
            background-color: ${AGreen300};
            box-shadow: 0 0 0 2px ${AGreen500};
        }
    }

    & div.tidslinje .avvist {
        background-color: ${ARed300};
        border-color: ${ARed500};

        &.aktivPeriode {
            background-color: ${ARed400};
            box-shadow: 0 0 0 2px ${ARed600};
        }
    }

    & div.tidslinje .ubehandlet {
        background-color: ${AOrange200};
        border-color: ${AOrange400};

        &.aktivPeriode {
            background-color: ${AOrange300};
            box-shadow: 0 0 0 2px ${AOrange500};
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
