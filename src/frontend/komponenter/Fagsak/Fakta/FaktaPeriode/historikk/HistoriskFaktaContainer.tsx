import type { BehandlingDto } from '../../../../../generated';

import { Alert, Heading, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import * as React from 'react';
import { styled } from 'styled-components';

import { useHistoriskFakta } from './HistoriskFaktaContext';
import HistoriskFaktaVisning from './HistoriskFaktaVisning';
import VelgHistoriskFaktaVurdering from './VelgHistoriskFaktaVurdering';
import { RessursStatus } from '../../../../../typer/ressurs';
import DataLastIkkeSuksess from '../../../../Felleskomponenter/Datalast/DataLastIkkeSuksess';

const Container = styled.div`
    padding: ${ASpacing3};
`;

type Props = {
    behandling: BehandlingDto;
};

const HistoriskFaktaContainer: React.FC<Props> = () => {
    const { inaktiveFakta, skjemaData, fakta, setInaktivFakta } = useHistoriskFakta();

    if (inaktiveFakta?.status === RessursStatus.Suksess) {
        return (
            <Container>
                <VStack gap="5">
                    <Alert variant="info">
                        <Heading level="2" size="small">
                            Tidligere fakta på denne behandlingen
                        </Heading>
                    </Alert>
                    <VelgHistoriskFaktaVurdering
                        inaktiveFakta={inaktiveFakta.data}
                        setInaktivFakta={setInaktivFakta}
                    />
                    {skjemaData && fakta && (
                        <HistoriskFaktaVisning skjemaData={skjemaData} fakta={fakta} />
                    )}
                </VStack>
            </Container>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[inaktiveFakta]} />;
    }
};

export default HistoriskFaktaContainer;
