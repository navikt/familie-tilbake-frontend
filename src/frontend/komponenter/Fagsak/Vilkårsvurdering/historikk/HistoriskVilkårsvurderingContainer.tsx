import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, BodyLong, Heading, Loader, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useHistoriskVilkårsvurdering } from './HistoriskVilkårsvurderingContext';
import HistoriskVilkårsvurderingVisning from './HistoriskVilkårsvurderingVisning';
import VelgHistoriskVilkårsvurdering from './VelgHistoriskVilkårsvurdering';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';

const Container = styled.div`
    padding: ${ASpacing3};
`;

const MidtstiltContainer = styled(Container)`
    text-align: center;
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

    switch (feilutbetalingInaktiveVilkårsvurderinger?.status) {
        case RessursStatus.SUKSESS: {
            return (
                <Container>
                    <VStack gap="5">
                        <Alert variant={'info'}>
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
        }
        case RessursStatus.HENTER:
            return (
                <MidtstiltContainer>
                    <BodyLong spacing>Henting av feilutbetalingen tar litt tid.</BodyLong>
                    <Loader
                        size="2xlarge"
                        title="henter..."
                        transparent={false}
                        variant="neutral"
                    />
                </MidtstiltContainer>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return (
                <Alert variant="error">
                    {feilutbetalingInaktiveVilkårsvurderinger.frontendFeilmelding}
                </Alert>
            );
    }
};

export default HistoriskVilkårsvurderingContainer;
