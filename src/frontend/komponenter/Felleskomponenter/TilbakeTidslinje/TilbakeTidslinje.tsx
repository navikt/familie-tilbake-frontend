import * as React from 'react';

import { styled } from 'styled-components';

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
import { Timeline, TimelinePeriodProps } from '@navikt/ds-react';
import { format } from 'date-fns';

const TidslinjeContainer = styled.div`
    border: 1px solid ${ABorderStrong};
    margin-bottom: ${ASpacing5};
    padding: 12px 16px;

    .etiketter div:last-child {
        max-width: max-content;
    }

    & .navds-timeline__period--success {
        background-color: ${AGreen200};
        border-color: ${AGreen400};

        &.aktivPeriode {
            background-color: ${AGreen300};
            box-shadow: 0 0 0 2px ${AGreen500};
        }
    }

    & .navds-timeline__period--error {
        background-color: ${ARed300};
        border-color: ${ARed500};

        &.aktivPeriode {
            background-color: ${ARed400};
            box-shadow: 0 0 0 2px ${ARed600};
        }
    }

    & .navds-timeline__period--warning {
        background-color: ${AOrange200};
        border-color: ${AOrange400};

        &.aktivPeriode {
            background-color: ${AOrange300};
            box-shadow: 0 0 0 2px ${AOrange500};
        }
    }
`;

interface IProps {
    rader: TimelinePeriodProps[][];
    onSelectPeriode: (periode: TimelinePeriodProps) => void;
}

const TilbakeTidslinje: React.FC<IProps> = ({ rader, onSelectPeriode }) => {
    return (
        <TidslinjeContainer>
            <Timeline>
                {rader.map((rad, index) => (
                    <Timeline.Row label={''} key={index}>
                        {rad.map(periode => (
                            <Timeline.Period
                                key={periode.id}
                                start={periode.start}
                                end={periode.end}
                                status={periode.status}
                                isActive={periode.isActive}
                                className={periode.className}
                                onClick={() => onSelectPeriode(periode)}
                            >
                                Periode fra {format(new Date(periode.start), 'dd-MM-yyyy')} til{' '}
                                {format(new Date(periode.end), 'dd-MM-yyyy')}
                            </Timeline.Period>
                        ))}
                    </Timeline.Row>
                ))}
            </Timeline>
        </TidslinjeContainer>
    );
};

export default TilbakeTidslinje;
