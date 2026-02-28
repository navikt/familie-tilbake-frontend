import type { FC } from 'react';

import { Heading, LocalAlert, VStack } from '@navikt/ds-react';

import { DataLastIkkeSuksess } from '~/komponenter/datalast/DataLastIkkeSuksess';
import { RessursStatus } from '~/typer/ressurs';

import { useHistoriskVilkårsvurdering } from './HistoriskVilkårsvurderingContext';
import { HistoriskVilkårsvurderingVisning } from './HistoriskVilkårsvurderingVisning';
import { VelgHistoriskVilkårsvurdering } from './VelgHistoriskVilkårsvurdering';

export const HistoriskVilkårsvurderingContainer: FC = () => {
    const { inaktiveVilkårsvurderinger, skjemaData, setInaktivVilkårsvurdering } =
        useHistoriskVilkårsvurdering();

    if (inaktiveVilkårsvurderinger?.status === RessursStatus.Suksess) {
        return (
            <div className="p-3">
                <VStack gap="space-20">
                    <LocalAlert status="announcement">
                        <LocalAlert.Header>
                            <LocalAlert.Title>
                                <Heading level="2" size="small">
                                    Tidligere vilkårsvurderinger på denne behandlingen
                                </Heading>
                            </LocalAlert.Title>
                        </LocalAlert.Header>
                    </LocalAlert>
                    <VelgHistoriskVilkårsvurdering
                        inaktiveVilkårsvurderinger={inaktiveVilkårsvurderinger.data}
                        setInaktivVilkårsvurdering={setInaktivVilkårsvurdering}
                    />
                    {skjemaData && skjemaData.length > 0 && (
                        <HistoriskVilkårsvurderingVisning perioder={skjemaData} />
                    )}
                </VStack>
            </div>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[inaktiveVilkårsvurderinger]} />;
    }
};
