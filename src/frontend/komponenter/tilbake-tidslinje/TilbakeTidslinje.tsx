import type { TimelinePeriodProps } from '@navikt/ds-react';
import type { FC, JSX } from 'react';
import type { ForeldelsesvurderingstypeEnum } from '~/generated';

import {
    CheckmarkCircleFillIcon,
    CheckmarkCircleIcon,
    PencilFillIcon,
    PencilIcon,
    XMarkOctagonFillIcon,
    XMarkOctagonIcon,
} from '@navikt/aksel-icons';
import { Timeline } from '@navikt/ds-react';

import { formatterDatoDDMMYYYY } from '~/utils/dateUtils';

const ikon = (
    status: TimelinePeriodProps['status'],
    valgt: TimelinePeriodProps['isActive']
): JSX.Element => {
    switch (status) {
        case 'warning':
            return valgt ? <XMarkOctagonFillIcon aria-hidden /> : <XMarkOctagonIcon aria-hidden />;
        case 'success':
            return valgt ? (
                <CheckmarkCircleFillIcon aria-hidden />
            ) : (
                <CheckmarkCircleIcon aria-hidden />
            );
        case 'neutral':
        default:
            return valgt ? <PencilFillIcon aria-hidden /> : <PencilIcon aria-hidden />;
    }
};

const periodeStatus = (statusLabel: ForeldelsesvurderingstypeEnum | 'VURDERT'): string => {
    switch (statusLabel) {
        case 'FORELDET':
            return 'Foreldet';
        case 'IKKE_FORELDET':
            return 'Ikke foreldet';
        case 'TILLEGGSFRIST':
            return 'Tilleggsfrist';
        case 'VURDERT':
            return 'Vurdert';
        case 'IKKE_VURDERT':
        default:
            return 'Ikke vurdert';
    }
};

const periodeTekst = (periode: TimelinePeriodProps): string =>
    `${periodeStatus(periode.statusLabel as ForeldelsesvurderingstypeEnum)} periode fra ${formatterDatoDDMMYYYY(periode.start)} til ${formatterDatoDDMMYYYY(periode.end)}`;

type Props = {
    rader: TimelinePeriodProps[][];
    onSelectPeriode: (periode: TimelinePeriodProps) => void;
};

export const TilbakeTidslinje: FC<Props> = ({ rader, onSelectPeriode }) => {
    return (
        <Timeline>
            {rader.map(rad => (
                <Timeline.Row label="" key={rad[0].id}>
                    {rad.map(periode => (
                        <Timeline.Period
                            key={periode.id}
                            icon={ikon(periode.status, !!periode.isActive)}
                            start={periode.start}
                            end={periode.end}
                            status={periode.status}
                            isActive={periode.isActive}
                            aria-label={periodeTekst(periode)}
                            onClick={() => onSelectPeriode(periode)}
                        >
                            {periodeTekst(periode)}
                        </Timeline.Period>
                    ))}
                </Timeline.Row>
            ))}
        </Timeline>
    );
};
