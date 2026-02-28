import type { FC } from 'react';

import { BodyLong, Heading, VStack } from '@navikt/ds-react';

import { DataLastIkkeSuksess } from '~/komponenter/datalast/DataLastIkkeSuksess';
import { RessursStatus } from '~/typer/ressurs';

import { erTotalbeløpUnder4Rettsgebyr, useVilkårsvurdering } from './VilkårsvurderingContext';
import { VilkårsvurderingPerioder } from './VilkårsvurderingPerioder';

export const VilkårsvurderingContainer: FC = () => {
    const { containerRef, vilkårsvurdering, erAutoutført, skjemaData } = useVilkårsvurdering();

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
                    />
                )}
            </VStack>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[vilkårsvurdering]} />;
    }
};
