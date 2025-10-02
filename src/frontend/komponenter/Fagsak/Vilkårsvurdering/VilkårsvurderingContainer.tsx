import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';

import { BodyLong, Heading, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { styled } from 'styled-components';

import { erTotalbeløpUnder4Rettsgebyr, useVilkårsvurdering } from './VilkårsvurderingContext';
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

type Props = {
    fagsak: Fagsak;
    behandling: Behandling;
};

const VilkårsvurderingContainer: React.FC<Props> = ({ fagsak, behandling }) => {
    const {
        containerRef,
        vilkårsvurdering: vilkårsvurdering,
        stegErBehandlet,
        erAutoutført,
        skjemaData,
    } = useVilkårsvurdering();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;

    const stegInfotekst = {
        [Ytelsetype.Barnetrygd]: vilkårsvurderingStegInfotekstBarnetrygd,
        [Ytelsetype.Kontantstøtte]: vilkårsvurderingStegInfotekstKontantstøtte,
        [Ytelsetype.Barnetilsyn]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.Overgangsstønad]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.Skolepenger]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.Tilleggsstønad]: vilkårsvurderingStegInfotekst,
    }[fagsak.ytelsestype];

    if (vilkårsvurdering?.status === RessursStatus.Suksess) {
        const totalbeløpErUnder4Rettsgebyr = erTotalbeløpUnder4Rettsgebyr(vilkårsvurdering.data);

        return (
            <StyledVilkårsvurdering ref={containerRef}>
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
        return <DataLastIkkeSuksess ressurser={[vilkårsvurdering]} />;
    }
};

export default VilkårsvurderingContainer;
