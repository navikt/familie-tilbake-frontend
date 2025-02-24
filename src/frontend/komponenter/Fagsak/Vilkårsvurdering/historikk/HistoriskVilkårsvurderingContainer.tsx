import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, Heading, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';

import { useHistoriskVilkårsvurdering } from './HistoriskVilkårsvurderingContext';
import HistoriskVilkårsvurderingVisning from './HistoriskVilkårsvurderingVisning';
import VelgHistoriskVilkårsvurdering from './VelgHistoriskVilkårsvurdering';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import DataLastIkkeSuksess from '../../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { RessursStatus } from '../../../../typer/ressurs';

const Container = styled.div`
    padding: ${ASpacing3};
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const HistoriskVilkårsvurderingContainer: React.FC<IProps> = () => {
    const {
        feilutbetalingInaktiveVilkårsvurderinger,
        skjemaData,
        settFeilutbetalingInaktivVilkårsvurdering,
    } = useHistoriskVilkårsvurdering();

    if (feilutbetalingInaktiveVilkårsvurderinger?.status === RessursStatus.SUKSESS) {
        return (
            <Container>
                <VStack gap="5">
                    <Alert variant="info">
                        <Heading level="2" size="small">
                            Tidligere vilkårsvurderinger på denne behandlingen
                        </Heading>
                    </Alert>
                    <VelgHistoriskVilkårsvurdering
                        feilutbetalingInaktiveVilkårsvurderinger={
                            feilutbetalingInaktiveVilkårsvurderinger.data
                        }
                        settFeilutbetalingInaktivVilkårsvurdering={
                            settFeilutbetalingInaktivVilkårsvurdering
                        }
                    />
                    {skjemaData && skjemaData.length > 0 && (
                        <HistoriskVilkårsvurderingVisning perioder={skjemaData} />
                    )}
                </VStack>
            </Container>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[feilutbetalingInaktiveVilkårsvurderinger]} />;
    }
};

export default HistoriskVilkårsvurderingContainer;
