import type { TimelinePeriodProps } from '@navikt/ds-react';

import { CheckmarkCircleIcon, PencilIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';
import { Timeline } from '@navikt/ds-react';
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
    ASpacing5,
    AOrange800,
    AGreen800,
    ARed800,
    ARed200,
} from '@navikt/ds-tokens/dist/tokens';
import classNames from 'classnames';
import * as React from 'react';
import { styled } from 'styled-components';

import { dateTilIsoDatoStringEllerUndefined } from '../../../utils/dato';

const TidslinjeContainer = styled.div`
    margin-bottom: ${ASpacing5};
    padding: 12px 16px;

    .etiketter div:last-child {
        max-width: max-content;
    }

    & .navds-timeline__period--success {
        background-color: ${AGreen200};
        border-color: ${AGreen400};

        &:hover {
            background-color: ${AGreen300};
        }

        &.aktivPeriode {
            background-color: ${AGreen300};
            box-shadow: 0 0 0 2px ${AGreen500};
        }
    }

    & .navds-timeline__period--danger {
        background-color: ${ARed200};
        border-color: ${ARed400};

        &:hover {
            background-color: ${ARed300};
        }

        &.aktivPeriode {
            background-color: ${ARed300};
            box-shadow: 0 0 0 2px ${ARed500};
        }
    }

    & .navds-timeline__period--warning {
        background-color: ${AOrange200};
        border-color: ${AOrange400};

        &:hover {
            background-color: ${AOrange300};
        }

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
                {rader.map(rad => (
                    <Timeline.Row label="" key={rad[0].id}>
                        {rad.map(periode => {
                            const handling =
                                periode.status === 'success'
                                    ? 'Behandlet'
                                    : periode.status === 'warning'
                                      ? 'Ubehandlet'
                                      : 'Avvist';
                            const varighetTekst = `${handling} periode fra ${dateTilIsoDatoStringEllerUndefined(new Date(periode.start))} til ${dateTilIsoDatoStringEllerUndefined(new Date(periode.end))}`;
                            const ikon =
                                periode.status === 'warning' ? (
                                    <PencilIcon
                                        title="a11y-title"
                                        fontSize="1.5rem"
                                        aria-hidden="true"
                                        style={{ color: AOrange800 }}
                                    />
                                ) : periode.status === 'success' ? (
                                    <CheckmarkCircleIcon
                                        title="a11y-title"
                                        fontSize="1.5rem"
                                        aria-hidden="true"
                                        style={{ color: AGreen800 }}
                                    />
                                ) : (
                                    <XMarkOctagonIcon
                                        title="a11y-title"
                                        fontSize="1.5rem"
                                        aria-hidden="true"
                                        style={{ color: ARed800 }}
                                    />
                                );

                            return (
                                <Timeline.Period
                                    key={periode.id}
                                    icon={ikon}
                                    start={periode.start}
                                    end={periode.end}
                                    status={periode.status}
                                    isActive={periode.isActive}
                                    className={classNames(
                                        periode.className,
                                        periode.isActive && 'aktivPeriode'
                                    )}
                                    aria-label={`${periode.status} ${varighetTekst}`}
                                    onClick={() => onSelectPeriode(periode)}
                                >
                                    {varighetTekst}
                                </Timeline.Period>
                            );
                        })}
                    </Timeline.Row>
                ))}
            </Timeline>
        </TidslinjeContainer>
    );
};

export default TilbakeTidslinje;
