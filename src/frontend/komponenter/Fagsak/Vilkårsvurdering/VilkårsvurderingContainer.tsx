import type { IBehandling } from '../../../typer/behandling';
import type { IFagsak } from '../../../typer/fagsak';

import { BodyLong, Heading, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { styled } from 'styled-components';

import {
    erTotalbeløpUnder4Rettsgebyr,
    useFeilutbetalingVilkårsvurdering,
} from './FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import { useBehandling } from '../../../context/BehandlingContext';
import {
    Ytelsetype,
    vilkårsvurderingStegInfotekst,
    vilkårsvurderingStegInfotekstKontantstøtte,
    vilkårsvurderingStegInfotekstBarnetrygd,
} from '../../../kodeverk';
import { RessursStatus } from '../../../typer/ressurs';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

const StyledVilkårsvurdering = styled.div`
    padding: ${ASpacing3};
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const VilkårsvurderingContainer: React.FC<IProps> = ({ fagsak, behandling }) => {
    const { feilutbetalingVilkårsvurdering, stegErBehandlet, erAutoutført, skjemaData } =
        useFeilutbetalingVilkårsvurdering();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;

    const stegInfotekst = {
        [Ytelsetype.Barnetrygd]: vilkårsvurderingStegInfotekstBarnetrygd,
        [Ytelsetype.Kontantstøtte]: vilkårsvurderingStegInfotekstKontantstøtte,
        [Ytelsetype.Barnetilsyn]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.Overganggstønad]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.Skolepenger]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.Tilleggsstønader]: vilkårsvurderingStegInfotekst,
    }[fagsak.ytelsestype];

    if (feilutbetalingVilkårsvurdering?.status === RessursStatus.Suksess) {
        const totalbeløpErUnder4Rettsgebyr = erTotalbeløpUnder4Rettsgebyr(
            feilutbetalingVilkårsvurdering.data
        );

        return (
            <StyledVilkårsvurdering>
                <Heading level="2" size="small" spacing>
                    Tilbakekreving
                </Heading>
                <VStack gap="5">
                    {erAutoutført && (
                        <BodyLong size="small">
                            Automatisk vurdert. Alle perioder er foreldet.
                        </BodyLong>
                    )}
                    {!erAutoutført && (!erLesevisning || stegErBehandlet) && (
                        <Steginformasjon
                            behandletSteg={stegErBehandlet}
                            infotekst={stegInfotekst}
                        />
                    )}
                    {skjemaData && skjemaData.length > 0 && (
                        <VilkårsvurderingPerioder
                            behandling={behandling}
                            perioder={skjemaData}
                            erTotalbeløpUnder4Rettsgebyr={totalbeløpErUnder4Rettsgebyr}
                            erLesevisning={erLesevisning}
                            fagsak={fagsak}
                        />
                    )}
                </VStack>
            </StyledVilkårsvurdering>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[feilutbetalingVilkårsvurdering]} />;
    }
};

export default VilkårsvurderingContainer;
