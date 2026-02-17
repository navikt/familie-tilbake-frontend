import { Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useFakta } from './FaktaContext';
import { GammelFaktaSkjema } from './GammelFaktaSkjema';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { DataLastIkkeSuksess } from '../../../komponenter/datalast/DataLastIkkeSuksess';
import { Steginformasjon } from '../../../komponenter/steginformasjon/StegInformasjon';
import { RessursStatus } from '../../../typer/ressurs';

export const FaktaContainer: React.FC = () => {
    const { stegErBehandlet, skjemaData, fakta } = useFakta();
    const { behandlingILesemodus } = useBehandlingState();

    if (fakta?.status === RessursStatus.Suksess) {
        return (
            <VStack gap="space-24">
                <Heading size="small">Fakta fra feilutbetalingssaken</Heading>
                {(!behandlingILesemodus || stegErBehandlet) && (
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst="Kontroller at korrekt hendelse er satt"
                    />
                )}
                <GammelFaktaSkjema skjemaData={skjemaData} fakta={fakta.data} />
            </VStack>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[fakta]} />;
    }
};
