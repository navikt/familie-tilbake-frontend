import type { Behandling } from '../../../../typer/behandling';

import { Alert, Heading, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { styled } from 'styled-components';

import { useHistoriskVilkårsvurdering } from './HistoriskVilkårsvurderingContext';
import HistoriskVilkårsvurderingVisning from './HistoriskVilkårsvurderingVisning';
import VelgHistoriskVilkårsvurdering from './VelgHistoriskVilkårsvurdering';
import { RessursStatus } from '../../../../typer/ressurs';
import DataLastIkkeSuksess from '../../../Felleskomponenter/Datalast/DataLastIkkeSuksess';

const Container = styled.div`
    padding: ${ASpacing3};
`;

type Props = {
    behandling: Behandling;
};

const HistoriskVilkårsvurderingContainer: React.FC<Props> = () => {
    const { inaktiveVilkårsvurderinger, skjemaData, setInaktivVilkårsvurdering } =
        useHistoriskVilkårsvurdering();

    if (inaktiveVilkårsvurderinger?.status === RessursStatus.Suksess) {
        return (
            <Container>
                <VStack gap="5">
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
            </Container>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[inaktiveVilkårsvurderinger]} />;
    }
};

export default HistoriskVilkårsvurderingContainer;
