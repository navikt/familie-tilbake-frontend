import { BodyLong, Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { erTotalbeløpUnder4Rettsgebyr, useVilkårsvurdering } from './VilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { useFagsak } from '../../../context/FagsakContext';
import { vilkårsvurderingStegInfotekstForYtelsestype } from '../../../kodeverk';
import { RessursStatus } from '../../../typer/ressurs';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

const VilkårsvurderingContainer: React.FC = () => {
    const { ytelsestype } = useFagsak();
    const {
        containerRef,
        vilkårsvurdering: vilkårsvurdering,
        stegErBehandlet,
        erAutoutført,
        skjemaData,
    } = useVilkårsvurdering();
    const { behandlingILesemodus } = useBehandlingState();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;

    const stegInfotekst = vilkårsvurderingStegInfotekstForYtelsestype[ytelsestype];

    if (vilkårsvurdering?.status === RessursStatus.Suksess) {
        const totalbeløpErUnder4Rettsgebyr = erTotalbeløpUnder4Rettsgebyr(vilkårsvurdering.data);

        return (
            <>
                <Heading level="1" size="small" spacing ref={containerRef}>
                    Tilbakekreving
                </Heading>
                <VStack gap="space-20">
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
