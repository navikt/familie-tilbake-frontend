import type { FC } from 'react';

import { Heading, LocalAlert, VStack } from '@navikt/ds-react';

import { DataLastIkkeSuksess } from '~/komponenter/datalast/DataLastIkkeSuksess';
import { RessursStatus } from '~/typer/ressurs';

import { useHistoriskFakta } from './HistoriskFaktaContext';
import { HistoriskFaktaVisning } from './HistoriskFaktaVisning';
import { VelgHistoriskFaktaVurdering } from './VelgHistoriskFaktaVurdering';

export const HistoriskFaktaContainer: FC = () => {
    const { inaktiveFakta, skjemaData, fakta, setInaktivFakta } = useHistoriskFakta();

    if (inaktiveFakta?.status === RessursStatus.Suksess) {
        return (
            <div className="p-3">
                <VStack gap="space-20">
                    <LocalAlert status="announcement">
                        <LocalAlert.Header>
                            <LocalAlert.Title>
                                <Heading level="2" size="small">
                                    Tidligere fakta på denne behandlingen
                                </Heading>
                            </LocalAlert.Title>
                        </LocalAlert.Header>
                    </LocalAlert>
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
