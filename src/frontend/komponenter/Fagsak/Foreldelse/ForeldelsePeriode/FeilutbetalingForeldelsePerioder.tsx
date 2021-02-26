import * as React from 'react';

import '@navikt/helse-frontend-tidslinje/lib/main.css';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';

import { Periode, Tidslinje } from '@navikt/helse-frontend-tidslinje';

import { Foreldelsevurdering } from '../../../../kodeverk';
import { ForeldelsePeriode } from '../../../../typer/feilutbetalingtyper';
import { Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import ForeldelsePeriodeSkjema from './FeilutbetalingForeldelsePeriodeSkjema';

const TidslinjeContainer = styled.div`
    border: 1px solid ${navFarger.navGra60};
    margin-bottom: 20px;

    button.behandlet {
        background-color: ${navFarger.navGronnLighten60};
    }

    button.ubehandlet {
        background-color: ${navFarger.navLysGra};
    }
`;

const finnClassNamePeriode = (periode: ForeldelsePeriode) => {
    switch (periode.foreldelseVurderingType) {
        case Foreldelsevurdering.FORELDET:
        case Foreldelsevurdering.IKKE_FORELDET:
        case Foreldelsevurdering.TILLEGGSFRIST:
            return 'behandlet';
        case Foreldelsevurdering.IKKE_VURDERT:
        case Foreldelsevurdering.UDEFINERT:
        default:
            return 'ubehandlet';
    }
};

const genererRader = (perioder: ForeldelsePeriode[]): Periode[][] => {
    return [
        perioder.map(
            (periode, index): Periode => ({
                tom: new Date(periode.periode.tom),
                fom: new Date(periode.periode.fom),
                status: 'suksess',
                id: `index_${index}`,
                className: finnClassNamePeriode(periode),
            })
        ),
    ];
};

interface IProps {
    perioder: ForeldelsePeriode[];
    erLesevisning: boolean;
}

const ForeldelsePerioder: React.FC<IProps> = ({ perioder, erLesevisning }) => {
    const [tidslinjeRader, settTidslinjeRader] = React.useState<Periode[][]>();
    const [valgtPeriode, settValgtPeriode] = React.useState<ForeldelsePeriode>();

    React.useEffect(() => {
        settTidslinjeRader(genererRader(perioder));
    }, [perioder]);

    const onSelectPeriode = (periode: Periode): void => {
        const periodeFom = periode.fom.toISOString().substring(0, 10);
        const periodeTom = periode.tom.toISOString().substring(0, 10);
        const foreldelsePeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
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
                            <ForeldelsePeriodeSkjema
                                periode={valgtPeriode}
                                erLesevisning={erLesevisning}
                            />
                        </Column>
                    </Row>
                </>
            )}
        </>
    ) : null;
};

export default ForeldelsePerioder;
