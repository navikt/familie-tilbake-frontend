import type { Bruker } from '../../../../typer/bruker';

import * as React from 'react';

import { GuttIkon } from './GuttIkon';
import { JenteIkon } from './JenteIkon';
import { KvinneIkon } from './KvinneIkon';
import { MannIkon } from './MannIkon';
import { NøytralPersonIkon } from './NøytralPersonIkon';
import { Kjønn } from '../../../../typer/bruker';

export type Props = {
    alder: number;
    className?: string;
    kjønn: Bruker['kjønn'];
    width?: number;
    height?: number;
};

export const FamilieIkonVelger: React.FunctionComponent<Props> = ({
    className,
    alder,
    kjønn,
    width = 32,
    height = 32,
}) => {
    switch (kjønn) {
        case Kjønn.Kvinne:
            if (alder < 18) {
                return <JenteIkon className={className} height={height} width={width} />;
            } else {
                return <KvinneIkon className={className} height={height} width={width} />;
            }
        case Kjønn.Mann:
            if (alder < 18) {
                return <GuttIkon className={className} height={height} width={width} />;
            } else {
                return <MannIkon className={className} height={height} width={width} />;
            }
        default:
            return <NøytralPersonIkon className={className} height={height} width={width} />;
    }
};
