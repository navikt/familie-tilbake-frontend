import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';

import { Periode, Tidslinje } from '@navikt/helse-frontend-tidslinje';

import { Foreldelsevurdering } from '../../../kodeverk';
import { VilkårsvurderingPeriode } from '../../../typer/feilutbetalingtyper';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import { VilkårsvurderingPeriodeProvider } from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeContext';
import VilkårsvurderingPeriodeSkjema from './VilkårsvurderingPeriode/VilkårsvurderingPeriodeSkjema';

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

const finnClassNamePeriode = (periode: VilkårsvurderingPeriode) => {
    if (
        periode.vilkårsresultat ||
        periode.foreldelse.foreldelseVurderingType === Foreldelsevurdering.FORELDET
    ) {
        return 'behandlet';
    }
    return 'ubehandlet';
};

const genererRader = (perioder: VilkårsvurderingPeriode[]): Periode[][] => {
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
    perioder: VilkårsvurderingPeriode[];
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const VilkårsvurderingPerioder: React.FC<IProps> = ({
    perioder,
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
}) => {
    const [tidslinjeRader, settTidslinjeRader] = React.useState<Periode[][]>();
    const [valgtPeriode, settValgtPeriode] = React.useState<VilkårsvurderingPeriode>();

    React.useEffect(() => {
        settTidslinjeRader(genererRader(perioder));
    }, [perioder]);

    const onSelectPeriode = (periode: Periode) => {
        const periodeFom = periode.fom.toISOString().substring(0, 10);
        const periodeTom = periode.tom.toISOString().substring(0, 10);
        const vilkårsvurderingPeriode = perioder.find(
            per => per.periode.fom === periodeFom && per.periode.tom === periodeTom
        );
        settValgtPeriode(vilkårsvurderingPeriode);
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
                            <VilkårsvurderingPeriodeProvider periode={valgtPeriode}>
                                <VilkårsvurderingPeriodeSkjema
                                    erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                                    erLesevisning={erLesevisning}
                                />
                            </VilkårsvurderingPeriodeProvider>
                        </Column>
                    </Row>
                </>
            )}
        </>
    ) : null;
};

export default VilkårsvurderingPerioder;
