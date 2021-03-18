import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Undertittel } from 'nav-frontend-typografi';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Foreldelsevurdering } from '../../../kodeverk';
import { Behandlingssteg, IBehandling } from '../../../typer/behandling';
import {
    IFeilutbetalingVilkårsvurdering,
    VilkårsvurderingPeriode,
} from '../../../typer/feilutbetalingtyper';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

const StyledVilkårsvurdering = styled.div`
    padding: 10px;
`;

export const RadMedMargin = styled(Row)`
    margin-bottom: 16px;
`;

interface IProps {
    behandling: IBehandling;
}

const VilkårsvurderingContainer: React.FC<IProps> = ({ behandling }) => {
    const [
        feilutbetalingVilkårsvurdering,
        settFeilutbetalingVilkårsvurdering,
    ] = React.useState<IFeilutbetalingVilkårsvurdering>();
    const [stegErBehandlet, settStegErBehandlet] = React.useState<boolean>(false);
    const {
        aktivtSteg,
        erStegBehandlet,
        behandlingILesemodus,
        hentFeilutbetalingVilkårsvurdering,
    } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    React.useEffect(() => {
        settStegErBehandlet(erStegBehandlet(Behandlingssteg.VILKÅRSVURDERING));
        const vilkårsvurdering = hentFeilutbetalingVilkårsvurdering(behandling.behandlingId);
        if (vilkårsvurdering.status === RessursStatus.SUKSESS) {
            settFeilutbetalingVilkårsvurdering(vilkårsvurdering.data);
        }
    }, [behandling]);

    const totalbeløp = feilutbetalingVilkårsvurdering?.perioder.reduce(
        (acc: number, periode: VilkårsvurderingPeriode) =>
            periode.foreldelse.foreldelseVurderingType !== Foreldelsevurdering.FORELDET
                ? acc + periode.feilutbetaltBeløp
                : acc,
        0
    );
    const erTotalbeløpUnder4Rettsgebyr =
        totalbeløp && feilutbetalingVilkårsvurdering?.rettsgebyr
            ? totalbeløp < feilutbetalingVilkårsvurdering.rettsgebyr * 4
            : false;

    return feilutbetalingVilkårsvurdering ? (
        <StyledVilkårsvurdering>
            <Undertittel>Tilbakekreving</Undertittel>
            <Spacer20 />
            {aktivtSteg && (
                <>
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst={`Fastsett tilbakekreving etter §22-15. Del opp perioden ved behov for ulik vurdering`}
                    />
                    <Spacer20 />
                </>
            )}
            <RadMedMargin>
                <Column xs="12">
                    <VilkårsvurderingPerioder
                        perioder={feilutbetalingVilkårsvurdering.perioder}
                        erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr}
                        erLesevisning={erLesevisning}
                    />
                </Column>
            </RadMedMargin>
        </StyledVilkårsvurdering>
    ) : null;
};

export default VilkårsvurderingContainer;
