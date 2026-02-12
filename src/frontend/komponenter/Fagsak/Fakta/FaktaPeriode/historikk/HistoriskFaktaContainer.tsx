import { Alert, Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useHistoriskFakta } from './HistoriskFaktaContext';
import { HistoriskFaktaVisning } from './HistoriskFaktaVisning';
import { VelgHistoriskFaktaVurdering } from './VelgHistoriskFaktaVurdering';
import { RessursStatus } from '../../../../../typer/ressurs';
import { DataLastIkkeSuksess } from '../../../../Felleskomponenter/Datalast/DataLastIkkeSuksess';

const HistoriskFaktaContainer: React.FC = () => {
    const { inaktiveFakta, skjemaData, fakta, setInaktivFakta } = useHistoriskFakta();

    if (inaktiveFakta?.status === RessursStatus.Suksess) {
        return (
            <div className="p-3">
                <VStack gap="space-20">
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
            </div>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[inaktiveFakta]} />;
    }
};

export default HistoriskFaktaContainer;
