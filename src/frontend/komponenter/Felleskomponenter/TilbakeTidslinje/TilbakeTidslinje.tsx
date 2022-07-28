import * as React from 'react';

import styled from 'styled-components';

import { type Periode, Tidslinje } from '@navikt/familie-tidslinje';

const TidslinjeContainer = styled.div`
    border: 1px solid var(--navds-semantic-color-border);
    margin-bottom: 20px;

    .etiketter div:last-child {
        max-width: max-content;
    }

    & div.tidslinje .behandlet {
        background-color: var(--navds-global-color-green-200);
        border-color: var(--navds-global-color-green-400);

        &.aktivPeriode {
            background-color: var(--navds-global-color-green-300);
            box-shadow: 0 0 0 2px var(--navds-global-color-green-500);
        }
    }

    & div.tidslinje .avvist {
        background-color: var(--navds-global-color-red-300);
        border-color: var(--navds-global-color-red-500);

        &.aktivPeriode {
            background-color: var(--navds-global-color-red-400);
            box-shadow: 0 0 0 2px var(--navds-global-color-red-600);
        }
    }

    & div.tidslinje .ubehandlet {
        background-color: var(--navds-global-color-orange-200);
        border-color: var(--navds-global-color-orange-400);

        &.aktivPeriode {
            background-color: var(--navds-global-color-orange-300);
            box-shadow: 0 0 0 2px var(--navds-global-color-orange-500);
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
