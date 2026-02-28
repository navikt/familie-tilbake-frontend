import type { TimelinePeriodProps } from '@navikt/ds-react';
import type { FC } from 'react';

import { CheckmarkCircleIcon, PencilIcon, XMarkOctagonIcon } from '@navikt/aksel-icons';
import { Timeline } from '@navikt/ds-react';
import classNames from 'classnames';

import { dateTilIsoDatoStringEllerUndefined } from '~/utils/dato';

type Props = {
    rader: TimelinePeriodProps[][];
    onSelectPeriode: (periode: TimelinePeriodProps) => void;
};

export const TilbakeTidslinje: FC<Props> = ({ rader, onSelectPeriode }) => {
    return (
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
                                <PencilIcon aria-hidden />
                            ) : periode.status === 'success' ? (
                                <CheckmarkCircleIcon aria-hidden />
                            ) : (
                                <XMarkOctagonIcon aria-hidden />
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
    );
};
