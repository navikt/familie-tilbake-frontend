import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { Periode, Tidslinje } from '@navikt/familie-tidslinje';

const TidslinjeContainer = styled.div`
    border: 1px solid ${navFarger.navGra60};
    margin-bottom: 20px;

    .etiketter div:last-child {
        max-width: max-content;
    }

    & div.tidslinje .behandlet {
        background-color: ${navFarger.navGronnLighten60};
        border-color: ${navFarger.navGronnLighten40};

        &.aktivPeriode {
            background-color: ${navFarger.navGronnLighten40};
            box-shadow: 0 0 0 2px ${navFarger.navGronn};
        }
    }

    & div.tidslinje .avvist {
        background-color: ${navFarger.redErrorLighten40};
        border-color: ${navFarger.redErrorLighten20};

        &.aktivPeriode {
            background-color: ${navFarger.redErrorLighten20};
            box-shadow: 0 0 0 2px ${navFarger.navRod};
        }
    }

    & div.tidslinje .ubehandlet {
        background-color: ${navFarger.navOransjeLighten60};
        border-color: ${navFarger.navOransjeLighten40};

        &.aktivPeriode {
            background-color: ${navFarger.navOransjeLighten40};
            box-shadow: 0 0 0 2px ${navFarger.navOransje};
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
