import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, Heading, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useHistoriskFakta } from './HistoriskFaktaContext';
import HistoriskFaktaVisning from './HistoriskFaktaVisning';
import VelgHistoriskFaktaVurdering from './VelgHistoriskFaktaVurdering';
import { IBehandling } from '../../../../../typer/behandling';
import { IFagsak } from '../../../../../typer/fagsak';
import HenterData from '../../../../Felleskomponenter/HenterData/HenterData';

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

    switch (feilutbetalingInaktiveFakta?.status) {
        case RessursStatus.SUKSESS: {
            return (
                <Container>
                    <VStack gap="5">
                        <Alert variant={'info'}>
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
        }
        case RessursStatus.HENTER:
            return <HenterData beskrivelse="Henting av feilutbetalingen tar litt tid." />;
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert variant="error">{feilutbetalingInaktiveFakta.frontendFeilmelding}</Alert>;
    }
};

export default HistoriskFaktaContainer;
