import type { IBehandling } from '../../../../../typer/behandling';
import type { IFagsak } from '../../../../../typer/fagsak';

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

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const HistoriskFaktaContainer: React.FC<IProps> = () => {
    const { feilutbetalingInaktiveFakta, skjemaData, fakta, settFeilutbetalingInaktivFakta } =
        useHistoriskFakta();

    if (feilutbetalingInaktiveFakta?.status === RessursStatus.Suksess) {
        return (
            <Container>
                <VStack gap="5">
                    <Alert variant="info">
                        <Heading level="2" size="small">
                            Tidligere fakta på denne behandlingen
                        </Heading>
                    </Alert>
                    <VelgHistoriskFaktaVurdering
                        feilutbetalingInaktiveFakta={feilutbetalingInaktiveFakta.data}
                        settFeilutbetalingInaktivFakta={settFeilutbetalingInaktivFakta}
                    />
                    {skjemaData && fakta && (
                        <HistoriskFaktaVisning skjemaData={skjemaData} fakta={fakta} />
                    )}
                </VStack>
            </Container>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[feilutbetalingInaktiveFakta]} />;
    }
};

export default HistoriskFaktaContainer;
