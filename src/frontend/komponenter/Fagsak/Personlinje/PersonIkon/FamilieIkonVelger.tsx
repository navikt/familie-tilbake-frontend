import type { IPerson } from '../../../../typer/person';

import * as React from 'react';

import { GuttIkon } from './GuttIkon';
import { JenteIkon } from './JenteIkon';
import { KvinneIkon } from './KvinneIkon';
import { MannIkon } from './MannIkon';
import { NøytralPersonIkon } from './NøytralPersonIkon';
import { Kjønn } from '../../../../typer/person';

export interface IProps {
    alder: number;
    className?: string;
    kjønn: IPerson['kjønn'];
    width?: number;
    height?: number;
}

export const FamilieIkonVelger: React.FunctionComponent<IProps> = ({
    className,
    alder,
    kjønn,
    width = 32,
    height = 32,
}) => {
    switch (kjønn) {
        case Kjønn.Kvinne:
            if (alder < 18) {
                return <JenteIkon className={className} heigth={height} width={width} />;
            } else {
                return <KvinneIkon className={className} heigth={height} width={width} />;
            }
        case Kjønn.Mann:
            if (alder < 18) {
                return <GuttIkon className={className} heigth={height} width={width} />;
            } else {
                return <MannIkon className={className} heigth={height} width={width} />;
            }
        default:
            return <NøytralPersonIkon className={className} heigth={height} width={width} />;
    }
};
