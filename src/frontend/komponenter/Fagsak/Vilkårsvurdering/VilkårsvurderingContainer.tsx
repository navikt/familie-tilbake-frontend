import * as React from 'react';

import { styled } from 'styled-components';

import { BodyLong, Heading, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';

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
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { RessursStatus } from '../../../typer/ressurs';

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
        [Ytelsetype.BARNETRYGD]: vilkårsvurderingStegInfotekstBarnetrygd,
        [Ytelsetype.KONTANTSTØTTE]: vilkårsvurderingStegInfotekstKontantstøtte,
        [Ytelsetype.BARNETILSYN]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.OVERGANGSSTØNAD]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.SKOLEPENGER]: vilkårsvurderingStegInfotekst,
    }[fagsak.ytelsestype];

    if (feilutbetalingVilkårsvurdering?.status === RessursStatus.SUKSESS) {
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
