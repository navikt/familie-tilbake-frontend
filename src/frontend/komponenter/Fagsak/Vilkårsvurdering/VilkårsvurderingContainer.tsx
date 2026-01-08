import type { BehandlingDto } from '../../../generated';

import { BodyLong, Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { erTotalbeløpUnder4Rettsgebyr, useVilkårsvurdering } from './VilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import { useBehandling } from '../../../context/BehandlingContext';
import { useFagsak } from '../../../context/FagsakContext';
import { vilkårsvurderingStegInfotekstForYtelsestype } from '../../../kodeverk';
import { RessursStatus } from '../../../typer/ressurs';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

type Props = {
    behandling: BehandlingDto;
};

const VilkårsvurderingContainer: React.FC<Props> = ({ behandling }) => {
    const { ytelsestype } = useFagsak();
    const {
        containerRef,
        vilkårsvurdering: vilkårsvurdering,
        stegErBehandlet,
        erAutoutført,
        skjemaData,
    } = useVilkårsvurdering();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;

    const stegInfotekst = vilkårsvurderingStegInfotekstForYtelsestype[ytelsestype];

    if (vilkårsvurdering?.status === RessursStatus.Suksess) {
        const totalbeløpErUnder4Rettsgebyr = erTotalbeløpUnder4Rettsgebyr(vilkårsvurdering.data);

        return (
            <>
                <Heading level="1" size="small" spacing ref={containerRef}>
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
                        />
                    )}
                </VStack>
            </>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[vilkårsvurdering]} />;
    }
};

export default VilkårsvurderingContainer;
