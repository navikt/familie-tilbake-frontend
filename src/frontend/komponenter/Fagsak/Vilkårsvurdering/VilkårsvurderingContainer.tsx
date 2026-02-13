import { BodyLong, Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { erTotalbeløpUnder4Rettsgebyr, useVilkårsvurdering } from './VilkårsvurderingContext';
import { VilkårsvurderingPerioder } from './VilkårsvurderingPerioder';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { RessursStatus } from '../../../typer/ressurs';
import { DataLastIkkeSuksess } from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';

export const VilkårsvurderingContainer: React.FC = () => {
    const { containerRef, vilkårsvurdering, erAutoutført, skjemaData } = useVilkårsvurdering();
    const { behandlingILesemodus } = useBehandlingState();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;

    if (vilkårsvurdering?.status === RessursStatus.Suksess) {
        const totalbeløpErUnder4Rettsgebyr = erTotalbeløpUnder4Rettsgebyr(vilkårsvurdering.data);

        return (
            <VStack gap="space-24">
                <Heading size="medium" ref={containerRef}>
                    Vilkårsvurdering
                </Heading>

                {erAutoutført && (
                    <BodyLong size="small">Automatisk vurdert. Alle perioder er foreldet.</BodyLong>
                )}
                {skjemaData && skjemaData.length > 0 && (
                    <VilkårsvurderingPerioder
                        perioder={skjemaData}
                        erTotalbeløpUnder4Rettsgebyr={totalbeløpErUnder4Rettsgebyr}
                        erLesevisning={erLesevisning}
                    />
                )}
            </VStack>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[vilkårsvurdering]} />;
    }
};
