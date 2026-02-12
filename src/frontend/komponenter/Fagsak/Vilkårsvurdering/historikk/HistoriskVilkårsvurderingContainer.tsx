import { Alert, Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useHistoriskVilkårsvurdering } from './HistoriskVilkårsvurderingContext';
import { HistoriskVilkårsvurderingVisning } from './HistoriskVilkårsvurderingVisning';
import { VelgHistoriskVilkårsvurdering } from './VelgHistoriskVilkårsvurdering';
import { RessursStatus } from '../../../../typer/ressurs';
import { DataLastIkkeSuksess } from '../../../Felleskomponenter/Datalast/DataLastIkkeSuksess';

export const HistoriskVilkårsvurderingContainer: React.FC = () => {
    const { inaktiveVilkårsvurderinger, skjemaData, setInaktivVilkårsvurdering } =
        useHistoriskVilkårsvurdering();

    if (inaktiveVilkårsvurderinger?.status === RessursStatus.Suksess) {
        return (
            <div className="p-3">
                <VStack gap="space-20">
                    <Alert variant="info">
                        <Heading level="2" size="small">
                            Tidligere vilkårsvurderinger på denne behandlingen
                        </Heading>
                    </Alert>
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
