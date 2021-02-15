import * as React from 'react';

import '@navikt/helse-frontend-tidslinje/lib/main.css';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';

import { Periode, Tidslinje } from '@navikt/helse-frontend-tidslinje';

import { ForeldelsePeriode } from '../../../../typer/feilutbetalingtyper';
import ForeldelsePeriodeForm from './FeilutbetalingForeldelsePeriodeSkjema';

const Spacer20 = styled.div`
    height: 20px;
`;

const TidslinjeContainer = styled.div`
    border: 1px solid ${navFarger.navGra20};
    margin-bottom: 20px;
`;

const genererRader = (perioder: ForeldelsePeriode[]): Periode[][] => {
    return [
        perioder.map(
            (periode, index): Periode => ({
                tom: new Date(periode.tom),
                fom: new Date(periode.fom),
                status: 'suksess',
                id: `index_${index}`,
            })
        ),
    ];
};

interface IProps {
    perioder: ForeldelsePeriode[];
}

const ForeldelsePerioder: React.FC<IProps> = ({ perioder }) => {
    const [tidslinjeRader, settTidslinjeRader] = React.useState<Periode[][]>();
    const [valgtPeriode, settValgtPeriode] = React.useState<ForeldelsePeriode>();

    React.useEffect(() => {
        settTidslinjeRader(genererRader(perioder));
    }, [perioder]);

    const onSelectPeriode = (periode: Periode): void => {
        const periodeFom = periode.fom.toISOString().substring(0, 10);
        const periodeTom = periode.tom.toISOString().substring(0, 10);
        const foreldelsePeriode = perioder.find(
            per => per.fom === periodeFom && per.tom === periodeTom
        );
        settValgtPeriode(foreldelsePeriode);
    };

    return perioder && tidslinjeRader ? (
        <>
            <Row>
                <Column xs="12">
                    <TidslinjeContainer>
                        <Tidslinje rader={tidslinjeRader} onSelectPeriode={onSelectPeriode} />
                    </TidslinjeContainer>
                </Column>
            </Row>
            {valgtPeriode && (
                <>
                    <Spacer20 />
                    <Row>
                        <Column xs="12">
                            <ForeldelsePeriodeForm periode={valgtPeriode} />
                        </Column>
                    </Row>
                </>
            )}
        </>
    ) : null;
};

export default ForeldelsePerioder;
