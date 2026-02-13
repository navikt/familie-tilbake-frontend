import { Heading, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { useFakta } from './FaktaContext';
import { GammelFaktaSkjema } from './GammelFaktaSkjema';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { RessursStatus } from '../../../typer/ressurs';
import { DataLastIkkeSuksess } from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { Steginformasjon } from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

export const FaktaContainer: React.FC = () => {
    const { stegErBehandlet, skjemaData, fakta } = useFakta();
    const { behandlingILesemodus } = useBehandlingState();
    const erLesevisning = !!behandlingILesemodus;

    if (fakta?.status === RessursStatus.Suksess) {
        return (
            <VStack gap="space-24">
                <Heading size="small">Fakta fra feilutbetalingssaken</Heading>
                {(!erLesevisning || stegErBehandlet) && (
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst="Kontroller at korrekt hendelse er satt"
                    />
                )}
                <GammelFaktaSkjema
                    skjemaData={skjemaData}
                    fakta={fakta.data}
                    erLesevisning={erLesevisning}
                />
            </VStack>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[fakta]} />;
    }
};
